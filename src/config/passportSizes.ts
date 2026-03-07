export interface PassportSize {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  description: string;
}

export const PASSPORT_SIZES: PassportSize[] = [
  {
    id: 'india',
    name: 'India Passport',
    widthMm: 35,
    heightMm: 45,
    description: '35mm × 45mm',
  },
  {
    id: 'us',
    name: 'US Passport',
    widthMm: 50.8, // 2 inches
    heightMm: 50.8, // 2 inches
    description: '2 × 2 inches (51mm × 51mm)',
  },
  {
    id: 'uk',
    name: 'UK Passport',
    widthMm: 35,
    heightMm: 45,
    description: '35mm × 45mm',
  },
  {
    id: 'china',
    name: 'China Passport',
    widthMm: 33,
    heightMm: 48,
    description: '33mm × 48mm',
  },
  {
    id: 'custom',
    name: 'Custom Size',
    widthMm: 35,
    heightMm: 45,
    description: 'Define your own dimensions',
  },
];

export const MM_TO_PX_300DPI = 11.811;

export const getPixelsFromMm = (mm: number) => Math.round(mm * MM_TO_PX_300DPI);
