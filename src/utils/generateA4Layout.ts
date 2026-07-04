import {
  canvasToPngBlobUrl,
  createA4Canvas,
  finalizeA4Canvas,
  getPrintDpiConfig,
  mmToPxAtDpi,
  type PrintDpiConfig,
} from './printDpi';

export type PrintDPI = number;

export interface A4LayoutResult {
  pages: string[];
  photosPerPage: number;
  totalPages: number;
  totalCopies: number;
}

const PAGE_PADDING_MM = 5;
const PHOTO_MARGIN_MM = 3;

function drawPhotoOnPage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  indexOnPage: number,
  photoWidthPx: number,
  photoHeightPx: number,
  cols: number,
  offsetX: number,
  offsetY: number,
  marginPx: number,
  scaleFactor: number
) {
  const col = indexOnPage % cols;
  const row = Math.floor(indexOnPage / cols);
  const x = offsetX + col * (photoWidthPx + marginPx);
  const y = offsetY + row * (photoHeightPx + marginPx);

  ctx.drawImage(img, x, y, photoWidthPx, photoHeightPx);

  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2 * scaleFactor;
  ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);

  ctx.save();
  ctx.strokeStyle = '#aaaaaa';
  ctx.lineWidth = 1 * scaleFactor;
  ctx.setLineDash([6 * scaleFactor, 4 * scaleFactor]);
  ctx.strokeRect(
    x - scaleFactor,
    y - scaleFactor,
    photoWidthPx + 2 * scaleFactor,
    photoHeightPx + 2 * scaleFactor
  );
  ctx.restore();
}

export async function generateA4Layout(
  passportPhotoSrc: string,
  photoWidthMm: number,
  photoHeightMm: number,
  numCopies: number,
  dpi: PrintDPI = 300
): Promise<A4LayoutResult> {
  const dpiConfig: PrintDpiConfig = getPrintDpiConfig(dpi);
  const { canvasWidth, canvasHeight, renderDPI, metaDPI } = dpiConfig;

  const paddingPx = mmToPxAtDpi(PAGE_PADDING_MM, renderDPI);
  const marginPx = mmToPxAtDpi(PHOTO_MARGIN_MM, renderDPI);
  const photoWidthPx = mmToPxAtDpi(photoWidthMm, renderDPI);
  const photoHeightPx = mmToPxAtDpi(photoHeightMm, renderDPI);

  const usableWidth = canvasWidth - 2 * paddingPx;
  const usableHeight = canvasHeight - 2 * paddingPx;

  const cols = Math.max(1, Math.floor((usableWidth + marginPx) / (photoWidthPx + marginPx)));
  const rows = Math.max(1, Math.floor((usableHeight + marginPx) / (photoHeightPx + marginPx)));
  const photosPerPage = cols * rows;

  const gridWidth = cols * photoWidthPx + (cols - 1) * marginPx;
  const gridHeight = rows * photoHeightPx + (rows - 1) * marginPx;
  const offsetX = paddingPx + Math.floor((usableWidth - gridWidth) / 2);
  const offsetY = paddingPx + Math.floor((usableHeight - gridHeight) / 2);

  const totalPages = Math.max(1, Math.ceil(numCopies / photosPerPage));
  const scaleFactor = renderDPI / 300;

  const img = new Image();
  img.src = passportPhotoSrc;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load passport photo'));
  });

  const pages: string[] = [];

  for (let page = 0; page < totalPages; page++) {
    const canvas = createA4Canvas(dpiConfig);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const startCopy = page * photosPerPage;
    const endCopy = Math.min(numCopies, startCopy + photosPerPage);

    for (let i = startCopy; i < endCopy; i++) {
      drawPhotoOnPage(
        ctx,
        img,
        i - startCopy,
        photoWidthPx,
        photoHeightPx,
        cols,
        offsetX,
        offsetY,
        marginPx,
        scaleFactor
      );
    }

    pages.push(await canvasToPngBlobUrl(finalizeA4Canvas(canvas, dpiConfig), metaDPI));
  }

  return {
    pages,
    photosPerPage,
    totalPages,
    totalCopies: numCopies,
  };
}
