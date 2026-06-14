import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { BRAND_NAME } from '../../config/brand';
import { BrandLogo } from '../BrandLogo';
import { cn } from '../../utils/cn';
import { NAV_LINKS } from './constants';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b',
        'transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ease-out',
        isScrolled
          ? 'bg-zinc-900/60 backdrop-blur-xl border-white/[0.06] shadow-lg shadow-black/25'
          : 'border-transparent bg-transparent shadow-none'
      )}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 group shrink-0" aria-label={`${BRAND_NAME} home`}>
            <BrandLogo size="md" />
          </Link>

          <nav className="hidden lg:flex items-center gap-8" role="navigation" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-snapid-muted hover:text-snapid-text transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-snapid-indigo to-snapid-violet transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="/studio"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-snapid-indigo to-snapid-violet text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Start Free
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={isMobileMenuOpen ? 'visible' : 'hidden'}
        variants={{
          visible: { opacity: 1, height: 'auto' },
          hidden: { opacity: 0, height: 0 },
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        className="lg:hidden overflow-hidden glass-card border-t border-white/10"
      >
        <nav className="px-4 py-6 space-y-4" role="navigation" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-medium text-snapid-text hover:text-snapid-indigo transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/id-print"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-medium text-snapid-text hover:text-snapid-indigo transition-colors"
          >
            ID Card Print
          </Link>
          <Link
            to="/studio"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block w-full text-center px-5 py-3 rounded-full bg-gradient-to-r from-snapid-indigo to-snapid-violet text-white font-semibold shadow-lg mt-4"
          >
            Start Free
          </Link>
        </nav>
      </motion.div>
    </header>
  );
};
