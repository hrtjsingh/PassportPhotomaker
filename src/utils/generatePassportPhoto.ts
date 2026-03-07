import { getPixelsFromMm } from '../config/passportSizes';

export async function generatePassportPhoto(
  imageSrc: string,
  widthMm: number,
  heightMm: number,
  backgroundColor: string = '#ffffff',
  upscaleFactor: number = 1
): Promise<string> {
  const widthPx = getPixelsFromMm(widthMm) * upscaleFactor;
  const heightPx = getPixelsFromMm(heightMm) * upscaleFactor;

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, widthPx, heightPx);

  // Draw image
  const img = new Image();
  img.src = imageSrc;
  await new Promise((resolve) => (img.onload = resolve));

  // Calculate aspect ratios to fit image properly (cover)
  const imgAspectRatio = img.width / img.height;
  const canvasAspectRatio = widthPx / heightPx;

  let drawWidth, drawHeight, offsetX, offsetY;

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

  return canvas.toDataURL('image/png');
}
