import {
  canvasToPngBlobUrl,
  createA4Canvas,
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

const COLS = 5;
const PAGE_PADDING_MM = 5;
const PHOTO_MARGIN_MM = 5;

function drawPhotoOnPage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  indexOnPage: number,
  fittedPhotoWidth: number,
  fittedPhotoHeight: number,
  paddingPx: number,
  marginPx: number,
  scaleFactor: number
) {
  const col = indexOnPage % COLS;
  const row = Math.floor(indexOnPage / COLS);
  const x = paddingPx + col * (fittedPhotoWidth + marginPx);
  const y = paddingPx + row * (fittedPhotoHeight + marginPx);

  ctx.drawImage(img, x, y, fittedPhotoWidth, fittedPhotoHeight);

  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2 * scaleFactor;
  ctx.strokeRect(x, y, fittedPhotoWidth, fittedPhotoHeight);

  ctx.save();
  ctx.strokeStyle = '#aaaaaa';
  ctx.lineWidth = 1 * scaleFactor;
  ctx.setLineDash([6 * scaleFactor, 4 * scaleFactor]);
  ctx.strokeRect(
    x - scaleFactor,
    y - scaleFactor,
    fittedPhotoWidth + 2 * scaleFactor,
    fittedPhotoHeight + 2 * scaleFactor
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
  const { canvasWidth, canvasHeight, renderDPI, metaDPI }: PrintDpiConfig = getPrintDpiConfig(dpi);

  const paddingPx = mmToPxAtDpi(PAGE_PADDING_MM, renderDPI);
  const marginPx = mmToPxAtDpi(PHOTO_MARGIN_MM, renderDPI);

  const usableWidth = canvasWidth - 2 * paddingPx;
  const fittedPhotoWidth = Math.floor((usableWidth - (COLS - 1) * marginPx) / COLS);

  const aspectRatio = photoHeightMm / photoWidthMm;
  const fittedPhotoHeight = Math.round(fittedPhotoWidth * aspectRatio);

  const usableHeight = canvasHeight - 2 * paddingPx;
  const maxRows = Math.max(
    1,
    Math.floor((usableHeight + marginPx) / (fittedPhotoHeight + marginPx))
  );
  const photosPerPage = COLS * maxRows;
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
    const canvas = createA4Canvas({ canvasWidth, canvasHeight, renderDPI, metaDPI });
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
        fittedPhotoWidth,
        fittedPhotoHeight,
        paddingPx,
        marginPx,
        scaleFactor
      );
    }

    pages.push(await canvasToPngBlobUrl(canvas, metaDPI));
  }

  return {
    pages,
    photosPerPage,
    totalPages,
    totalCopies: numCopies,
  };
}
