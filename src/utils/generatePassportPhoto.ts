import { canvasToPngDataUrl, mmToPxAtDpi } from './printDpi';

export async function generatePassportPhoto(
  imageSrc: string,
  widthMm: number,
  heightMm: number,
  backgroundColor: string = '#ffffff',
  upscaleFactor: number = 1
): Promise<string> {
  const outputDpi = 300 * upscaleFactor;
  const widthPx = mmToPxAtDpi(widthMm, outputDpi);
  const heightPx = mmToPxAtDpi(heightMm, outputDpi);

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, widthPx, heightPx);

  const img = new Image();
  img.src = imageSrc;
  await new Promise((resolve) => (img.onload = resolve));

  const imgAspectRatio = img.width / img.height;
  const canvasAspectRatio = widthPx / heightPx;

  let drawWidth: number;
  let drawHeight: number;
  let offsetX: number;
  let offsetY: number;

  if (imgAspectRatio > canvasAspectRatio) {
    drawHeight = heightPx;
    drawWidth = heightPx * imgAspectRatio;
    offsetX = (widthPx - drawWidth) / 2;
    offsetY = 0;
  } else {
    drawWidth = widthPx;
    drawHeight = widthPx / imgAspectRatio;
    offsetX = 0;
    offsetY = (heightPx - drawHeight) / 2;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  return canvasToPngDataUrl(canvas, outputDpi);
}
