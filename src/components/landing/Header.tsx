import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { BRAND_NAME } from '../../config/brand';
import { BrandLogo } from '../BrandLogo';
import { cn } from '../../utils/cn';
import { NAV_LINKS } from './constants';

const MOBILE_HEADER_OFFSET = 72;

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

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobileMenuOpen]);

  const scrollToHash = useCallback(
    (hash: string) => {
      const id = hash.replace(/^#/, '');
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - MOBILE_HEADER_OFFSET;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    },
    [prefersReducedMotion]
  );

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      requestAnimationFrame(() => scrollToHash(href));
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b',
        'transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ease-out',
        isScrolled
          ? 'bg-snapid-bg/80 backdrop-blur-xl border-[#e8dcc8]/10 shadow-lg shadow-black/25'
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
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a href="/studio" className="hidden sm:inline-flex btn-primary text-sm px-5 py-2.5">
              Start Free
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-snapid-bg-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="lg:hidden glass-card border-t border-white/10 px-4 py-6 space-y-4"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block py-1 text-base font-medium text-snapid-text hover:text-brand-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/id-print"
              onClick={closeMobileMenu}
              className="block py-1 text-base font-medium text-snapid-text hover:text-brand-400 transition-colors"
            >
              ID Card Print
            </Link>
            <Link
              to="/studio"
              onClick={closeMobileMenu}
              className="block w-full text-center btn-primary mt-4"
            >
              Start Free
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};
