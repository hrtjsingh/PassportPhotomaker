import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';

export async function removeBackground(
  imageSrc: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const blob = await imglyRemoveBackground(imageSrc, {
      progress: (key, current, total) => {
        if (onProgress) {
          const progress = Math.round((current / total) * 100);
          onProgress(progress);
        }
      },
      model: 'isnet_fp16', // More accurate than 'isnet'
      output: {
        quality: 1.0,         // Max quality output
        format: 'image/png',  // PNG preserves transparency better
      },
    });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Background removal failed:', error);
    throw error;
  }
}