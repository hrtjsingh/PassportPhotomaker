import { createImage } from './cropImage';
import { applyEnhancementDetail, applyPortraitFilters, finishPortraitEnhance } from './enhanceImage';
import {
  runEnhanceInWorker,
  terminateEnhanceWorker,
} from './enhanceWorkerClient';
import {
  getMemoryFallbackSizes,
  isBgRemovalOomError,
  yieldForMemoryReclaim,
} from './bgRemovalInput';
import { waitForModelPreload } from './modelPreload';
import { MAX_ENHANCE_INPUT_PX } from '../config/mlModels';

export { HQ_ENHANCE_MODEL } from '../config/mlModels';

function scaleToMaxEdge(width: number, height: number, maxPx: number) {
  const longest = Math.max(width, height);
  if (longest <= maxPx) return { width, height, scale: 1 };
  const scale = maxPx / longest;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    scale,
  };
}

function compositeOnBackground(
  imageSrc: string,
  width: number,
  height: number,
  backgroundColor: string
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

async function extractAlphaMask(imageSrc: string): Promise<Uint8ClampedArray | null> {
  const img = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const alpha = new Uint8ClampedArray(data.width * data.height);
  let hasTransparency = false;
  for (let i = 0; i < alpha.length; i++) {
    alpha[i] = data.data[i * 4 + 3];
    if (alpha[i] < 250) hasTransparency = true;
  }
  return hasTransparency ? alpha : null;
}

function applyAlphaMask(
  canvas: HTMLCanvasElement,
  alpha: Uint8ClampedArray,
  width: number,
  height: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const data = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < alpha.length; i++) {
    data.data[i * 4 + 3] = alpha[i];
  }
  ctx.putImageData(data, 0, 0);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/jpeg',
      0.92
    );
  });
}

async function runEnhanceAtSize(
  imageSrc: string,
  img: HTMLImageElement,
  width: number,
  height: number,
  alphaMask: Uint8ClampedArray | null,
  maxInputPx: number,
  backgroundColor: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const scaled = scaleToMaxEdge(width, height, maxInputPx);
  const compositeCanvas = await compositeOnBackground(
    imageSrc,
    scaled.width,
    scaled.height,
    backgroundColor
  );

  const inputBlob = await canvasToBlob(compositeCanvas);
  const upscaledBlob = await runEnhanceInWorker(inputBlob, onProgress);

  const upscaledUrl = URL.createObjectURL(upscaledBlob);
  const upscaledImg = await createImage(upscaledUrl);
  URL.revokeObjectURL(upscaledUrl);

  const output = document.createElement('canvas');
  output.width = width;
  output.height = height;
  const ctx = output.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const modelCanvas = document.createElement('canvas');
  modelCanvas.width = upscaledImg.width;
  modelCanvas.height = upscaledImg.height;
  const modelCtx = modelCanvas.getContext('2d');
  if (!modelCtx) throw new Error('Could not get canvas context');
  modelCtx.drawImage(upscaledImg, 0, 0);
  const enhancedData = modelCtx.getImageData(0, 0, upscaledImg.width, upscaledImg.height);

  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const sourceCtx = sourceCanvas.getContext('2d');
  if (!sourceCtx) throw new Error('Could not get canvas context');
  sourceCtx.drawImage(img, 0, 0, width, height);
  const sourceData = sourceCtx.getImageData(0, 0, width, height);

  ctx.putImageData(applyEnhancementDetail(sourceData, enhancedData), 0, 0);
  ctx.putImageData(applyPortraitFilters(ctx.getImageData(0, 0, width, height)), 0, 0);

  if (alphaMask) {
    applyAlphaMask(output, alphaMask, width, height);
  }

  return output.toDataURL('image/png');
}

/**
 * HQ enhancement: Swin2SR detail on subject only; background unchanged.
 * Retries at smaller sizes on WASM OOM; falls back to local sharpen if all fail.
 */
export async function hqEnhanceImage(
  imageSrc: string,
  backgroundColor = '#ffffff',
  onProgress?: (progress: number) => void
): Promise<string> {
  await waitForModelPreload();

  const img = await createImage(imageSrc);
  const { width, height } = img;
  const alphaMask = await extractAlphaMask(imageSrc);
  const sizes = getMemoryFallbackSizes(MAX_ENHANCE_INPUT_PX, true);

  let lastError: unknown;
  for (let i = 0; i < sizes.length; i++) {
    try {
      return await runEnhanceAtSize(
        imageSrc,
        img,
        width,
        height,
        alphaMask,
        sizes[i],
        backgroundColor,
        onProgress
      );
    } catch (error) {
      if (!isBgRemovalOomError(error)) {
        console.warn('Swin2SR enhancement unavailable, using local sharpen:', error);
        return finishPortraitEnhance(imageSrc);
      }
      lastError = error;
      terminateEnhanceWorker();
      if (i < sizes.length - 1) {
        await yieldForMemoryReclaim();
      }
    }
  }

  console.warn('Swin2SR enhancement unavailable, using local sharpen:', lastError);
  return finishPortraitEnhance(imageSrc);
}

/** Swin2SR loads lazily inside the enhance worker — no main-thread warmup. */
export function warmupEnhancer(): Promise<void> {
  return Promise.resolve();
}
