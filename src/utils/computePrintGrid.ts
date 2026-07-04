import { mmToPxAtDpi } from './printDpi';

export const PAGE_PADDING_MM = 5;
export const PHOTO_MARGIN_MM = 3;

export interface PrintGridLimits {
  maxCols: number;
  maxRows: number;
  defaultCols: number;
  defaultRows: number;
  photosPerPage: number;
}

export function computePrintGrid(
  photoWidthMm: number,
  photoHeightMm: number,
  sheetWidthMm: number,
  sheetHeightMm: number
): PrintGridLimits {
  const usableWidth = sheetWidthMm - 2 * PAGE_PADDING_MM;
  const usableHeight = sheetHeightMm - 2 * PAGE_PADDING_MM;

  const maxCols = Math.max(
    1,
    Math.floor((usableWidth + PHOTO_MARGIN_MM) / (photoWidthMm + PHOTO_MARGIN_MM))
  );
  const maxRows = Math.max(
    1,
    Math.floor((usableHeight + PHOTO_MARGIN_MM) / (photoHeightMm + PHOTO_MARGIN_MM))
  );

  return {
    maxCols,
    maxRows,
    defaultCols: maxCols,
    defaultRows: maxRows,
    photosPerPage: maxCols * maxRows,
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
