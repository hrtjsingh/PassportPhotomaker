export interface PrintPaperSize {
  id: string;
  label: string;
  sublabel: string;
  widthMm: number;
  heightMm: number;
}

const IN = 25.4;

/** Paper sizes for single-photo print layout dialog. Extend here for new sizes. */
export const PRINT_PAPER_SIZES: PrintPaperSize[] = [
  {
    id: 'a4',
    label: 'A4',
    sublabel: '210 × 297 mm',
    widthMm: 210,
    heightMm: 297,
  },
  {
    id: '4x6',
    label: '4×6 in',
    sublabel: '101.6 × 152.4 mm',
    widthMm: 4 * IN,
    heightMm: 6 * IN,
  },
];

export const DEFAULT_PRINT_PAPER = PRINT_PAPER_SIZES[0];

export function getPrintPaperSize(id: string): PrintPaperSize {
  return PRINT_PAPER_SIZES.find((s) => s.id === id) ?? DEFAULT_PRINT_PAPER;
}

export function getOrientedPrintPaper(
  paper: PrintPaperSize,
  landscape: boolean
): { widthMm: number; heightMm: number } {
  return {
    widthMm: landscape ? paper.heightMm : paper.widthMm,
    heightMm: landscape ? paper.widthMm : paper.heightMm,
  };
}
