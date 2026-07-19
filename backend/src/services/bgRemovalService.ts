import type { BgRemovalModelOption } from '../config/models.js';
import {
  getBgRemovalModelById,
  OOM_FALLBACK_MODEL_ID,
} from '../config/models.js';
import { refineAlphaFromOriginal } from '../utils/alphaRefine.js';
import {
  addImagePadding,
  cropPadding,
  getImageSize,
  getMemoryFallbackSizes,
  isOomError,
  limitImageSize,
  upscaleImage,
} from '../utils/imageProcessing.js';
import { clearLoadedModels, getBgRemover } from './modelManager.js';

export interface BgRemovalResult {
  buffer: Buffer;
  usedFallback?: { from: string; to: string };
}

async function runOnce(
  model: BgRemovalModelOption,
  imageBuffer: Buffer,
  maxInputPx: number,
  backgroundColor?: string
): Promise<Buffer> {
  const originalSize = await getImageSize(imageBuffer);
  const { buffer: inferenceBuffer, scale } = await limitImageSize(imageBuffer, maxInputPx);
  const { buffer: paddedBuffer, padding } = await addImagePadding(inferenceBuffer, 0.1, backgroundColor);

  const segmenter = await getBgRemover(model);
  const paddedBlob = new Blob([paddedBuffer], { type: 'image/png' });
  const rawImage = await segmenter(paddedBlob);
  const resultBuffer = Buffer.from(await rawImage.toBlob('image/png').then((b) => b.arrayBuffer()));

  let cropped = await cropPadding(resultBuffer, padding);
  if (scale < 1) {
    cropped = await upscaleImage(cropped, originalSize.width, originalSize.height);
  }

  try {
    return await refineAlphaFromOriginal(imageBuffer, cropped, {
      dilationRadius: 1,
      sourceBackgroundColor: backgroundColor,
    });
  } catch {
    return cropped;
  }
}

async function runWithRetries(
  model: BgRemovalModelOption,
  imageBuffer: Buffer,
  backgroundColor?: string
): Promise<Buffer> {
  const sizes = getMemoryFallbackSizes(model.maxInputPx ?? 2048, model.memoryHeavy);
  let lastError: unknown;

  for (const size of sizes) {
    try {
      return await runOnce(model, imageBuffer, size, backgroundColor);
    } catch (error) {
      if (!isOomError(error)) throw error;
      lastError = error;
    }
  }

  throw lastError;
}

export async function removeBackground(
  imageBuffer: Buffer,
  modelId?: string,
  backgroundColor?: string
): Promise<BgRemovalResult> {
  const model = getBgRemovalModelById(modelId ?? 'ben2');

  try {
    const buffer = await runWithRetries(model, imageBuffer, backgroundColor);
    return { buffer };
  } catch (error) {
    if (!isOomError(error) || !model.memoryHeavy || model.id === OOM_FALLBACK_MODEL_ID) {
      throw error;
    }
  }

  const fallback = getBgRemovalModelById(OOM_FALLBACK_MODEL_ID);
  clearLoadedModels();

  const buffer = await runWithRetries(fallback, imageBuffer, backgroundColor);
  return {
    buffer,
    usedFallback: { from: model.name, to: fallback.name },
  };
}
