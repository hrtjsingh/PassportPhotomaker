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
  paddingTopMm?: number;
  paddingBottomMm?: number;
  paddingLeftMm?: number;
  paddingRightMm?: number;
  marginMm?: number;
  rotatePhotosOnSheet?: boolean;
  centerGridOnSheet?: boolean;
  defaultGridCols?: number;
  defaultGridRows?: number;
}

export interface SheetPaddingMm {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function resolveSheetPadding(options: LayoutGridOptions): SheetPaddingMm {
  const base = options.paddingMm ?? PAGE_PADDING_MM;
  return {
    top: options.paddingTopMm ?? base,
    bottom: options.paddingBottomMm ?? base,
    left: options.paddingLeftMm ?? base,
    right: options.paddingRightMm ?? base,
  };
}

export function getLayoutOptionsForSheet(sheet: SheetSize): LayoutGridOptions {
  return {
    paddingMm: sheet.layoutPaddingMm ?? PAGE_PADDING_MM,
    paddingTopMm: sheet.layoutPaddingTopMm,
    paddingBottomMm: sheet.layoutPaddingBottomMm,
    marginMm: sheet.layoutMarginMm ?? PHOTO_MARGIN_MM,
    rotatePhotosOnSheet: sheet.rotatePhotosOnSheet ?? false,
    centerGridOnSheet: sheet.centerGridOnSheet ?? false,
    defaultGridCols: sheet.defaultGridCols,
    defaultGridRows: sheet.defaultGridRows,
  };
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

export function computePrintGrid(
  photoWidthMm: number,
  photoHeightMm: number,
  sheetWidthMm: number,
  sheetHeightMm: number,
  options: LayoutGridOptions = {}
): PrintGridLimits {
  const padding = resolveSheetPadding(options);
  const marginMm = options.marginMm ?? PHOTO_MARGIN_MM;
  const rotatePhotosOnSheet = options.rotatePhotosOnSheet ?? false;
  const { cellWidthMm, cellHeightMm } = getCellDimensionsMm(
    photoWidthMm,
    photoHeightMm,
    rotatePhotosOnSheet
  );

  const usableWidth = sheetWidthMm - padding.left - padding.right;
  const usableHeight = sheetHeightMm - padding.top - padding.bottom;

  const maxCols = Math.max(
    1,
    Math.floor((usableWidth + marginMm) / (cellWidthMm + marginMm))
  );
  const maxRows = Math.max(
    1,
    Math.floor((usableHeight + marginMm) / (cellHeightMm + marginMm))
  );

  const defaultCols = options.defaultGridCols
    ? Math.min(options.defaultGridCols, maxCols)
    : maxCols;
  const defaultRows = options.defaultGridRows
    ? Math.min(options.defaultGridRows, maxRows)
    : maxRows;

  return {
    maxCols,
    maxRows,
    defaultCols,
    defaultRows,
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
  padding: SheetPaddingMm,
  marginMm: number
): { widthMm: number; heightMm: number } {
  return {
    widthMm:
      cols * cellWidthMm + Math.max(0, cols - 1) * marginMm + padding.left + padding.right,
    heightMm:
      rows * cellHeightMm + Math.max(0, rows - 1) * marginMm + padding.top + padding.bottom,
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
  const padding = resolveSheetPadding(options);
  const marginMm = options.marginMm ?? PHOTO_MARGIN_MM;
  const { cellWidthMm, cellHeightMm } = getCellDimensionsMm(
    photoWidthMm,
    photoHeightMm,
    options.rotatePhotosOnSheet ?? false
  );
  const used = getLayoutUsedSizeMm(cols, rows, cellWidthMm, cellHeightMm, padding, marginMm);
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
