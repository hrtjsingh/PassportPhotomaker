import type { A4LayoutResult } from './generateA4Layout';
import {
  canvasToPngBlobUrl,
  createA4Canvas,
  finalizeA4Canvas,
  getPrintDpiConfig,
  mmToPxAtDpi,
  type PrintDpiConfig,
} from './printDpi';

type PrintDPI = number;

const PAGE_PADDING_MM = 10;
const CARD_GAP_MM = 12;
const SET_GAP_MM = 12;
const MAX_SETS_PER_PAGE = 2;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function drawCardContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);

  const scale = Math.min(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawSet(
  ctx: CanvasRenderingContext2D,
  frontImg: HTMLImageElement,
  backImg: HTMLImageElement,
  originX: number,
  originY: number,
  cardWidthPx: number,
  cardHeightPx: number,
  cardGapPx: number
) {
  let y = originY;
  drawCardContain(ctx, frontImg, originX, y, cardWidthPx, cardHeightPx);
  y += cardHeightPx + cardGapPx;
  drawCardContain(ctx, backImg, originX, y, cardWidthPx, cardHeightPx);
}

export async function generateIdCardA4Layout(
  frontSrc: string,
  backSrc: string,
  cardWidthMm: number,
  cardHeightMm: number,
  numCopies: number,
  dpi: PrintDPI = 300
): Promise<A4LayoutResult> {
  const dpiConfig: PrintDpiConfig = getPrintDpiConfig(dpi);
  const { canvasWidth, canvasHeight, renderDPI, metaDPI } = dpiConfig;

  const paddingPx = mmToPxAtDpi(PAGE_PADDING_MM, renderDPI);
  const cardGapPx = mmToPxAtDpi(CARD_GAP_MM, renderDPI);
  const setGapPx = mmToPxAtDpi(SET_GAP_MM, renderDPI);
  const cardWidthPx = mmToPxAtDpi(cardWidthMm, renderDPI);
  const cardHeightPx = mmToPxAtDpi(cardHeightMm, renderDPI);

  const setWidthPx = cardWidthPx;
  const setHeightPx = 2 * cardHeightPx + cardGapPx;

  const usableWidth = canvasWidth - 2 * paddingPx;
  const usableHeight = canvasHeight - 2 * paddingPx;

  const maxSetsOnPage = Math.max(
    1,
    Math.min(
      MAX_SETS_PER_PAGE,
      Math.floor((usableHeight + setGapPx) / (setHeightPx + setGapPx))
    )
  );

  if (setWidthPx > usableWidth) {
    throw new Error('Card size too large for A4 sheet');
  }

  const setsPerPage = maxSetsOnPage;
  const totalPages = Math.max(1, Math.ceil(numCopies / setsPerPage));

  const [frontImg, backImg] = await Promise.all([loadImage(frontSrc), loadImage(backSrc)]);

  const originX = paddingPx + (usableWidth - setWidthPx) / 2;

  const pages: string[] = [];

  for (let page = 0; page < totalPages; page++) {
    const canvas = createA4Canvas(dpiConfig);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const startCopy = page * setsPerPage;
    const endCopy = Math.min(numCopies, startCopy + setsPerPage);
    const setsOnPage = endCopy - startCopy;
    const pageBlockHeight = setsOnPage * setHeightPx + (setsOnPage - 1) * setGapPx;
    let originY = paddingPx + (usableHeight - pageBlockHeight) / 2;

    for (let i = startCopy; i < endCopy; i++) {
      drawSet(ctx, frontImg, backImg, originX, originY, cardWidthPx, cardHeightPx, cardGapPx);
      originY += setHeightPx + setGapPx;
    }

    pages.push(await canvasToPngBlobUrl(finalizeA4Canvas(canvas, dpiConfig), metaDPI));
  }

  return {
    pages,
    photosPerPage: setsPerPage,
    totalPages,
    totalCopies: numCopies,
  };
}
