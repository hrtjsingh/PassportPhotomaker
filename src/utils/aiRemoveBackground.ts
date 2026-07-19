/** Background removal via user-selected local model. */
import { runBgRemoval } from './runBgRemoval';

export async function aiRemoveBackground(
  imageSrc: string,
  targetColor: string = 'transparent',
  onProgress?: (progress: number) => void
): Promise<string> {
  const bgColor = targetColor === 'transparent' ? '#ffffff' : targetColor;
  const result = await runBgRemoval(imageSrc, onProgress, bgColor);
  return result.url;
}
