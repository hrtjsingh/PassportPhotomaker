import { useEffect } from 'react';
import { BRAND_NAME, SEO, STEP_SEO, getSiteUrl } from '../config/brand';
import type { WizardStep } from '../components/StepProgress';

function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function usePageSEO(step: WizardStep) {
  useEffect(() => {
    const stepSeo = STEP_SEO[step] ?? STEP_SEO.upload;
    const title = step === 'upload' ? SEO.title : stepSeo.title;
    const description = step === 'upload' ? SEO.description : stepSeo.description;
    const url = `${getSiteUrl()}/app`;

    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', url, true);
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
  }, [step]);
}

export function injectJsonLd() {
  const url = getSiteUrl();
  const scriptId = 'snapid-jsonld';

  const existing = document.getElementById(scriptId);
  if (existing) existing.remove();

  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: BRAND_NAME,
    description: SEO.description,
    url,
    applicationCategory: 'PhotographyApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Passport photo cropping',
      'AI background removal',
      'A4 multi-page print layout',
      'PDF and PNG export',
      'Up to 1200 DPI output',
      '100% browser-local processing',
    ],
  };

  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}
