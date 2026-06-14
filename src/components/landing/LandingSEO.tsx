import React from 'react';
import { BRAND_NAME, SEO as BRAND_SEO, getSiteUrl } from '../../config/brand';

export const LandingSEO = () => {
  const siteUrl = getSiteUrl() || 'https://snapid.app';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: BRAND_NAME,
    description: BRAND_SEO.description,
    url: siteUrl,
    applicationCategory: 'PhotographyApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'AI background removal',
      'Official country photo sizes',
      'A4 print layout',
      '1200 DPI export',
      'Local browser processing',
      'PDF and PNG export',
    ],
  };

  return (
    <>
      <title>{BRAND_SEO.title}</title>
      <meta name="description" content={BRAND_SEO.description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={siteUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={BRAND_SEO.title} />
      <meta property="og:description" content={BRAND_SEO.description} />
      <meta property="og:image" content={`${siteUrl}${BRAND_SEO.ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={BRAND_SEO.title} />
      <meta name="twitter:description" content={BRAND_SEO.description} />
      <meta name="twitter:image" content={`${siteUrl}${BRAND_SEO.ogImage}`} />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
};
