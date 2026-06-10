import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';
import { getBgRemovalConfig, ensureBgRemovalPublicPath } from './bgRemovalConfig';
import { waitForModelPreload } from './modelPreload';
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
  _backgroundColor = '#ffffff'
): Promise<string> {
  try {
    await waitForModelPreload();
    await ensureBgRemovalPublicPath();
    const { paddedSrc, padding } = await addImagePadding(imageSrc, 0.1);
    const paddedBlob = await dataUrlToBlob(paddedSrc);

    const blob = await imglyRemoveBackground(paddedBlob, {
      ...getBgRemovalConfig(),
      progress: (key, current, total) => {
        if (onProgress) {
          onProgress(Math.round((current / total) * 100));
        }
      },
    });

    const paddedResultUrl = URL.createObjectURL(blob);
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
        // Fall back to cropped result if refinement fails
        return croppedUrl;
      }
    } finally {
      URL.revokeObjectURL(paddedResultUrl);
    }
  } catch (error) {
    console.error('Background removal failed:', error);
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
