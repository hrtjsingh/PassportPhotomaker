import { pipeline, env, type RawImage } from '@huggingface/transformers';
import {
  addImagePadding,
  cropPaddingFromResult,
  refineAlphaFromOriginal,
} from './refineAlphaMask';
import { waitForModelPreload } from './modelPreload';

import { HQ_BG_MODEL } from '../config/mlModels';

export { HQ_BG_MODEL };

env.allowLocalModels = false;
env.useBrowserCache = true;

type BackgroundRemover = (
  image: Blob,
  options?: Record<string, unknown>
) => Promise<RawImage>;

let removerPromise: Promise<BackgroundRemover> | null = null;
let progressHandler: ((progress: number) => void) | undefined;

async function getRemover(onProgress?: (progress: number) => void): Promise<BackgroundRemover> {
  progressHandler = onProgress;
  if (!removerPromise) {
    removerPromise = (
      pipeline('background-removal', HQ_BG_MODEL, {
        progress_callback: (info: { status: string; progress?: number }) => {
          if (info.status === 'progress' && info.progress != null) {
            progressHandler?.(Math.round(info.progress));
          }
        },
      }) as Promise<BackgroundRemover>
    ).catch((err) => {
      removerPromise = null;
      throw err;
    });
  }
  return removerPromise;
}

/** Load ModNet into main-thread memory (after worker cache warmup). */
export function warmupBgRemover(): Promise<void> {
  return getRemover().then(() => undefined);
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

/** High-quality background removal using ModNet (100% local, no API key). */
export async function hqRemoveBackground(
  imageSrc: string,
  onProgress?: (progress: number) => void,
  _backgroundColor = '#ffffff'
): Promise<string> {
  await waitForModelPreload();
  const { paddedSrc, padding } = await addImagePadding(imageSrc, 0.1);
  const paddedBlob = await dataUrlToBlob(paddedSrc);

  const segmenter = await getRemover(onProgress);
  const rawImage = await segmenter(paddedBlob);
  const resultBlob = await rawImage.toBlob('image/png');

  const paddedResultUrl = URL.createObjectURL(resultBlob);
  try {
    const croppedBlob = await cropPaddingFromResult(paddedResultUrl, padding);
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
