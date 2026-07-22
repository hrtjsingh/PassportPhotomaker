import {
  createDefaultLayoutState,
  LAYOUT_BLEED_MAX,
  LAYOUT_BLEED_MIN,
  LAYOUT_DEFAULT_BLEED,
  LAYOUT_DEFAULT_SCALE,
  LAYOUT_SCALE_MAX,
  LAYOUT_SCALE_MIN,
  type PhotoLayoutState,
} from './printLayoutMath';

const STORAGE_KEY = 'snapid:print-layout-prefs';

export interface PrintLayoutPreferences {
  scalePercent: number;
  bleedMm: number;
}

function clampScale(value: number): number {
  return Math.min(LAYOUT_SCALE_MAX, Math.max(LAYOUT_SCALE_MIN, Math.round(value)));
}

function clampBleed(value: number): number {
  return Math.min(LAYOUT_BLEED_MAX, Math.max(LAYOUT_BLEED_MIN, Math.round(value)));
}

export function getPrintLayoutPreferences(): PrintLayoutPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { scalePercent: LAYOUT_DEFAULT_SCALE, bleedMm: LAYOUT_DEFAULT_BLEED };
    }

    const parsed = JSON.parse(raw) as Partial<PrintLayoutPreferences>;
    return {
      scalePercent: clampScale(Number(parsed.scalePercent) || LAYOUT_DEFAULT_SCALE),
      bleedMm: clampBleed(Number(parsed.bleedMm) ?? LAYOUT_DEFAULT_BLEED),
    };
  } catch {
    return { scalePercent: LAYOUT_DEFAULT_SCALE, bleedMm: LAYOUT_DEFAULT_BLEED };
  }
}

export function savePrintLayoutPreferences(prefs: PrintLayoutPreferences): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        scalePercent: clampScale(prefs.scalePercent),
        bleedMm: clampBleed(prefs.bleedMm),
      })
    );
  } catch {
    // ignore quota / private mode
  }
}

/** Default layout with scale restored from localStorage. */
export function createLayoutStateFromPreferences(): PhotoLayoutState {
  const { scalePercent } = getPrintLayoutPreferences();
  return {
    ...createDefaultLayoutState(),
    scalePercent,
  };
}

export function getSavedBleedMm(): number {
  return getPrintLayoutPreferences().bleedMm;
}
