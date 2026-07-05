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
  clampGridToFitSheet,
  getCellSizePx,
  getLayoutOptionsForSheet,
  getPhotoDrawSizePx,
  resolveSheetPadding,
  PHOTO_MARGIN_MM,
  type LayoutGridOptions,
} from './computePrintGrid';
import { DEFAULT_SHEET, type SheetSize } from '../config/sheetSizes';

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
  sheet?: SheetSize;
  layout?: LayoutGridOptions;
}

function drawPhotoOnPage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  indexOnPage: number,
  photoWidthPx: number,
  photoHeightPx: number,
  cellWidthPx: number,
  cellHeightPx: number,
  cols: number,
  offsetX: number,
  offsetY: number,
  marginPx: number,
  scaleFactor: number,
  rotateOnSheet: boolean
) {
  const col = indexOnPage % cols;
  const row = Math.floor(indexOnPage / cols);
  const x = offsetX + col * (cellWidthPx + marginPx);
  const y = offsetY + row * (cellHeightPx + marginPx);

  const pixelPerfect =
    img.naturalWidth === photoWidthPx && img.naturalHeight === photoHeightPx;
  ctx.imageSmoothingEnabled = !pixelPerfect;
  ctx.imageSmoothingQuality = 'high';

  if (rotateOnSheet) {
    ctx.save();
    ctx.translate(x + cellWidthPx, y);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      0,
      0,
      photoWidthPx,
      photoHeightPx
    );
    ctx.restore();
  } else {
    ctx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      x,
      y,
      photoWidthPx,
      photoHeightPx
    );
  }

  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2 * scaleFactor;
  ctx.strokeRect(x, y, cellWidthPx, cellHeightPx);

  ctx.save();
  ctx.strokeStyle = '#aaaaaa';
  ctx.lineWidth = 1 * scaleFactor;
  ctx.setLineDash([6 * scaleFactor, 4 * scaleFactor]);
  const inset = 2 * scaleFactor;
  ctx.strokeRect(
    x + inset,
    y + inset,
    Math.max(0, cellWidthPx - 2 * inset),
    Math.max(0, cellHeightPx - 2 * inset)
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
  const layoutOptions =
    options.layout ??
    (options.sheet ? getLayoutOptionsForSheet(options.sheet) : undefined) ??
    {};
  const padding = resolveSheetPadding(layoutOptions);
  const marginMm = layoutOptions.marginMm ?? PHOTO_MARGIN_MM;
  const rotatePhotosOnSheet = layoutOptions.rotatePhotosOnSheet ?? false;

  const dpiConfig: PrintDpiConfig = getPrintDpiConfig(dpi, sheetWidthMm, sheetHeightMm);
  const { canvasWidth, canvasHeight, renderDPI, metaDPI } = dpiConfig;

  const marginPx = mmToPxAtDpi(marginMm, renderDPI);
  const { widthPx: photoWidthPx, heightPx: photoHeightPx } = getPhotoDrawSizePx(
    photoWidthMm,
    photoHeightMm,
    renderDPI
  );
  const { widthPx: cellWidthPx, heightPx: cellHeightPx } = getCellSizePx(
    photoWidthMm,
    photoHeightMm,
    renderDPI,
    rotatePhotosOnSheet
  );

  const gridLimits = computePrintGrid(
    photoWidthMm,
    photoHeightMm,
    sheetWidthMm,
    sheetHeightMm,
    layoutOptions
  );
  const { cols, rows } = clampGridToFitSheet(
    options.cols ?? gridLimits.defaultCols,
    options.rows ?? gridLimits.defaultRows,
    photoWidthMm,
    photoHeightMm,
    sheetWidthMm,
    sheetHeightMm,
    layoutOptions
  );
  const photosPerPage = cols * rows;

  const gridWidthPx = cols * cellWidthPx + Math.max(0, cols - 1) * marginPx;
  const gridHeightPx = rows * cellHeightPx + Math.max(0, rows - 1) * marginPx;

  const minOffsetX = mmToPxAtDpi(padding.left, renderDPI);
  const offsetX = layoutOptions.centerGridOnSheet
    ? Math.round((canvasWidth - gridWidthPx) / 2)
    : minOffsetX;
  const offsetY = layoutOptions.centerGridOnSheet
    ? Math.round((canvasHeight - gridHeightPx) / 2)
    : mmToPxAtDpi(padding.top, renderDPI);

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
        cellWidthPx,
        cellHeightPx,
        cols,
        offsetX,
        offsetY,
        marginPx,
        scaleFactor,
        rotatePhotosOnSheet
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

export { computePrintGrid, getLayoutOptionsForSheet };
