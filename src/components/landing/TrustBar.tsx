import React from 'react';
import { Check, Globe } from 'lucide-react';

const COUNTRIES = [
  { code: 'IN', name: 'India', size: '33×43mm' },
  { code: 'US', name: 'USA', size: '2×2"' },
  { code: 'GB', name: 'UK', size: '35×45mm' },
  { code: 'CN', name: 'China', size: '33×48mm' },
  { code: 'Custom', name: 'Custom', size: 'Any size' },
] as const;

export const TrustBar = () => (
  <section
    className="relative py-8 border-y border-[#e8dcc8]/10 bg-snapid-bg-elevated/50 backdrop-blur-md"
    aria-label="Supported countries"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
        <span className="text-sm font-semibold text-snapid-muted uppercase tracking-widest font-display">Works for</span>
        <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
          {COUNTRIES.map((country) => (
            <div
              key={country.code}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card hover:border-brand-400/20 transition-colors"
            >
              <Globe className="w-4 h-4 text-brand-700" aria-hidden="true" />
              <span className="text-sm font-medium text-snapid-text">{country.name}</span>
              <span className="text-xs text-snapid-muted">{country.size}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-snapid-muted">
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-brand-400" aria-hidden="true" />
          No account required
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-brand-400" aria-hidden="true" />
          No server upload
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-brand-400" aria-hidden="true" />
          No watermarks
        </span>
      </div>
    </div>
  </section>
);
