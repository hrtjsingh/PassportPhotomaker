import sharp from 'sharp';

export interface ImageSize {
  width: number;
  height: number;
}

export interface ImagePadding {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function getImageSize(buffer: Buffer): Promise<ImageSize> {
  const meta = await sharp(buffer).metadata();
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}

export async function limitImageSize(
  buffer: Buffer,
  maxLongestEdge: number
): Promise<{ buffer: Buffer; scale: number }> {
  const { width, height } = await getImageSize(buffer);
  const longest = Math.max(width, height);
  if (longest <= maxLongestEdge) {
    return { buffer, scale: 1 };
  }

  const scale = maxLongestEdge / longest;
  const newWidth = Math.max(1, Math.round(width * scale));
  const newHeight = Math.max(1, Math.round(height * scale));
  const resized = await sharp(buffer)
    .resize(newWidth, newHeight, { fit: 'fill' })
    .png()
    .toBuffer();

  return { buffer: resized, scale: newWidth / width };
}

export async function upscaleImage(
  buffer: Buffer,
  targetWidth: number,
  targetHeight: number
): Promise<Buffer> {
  return sharp(buffer)
    .resize(targetWidth, targetHeight, { fit: 'fill' })
    .png()
    .toBuffer();
}

type Rgb = [number, number, number];

function rgbToHex([r, g, b]: Rgb): string {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function median(values: number[]): number {
  if (values.length === 0) return 128;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function estimateSourceBackgroundColor(original: Buffer, width: number, height: number): Rgb {
  const band = Math.max(3, Math.min(14, Math.round(Math.min(width, height) * 0.03)));
  const samples: Rgb[] = [];

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < band; y++) {
      const i = (y * width + x) * 4;
      samples.push([original[i], original[i + 1], original[i + 2]]);
    }
    for (let y = height - band; y < height; y++) {
      const i = (y * width + x) * 4;
      samples.push([original[i], original[i + 1], original[i + 2]]);
    }
  }
  for (let y = band; y < height - band; y++) {
    for (let x = 0; x < band; x++) {
      const i = (y * width + x) * 4;
      samples.push([original[i], original[i + 1], original[i + 2]]);
    }
    for (let x = width - band; x < width; x++) {
      const i = (y * width + x) * 4;
      samples.push([original[i], original[i + 1], original[i + 2]]);
    }
  }

  return [
    median(samples.map((s) => s[0])),
    median(samples.map((s) => s[1])),
    median(samples.map((s) => s[2])),
  ];
}

export async function addImagePadding(
  buffer: Buffer,
  paddingPercent = 0.1,
  paddingColor?: string
): Promise<{ buffer: Buffer; padding: ImagePadding }> {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const padX = Math.round(width * paddingPercent);
  const padY = Math.round(height * paddingPercent);
  const fill = paddingColor ?? rgbToHex(estimateSourceBackgroundColor(data, width, height));

  const padded = await sharp(buffer)
    .extend({
      top: padY,
      bottom: padY,
      left: padX,
      right: padX,
      background: fill,
    })
    .png()
    .toBuffer();

  return {
    buffer: padded,
    padding: { x: padX, y: padY, width, height },
  };
}

export async function cropPadding(buffer: Buffer, padding: ImagePadding): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();
  const fullWidth = meta.width ?? padding.width;
  const fullHeight = meta.height ?? padding.height;

  return sharp(buffer)
    .extract({
      left: padding.x,
      top: padding.y,
      width: Math.min(padding.width, fullWidth - padding.x),
      height: Math.min(padding.height, fullHeight - padding.y),
    })
    .png()
    .toBuffer();
}

export async function compositeOnBackground(
  buffer: Buffer,
  width: number,
  height: number,
  backgroundColor: string
): Promise<Buffer> {
  const resized = await sharp(buffer).resize(width, height, { fit: 'fill' }).ensureAlpha().toBuffer();
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: backgroundColor,
    },
  })
    .composite([{ input: resized, top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toBuffer();
}

export async function toPngBuffer(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer).png().toBuffer();
}

export async function getRawRgba(buffer: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

export async function fromRawRgba(data: Buffer, width: number, height: number): Promise<Buffer> {
  return sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

export function getMemoryFallbackSizes(maxInputPx: number, memoryHeavy = false): number[] {
  const minSize = memoryHeavy ? 384 : 512;
  const candidates = memoryHeavy
    ? [maxInputPx, Math.round(maxInputPx * 0.75), 768, 512, 384]
    : [maxInputPx, Math.round(maxInputPx * 0.75), 1024, 768];
  return [...new Set(candidates.filter((size) => size >= minSize))].sort((a, b) => b - a);
}

export function isOomError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('bad_alloc') ||
    message.includes('Out of memory') ||
    message.includes('OOM') ||
    message.includes('ENOMEM')
  );
}
