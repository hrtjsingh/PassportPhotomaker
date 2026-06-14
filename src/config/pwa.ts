import { BRAND_DESCRIPTION, BRAND_NAME, BRAND_SHORT } from './brand';

export const PWA_THEME_COLOR = '#12100e';
export const PWA_BACKGROUND_COLOR = '#12100e';

export const PWA_MANIFEST = {
  name: BRAND_NAME,
  short_name: BRAND_SHORT,
  description: BRAND_DESCRIPTION,
  theme_color: PWA_THEME_COLOR,
  background_color: PWA_BACKGROUND_COLOR,
  display: 'standalone' as const,
  orientation: 'portrait' as const,
  scope: '/',
  start_url: '/',
  id: '/',
  categories: ['photo', 'utilities', 'productivity'],
  lang: 'en',
  dir: 'ltr' as const,
  icons: [
    {
      src: 'apple-touch-icon.svg',
      sizes: '180x180',
      type: 'image/svg+xml',
      purpose: 'any',
    },
    {
      src: 'apple-touch-icon.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'maskable',
    },
    {
      src: 'favicon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any',
    },
  ],
  shortcuts: [
    {
      name: 'Passport photos',
      short_name: 'Studio',
      description: 'Create print-ready passport photos',
      url: '/studio',
      icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
    },
    {
      name: 'ID card print',
      short_name: 'ID Print',
      description: 'Print front and back of your ID on A4',
      url: '/id-print',
      icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
    },
  ],
};
