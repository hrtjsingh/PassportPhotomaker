import {
  fromRawRgba,
  getRawRgba,
  type ImagePadding,
} from './imageProcessing.js';

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
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

function estimateSourceBackgroundColor(
  original: Buffer,
  cutout: Buffer,
  width: number,
  height: number
): Rgb {
  const band = Math.max(3, Math.min(14, Math.round(Math.min(width, height) * 0.03)));
  const samples: Rgb[] = [];

  const addSample = (x: number, y: number, data: Buffer) => {
    const i = (y * width + x) * 4;
    samples.push([data[i], data[i + 1], data[i + 2]]);
  };

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < band; y++) addSample(x, y, original);
    for (let y = height - band; y < height; y++) addSample(x, y, original);
  }
  for (let y = band; y < height - band; y++) {
    for (let x = 0; x < band; x++) addSample(x, y, original);
    for (let x = width - band; x < width; x++) addSample(x, y, original);
  }

  for (let i = 0; i < width * height; i++) {
    if (cutout[i * 4 + 3] >= 20) continue;
    const idx = i * 4;
    samples.push([original[idx], original[idx + 1], original[idx + 2]]);
  }

  return [
    median(samples.map((s) => s[0])),
    median(samples.map((s) => s[1])),
    median(samples.map((s) => s[2])),
  ];
}

function dilateAlpha(alpha: Float32Array, width: number, height: number, radius: number): Float32Array {
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

function erodeAlpha(alpha: Float32Array, width: number, height: number, radius: number): Float32Array {
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

function stripBackgroundFringe(
  original: Buffer,
  alpha: Float32Array,
  width: number,
  height: number,
  sourceBg: Rgb
): Float32Array {
  const out = new Float32Array(alpha);
  const hardTol = 36;
  const softTol = 58;

  for (let i = 0; i < width * height; i++) {
    const a = out[i];
    if (a <= 0 || a >= 0.94) continue;

    const idx = i * 4;
    const r = original[idx];
    const g = original[idx + 1];
    const b = original[idx + 2];

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

function clamp255(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function decontaminateEdges(
  original: Buffer,
  cutout: Buffer,
  alpha: Float32Array,
  width: number,
  height: number,
  sourceBg: Rgb
): Buffer {
  const out = Buffer.alloc(width * height * 4);
  const [bgR, bgG, bgB] = sourceBg;
  const fringeTol = 42;

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    let a = snapAlpha(alpha[i]);

    if (a <= 0) {
      out[idx + 3] = 0;
      continue;
    }

    const orig: Rgb = [original[idx], original[idx + 1], original[idx + 2]];
    const cut: Rgb = [cutout[idx], cutout[idx + 1], cutout[idx + 2]];

    if (a < 0.55 && matchesSourceBackground(orig[0], orig[1], orig[2], sourceBg, fringeTol)) {
      out[idx + 3] = 0;
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

    out[idx] = r;
    out[idx + 1] = g;
    out[idx + 2] = b;
    out[idx + 3] = Math.round(a * 255);
  }

  return out;
}

export async function refineAlphaFromOriginal(
  originalBuffer: Buffer,
  cutoutBuffer: Buffer,
  options: { dilationRadius?: number; sourceBackgroundColor?: string } = {}
): Promise<Buffer> {
  const { dilationRadius = 1, sourceBackgroundColor } = options;
  const original = await getRawRgba(originalBuffer);
  const cutout = await getRawRgba(cutoutBuffer);

  const width = original.width;
  const height = original.height;
  const sourceBg = sourceBackgroundColor
    ? hexToRgb(sourceBackgroundColor)
    : estimateSourceBackgroundColor(original.data, cutout.data, width, height);

  const alpha = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    alpha[i] = cutout.data[i * 4 + 3] / 255;
  }

  let processed = erodeAlpha(alpha, width, height, 2);
  processed = stripBackgroundFringe(original.data, processed, width, height, sourceBg);
  if (dilationRadius > 0) {
    processed = dilateAlpha(processed, width, height, dilationRadius);
  }
  processed = stripBackgroundFringe(original.data, processed, width, height, sourceBg);

  const cleaned = decontaminateEdges(
    original.data,
    cutout.data,
    processed,
    width,
    height,
    sourceBg
  );

  return fromRawRgba(cleaned, width, height);
}

export type { ImagePadding };
