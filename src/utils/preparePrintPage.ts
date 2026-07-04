import type { SheetSize } from '../config/sheetSizes';
import { getOrientedSheet } from '../config/sheetSizes';

export interface PrintPageDimensions {
  widthMm: number;
  heightMm: number;
  rotateLandscapeToPortrait: boolean;
}

/** Page size sent to the printer — photo paper landscape layouts map to portrait feed. */
export function getPrintPageDimensions(
  sheet: SheetSize,
  landscape: boolean
): PrintPageDimensions {
  if (landscape && sheet.printLandscapeAsPortrait) {
    return {
      widthMm: sheet.widthMm,
      heightMm: sheet.heightMm,
      rotateLandscapeToPortrait: true,
    };
  }

  const oriented = getOrientedSheet(sheet, landscape);
  return {
    widthMm: oriented.widthMm,
    heightMm: oriented.heightMm,
    rotateLandscapeToPortrait: false,
  };
}

function loadPageImage(pageRef: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load print page'));
    img.src = pageRef;
  });
}

/** Rotate a landscape layout canvas 90° CW onto native portrait page dimensions. */
export async function rotateLandscapePageToPortraitDataUrl(pageRef: string): Promise<string> {
  const img = await loadPageImage(pageRef);
  const canvas = document.createElement('canvas');
  canvas.width = img.height;
  canvas.height = img.width;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(img, 0, 0);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

export async function preparePageForPrint(
  pageRef: string,
  dimensions: PrintPageDimensions
): Promise<string> {
  if (dimensions.rotateLandscapeToPortrait) {
    return rotateLandscapePageToPortraitDataUrl(pageRef);
  }
  return pageRef;
}

export async function preparePagesForPrint(
  pageRefs: string[],
  dimensions: PrintPageDimensions
): Promise<string[]> {
  return Promise.all(pageRefs.map((page) => preparePageForPrint(page, dimensions)));
}
