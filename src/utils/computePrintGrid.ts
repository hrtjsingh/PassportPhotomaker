import { mmToPxAtDpi } from './printDpi';
import type { SheetSize } from '../config/sheetSizes';

export const PAGE_PADDING_MM = 5;
export const PHOTO_MARGIN_MM = 3;

export interface PrintGridLimits {
  maxCols: number;
  maxRows: number;
  defaultCols: number;
  defaultRows: number;
  photosPerPage: number;
  rotatePhotosOnSheet: boolean;
}

export interface LayoutGridOptions {
  paddingMm?: number;
  marginMm?: number;
  rotatePhotosOnSheet?: boolean;
}

export function getCellDimensionsMm(
  photoWidthMm: number,
  photoHeightMm: number,
  rotatePhotosOnSheet: boolean
): { cellWidthMm: number; cellHeightMm: number } {
  if (!rotatePhotosOnSheet) {
    return { cellWidthMm: photoWidthMm, cellHeightMm: photoHeightMm };
  }
  return { cellWidthMm: photoHeightMm, cellHeightMm: photoWidthMm };
}

export function getLayoutOptionsForSheet(sheet: SheetSize): LayoutGridOptions {
  return {
    paddingMm: sheet.layoutPaddingMm ?? PAGE_PADDING_MM,
    marginMm: sheet.layoutMarginMm ?? PHOTO_MARGIN_MM,
    rotatePhotosOnSheet: sheet.rotatePhotosOnSheet ?? false,
  };
}

export function computePrintGrid(
  photoWidthMm: number,
  photoHeightMm: number,
  sheetWidthMm: number,
  sheetHeightMm: number,
  options: LayoutGridOptions = {}
): PrintGridLimits {
  const paddingMm = options.paddingMm ?? PAGE_PADDING_MM;
  const marginMm = options.marginMm ?? PHOTO_MARGIN_MM;
  const rotatePhotosOnSheet = options.rotatePhotosOnSheet ?? false;
  const { cellWidthMm, cellHeightMm } = getCellDimensionsMm(
    photoWidthMm,
    photoHeightMm,
    rotatePhotosOnSheet
  );

  const usableWidth = sheetWidthMm - 2 * paddingMm;
  const usableHeight = sheetHeightMm - 2 * paddingMm;

  const maxCols = Math.max(
    1,
    Math.floor((usableWidth + marginMm) / (cellWidthMm + marginMm))
  );
  const maxRows = Math.max(
    1,
    Math.floor((usableHeight + marginMm) / (cellHeightMm + marginMm))
  );

  return {
    maxCols,
    maxRows,
    defaultCols: maxCols,
    defaultRows: maxRows,
    photosPerPage: maxCols * maxRows,
    rotatePhotosOnSheet,
  };
}

export function clampGrid(
  cols: number,
  rows: number,
  limits: PrintGridLimits
): { cols: number; rows: number } {
  return {
    cols: Math.min(Math.max(1, cols), limits.maxCols),
    rows: Math.min(Math.max(1, rows), limits.maxRows),
  };
}

export function getLayoutUsedSizeMm(
  cols: number,
  rows: number,
  cellWidthMm: number,
  cellHeightMm: number,
  paddingMm: number,
  marginMm: number
): { widthMm: number; heightMm: number } {
  return {
    widthMm: cols * cellWidthMm + Math.max(0, cols - 1) * marginMm + 2 * paddingMm,
    heightMm: rows * cellHeightMm + Math.max(0, rows - 1) * marginMm + 2 * paddingMm,
  };
}

export function layoutFitsOnSheet(
  cols: number,
  rows: number,
  photoWidthMm: number,
  photoHeightMm: number,
  sheetWidthMm: number,
  sheetHeightMm: number,
  options: LayoutGridOptions = {}
): boolean {
  const paddingMm = options.paddingMm ?? PAGE_PADDING_MM;
  const marginMm = options.marginMm ?? PHOTO_MARGIN_MM;
  const { cellWidthMm, cellHeightMm } = getCellDimensionsMm(
    photoWidthMm,
    photoHeightMm,
    options.rotatePhotosOnSheet ?? false
  );
  const used = getLayoutUsedSizeMm(cols, rows, cellWidthMm, cellHeightMm, paddingMm, marginMm);
  return used.widthMm <= sheetWidthMm + 0.01 && used.heightMm <= sheetHeightMm + 0.01;
}

/** Shrink grid until content fits inside sheet at true photo size. */
export function clampGridToFitSheet(
  cols: number,
  rows: number,
  photoWidthMm: number,
  photoHeightMm: number,
  sheetWidthMm: number,
  sheetHeightMm: number,
  options: LayoutGridOptions = {}
): { cols: number; rows: number } {
  const limits = computePrintGrid(
    photoWidthMm,
    photoHeightMm,
    sheetWidthMm,
    sheetHeightMm,
    options
  );
  let c = Math.min(Math.max(1, cols), limits.maxCols);
  let r = Math.min(Math.max(1, rows), limits.maxRows);

  while (r > 1 && !layoutFitsOnSheet(c, r, photoWidthMm, photoHeightMm, sheetWidthMm, sheetHeightMm, options)) {
    r -= 1;
  }
  while (c > 1 && !layoutFitsOnSheet(c, r, photoWidthMm, photoHeightMm, sheetWidthMm, sheetHeightMm, options)) {
    c -= 1;
  }

  return { cols: c, rows: r };
}

export function getPhotoDrawSizePx(
  photoWidthMm: number,
  photoHeightMm: number,
  renderDpi: number
): { widthPx: number; heightPx: number } {
  return {
    widthPx: mmToPxAtDpi(photoWidthMm, renderDpi),
    heightPx: mmToPxAtDpi(photoHeightMm, renderDpi),
  };
}

export function getCellSizePx(
  photoWidthMm: number,
  photoHeightMm: number,
  renderDpi: number,
  rotatePhotosOnSheet: boolean
): { widthPx: number; heightPx: number } {
  if (!rotatePhotosOnSheet) {
    return getPhotoDrawSizePx(photoWidthMm, photoHeightMm, renderDpi);
  }
  return {
    widthPx: mmToPxAtDpi(photoHeightMm, renderDpi),
    heightPx: mmToPxAtDpi(photoWidthMm, renderDpi),
  };
}
