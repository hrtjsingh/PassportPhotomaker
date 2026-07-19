/** Route background removal to the user-selected local model. */
import {
  getBgRemovalModelById,
  OOM_FALLBACK_MODEL_ID,
  type BgRemovalModelOption,
} from '../config/bgRemovalModels';
import { getSelectedBgModel } from './bgRemovalSettings';
import {
  formatBgRemovalOomError,
  getMemoryFallbackSizes,
  isBgRemovalOomError,
  yieldForMemoryReclaim,
} from './bgRemovalInput';
import { hqRemoveBackground, resetBgRemoverCache } from './hqRemoveBackground';
import { removeBackground } from './removeBackground';

export interface BgRemovalRunResult {
  url: string;
  usedFallback?: { from: string; to: string };
}

async function runOnce(
  model: BgRemovalModelOption,
  imageSrc: string,
  maxInputPx: number,
  onProgress?: (progress: number) => void,
  backgroundColor = '#ffffff',
  modelOverride?: BgRemovalModelOption
): Promise<string> {
  const activeModel = modelOverride ?? model;
  if (activeModel.backend === 'imgly') {
    return removeBackground(imageSrc, onProgress, backgroundColor, maxInputPx);
  }
  return hqRemoveBackground(imageSrc, onProgress, backgroundColor, maxInputPx, modelOverride);
}

async function runWithRetries(
  model: BgRemovalModelOption,
  imageSrc: string,
  onProgress?: (progress: number) => void,
  backgroundColor = '#ffffff',
  modelOverride?: BgRemovalModelOption
): Promise<string> {
  const activeModel = modelOverride ?? model;
  const sizes = getMemoryFallbackSizes(activeModel.maxInputPx ?? 2048, activeModel.memoryHeavy);

  let lastError: unknown;
  for (let i = 0; i < sizes.length; i++) {
    try {
      return await runOnce(model, imageSrc, sizes[i], onProgress, backgroundColor, modelOverride);
    } catch (error) {
      if (!isBgRemovalOomError(error)) throw error;
      lastError = error;
      if (i < sizes.length - 1) {
        await yieldForMemoryReclaim();
      }
    }
  }

  throw lastError;
}

export async function runBgRemoval(
  imageSrc: string,
  onProgress?: (progress: number) => void,
  backgroundColor = '#ffffff'
): Promise<BgRemovalRunResult> {
  const model = getSelectedBgModel();

  try {
    const url = await runWithRetries(model, imageSrc, onProgress, backgroundColor);
    return { url };
  } catch (error) {
    if (!isBgRemovalOomError(error) || !model.memoryHeavy || model.id === OOM_FALLBACK_MODEL_ID) {
      if (isBgRemovalOomError(error)) {
        throw new Error(formatBgRemovalOomError(model.name));
      }
      throw error;
    }
  }

  const fallback = getBgRemovalModelById(OOM_FALLBACK_MODEL_ID);
  resetBgRemoverCache();
  await yieldForMemoryReclaim(400);

  try {
    const url = await runWithRetries(model, imageSrc, onProgress, backgroundColor, fallback);
    return {
      url,
      usedFallback: { from: model.name, to: fallback.name },
    };
  } catch (fallbackError) {
    console.error('Background removal fallback failed:', fallbackError);
    throw new Error(formatBgRemovalOomError(model.name));
  }
}
