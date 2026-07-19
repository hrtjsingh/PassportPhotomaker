import { createImage } from './cropImage';

export async function getImageDimensions(
  imageSrc: string
): Promise<{ width: number; height: number }> {
  const img = await createImage(imageSrc);
  return { width: img.width, height: img.height };
}

/** Downscale for inference when photo exceeds model memory budget. */
export async function limitImageSizeForInference(
  imageSrc: string,
  maxLongestEdge: number
): Promise<{ src: string; scale: number }> {
  const img = await createImage(imageSrc);
  const longest = Math.max(img.width, img.height);
  if (longest <= maxLongestEdge) {
    return { src: imageSrc, scale: 1 };
  }

  const scale = maxLongestEdge / longest;
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(img, 0, 0, width, height);
  return { src: canvas.toDataURL('image/png'), scale: width / img.width };
}

export async function upscaleImageBlob(
  blob: Blob,
  targetWidth: number,
  targetHeight: number
): Promise<Blob> {
  const url = URL.createObjectURL(blob);
  try {
    const img = await createImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('Canvas toBlob failed'))),
        'image/png'
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function isBgRemovalOomError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('bad_alloc') ||
    message.includes('ERROR_CODE: 6') ||
    message.includes('Out of memory') ||
    message.includes('OOM')
  );
}

export function getMemoryFallbackSizes(maxInputPx: number, memoryHeavy = false): number[] {
  const minSize = memoryHeavy ? 256 : 320;
  const candidates = memoryHeavy
    ? [maxInputPx, Math.round(maxInputPx * 0.7), 384, 320, 288, 256]
    : [maxInputPx, Math.round(maxInputPx * 0.75), 512, 384];
  return [...new Set(candidates.filter((size) => size >= minSize))].sort((a, b) => b - a);
}

/** Brief pause so WASM can reclaim memory between OOM retries. */
export function yieldForMemoryReclaim(ms = 150): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function formatBgRemovalOomError(modelName: string): string {
  return (
    `${modelName} ran out of browser memory even at reduced size. ` +
    'Switch to ModNet or ISNet in Settings, close other tabs, or use a smaller photo.'
  );
}
