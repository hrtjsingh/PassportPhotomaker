/** Open-source high-quality background removal (ModNet, runs locally in browser). */
export async function aiRemoveBackground(
  imageSrc: string,
  targetColor: string = 'transparent',
  onProgress?: (progress: number) => void
): Promise<string> {
  const { hqRemoveBackground } = await import('./hqRemoveBackground');
  const bgColor = targetColor === 'transparent' ? '#ffffff' : targetColor;
  return hqRemoveBackground(imageSrc, onProgress, bgColor);
}
