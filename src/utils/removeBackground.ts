import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';
import { getBgRemovalConfig, ensureBgRemovalPublicPath } from './bgRemovalConfig';
import { waitForModelPreload } from './modelPreload';
import { getSelectedBgModel } from './bgRemovalSettings';
import {
  getImageDimensions,
  isBgRemovalOomError,
  limitImageSizeForInference,
  upscaleImageBlob,
} from './bgRemovalInput';
import {
  addImagePadding,
  cropPaddingFromResult,
  refineAlphaFromOriginal,
} from './refineAlphaMask';

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function removeBackground(
  imageSrc: string,
  onProgress?: (progress: number) => void,
  _backgroundColor = '#ffffff',
  maxInputPx?: number
): Promise<string> {
  const selected = getSelectedBgModel();
  if (selected.backend !== 'imgly') {
    throw new Error('Selected background model is not an imgly model.');
  }

  const imglyModel = selected.modelId as 'isnet' | 'isnet_fp16' | 'isnet_quint8';

  try {
    await waitForModelPreload();
    await ensureBgRemovalPublicPath();
    const originalSize = await getImageDimensions(imageSrc);
    const inputLimit = maxInputPx ?? selected.maxInputPx ?? 2048;
    const { src: inferenceSrc, scale } = await limitImageSizeForInference(imageSrc, inputLimit);
    const { paddedSrc, padding } = await addImagePadding(inferenceSrc, 0.1);
    const paddedBlob = await dataUrlToBlob(paddedSrc);

    const blob = await imglyRemoveBackground(paddedBlob, {
      ...getBgRemovalConfig(imglyModel),
      progress: (_key, current, total) => {
        if (onProgress) {
          onProgress(Math.round((current / total) * 100));
        }
      },
    });

    const paddedResultUrl = URL.createObjectURL(blob);
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
  } catch (error) {
    console.error('Background removal failed:', error);
    if (isBgRemovalOomError(error)) {
      throw error;
    }
    const message =
      error instanceof TypeError &&
      (String(error.message).includes('fetch') ||
        String(error.message).includes('URL'))
        ? 'Could not load the background removal model. Use npm start (not static hosting alone), or run: npm run setup:bg-removal && npm run build'
        : error instanceof Error
          ? error.message
          : 'Background removal failed';
    throw new Error(message);
  }
}
