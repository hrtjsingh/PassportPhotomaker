import { MAX_ENHANCE_INPUT_PX } from '../config/models.js';
import {
  applyAlphaMask,
  applyEnhancementDetail,
  applyPortraitFilters,
  extractAlphaMask,
} from '../utils/enhancePostProcess.js';
import {
  compositeOnBackground,
  getImageSize,
  getMemoryFallbackSizes,
  getRawRgba,
  fromRawRgba,
  isOomError,
} from '../utils/imageProcessing.js';
import { getUpscaler } from './modelManager.js';

function scaleToMaxEdge(width: number, height: number, maxPx: number) {
  const longest = Math.max(width, height);
  if (longest <= maxPx) return { width, height };
  const scale = maxPx / longest;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

async function runEnhanceAtSize(
  imageBuffer: Buffer,
  width: number,
  height: number,
  alphaMask: Uint8ClampedArray | null,
  maxInputPx: number,
  backgroundColor: string
): Promise<Buffer> {
  const scaled = scaleToMaxEdge(width, height, maxInputPx);
  const compositeBuffer = await compositeOnBackground(
    imageBuffer,
    scaled.width,
    scaled.height,
    backgroundColor
  );

  const upscaler = await getUpscaler();
  const inputBlob = new Blob([compositeBuffer], { type: 'image/jpeg' });
  const result = await upscaler(inputBlob);
  const upscaledBuffer = Buffer.from(await result.toBlob('image/png').then((b) => b.arrayBuffer()));

  const source = await getRawRgba(imageBuffer);
  const enhanced = await getRawRgba(upscaledBuffer);

  let merged = applyEnhancementDetail(
    source.data,
    enhanced.data,
    width,
    height,
    enhanced.width,
    enhanced.height
  );

  merged = applyPortraitFilters(merged, width, height);

  if (alphaMask) {
    merged = applyAlphaMask(merged, alphaMask);
  }

  return fromRawRgba(merged, width, height);
}

export async function enhanceImage(
  imageBuffer: Buffer,
  backgroundColor = '#ffffff'
): Promise<Buffer> {
  const { width, height } = await getImageSize(imageBuffer);
  const { data } = await getRawRgba(imageBuffer);
  const alphaMask = extractAlphaMask(data, width, height);
  const sizes = getMemoryFallbackSizes(MAX_ENHANCE_INPUT_PX, true);

  let lastError: unknown;
  for (const size of sizes) {
    try {
      return await runEnhanceAtSize(imageBuffer, width, height, alphaMask, size, backgroundColor);
    } catch (error) {
      if (!isOomError(error)) throw error;
      lastError = error;
    }
  }

  throw lastError ?? new Error('Enhancement failed');
}
