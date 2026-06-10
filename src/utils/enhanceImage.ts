export const SUBJECT_ALPHA_THRESHOLD = 128;

export async function enhanceImage(
  imageSrc: string,
  options: {
    brightness: number; // 0 to 2 (1 is normal)
    contrast: number;   // 0 to 2 (1 is normal)
    sharpen: number;    // 0 to 1 (0 is none)
    skinClear?: number;   // 0 to 1 (0 is none)
  }
): Promise<string> {
  const img = new Image();
  img.src = imageSrc;
  await new Promise((resolve) => (img.onload = resolve));

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(img, 0, 0);
  let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const original = new Uint8ClampedArray(data.data);
  applyBrightnessContrastSubjectOnly(data, options.brightness, options.contrast, original);

  if (options.skinClear && options.skinClear > 0) {
    data = clearSkinImageData(data, options.skinClear);
  }

  if (options.sharpen > 0) {
    ctx.putImageData(sharpen(data, options.sharpen, original), 0, 0);
  } else {
    ctx.putImageData(data, 0, 0);
  }

  return canvas.toDataURL('image/png');
}

/** Auto white-balance + shadow lift tuned for passport portraits. */
export async function autoCorrectPassport(imageSrc: string): Promise<string> {
  const img = new Image();
  img.src = imageSrc;
  await new Promise((resolve) => (img.onload = resolve));

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = data.data;

  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let count = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 40) continue;
    rSum += pixels[i];
    gSum += pixels[i + 1];
    bSum += pixels[i + 2];
    count++;
  }

  if (count > 0) {
    const rAvg = rSum / count;
    const gAvg = gSum / count;
    const bAvg = bSum / count;
    const gray = (rAvg + gAvg + bAvg) / 3;
    const rGain = Math.min(1.25, Math.max(0.85, gray / Math.max(rAvg, 1)));
    const gGain = Math.min(1.25, Math.max(0.85, gray / Math.max(gAvg, 1)));
    const bGain = Math.min(1.25, Math.max(0.85, gray / Math.max(bAvg, 1)));
    const gamma = 0.92;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 10) continue;
      pixels[i] = clamp255(Math.pow((pixels[i] * rGain) / 255, gamma) * 255);
      pixels[i + 1] = clamp255(Math.pow((pixels[i + 1] * gGain) / 255, gamma) * 255);
      pixels[i + 2] = clamp255(Math.pow((pixels[i + 2] * bGain) / 255, gamma) * 255);
    }
  }

  ctx.putImageData(data, 0, 0);
  const balanced = canvas.toDataURL('image/png');
  return enhanceImage(balanced, { brightness: 1.02, contrast: 1.1, sharpen: 0.3 });
}

function clamp255(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function isSubjectPixel(alpha: number): boolean {
  return alpha >= SUBJECT_ALPHA_THRESHOLD;
}

function restoreBackgroundPixels(
  dst: Uint8ClampedArray,
  original: Uint8ClampedArray,
  i: number
): void {
  dst[i] = original[i];
  dst[i + 1] = original[i + 1];
  dst[i + 2] = original[i + 2];
  dst[i + 3] = original[i + 3];
}

function applyBrightnessContrastSubjectOnly(
  imageData: ImageData,
  brightness: number,
  contrast: number,
  original: Uint8ClampedArray
): void {
  const pixels = imageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    if (!isSubjectPixel(pixels[i + 3])) {
      restoreBackgroundPixels(pixels, original, i);
      continue;
    }

    for (let c = 0; c < 3; c++) {
      let val = pixels[i + c];
      val = (val - 128) * contrast + 128;
      val = val * brightness;
      pixels[i + c] = clamp255(val);
    }
  }
}

function rgbLuminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function scaleRgbToLuminance(r: number, g: number, b: number, targetL: number): [number, number, number] {
  const l = rgbLuminance(r, g, b);
  if (l < 1) return [r, g, b];
  const scale = targetL / l;
  return [clamp255(r * scale), clamp255(g * scale), clamp255(b * scale)];
}

/** Keep original hue/saturation; apply only luminance detail from the enhanced image. */
export function preserveColorTone(
  original: ImageData,
  enhanced: ImageData,
  strength = 1
): ImageData {
  const out = new ImageData(original.width, original.height);
  const orig = original.data;
  const enh = enhanced.data;
  const dst = out.data;

  for (let i = 0; i < orig.length; i += 4) {
    dst[i + 3] = orig[i + 3];
    if (orig[i + 3] < 10) {
      dst[i] = orig[i];
      dst[i + 1] = orig[i + 1];
      dst[i + 2] = orig[i + 2];
      continue;
    }

    const origL = rgbLuminance(orig[i], orig[i + 1], orig[i + 2]);
    const enhL = rgbLuminance(enh[i], enh[i + 1], enh[i + 2]);
    const targetL = origL + (enhL - origL) * strength;
    [dst[i], dst[i + 1], dst[i + 2]] = scaleRgbToLuminance(
      orig[i],
      orig[i + 1],
      orig[i + 2],
      targetL
    );
  }

  return out;
}

function resizeImageData(source: ImageData, targetW: number, targetH: number): ImageData {
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = source.width;
  srcCanvas.height = source.height;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) throw new Error('Could not get canvas context');
  srcCtx.putImageData(source, 0, 0);

  const dstCanvas = document.createElement('canvas');
  dstCanvas.width = targetW;
  dstCanvas.height = targetH;
  const dstCtx = dstCanvas.getContext('2d');
  if (!dstCtx) throw new Error('Could not get canvas context');
  dstCtx.imageSmoothingEnabled = true;
  dstCtx.imageSmoothingQuality = 'high';
  dstCtx.drawImage(srcCanvas, 0, 0, targetW, targetH);
  return dstCtx.getImageData(0, 0, targetW, targetH);
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

/** Add model detail onto full-res original — avoids blurry upscale of the whole image. */
export function applyEnhancementDetail(
  source: ImageData,
  enhanced: ImageData,
  strength = 1.1
): ImageData {
  const ew = enhanced.width;
  const eh = enhanced.height;
  const sw = source.width;
  const sh = source.height;
  const sourceSmall = resizeImageData(source, ew, eh);
  const detailMap = new Float32Array(ew * eh);

  for (let y = 0; y < eh; y++) {
    for (let x = 0; x < ew; x++) {
      const idx = y * ew + x;
      const si = idx * 4;
      if (!isSubjectPixel(sourceSmall.data[si + 3])) {
        detailMap[idx] = 0;
        continue;
      }
      const origL = rgbLuminance(
        sourceSmall.data[si],
        sourceSmall.data[si + 1],
        sourceSmall.data[si + 2]
      );
      const enhL = rgbLuminance(
        enhanced.data[si],
        enhanced.data[si + 1],
        enhanced.data[si + 2]
      );
      detailMap[idx] = (enhL - origL) * strength;
    }
  }

  const out = new ImageData(sw, sh);
  const dst = out.data;
  const src = source.data;

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4;
      dst[i + 3] = src[i + 3];
      if (!isSubjectPixel(src[i + 3])) {
        restoreBackgroundPixels(dst, src, i);
        continue;
      }

      const mapX = ((x + 0.5) * ew) / sw - 0.5;
      const mapY = ((y + 0.5) * eh) / sh - 0.5;
      const detail = sampleBilinear(detailMap, ew, eh, mapX, mapY);
      const origL = rgbLuminance(src[i], src[i + 1], src[i + 2]);
      [dst[i], dst[i + 1], dst[i + 2]] = scaleRgbToLuminance(
        src[i],
        src[i + 1],
        src[i + 2],
        origL + detail
      );
    }
  }

  return out;
}

function boxBlur3(imageData: ImageData): ImageData {
  const { width, height, data } = imageData;
  const out = new Uint8ClampedArray(data.length);

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

  return new ImageData(out, width, height);
}

function softBlur(imageData: ImageData): ImageData {
  return boxBlur3(boxBlur3(imageData));
}

/** 0–1 weight for skin-tone pixels (YCbCr heuristic). */
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

/** Edge-aware skin smooth — clears blemishes on skin, keeps eyes/hair sharp. */
export function clearSkinImageData(imageData: ImageData, amount = 0.42): ImageData {
  const blurred = boxBlur3(imageData);
  const soft = softBlur(imageData);
  const { width, height, data } = imageData;
  const blurData = blurred.data;
  const softData = soft.data;
  const out = new ImageData(width, height);
  const dst = out.data;

  for (let i = 0; i < data.length; i += 4) {
    if (!isSubjectPixel(data[i + 3])) {
      restoreBackgroundPixels(dst, data, i);
      continue;
    }

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const skin = skinToneWeight(r, g, b);
    const edge = edgeStrength(r, g, b, blurData[i], blurData[i + 1], blurData[i + 2]);
    const blend = amount * skin * (1 - edge) * (1 - edge);

    dst[i + 3] = data[i + 3];
    for (let c = 0; c < 3; c++) {
      dst[i + c] = clamp255(data[i + c] * (1 - blend) + softData[i + c] * blend);
    }
  }

  return out;
}

export function applyPortraitFilters(
  imageData: ImageData,
  skinClear = 0.42,
  sharpenAmount = 0.55
): ImageData {
  return sharpenPortraitImageData(clearSkinImageData(imageData, skinClear), sharpenAmount);
}

/** Unsharp mask — sharpens subject only, leaves background untouched. */
export function sharpenPortraitImageData(imageData: ImageData, amount = 0.62): ImageData {
  const blurred = boxBlur3(imageData);
  const { width, height, data } = imageData;
  const blurData = blurred.data;
  const out = new ImageData(width, height);
  const dst = out.data;

  for (let i = 0; i < data.length; i += 4) {
    if (!isSubjectPixel(data[i + 3])) {
      restoreBackgroundPixels(dst, data, i);
      continue;
    }

    dst[i + 3] = data[i + 3];
    for (let c = 0; c < 3; c++) {
      const detail = data[i + c] - blurData[i + c];
      dst[i + c] = clamp255(data[i + c] + detail * amount);
    }
  }

  return out;
}

export async function finishPortraitEnhance(imageSrc: string): Promise<string> {
  const img = new Image();
  img.src = imageSrc;
  await new Promise((resolve) => (img.onload = resolve));

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.putImageData(applyPortraitFilters(data), 0, 0);
  return canvas.toDataURL('image/png');
}

function sharpen(imageData: ImageData, amount: number, original?: Uint8ClampedArray) {
  const { width, height, data } = imageData;
  const output = new ImageData(new Uint8ClampedArray(data), width, height);
  const outputData = output.data;
  const orig = original ?? data;

  // Simple sharpening kernel
  // [ 0, -1,  0]
  // [-1,  5, -1]
  // [ 0, -1,  0]
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      if (!isSubjectPixel(data[idx + 3])) {
        restoreBackgroundPixels(outputData, orig, idx);
        continue;
      }

      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const sampleIdx = ((y + ky - 1) * width + (x + kx - 1)) * 4 + c;
            sum += data[sampleIdx] * kernel[ky * 3 + kx];
          }
        }
        outputData[idx + c] = data[idx + c] * (1 - amount) + sum * amount;
      }
      outputData[idx + 3] = data[idx + 3];
    }
  }

  return output;
}
