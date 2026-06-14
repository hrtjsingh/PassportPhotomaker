import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { BRAND_NAME } from '../../config/brand';
import { BrandLogo } from '../BrandLogo';

export const Footer = () => (
  <footer className="relative bg-zinc-950 text-zinc-400 py-12 border-t border-zinc-800" role="contentinfo">
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
          <p className="text-xs text-zinc-500 flex items-center gap-1.5">
            <Shield className="w-3 h-3" aria-hidden="true" />
            All processing happens locally in your browser
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
            </li>
            <li>
              <a href="#sizes" className="hover:text-white transition-colors">
                Supported Sizes
              </a>
            </li>
            <li>
              <a href="/studio" className="hover:text-white transition-colors">
                Passport Photos
              </a>
            </li>
            <li>
              <a href="/id-print" className="hover:text-white transition-colors">
                ID Card Print
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </li>
            <li>
              <a
                href="https://github.com/snapid"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-zinc-500">© 2026 {BRAND_NAME}. All rights reserved.</p>
        <p className="text-xs text-zinc-600">Made with care for privacy-conscious travelers worldwide.</p>
      </div>
    </div>
  </footer>
);
