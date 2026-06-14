export const BRAND_NAME = 'SnapID';
export const BRAND_TAGLINE = 'Free · Private · Print-ready';
export const BRAND_DESCRIPTION =
  'Create print-ready ID and passport photos in your browser. Crop, remove background, enhance, and download A4 layouts — up to 1200 DPI.';

export const SEO = {
  title: 'SnapID — Free Passport & ID Photo Maker Online',
  description:
    'Make print-ready passport and ID photos free in your browser. AI background removal, country sizes, A4 multi-page layout, PDF download up to 1200 DPI. No upload — 100% private.',
  keywords: [
    'passport photo maker',
    'ID photo online',
    'passport photo size',
    'background removal',
    'A4 passport photo print',
    'free passport photo',
    'visa photo maker',
    'passport photo template',
  ].join(', '),
  ogImage: '/apple-touch-icon.svg',
  twitterHandle: '',
} as const;

export const STEP_SEO: Record<string, { title: string; description: string }> = {
  upload: {
    title: 'Upload Photo — SnapID',
    description: 'Upload a photo to create print-ready passport or ID pictures. Free, private, runs in your browser.',
  },
  crop: {
    title: 'Crop Photo — SnapID',
    description: 'Crop your photo to official passport dimensions for India, US, UK, China, or custom sizes.',
  },
  background: {
    title: 'Remove Background — SnapID',
    description: 'Remove photo background with local AI and pick a passport-compliant backdrop color.',
  },
  enhance: {
    title: 'Enhance Photo — SnapID',
    description: 'Sharpen and brighten your passport photo for clearer prints.',
  },
  settings: {
    title: 'Print Settings — SnapID',
    description: 'Choose copy count and print resolution for your A4 passport photo sheet.',
  },
  preview: {
    title: 'Download & Print — SnapID',
    description: 'Preview A4 sheets, download PDF or PNG, and print passport photos at home.',
  },
};

export function getSiteUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}
