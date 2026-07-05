export interface SheetSize {
  id: string;
  label: string;
  sublabel: string;
  widthMm: number;
  heightMm: number;
  pdfFormat: [number, number];
  /** Tighter padding for small photo paper (defaults to 5 mm). */
  layoutPaddingMm?: number;
  /** Extra top inset (defaults to layoutPaddingMm). */
  layoutPaddingTopMm?: number;
  /** Extra bottom inset for printer margin (defaults to layoutPaddingMm). */
  layoutPaddingBottomMm?: number;
  /** Gap between photos (defaults to 3 mm). */
  layoutMarginMm?: number;
  /** Rotate each photo 90° — fits 8× on portrait 4×6 at true print size. */
  rotatePhotosOnSheet?: boolean;
  /** Center the photo grid on the sheet (within min edge padding). */
  centerGridOnSheet?: boolean;
  /** Lock to portrait — avoids clipped prints on 4×6 photo-paper trays. */
  portraitOnly?: boolean;
  /** Prefer landscape when it fits more photos at true print size (e.g. 4×6 → 4×2). */
  defaultLandscape?: boolean;
}

const IN = 25.4;

/** Standard photo-paper sizes plus A4 for multi-photo sheets. */
export const SHEET_SIZES: SheetSize[] = [
  {
    id: '4x6',
    label: '4×6"',
    sublabel: '10×15 cm · 8 photos',
    widthMm: 4 * IN,
    heightMm: 6 * IN,
    pdfFormat: [4 * IN, 6 * IN],
    layoutPaddingMm: 2,
    layoutMarginMm: 1,
    rotatePhotosOnSheet: true,
    centerGridOnSheet: true,
    portraitOnly: true,
  },
  {
    id: '5x7',
    label: '5×7"',
    sublabel: '13×18 cm',
    widthMm: 5 * IN,
    heightMm: 7 * IN,
    pdfFormat: [5 * IN, 7 * IN],
  },
  {
    id: '6x8',
    label: '6×8"',
    sublabel: '15×20 cm',
    widthMm: 6 * IN,
    heightMm: 8 * IN,
    pdfFormat: [6 * IN, 8 * IN],
  },
  {
    id: '8x10',
    label: '8×10"',
    sublabel: '20×25 cm',
    widthMm: 8 * IN,
    heightMm: 10 * IN,
    pdfFormat: [8 * IN, 10 * IN],
  },
  {
    id: 'a4',
    label: 'A4',
    sublabel: '210×297 mm',
    widthMm: 210,
    heightMm: 297,
    pdfFormat: [210, 297],
  },
];

export const DEFAULT_SHEET = SHEET_SIZES[0];

export const A4_SHEET = SHEET_SIZES.find((s) => s.id === 'a4') ?? SHEET_SIZES[SHEET_SIZES.length - 1];

export function getSheetById(id: string): SheetSize {
  return SHEET_SIZES.find((s) => s.id === id) ?? DEFAULT_SHEET;
}

export function getEffectiveLandscape(sheet: SheetSize, landscape: boolean): boolean {
  if (sheet.portraitOnly) return false;
  return landscape;
}

export interface OrientedSheet {
  widthMm: number;
  heightMm: number;
  pdfFormat: [number, number];
  landscape: boolean;
}

export function getOrientedSheet(sheet: SheetSize, landscape: boolean): OrientedSheet {
  return {
    widthMm: landscape ? sheet.heightMm : sheet.widthMm,
    heightMm: landscape ? sheet.widthMm : sheet.heightMm,
    pdfFormat: landscape ? [sheet.heightMm, sheet.widthMm] : sheet.pdfFormat,
    landscape,
  };
}
