import { pipeline, env, type RawImage } from '@huggingface/transformers';
import type { BgRemovalModelOption } from '../config/bgRemovalModels';
import { getTransformersPipelineOptions } from '../config/bgRemovalModels';
import {
  addImagePadding,
  cropPaddingFromResult,
  refineAlphaFromOriginal,
} from './refineAlphaMask';
import {
  getImageDimensions,
  limitImageSizeForInference,
  upscaleImageBlob,
} from './bgRemovalInput';
import { waitForModelPreload } from './modelPreload';
import { getSelectedBgModel } from './bgRemovalSettings';

env.allowLocalModels = false;
env.useBrowserCache = true;

type BackgroundRemover = (
  image: Blob,
  options?: Record<string, unknown>
) => Promise<RawImage>;

let removerPromise: Promise<BackgroundRemover> | null = null;
let loadedModelKey: string | null = null;
let progressHandler: ((progress: number) => void) | undefined;

export function resetBgRemoverCache(): void {
  removerPromise = null;
  loadedModelKey = null;
}

async function getRemover(
  model: BgRemovalModelOption,
  onProgress?: (progress: number) => void
): Promise<BackgroundRemover> {
  progressHandler = onProgress;

  if (model.backend !== 'transformers') {
    throw new Error('Selected background model is not a Transformers.js model.');
  }

  if (loadedModelKey !== model.id) {
    removerPromise = null;
    loadedModelKey = model.id;
  }

  if (!removerPromise) {
    removerPromise = (
      pipeline(
        'background-removal',
        model.modelId,
        getTransformersPipelineOptions(model, (progress) => {
          progressHandler?.(progress);
        })
      ) as Promise<BackgroundRemover>
    ).catch((err) => {
      removerPromise = null;
      loadedModelKey = null;
      throw err;
    });
  }
  return removerPromise;
}

/** Load selected Transformers.js model into main-thread memory. */
export function warmupBgRemover(): Promise<void> {
  const model = getSelectedBgModel();
  if (model.backend !== 'transformers') return Promise.resolve();
  return getRemover(model).then(() => undefined);
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

/** Background removal via Transformers.js pipeline (100% local, no API key). */
export async function hqRemoveBackground(
  imageSrc: string,
  onProgress?: (progress: number) => void,
  _backgroundColor = '#ffffff',
  maxInputPx?: number,
  modelOverride?: BgRemovalModelOption
): Promise<string> {
  const model = modelOverride ?? getSelectedBgModel();
  if (model.backend !== 'transformers') {
    throw new Error('Selected background model is not a Transformers.js model.');
  }

  if (!modelOverride) {
    await waitForModelPreload();
  }

  const inputLimit = maxInputPx ?? model.maxInputPx ?? 2048;
  const originalSize = await getImageDimensions(imageSrc);
  const { src: inferenceSrc, scale } = await limitImageSizeForInference(imageSrc, inputLimit);
  const { paddedSrc, padding } = await addImagePadding(inferenceSrc, 0.1);
  const paddedBlob = await dataUrlToBlob(paddedSrc);

  const segmenter = await getRemover(model, onProgress);
  const rawImage = await segmenter(paddedBlob);
  const resultBlob = await rawImage.toBlob('image/png');

  const paddedResultUrl = URL.createObjectURL(resultBlob);
  try {
    let croppedBlob = await cropPaddingFromResult(paddedResultUrl, padding);
    if (scale < 1) {
      croppedBlob = await upscaleImageBlob(
        croppedBlob,
        originalSize.width,
        originalSize.height
      );
    }

    const croppedUrl = URL.createObjectURL(croppedBlob);

    try {
      const refinedBlob = await refineAlphaFromOriginal(imageSrc, croppedUrl, {
        dilationRadius: 1,
      });
      URL.revokeObjectURL(croppedUrl);
      return URL.createObjectURL(refinedBlob);
    } catch {
      return croppedUrl;
    }
  } finally {
    URL.revokeObjectURL(paddedResultUrl);
  }
}
