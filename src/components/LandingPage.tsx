import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { 
  Shield, Lock, Upload, Crop, Sparkles, Printer, Download, 
  ChevronDown, Menu, X, Check, Globe, FileImage, Zap, Eye,
  Camera, Maximize2, FileText, HelpCircle, ArrowRight, Star,
  Printer as PrinterIcon, Image as ImageIcon, Settings, ChevronRight
} from 'lucide-react';

/* =============================================================================
   DESIGN TOKENS & THEME (Tailwind v4 @theme approach)
   ============================================================================= */
const themeStyles = `
  @import "tailwindcss";
  
  @theme {
    --color-snapid-indigo: #4f46e5;
    --color-snapid-violet: #7c3aed;
    --color-snapid-cyan: #06b6d4;
    --color-snapid-bg: #f8f7ff;
    --color-snapid-text: #18181b;
    --color-snapid-muted: #71717a;
    --color-snapid-emerald: #10b981;
    --color-snapid-glass: rgba(255, 255, 255, 0.7);
    
    --font-display: "Plus Jakarta Sans", system-ui, sans-serif;
    --font-body: "Inter", system-ui, sans-serif;
    
    --animate-float: float 6s ease-in-out infinite;
    --animate-float-delayed: float 6s ease-in-out 3s infinite;
    --animate-pulse-slow: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
  }
`;

/* =============================================================================
   GLOBAL STYLES & FONTS
   ============================================================================= */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    
    ${themeStyles}
    
    html {
      scroll-behavior: smooth;
    }
    
    @media (prefers-reduced-motion: reduce) {
      html {
        scroll-behavior: auto;
      }
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    .mesh-gradient {
      background: 
        radial-gradient(ellipse 80% 50% at 20% 40%, rgba(79, 70, 229, 0.15), transparent),
        radial-gradient(ellipse 60% 40% at 80% 60%, rgba(124, 58, 237, 0.12), transparent),
        radial-gradient(ellipse 50% 60% at 50% 100%, rgba(6, 182, 212, 0.08), transparent),
        linear-gradient(to bottom, #f8f7ff, #f8f7ff);
    }
    
    .glass-card {
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }
    
    .glass-dark {
      background: rgba(24, 24, 27, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .text-gradient {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .grain-overlay {
      position: relative;
    }
    .grain-overlay::after {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0.03;
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }
    
    .dot-grid {
      background-image: radial-gradient(circle, #4f46e5 1px, transparent 1px);
      background-size: 24px 24px;
      opacity: 0.1;
    }
  `}</style>
);

/* =============================================================================
   ANIMATION VARIANTS
   ============================================================================= */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

/* =============================================================================
   SECTION 1: STICKY HEADER
   ============================================================================= */
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Sizes', href: '#sizes' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Privacy', href: '#privacy' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-card shadow-lg shadow-indigo-500/5' : 'bg-transparent'
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group" aria-label="SnapID Home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-snapid-indigo to-snapid-violet flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Camera className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-display)] text-snapid-text tracking-tight">
              Snap<span className="text-snapid-indigo">ID</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8" role="navigation" aria-label="Main navigation">
            {navLinks.map((link) => (
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

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <a
              href="/app"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-snapid-indigo to-snapid-violet text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Start Free
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isMobileMenuOpen ? 'visible' : 'hidden'}
        variants={{
          visible: { opacity: 1, height: 'auto' },
          hidden: { opacity: 0, height: 0 }
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        className="lg:hidden overflow-hidden glass-card border-t border-white/20"
      >
        <nav className="px-4 py-6 space-y-4" role="navigation" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-medium text-snapid-text hover:text-snapid-indigo transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/app"
            className="block w-full text-center px-5 py-3 rounded-full bg-gradient-to-r from-snapid-indigo to-snapid-violet text-white font-semibold shadow-lg mt-4"
          >
            Start Free
          </a>
        </nav>
      </motion.div>
    </header>
  );
};

/* =============================================================================
   SECTION 2: HERO
   ============================================================================= */
const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section 
      className="relative min-h-screen flex items-center pt-20 overflow-hidden grain-overlay"
      aria-label="Hero"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 mesh-gradient" aria-hidden="true" />
      <div className="absolute inset-0 dot-grid" aria-hidden="true" />
      
      {/* Floating Orbs */}
      {!prefersReducedMotion && (
        <>
          <motion.div 
            style={{ y: y1 }}
            className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl animate-[float_8s_ease-in-out_infinite]"
            aria-hidden="true"
          />
          <motion.div 
            style={{ y: y2 }}
            className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-violet-500/15 blur-3xl animate-[float_10s_ease-in-out_infinite_2s]"
            aria-hidden="true"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-3xl" aria-hidden="true" />
        </>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card shadow-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-snapid-muted">Free · Private · Print-ready</span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-[family-name:var(--font-display)] text-snapid-text tracking-tight leading-[1.1] mb-6"
            >
              Print-ready passport photos{' '}
              <span className="text-gradient">in minutes</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-lg sm:text-xl text-snapid-muted max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Create official passport and ID photos in your browser. 
              No account, no upload, no watermarks — 100% private with up to 1200 DPI export.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <a
                href="/app"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-snapid-indigo to-snapid-violet text-white font-semibold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Camera className="w-5 h-5" aria-hidden="true" />
                Create Your Photo Free
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full glass-card text-snapid-text font-semibold text-lg hover:bg-white/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                See How It Works
                <ChevronDown className="w-5 h-5" aria-hidden="true" />
              </a>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-center gap-2 justify-center lg:justify-start text-sm text-snapid-muted">
              <Lock className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              <span className="font-medium text-emerald-700">100% private</span>
              <span>— runs entirely in your browser</span>
            </motion.div>

            <motion.p variants={fadeInUp} className="mt-6 text-sm text-snapid-muted/80">
              Trusted by travelers, students, and professionals worldwide
            </motion.p>
          </motion.div>

          {/* Right Visual - Hero Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -5 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
            style={{ perspective: '1000px' }}
          >
            <div className="relative z-10">
              {/* Main App Window Mockup */}
              <div className="glass-card rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden border border-white/60">
                {/* Window Header */}
                <div className="px-4 py-3 border-b border-white/40 flex items-center gap-2 bg-white/40">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs font-medium text-snapid-muted">SnapID Studio</span>
                  </div>
                </div>
                
                {/* Window Content */}
                <div className="p-6 bg-gradient-to-br from-white/80 to-indigo-50/50">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Before/After Photo Strip */}
                    <div className="col-span-2 space-y-4">
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 shadow-inner group">
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300" />
                        {/* Simulated Photo */}
                        <div className="absolute inset-4 bg-white rounded-lg shadow-sm flex items-center justify-center">
                          <div className="w-24 h-32 bg-gradient-to-b from-amber-100 to-amber-50 rounded border-2 border-indigo-500/30 relative overflow-hidden">
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-amber-200" />
                            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-16 h-8 rounded-t-full bg-amber-200" />
                          </div>
                        </div>
                        {/* Crop Marks */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-500" />
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-500" />
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-500" />
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-500" />
                      </div>
                    </div>
                    
                    {/* Sidebar Controls */}
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-white/80 shadow-sm">
                        <div className="text-xs font-semibold text-snapid-text mb-2">Size</div>
                        <div className="space-y-1.5">
                          {['India (35×45mm)', 'US (2×2")', 'UK (35×45mm)'].map((size, i) => (
                            <div key={size} className={`text-xs px-2 py-1.5 rounded ${i === 0 ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-snapid-muted'}`}>
                              {size}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-white/80 shadow-sm">
                        <div className="text-xs font-semibold text-snapid-text mb-2">Background</div>
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-white border-2 border-indigo-500 shadow-sm" />
                          <div className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200" />
                          <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100" />
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-100">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <Shield className="w-3 h-3" />
                          Local Processing
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 glass-card rounded-xl p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-snapid-text">AI Removed</div>
                    <div className="text-[10px] text-snapid-muted">Background clean</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-4 glass-card rounded-xl p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-snapid-text">A4 Print Sheet</div>
                    <div className="text-[10px] text-snapid-muted">8 photos ready</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* =============================================================================
   SECTION 3: TRUST BAR
   ============================================================================= */
const TrustBar = () => {
  const countries = [
    { code: 'IN', name: 'India', size: '35×45mm' },
    { code: 'US', name: 'USA', size: '2×2"' },
    { code: 'GB', name: 'UK', size: '35×45mm' },
    { code: 'CN', name: 'China', size: '33×48mm' },
    { code: 'Custom', name: 'Custom', size: 'Any size' },
  ];

  return (
    <section className="relative py-8 border-y border-indigo-100/50 bg-white/50 backdrop-blur-sm" aria-label="Supported countries">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
          <span className="text-sm font-semibold text-snapid-muted uppercase tracking-wider">Works for</span>
          <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
            {countries.map((country) => (
              <div key={country.code} className="flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:shadow-md transition-shadow">
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
};

/* =============================================================================
   SECTION 4: FEATURES GRID (BENTO LAYOUT)
   ============================================================================= */
const Features = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'Local AI Background Removal',
      description: 'Open-source ML models run directly in your browser. Your photo never leaves your device.',
      color: 'from-indigo-500 to-violet-500',
      bgColor: 'bg-indigo-50',
      size: 'large',
    },
    {
      icon: Globe,
      title: 'Official Country Sizes',
      description: 'India, USA, UK, China, and custom dimensions. Always up-to-date with embassy requirements.',
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50',
      size: 'normal',
    },
    {
      icon: PrinterIcon,
      title: 'A4 Multi-Page Print Layout',
      description: 'Smart sheet arrangement fits 8-12 copies per page. Optimized for home and studio printers.',
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-50',
      size: 'normal',
    },
    {
      icon: Maximize2,
      title: 'Up to 1200 DPI Export',
      description: 'Crystal-clear resolution meets the strictest print standards. PNG or PDF output.',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      size: 'normal',
    },
    {
      icon: FileText,
      title: 'PDF + PNG Download',
      description: 'Export as single photos or ready-to-print A4 sheets. Perfect for digital submissions too.',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      size: 'normal',
    },
    {
      icon: Zap,
      title: 'Optional AI Enhancement',
      description: 'Subtle sharpening, brightness correction, and skin clearing — only if you want it.',
      color: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-50',
      size: 'normal',
    },
  ];

  return (
    <section id="features" className="relative py-24 lg:py-32 grain-overlay" aria-labelledby="features-heading">
      <div className="absolute inset-0 mesh-gradient opacity-50" aria-hidden="true" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] text-snapid-text tracking-tight mb-4"
          >
            Everything you need for{' '}
            <span className="text-gradient">perfect ID photos</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-snapid-muted max-w-2xl mx-auto">
            Professional-grade tools that run locally. No compromises on quality or privacy.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInUp}
              className={`group relative ${feature.size === 'large' ? 'md:col-span-2 lg:col-span-2' : ''}`}
            >
              <div className="relative h-full glass-card rounded-2xl p-6 lg:p-8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 border border-white/60 overflow-hidden">
                {/* Background Gradient Blob */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${feature.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500 blur-2xl`} />
                
                <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 bg-gradient-to-br ${feature.color} [&>path]:stroke-white`} style={{ stroke: 'url(#gradient)' }} aria-hidden="true" />
                </div>
                
                <h3 className="text-xl font-bold text-snapid-text mb-2 font-[family-name:var(--font-display)]">
                  {feature.title}
                </h3>
                <p className="text-snapid-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* =============================================================================
   SECTION 5: HOW IT WORKS (6-STEP TIMELINE)
   ============================================================================= */
const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: 'Upload',
      description: 'Drop any photo from your phone or computer.',
      color: 'bg-indigo-500',
    },
    {
      icon: Crop,
      title: 'Crop',
      description: 'Auto-detect face and align to official ratios.',
      color: 'bg-violet-500',
    },
    {
      icon: Sparkles,
      title: 'Remove Background',
      description: 'AI instantly replaces messy backgrounds with clean white.',
      color: 'bg-purple-500',
    },
    {
      icon: Zap,
      title: 'Enhance',
      description: 'Optional: sharpen, brighten, and perfect skin tones.',
      color: 'bg-fuchsia-500',
    },
    {
      icon: Settings,
      title: 'Print Settings',
      description: 'Choose country, paper size, and copies per sheet.',
      color: 'bg-pink-500',
    },
    {
      icon: Download,
      title: 'Download / Print',
      description: 'Export PNG or PDF at up to 1200 DPI resolution.',
      color: 'bg-rose-500',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 bg-white" aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] text-snapid-text tracking-tight mb-4"
          >
            From photo to print in{' '}
            <span className="text-gradient">6 steps</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-snapid-muted max-w-2xl mx-auto">
            No learning curve. The wizard guides you through everything.
          </motion.p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-rose-200" aria-hidden="true" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                className="relative text-center group"
              >
                {/* Step Number */}
                <div className={`w-12 h-12 rounded-full ${step.color} text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20 relative z-10 group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-5 h-5" aria-hidden="true" />
                </div>
                
                {/* Mobile Connector */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute left-1/2 top-12 w-0.5 h-8 bg-gradient-to-b from-indigo-200 to-transparent -translate-x-1/2" aria-hidden="true" />
                )}
                
                <h3 className="text-lg font-bold text-snapid-text mb-1 font-[family-name:var(--font-display)]">
                  {step.title}
                </h3>
                <p className="text-sm text-snapid-muted leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* =============================================================================
   SECTION 6: LIVE DEMO / PRODUCT SHOWCASE
   ============================================================================= */
const DemoShowcase = () => {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden" aria-labelledby="demo-heading">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 to-violet-950" aria-hidden="true" />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} aria-hidden="true" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.h2 
            variants={fadeInUp}
            id="demo-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] text-white tracking-tight mb-4"
          >
            The full studio runs in your{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">browser</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-indigo-200 max-w-2xl mx-auto">
            No installation. No waiting. Open the app and start creating immediately.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Browser Frame */}
          <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 bg-zinc-900">
            {/* Browser Chrome */}
            <div className="px-4 py-3 bg-zinc-800 border-b border-zinc-700 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-zinc-600" />
                <div className="w-3 h-3 rounded-full bg-zinc-600" />
                <div className="w-3 h-3 rounded-full bg-zinc-600" />
              </div>
              <div className="flex-1 max-w-md mx-auto">
                <div className="px-3 py-1.5 rounded-md bg-zinc-700 text-xs text-zinc-400 text-center font-mono">
                  snapid.app/studio
                </div>
              </div>
            </div>
            
            {/* App Screenshot Simulation */}
            <div className="aspect-[16/10] bg-zinc-900 relative overflow-hidden">
              <div className="absolute inset-0 flex">
                {/* Sidebar */}
                <div className="w-64 bg-zinc-800/50 border-r border-zinc-700/50 p-4 hidden sm:block">
                  <div className="space-y-3">
                    <div className="h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center px-3">
                      <span className="text-xs font-medium text-indigo-300">1. Upload Photo</span>
                    </div>
                    <div className="h-8 rounded-lg bg-zinc-700/30 flex items-center px-3">
                      <span className="text-xs text-zinc-400">2. Crop & Position</span>
                    </div>
                    <div className="h-8 rounded-lg bg-zinc-700/30 flex items-center px-3">
                      <span className="text-xs text-zinc-400">3. Background</span>
                    </div>
                    <div className="h-8 rounded-lg bg-zinc-700/30 flex items-center px-3">
                      <span className="text-xs text-zinc-400">4. Enhance</span>
                    </div>
                    <div className="h-8 rounded-lg bg-zinc-700/30 flex items-center px-3">
                      <span className="text-xs text-zinc-400">5. Print Settings</span>
                    </div>
                  </div>
                </div>
                
                {/* Main Canvas */}
                <div className="flex-1 p-6 flex items-center justify-center">
                  <div className="relative">
                    {/* Photo Preview */}
                    <div className="w-48 h-60 bg-white rounded-lg shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white" />
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-200" />
                      <div className="absolute top-28 left-1/2 -translate-x-1/2 w-24 h-12 rounded-t-full bg-amber-100" />
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-indigo-900" />
                      
                      {/* Crop Overlay */}
                      <div className="absolute inset-0 border-2 border-indigo-500/50">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-500" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-500" />
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-indigo-500" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-indigo-500" />
                      </div>
                    </div>
                    
                    {/* Floating Controls */}
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 translate-x-full space-y-2 hidden lg:block">
                      <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <Maximize2 className="w-4 h-4 text-zinc-600" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <Eye className="w-4 h-4 text-zinc-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Overlay */}
          <div className="mt-8 text-center">
            <a
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-indigo-900 font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-900"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              Try it now — free
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* =============================================================================
   SECTION 7: COMPARISON TABLE
   ============================================================================= */
const Comparison = () => {
  const features = [
    { name: 'Price', snapid: 'Free', booth: '$10-20', online: 'Freemium / $5+', icon: Star },
    { name: 'Privacy', snapid: '100% Local', booth: 'N/A', online: 'Uploads to server', icon: Shield },
    { name: 'Max DPI', snapid: '1200 DPI', booth: '300-600 DPI', online: '300 DPI', icon: Maximize2 },
    { name: 'Country Sizes', snapid: 'India, US, UK, China +', booth: 'Limited', online: 'Limited', icon: Globe },
    { name: 'A4 Print Layout', snapid: 'Yes', booth: 'No', online: 'Rarely', icon: PrinterIcon },
    { name: 'Account Required', snapid: 'No', booth: 'No', online: 'Usually yes', icon: Lock },
    { name: 'AI Background', snapid: 'Yes, local', booth: 'No', online: 'Sometimes', icon: Sparkles },
    { name: 'Watermarks', snapid: 'None', booth: 'None', online: 'Often yes', icon: ImageIcon },
  ];

  return (
    <section id="sizes" className="relative py-24 lg:py-32 grain-overlay" aria-labelledby="comparison-heading">
      <div className="absolute inset-0 mesh-gradient opacity-30" aria-hidden="true" />
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            id="comparison-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] text-snapid-text tracking-tight mb-4"
          >
            Why choose{' '}
            <span className="text-gradient">SnapID</span>?
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-snapid-muted max-w-2xl mx-auto">
            See how we compare to traditional options.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl overflow-hidden shadow-xl border border-white/60"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-indigo-100/50 bg-white/50">
                  <th className="px-6 py-4 text-sm font-semibold text-snapid-muted uppercase tracking-wider">Feature</th>
                  <th className="px-6 py-4 text-sm font-bold text-indigo-700 bg-indigo-50/50">SnapID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-snapid-muted">Photo Booth</th>
                  <th className="px-6 py-4 text-sm font-semibold text-snapid-muted">Generic Online</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50/50">
                {features.map((feature, index) => (
                  <tr key={feature.name} className="hover:bg-white/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <feature.icon className="w-4 h-4 text-snapid-muted" aria-hidden="true" />
                        <span className="font-medium text-snapid-text">{feature.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 bg-indigo-50/30">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                        <span className="font-semibold text-emerald-700">{feature.snapid}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-snapid-muted">{feature.booth}</td>
                    <td className="px-6 py-4 text-snapid-muted">{feature.online}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* =============================================================================
   SECTION 8: FAQ
   ============================================================================= */
const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Is my photo uploaded to a server?',
      a: 'No. SnapID processes everything locally in your browser using WebAssembly and TensorFlow.js. Your photos never leave your device, ensuring complete privacy.',
    },
    {
      q: 'What passport sizes are supported?',
      a: 'We support official sizes for India (35×45mm), USA (2×2"), UK (35×45mm), China (33×48mm), and many more. You can also set custom dimensions for any ID requirement.',
    },
    {
      q: 'Will prints be accepted by embassies and consulates?',
      a: 'SnapID follows official guidelines for each country. However, we always recommend checking the latest requirements on your embassy\'s website, as rules can change.',
    },
    {
      q: 'What DPI should I use for printing?',
      a: 'For most applications, 300 DPI is sufficient. For professional studio-quality prints or strict requirements, you can export up to 1200 DPI.',
    },
    {
      q: 'Can I print at home?',
      a: 'Absolutely. Our A4 multi-page layout arranges 8-12 photos per sheet, optimized for standard home inkjet and laser printers. Just use photo paper for best results.',
    },
    {
      q: 'Is it really free? How do you make money?',
      a: 'Yes, SnapID is completely free with no watermarks or hidden fees. We\'re supported by optional donations and plan to offer premium templates for business users in the future.',
    },
    {
      q: 'What file formats can I export?',
      a: 'You can download individual photos as PNG, or ready-to-print sheets as PDF. Both support up to 1200 DPI resolution.',
    },
    {
      q: 'Does it work on mobile phones?',
      a: 'Yes, SnapID is fully responsive and works on any modern browser including Safari on iOS and Chrome on Android. You can take a photo and edit it immediately.',
    },
  ];

  return (
    <section id="faq" className="relative py-24 lg:py-32 bg-white" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            id="faq-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] text-snapid-text tracking-tight mb-4"
          >
            Frequently asked{' '}
            <span className="text-gradient">questions</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-snapid-muted">
            Everything you need to know about SnapID.
          </motion.p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-xl border border-white/60 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-semibold text-snapid-text pr-4">{faq.q}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-snapid-muted flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`} 
                  aria-hidden="true"
                />
              </button>
              <motion.div
                initial={false}
                animate={{ height: openIndex === index ? 'auto' : 0, opacity: openIndex === index ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
              >
                <div className="px-6 pb-4 text-snapid-muted leading-relaxed">
                  {faq.a}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* =============================================================================
   SECTION 9: FINAL CTA
   ============================================================================= */
const FinalCTA = () => {
  return (
    <section id="privacy" className="relative py-24 lg:py-32 overflow-hidden" aria-labelledby="cta-heading">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-violet-900 to-indigo-950" aria-hidden="true" />
      
      {/* Animated Mesh */}
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-sm font-medium mb-8">
            <Shield className="w-4 h-4" aria-hidden="true" />
            Privacy-first. Always free.
          </motion.div>

          <motion.h2 
            variants={fadeInUp}
            id="cta-heading"
            className="text-3xl sm:text-4xl lg:text-6xl font-bold font-[family-name:var(--font-display)] text-white tracking-tight mb-6 leading-tight"
          >
            Your passport photo,{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">ready in 5 minutes</span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-lg text-indigo-200 max-w-2xl mx-auto mb-10">
            Join thousands who trust SnapID for their official ID photos. 
            No account, no upload, no compromises.
          </motion.p>

          <motion.div variants={fadeInUp}>
            <a
              href="/app"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-indigo-900 font-bold text-lg shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-4 focus:ring-offset-indigo-900"
            >
              <Camera className="w-6 h-6" aria-hidden="true" />
              Create Your Photo Free
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </a>
          </motion.div>

          <motion.p variants={fadeInUp} className="mt-6 text-sm text-indigo-300/80">
            <Lock className="w-3 h-3 inline mr-1" aria-hidden="true" />
            All processing happens locally in your browser
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

/* =============================================================================
   SECTION 10: FOOTER
   ============================================================================= */
const Footer = () => {
  return (
    <footer className="relative bg-zinc-950 text-zinc-400 py-12 border-t border-zinc-800" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4" aria-label="SnapID Home">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold text-white font-[family-name:var(--font-display)]">
                Snap<span className="text-indigo-400">ID</span>
              </span>
            </a>
            <p className="text-sm leading-relaxed max-w-sm mb-4">
              Free, private, browser-based passport and ID photo maker. 
              Professional results with zero compromises.
            </p>
            <p className="text-xs text-zinc-500 flex items-center gap-1.5">
              <Shield className="w-3 h-3" aria-hidden="true" />
              All processing happens locally in your browser
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#sizes" className="hover:text-white transition-colors">Supported Sizes</a></li>
              <li><a href="/app" className="hover:text-white transition-colors">Open App</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="https://github.com/snapid" className="hover:text-white transition-colors flex items-center gap-1">GitHub</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-500">
            © 2026 SnapID. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            Made with care for privacy-conscious travelers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

/* =============================================================================
   SEO & META COMPONENT
   ============================================================================= */
const SEO = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SnapID',
    description: 'Free browser-based passport and ID photo maker with AI background removal. 100% private, no upload required.',
    url: 'https://snapid.app',
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
      <title>SnapID — Free Passport & ID Photo Maker Online</title>
      <meta name="description" content="Create print-ready passport and ID photos in your browser. Free, private, no upload. AI background removal, official country sizes, A4 print layout. Up to 1200 DPI." />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://snapid.app" />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://snapid.app" />
      <meta property="og:title" content="SnapID — Free Passport & ID Photo Maker" />
      <meta property="og:description" content="Create print-ready passport photos in your browser. 100% private, no upload required." />
      <meta property="og:image" content="https://snapid.app/og-image.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="SnapID — Free Passport & ID Photo Maker" />
      <meta name="twitter:description" content="Create print-ready passport photos in your browser. 100% private, no upload required." />
      <meta name="twitter:image" content="https://snapid.app/og-image.jpg" />
      
      {/* Preconnect */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
};

/* =============================================================================
   SKIP LINK (Accessibility)
   ============================================================================= */
const SkipLink = () => (
  <a 
    href="#main-content" 
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg"
  >
    Skip to main content
  </a>
);

/* =============================================================================
   MAIN APP
   ============================================================================= */
export default function SnapIDLanding() {
  return (
    <div className="min-h-screen bg-snapid-bg font-[family-name:var(--font-body)] text-snapid-text antialiased">
      <GlobalStyles />
      <SEO />
      <SkipLink />
      
      <Header />
      
      <main id="main-content">
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <DemoShowcase />
        <Comparison />
        <FAQ />
        <FinalCTA />
      </main>
      
      <Footer />
    </div>
  );
}