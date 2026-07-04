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
}

export interface LayoutGridOptions {
  paddingMm?: number;
  marginMm?: number;
}

export function getLayoutOptionsForSheet(sheet: SheetSize): LayoutGridOptions {
  return {
    paddingMm: sheet.layoutPaddingMm ?? PAGE_PADDING_MM,
    marginMm: sheet.layoutMarginMm ?? PHOTO_MARGIN_MM,
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

  const usableWidth = sheetWidthMm - 2 * paddingMm;
  const usableHeight = sheetHeightMm - 2 * paddingMm;

  const maxCols = Math.max(
    1,
    Math.floor((usableWidth + marginMm) / (photoWidthMm + marginMm))
  );
  const maxRows = Math.max(
    1,
    Math.floor((usableHeight + marginMm) / (photoHeightMm + marginMm))
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
