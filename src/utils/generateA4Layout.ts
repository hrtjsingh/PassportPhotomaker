import {
  canvasToPngBlobUrl,
  createA4Canvas,
  finalizeA4Canvas,
  getPrintDpiConfig,
  mmToPxAtDpi,
  type PrintDpiConfig,
} from './printDpi';
import {
  computePrintGrid,
  getPhotoDrawSizePx,
  PAGE_PADDING_MM,
  PHOTO_MARGIN_MM,
} from './computePrintGrid';
import { DEFAULT_SHEET } from '../config/sheetSizes';

export type PrintDPI = number;

export interface A4LayoutResult {
  pages: string[];
  photosPerPage: number;
  totalPages: number;
  totalCopies: number;
  cols: number;
  rows: number;
  photoWidthMm: number;
  photoHeightMm: number;
}

export interface PrintLayoutOptions {
  sheetWidthMm?: number;
  sheetHeightMm?: number;
  cols?: number;
  rows?: number;
}

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

  const pixelPerfect =
    img.naturalWidth === photoWidthPx && img.naturalHeight === photoHeightPx;
  ctx.imageSmoothingEnabled = !pixelPerfect;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, x, y, photoWidthPx, photoHeightPx);

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
  dpi: PrintDPI = 300,
  options: PrintLayoutOptions = {}
): Promise<A4LayoutResult> {
  const sheetWidthMm = options.sheetWidthMm ?? DEFAULT_SHEET.widthMm;
  const sheetHeightMm = options.sheetHeightMm ?? DEFAULT_SHEET.heightMm;

  const dpiConfig: PrintDpiConfig = getPrintDpiConfig(dpi, sheetWidthMm, sheetHeightMm);
  const { canvasWidth, canvasHeight, renderDPI, metaDPI } = dpiConfig;

  const paddingPx = mmToPxAtDpi(PAGE_PADDING_MM, renderDPI);
  const marginPx = mmToPxAtDpi(PHOTO_MARGIN_MM, renderDPI);
  const { widthPx: photoWidthPx, heightPx: photoHeightPx } = getPhotoDrawSizePx(
    photoWidthMm,
    photoHeightMm,
    renderDPI
  );

  const gridLimits = computePrintGrid(photoWidthMm, photoHeightMm, sheetWidthMm, sheetHeightMm);
  const cols = Math.min(options.cols ?? gridLimits.defaultCols, gridLimits.maxCols);
  const rows = Math.min(options.rows ?? gridLimits.defaultRows, gridLimits.maxRows);
  const photosPerPage = cols * rows;

  const offsetX = paddingPx;
  const offsetY = paddingPx;

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
    cols,
    rows,
    photoWidthMm,
    photoHeightMm,
  };
}

export { computePrintGrid };
