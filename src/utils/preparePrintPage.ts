import type { SheetSize } from '../config/sheetSizes';
import { getEffectiveLandscape, getOrientedSheet } from '../config/sheetSizes';

export interface PrintPageDimensions {
  widthMm: number;
  heightMm: number;
}

/** Page size for print/PDF — matches layout canvas (no rotation). */
export function getPrintPageDimensions(
  sheet: SheetSize,
  landscape: boolean
): PrintPageDimensions {
  const oriented = getOrientedSheet(sheet, getEffectiveLandscape(sheet, landscape));
  return {
    widthMm: oriented.widthMm,
    heightMm: oriented.heightMm,
  };
}

export async function preparePageForPrint(pageRef: string): Promise<string> {
  return pageRef;
}

export async function preparePagesForPrint(pageRefs: string[]): Promise<string[]> {
  return pageRefs;
}
