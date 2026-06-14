import React from 'react';
import { Check, Globe } from 'lucide-react';

const COUNTRIES = [
  { code: 'IN', name: 'India', size: '35×45mm' },
  { code: 'US', name: 'USA', size: '2×2"' },
  { code: 'GB', name: 'UK', size: '35×45mm' },
  { code: 'CN', name: 'China', size: '33×48mm' },
  { code: 'Custom', name: 'Custom', size: 'Any size' },
] as const;

export const TrustBar = () => (
  <section
    className="relative py-8 border-y border-white/[0.06] bg-zinc-900/40 backdrop-blur-xl"
    aria-label="Supported countries"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
        <span className="text-sm font-semibold text-snapid-muted uppercase tracking-wider">Works for</span>
        <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
          {COUNTRIES.map((country) => (
            <div
              key={country.code}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:shadow-md transition-shadow"
            >
              <Globe className="w-4 h-4 text-snapid-indigo" aria-hidden="true" />
              <span className="text-sm font-medium text-snapid-text">{country.name}</span>
              <span className="text-xs text-snapid-muted">{country.size}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-snapid-muted">
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          No account required
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          No server upload
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          No watermarks
        </span>
      </div>
    </div>
  </section>
);
