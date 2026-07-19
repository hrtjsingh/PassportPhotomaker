/** HQ enhancement via backend API (signed in) or local Swin2SR. */
import { canUseMlBackend } from './mlAuth';

export async function aiEnhanceImage(
  imageSrc: string,
  backgroundColor = '#ffffff',
  onProgress?: (progress: number) => void
): Promise<string> {
  if (canUseMlBackend()) {
    const { enhanceViaApi } = await import('./mlApiClient');
    return enhanceViaApi(imageSrc, backgroundColor, onProgress);
  }

  const { hqEnhanceImage } = await import('./hqEnhanceImage');
  return hqEnhanceImage(imageSrc, backgroundColor, onProgress);
}
