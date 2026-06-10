/** Open-source HQ enhancement (Swin2SR + auto correction, runs locally in browser). */
export async function aiEnhanceImage(
  imageSrc: string,
  backgroundColor = '#ffffff',
  onProgress?: (progress: number) => void
): Promise<string> {
  const { hqEnhanceImage } = await import('./hqEnhanceImage');
  return hqEnhanceImage(imageSrc, backgroundColor, onProgress);
}
