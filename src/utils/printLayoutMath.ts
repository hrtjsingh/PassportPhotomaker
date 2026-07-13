/** CSS reference pixel density — 96 dpi. */
export const CSS_MM_TO_PX = 96 / 25.4;

export const LAYOUT_SCALE_MIN = 30;
export const LAYOUT_SCALE_MAX = 250;
export const LAYOUT_BLEED_MIN = 0;
export const LAYOUT_BLEED_MAX = 10;
export const LAYOUT_DEFAULT_SCALE = 100;
export const LAYOUT_DEFAULT_BLEED = 1;
export const LAYOUT_ROTATION_MIN = -180;
export const LAYOUT_ROTATION_MAX = 180;
export const LAYOUT_DEFAULT_ROTATION = 0;

export interface PhotoLayoutState {
  offsetXMm: number;
  offsetYMm: number;
  scalePercent: number;
  rotationDeg: number;
}

export interface PhotoRectMm {
  leftMm: number;
  topMm: number;
  widthMm: number;
  heightMm: number;
}

export function createDefaultLayoutState(): PhotoLayoutState {
  return {
    offsetXMm: 0,
    offsetYMm: 0,
    scalePercent: LAYOUT_DEFAULT_SCALE,
    rotationDeg: LAYOUT_DEFAULT_ROTATION,
  };
}

export function computeContentRectMm(
  pageWidthMm: number,
  pageHeightMm: number,
  contentWidthMm: number,
  contentHeightMm: number,
  layout: PhotoLayoutState
): PhotoRectMm {
  const heightMm = contentHeightMm * (layout.scalePercent / 100);
  const widthMm = heightMm * (contentWidthMm / contentHeightMm);

  const centerX = pageWidthMm / 2 + layout.offsetXMm;
  const centerY = pageHeightMm / 2 + layout.offsetYMm;

  return {
    leftMm: centerX - widthMm / 2,
    topMm: centerY - heightMm / 2,
    widthMm,
    heightMm,
  };
}

export function computePhotoRectMm(
  pageWidthMm: number,
  pageHeightMm: number,
  photoWidthMm: number,
  photoHeightMm: number,
  layout: PhotoLayoutState
): PhotoRectMm {
  return computeContentRectMm(
    pageWidthMm,
    pageHeightMm,
    photoWidthMm,
    photoHeightMm,
    layout
  );
}

export function computePreviewScale(
  pageWidthMm: number,
  pageHeightMm: number,
  maxWidthPx: number,
  maxHeightPx: number
): number {
  const pageWidthPx = pageWidthMm * CSS_MM_TO_PX;
  const pageHeightPx = pageHeightMm * CSS_MM_TO_PX;
  if (pageWidthPx <= 0 || pageHeightPx <= 0) return 1;
  return Math.min(maxWidthPx / pageWidthPx, maxHeightPx / pageHeightPx, 1);
}
