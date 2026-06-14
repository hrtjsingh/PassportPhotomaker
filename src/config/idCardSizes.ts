/** ISO/IEC 7810 ID-1 — standard credit card / driver's license size (mm). */
export const ID_CARD_ID1 = {
  id: 'id1',
  label: 'Standard ID card',
  description: '85.6 × 54 mm (credit card size)',
  widthMm: 85.6,
  heightMm: 53.98,
} as const;

export const ID_CARD_SIZES = [ID_CARD_ID1] as const;
