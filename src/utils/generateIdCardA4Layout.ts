import type { A4LayoutResult } from './generateA4Layout';
import {
  canvasToPngBlobUrlForPrint,
  createA4Canvas,
  getPrintDpiConfig,
  mmToPxAtDpi,
  type PrintDpiConfig,
} from './printDpi';
import { A4_SHEET } from '../config/sheetSizes';

type PrintDPI = number;

export interface IdCardSource {
  frontSrc: string;
  backSrc: string;
  copies: number;
}

const PAGE_PADDING_MM = 10;
const CARD_GAP_MM = 20;
const SET_GAP_MM = 20;
const MAX_SETS_PER_PAGE = 2;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function drawCardFill(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, x, y, w, h);
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
  drawCardFill(ctx, frontImg, originX, y, cardWidthPx, cardHeightPx);
  y += cardHeightPx + cardGapPx;
  drawCardFill(ctx, backImg, originX, y, cardWidthPx, cardHeightPx);
}

export async function generateIdCardA4Layout(
  idCards: IdCardSource[],
  cardWidthMm: number,
  cardHeightMm: number,
  dpi: PrintDPI = 300
): Promise<A4LayoutResult> {
  const dpiConfig: PrintDpiConfig = getPrintDpiConfig(
    dpi,
    A4_SHEET.widthMm,
    A4_SHEET.heightMm
  );
  const { canvasWidth, canvasHeight, renderDPI } = dpiConfig;

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
  const placements = idCards.flatMap((card) =>
    Array.from({ length: card.copies }, () => ({
      frontSrc: card.frontSrc,
      backSrc: card.backSrc,
    }))
  );
  const totalCopies = placements.length;
  const totalPages = Math.max(1, Math.ceil(totalCopies / setsPerPage));

  const uniqueSrcs = Array.from(
    new Set(placements.flatMap((p) => [p.frontSrc, p.backSrc]))
  );
  const imageMap = new Map<string, HTMLImageElement>();
  await Promise.all(
    uniqueSrcs.map(async (src) => {
      imageMap.set(src, await loadImage(src));
    })
  );

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
    const endCopy = Math.min(totalCopies, startCopy + setsPerPage);
    const setsOnPage = endCopy - startCopy;
    const pageBlockHeight = setsOnPage * setHeightPx + (setsOnPage - 1) * setGapPx;
    let originY = paddingPx + (usableHeight - pageBlockHeight) / 2;

    for (let i = startCopy; i < endCopy; i++) {
      const placement = placements[i];
      const frontImg = imageMap.get(placement.frontSrc);
      const backImg = imageMap.get(placement.backSrc);
      if (!frontImg || !backImg) continue;
      drawSet(ctx, frontImg, backImg, originX, originY, cardWidthPx, cardHeightPx, cardGapPx);
      originY += setHeightPx + setGapPx;
    }

    pages.push(await canvasToPngBlobUrlForPrint(canvas, dpiConfig));
  }

  return {
    pages,
    photosPerPage: setsPerPage,
    totalPages,
    totalCopies,
    cols: 1,
    rows: setsPerPage,
    photoWidthMm: cardWidthMm,
    photoHeightMm: cardHeightMm,
  };
}
