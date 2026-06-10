import { createImage } from './cropImage';

export interface ImagePadding {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RefineCutoutOptions {
  dilationRadius?: number;
  /** Override auto-detected background from the original photo. */
  sourceBackgroundColor?: string;
}

type Rgb = [number, number, number];

function rgbToHex([r, g, b]: Rgb): string {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized.padStart(6, '0');
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function median(values: number[]): number {
  if (values.length === 0) return 128;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/** Sample photo edges + model background pixels to find the original backdrop color. */
export function estimateSourceBackgroundColor(
  original: ImageData,
  cutout?: ImageData
): Rgb {
  const { width, height, data } = original;
  const band = Math.max(3, Math.min(14, Math.round(Math.min(width, height) * 0.03)));
  const samples: Rgb[] = [];

  const addSample = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    samples.push([data[i], data[i + 1], data[i + 2]]);
  };

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < band; y++) addSample(x, y);
    for (let y = height - band; y < height; y++) addSample(x, y);
  }
  for (let y = band; y < height - band; y++) {
    for (let x = 0; x < band; x++) addSample(x, y);
    for (let x = width - band; x < width; x++) addSample(x, y);
  }

  if (cutout) {
    for (let i = 0; i < width * height; i++) {
      if (cutout.data[i * 4 + 3] >= 20) continue;
      const idx = i * 4;
      samples.push([data[idx], data[idx + 1], data[idx + 2]]);
    }
  }

  return [
    median(samples.map((s) => s[0])),
    median(samples.map((s) => s[1])),
    median(samples.map((s) => s[2])),
  ];
}

/** Add border space so edge-touching subjects aren't misclassified as background. */
export async function addImagePadding(
  imageSrc: string,
  paddingPercent = 0.1,
  paddingColor?: string
): Promise<{ paddedSrc: string; padding: ImagePadding }> {
  const img = await createImage(imageSrc);
  const padX = Math.round(img.width * paddingPercent);
  const padY = Math.round(img.height * paddingPercent);
  const canvas = document.createElement('canvas');
  canvas.width = img.width + padX * 2;
  canvas.height = img.height + padY * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  let fill = paddingColor;
  if (!fill) {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = img.width;
    sampleCanvas.height = img.height;
    const sampleCtx = sampleCanvas.getContext('2d');
    if (!sampleCtx) throw new Error('Could not get canvas context');
    sampleCtx.drawImage(img, 0, 0);
    fill = rgbToHex(estimateSourceBackgroundColor(sampleCtx.getImageData(0, 0, img.width, img.height)));
  }

  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, padX, padY);

  return {
    paddedSrc: canvas.toDataURL('image/png'),
    padding: { x: padX, y: padY, width: img.width, height: img.height },
  };
}

/** Crop the padded result back to the original dimensions. */
export async function cropPaddingFromResult(
  resultSrc: string,
  padding: ImagePadding
): Promise<Blob> {
  const img = await createImage(resultSrc);
  const canvas = document.createElement('canvas');
  canvas.width = padding.width;
  canvas.height = padding.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(
    img,
    padding.x,
    padding.y,
    padding.width,
    padding.height,
    0,
    0,
    padding.width,
    padding.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/png'
    );
  });
}

function dilateAlpha(
  alpha: Float32Array,
  width: number,
  height: number,
  radius: number
): Float32Array {
  const dilated = new Float32Array(width * height);
  const r2 = radius * radius;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxA = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > r2) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            maxA = Math.max(maxA, alpha[ny * width + nx]);
          }
        }
      }
      dilated[y * width + x] = maxA;
    }
  }

  return dilated;
}

/** Shrink the outer semi-transparent ring where gray halos live. */
function erodeAlpha(
  alpha: Float32Array,
  width: number,
  height: number,
  radius: number
): Float32Array {
  const eroded = new Float32Array(width * height);
  const r2 = radius * radius;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minA = 1;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > r2) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            minA = Math.min(minA, alpha[ny * width + nx]);
          }
        }
      }
      eroded[y * width + x] = minA;
    }
  }

  return eroded;
}

function snapAlpha(a: number): number {
  if (a < 0.2) return 0;
  if (a > 0.7) return 1;
  return Math.min(1, Math.pow(a, 0.3));
}

function colorDistance(a: Rgb, b: Rgb): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

function isDesaturatedGray(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = (r + g + b) / 3;
  return max - min < 32 && lum > 80;
}

function matchesSourceBackground(r: number, g: number, b: number, sourceBg: Rgb, tolerance: number): boolean {
  return colorDistance([r, g, b], sourceBg) <= tolerance;
}

/** Drop semi-transparent pixels that still carry the old photo background color. */
function stripBackgroundFringe(
  original: ImageData,
  alpha: Float32Array,
  sourceBg: Rgb
): Float32Array {
  const { width, height } = original;
  const out = new Float32Array(alpha);
  const hardTol = 36;
  const softTol = 58;

  for (let i = 0; i < width * height; i++) {
    const a = out[i];
    if (a <= 0 || a >= 0.94) continue;

    const idx = i * 4;
    const r = original.data[idx];
    const g = original.data[idx + 1];
    const b = original.data[idx + 2];

    if (matchesSourceBackground(r, g, b, sourceBg, hardTol)) {
      out[i] = 0;
      continue;
    }

    if (a < 0.5 && matchesSourceBackground(r, g, b, sourceBg, softTol)) {
      out[i] = 0;
      continue;
    }

    if (a < 0.65 && isDesaturatedGray(r, g, b) && colorDistance([r, g, b], sourceBg) < softTol + 25) {
      out[i] = 0;
    }
  }

  return out;
}

/** Remove original background color spill from edge pixels. */
function decontaminateEdges(
  original: ImageData,
  cutout: ImageData,
  alpha: Float32Array,
  sourceBg: Rgb
): ImageData {
  const { width, height } = original;
  const out = new ImageData(width, height);
  const [bgR, bgG, bgB] = sourceBg;
  const fringeTol = 42;

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    let a = snapAlpha(alpha[i]);

    if (a <= 0) {
      out.data[idx + 3] = 0;
      continue;
    }

    const orig: Rgb = [original.data[idx], original.data[idx + 1], original.data[idx + 2]];
    const cut: Rgb = [cutout.data[idx], cutout.data[idx + 1], cutout.data[idx + 2]];

    if (a < 0.55 && matchesSourceBackground(orig[0], orig[1], orig[2], sourceBg, fringeTol)) {
      out.data[idx + 3] = 0;
      continue;
    }

    let r: number;
    let g: number;
    let b: number;

    if (a >= 1) {
      r = orig[0];
      g = orig[1];
      b = orig[2];
    } else {
      const invA = 1 / Math.max(a, 0.15);
      const spillR = (cut[0] - (1 - a) * bgR) * invA;
      const spillG = (cut[1] - (1 - a) * bgG) * invA;
      const spillB = (cut[2] - (1 - a) * bgB) * invA;

      const edgeWeight = Math.min(0.85, 1 - a);
      r = clamp255(spillR * (1 - edgeWeight) + orig[0] * edgeWeight);
      g = clamp255(spillG * (1 - edgeWeight) + orig[1] * edgeWeight);
      b = clamp255(spillB * (1 - edgeWeight) + orig[2] * edgeWeight);

      if (
        isDesaturatedGray(r, g, b) &&
        (matchesSourceBackground(r, g, b, sourceBg, fringeTol) ||
          colorDistance(cut, sourceBg) < colorDistance(orig, sourceBg))
      ) {
        r = orig[0];
        g = orig[1];
        b = orig[2];
        a = Math.min(1, a * 1.15);
      }
    }

    out.data[idx] = r;
    out.data[idx + 1] = g;
    out.data[idx + 2] = b;
    out.data[idx + 3] = Math.round(a * 255);
  }

  return out;
}

function clamp255(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/** Erosion + fringe strip + decontamination against the photo's original background. */
export async function refineAlphaFromOriginal(
  originalSrc: string,
  cutoutSrc: string,
  options: RefineCutoutOptions = {}
): Promise<Blob> {
  const { dilationRadius = 1, sourceBackgroundColor } = options;

  const [original, cutout] = await Promise.all([
    createImage(originalSrc),
    createImage(cutoutSrc),
  ]);

  const width = original.width;
  const height = original.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(cutout, 0, 0, width, height);
  const cutoutData = ctx.getImageData(0, 0, width, height);

  ctx.drawImage(original, 0, 0);
  const originalData = ctx.getImageData(0, 0, width, height);

  const sourceBg = sourceBackgroundColor
    ? hexToRgb(sourceBackgroundColor)
    : estimateSourceBackgroundColor(originalData, cutoutData);

  const alpha = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    alpha[i] = cutoutData.data[i * 4 + 3] / 255;
  }

  let processed = erodeAlpha(alpha, width, height, 2);
  processed = stripBackgroundFringe(originalData, processed, sourceBg);
  if (dilationRadius > 0) {
    processed = dilateAlpha(processed, width, height, dilationRadius);
  }
  processed = stripBackgroundFringe(originalData, processed, sourceBg);

  const cleaned = decontaminateEdges(originalData, cutoutData, processed, sourceBg);
  ctx.putImageData(cleaned, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/png'
    );
  });
}
