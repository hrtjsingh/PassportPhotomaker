const SUBJECT_ALPHA_THRESHOLD = 128;

function clamp255(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function isSubjectPixel(alpha: number): boolean {
  return alpha >= SUBJECT_ALPHA_THRESHOLD;
}

function rgbLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function scaleRgbToLuminance(r: number, g: number, b: number, targetL: number): [number, number, number] {
  const currentL = rgbLuminance(r, g, b);
  if (currentL < 1) return [r, g, b];
  const scale = targetL / currentL;
  return [clamp255(r * scale), clamp255(g * scale), clamp255(b * scale)];
}

function restoreBackgroundPixels(dst: Buffer, src: Buffer, i: number): void {
  dst[i] = src[i];
  dst[i + 1] = src[i + 1];
  dst[i + 2] = src[i + 2];
  dst[i + 3] = src[i + 3];
}

function resizeRgba(
  data: Buffer,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number
): Buffer {
  const out = Buffer.alloc(dstW * dstH * 4);
  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const srcX = ((x + 0.5) * srcW) / dstW - 0.5;
      const srcY = ((y + 0.5) * srcH) / dstH - 0.5;
      const x0 = Math.max(0, Math.min(srcW - 1, Math.floor(srcX)));
      const y0 = Math.max(0, Math.min(srcH - 1, Math.floor(srcY)));
      const x1 = Math.min(x0 + 1, srcW - 1);
      const y1 = Math.min(y0 + 1, srcH - 1);
      const tx = srcX - x0;
      const ty = srcY - y0;

      const dstIdx = (y * dstW + x) * 4;
      for (let c = 0; c < 4; c++) {
        const i00 = (y0 * srcW + x0) * 4 + c;
        const i10 = (y0 * srcW + x1) * 4 + c;
        const i01 = (y1 * srcW + x0) * 4 + c;
        const i11 = (y1 * srcW + x1) * 4 + c;
        const val =
          (data[i00] * (1 - tx) + data[i10] * tx) * (1 - ty) +
          (data[i01] * (1 - tx) + data[i11] * tx) * ty;
        out[dstIdx + c] = clamp255(val);
      }
    }
  }
  return out;
}

function sampleBilinear(map: Float32Array, w: number, h: number, x: number, y: number): number {
  const cx = Math.max(0, Math.min(w - 1, x));
  const cy = Math.max(0, Math.min(h - 1, y));
  const x0 = Math.floor(cx);
  const y0 = Math.floor(cy);
  const x1 = Math.min(x0 + 1, w - 1);
  const y1 = Math.min(y0 + 1, h - 1);
  const tx = cx - x0;
  const ty = cy - y0;
  const i00 = map[y0 * w + x0];
  const i10 = map[y0 * w + x1];
  const i01 = map[y1 * w + x0];
  const i11 = map[y1 * w + x1];
  return (i00 * (1 - tx) + i10 * tx) * (1 - ty) + (i01 * (1 - tx) + i11 * tx) * ty;
}

export function applyEnhancementDetail(
  source: Buffer,
  enhanced: Buffer,
  sw: number,
  sh: number,
  ew: number,
  eh: number,
  strength = 1.1
): Buffer {
  const sourceSmall = resizeRgba(source, sw, sh, ew, eh);
  const detailMap = new Float32Array(ew * eh);

  for (let y = 0; y < eh; y++) {
    for (let x = 0; x < ew; x++) {
      const idx = y * ew + x;
      const si = idx * 4;
      if (!isSubjectPixel(sourceSmall[si + 3])) {
        detailMap[idx] = 0;
        continue;
      }
      const origL = rgbLuminance(sourceSmall[si], sourceSmall[si + 1], sourceSmall[si + 2]);
      const enhL = rgbLuminance(enhanced[si], enhanced[si + 1], enhanced[si + 2]);
      detailMap[idx] = (enhL - origL) * strength;
    }
  }

  const out = Buffer.from(source);

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4;
      if (!isSubjectPixel(source[i + 3])) {
        restoreBackgroundPixels(out, source, i);
        continue;
      }

      const mapX = ((x + 0.5) * ew) / sw - 0.5;
      const mapY = ((y + 0.5) * eh) / sh - 0.5;
      const detail = sampleBilinear(detailMap, ew, eh, mapX, mapY);
      const origL = rgbLuminance(source[i], source[i + 1], source[i + 2]);
      [out[i], out[i + 1], out[i + 2]] = scaleRgbToLuminance(
        source[i],
        source[i + 1],
        source[i + 2],
        origL + detail
      );
    }
  }

  return out;
}

function boxBlur3(data: Buffer, width: number, height: number): Buffer {
  const out = Buffer.alloc(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      out[idx + 3] = data[idx + 3];

      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        out[idx] = data[idx];
        out[idx + 1] = data[idx + 1];
        out[idx + 2] = data[idx + 2];
        continue;
      }

      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            sum += data[((y + dy) * width + (x + dx)) * 4 + c];
          }
        }
        out[idx + c] = sum / 9;
      }
    }
  }

  return out;
}

function skinToneWeight(r: number, g: number, b: number): number {
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  if (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173) return 1;
  if (cb >= 70 && cb <= 135 && cr >= 125 && cr <= 180) return 0.55;
  return 0.12;
}

function edgeStrength(r: number, g: number, b: number, br: number, bg: number, bb: number): number {
  const l0 = rgbLuminance(r, g, b);
  const l1 = rgbLuminance(br, bg, bb);
  return Math.min(1, Math.abs(l0 - l1) / 40);
}

function clearSkin(data: Buffer, width: number, height: number, amount = 0.42): Buffer {
  const blurred = boxBlur3(data, width, height);
  const soft = boxBlur3(blurred, width, height);
  const out = Buffer.from(data);

  for (let i = 0; i < data.length; i += 4) {
    if (!isSubjectPixel(data[i + 3])) {
      restoreBackgroundPixels(out, data, i);
      continue;
    }

    const skin = skinToneWeight(data[i], data[i + 1], data[i + 2]);
    const edge = edgeStrength(data[i], data[i + 1], data[i + 2], blurred[i], blurred[i + 1], blurred[i + 2]);
    const blend = amount * skin * (1 - edge) * (1 - edge);

    out[i + 3] = data[i + 3];
    for (let c = 0; c < 3; c++) {
      out[i + c] = clamp255(data[i + c] * (1 - blend) + soft[i + c] * blend);
    }
  }

  return out;
}

function sharpenPortrait(data: Buffer, width: number, height: number, amount = 0.62): Buffer {
  const blurred = boxBlur3(data, width, height);
  const out = Buffer.from(data);

  for (let i = 0; i < data.length; i += 4) {
    if (!isSubjectPixel(data[i + 3])) {
      restoreBackgroundPixels(out, data, i);
      continue;
    }

    out[i + 3] = data[i + 3];
    for (let c = 0; c < 3; c++) {
      const detail = data[i + c] - blurred[i + c];
      out[i + c] = clamp255(data[i + c] + detail * amount);
    }
  }

  return out;
}

export function applyPortraitFilters(
  data: Buffer,
  width: number,
  height: number,
  skinClear = 0.42,
  sharpenAmount = 0.55
): Buffer {
  return sharpenPortrait(clearSkin(data, width, height, skinClear), width, height, sharpenAmount);
}

export function extractAlphaMask(data: Buffer, width: number, height: number): Uint8ClampedArray | null {
  const alpha = new Uint8ClampedArray(width * height);
  let hasTransparency = false;
  for (let i = 0; i < alpha.length; i++) {
    alpha[i] = data[i * 4 + 3];
    if (alpha[i] < 250) hasTransparency = true;
  }
  return hasTransparency ? alpha : null;
}

export function applyAlphaMask(data: Buffer, alpha: Uint8ClampedArray): Buffer {
  const out = Buffer.from(data);
  for (let i = 0; i < alpha.length; i++) {
    out[i * 4 + 3] = alpha[i];
  }
  return out;
}
