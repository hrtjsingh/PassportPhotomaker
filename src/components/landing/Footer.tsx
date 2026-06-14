import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { BRAND_NAME } from '../../config/brand';
import { BrandLogo } from '../BrandLogo';

export const Footer = () => (
  <footer className="relative bg-snapid-bg text-snapid-muted py-12 border-t border-[#e8dcc8]/10 torii-accent" role="contentinfo">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="inline-flex mb-4" aria-label={`${BRAND_NAME} home`}>
            <BrandLogo size="md" />
          </Link>
          <p className="text-sm leading-relaxed max-w-sm mb-4">
            Free, private, browser-based passport and ID photo maker. Professional results with zero
            compromises.
          </p>
          <p className="text-xs text-snapid-muted/70 flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-brand-400" aria-hidden="true" />
            All processing happens locally in your browser
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-snapid-text uppercase tracking-widest mb-4 font-display">Product</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#features" className="hover:text-brand-300 transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-brand-300 transition-colors">
                How It Works
              </a>
            </li>
            <li>
              <a href="#sizes" className="hover:text-brand-300 transition-colors">
                Supported Sizes
              </a>
            </li>
            <li>
              <a href="/studio" className="hover:text-brand-300 transition-colors">
                Passport Photos
              </a>
            </li>
            <li>
              <a href="/id-print" className="hover:text-brand-300 transition-colors">
                ID Card Print
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-snapid-text uppercase tracking-widest mb-4 font-display">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/privacy" className="hover:text-brand-300 transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-brand-300 transition-colors">
                Terms of Service
              </a>
            </li>
            <li>
              <a
                href="https://github.com/snapid"
                className="hover:text-brand-300 transition-colors flex items-center gap-1"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-[#e8dcc8]/8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-snapid-muted/60">© 2026 {BRAND_NAME}. All rights reserved.</p>
        <p className="text-xs text-snapid-muted/50 font-display">Crafted with care — 心を込めて</p>
      </div>
    </div>
  </footer>
);
