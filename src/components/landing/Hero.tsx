import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { Shield, Lock, Check, Camera, ChevronDown, FileText, CreditCard } from 'lucide-react';
import { staggerContainer, fadeInUp } from './animations';
import { FrostedSectionBg } from './FrostedSectionBg';

export const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="relative min-h-screen flex items-center pt-20 overflow-hidden grain-overlay"
      aria-label="Hero"
    >
      <FrostedSectionBg mesh meshOpacity="opacity-70" />
      <div className="absolute inset-0 dot-grid" aria-hidden="true" />

      {!prefersReducedMotion && (
        <>
          <motion.div
            style={{ y: y1 }}
            className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-white/[0.04] blur-3xl animate-[float_8s_ease-in-out_infinite]"
            aria-hidden="true"
          />
          <motion.div
            style={{ y: y2 }}
            className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-brand-500/[0.05] blur-3xl animate-[float_10s_ease-in-out_infinite_2s]"
            aria-hidden="true"
          />
        </>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass-card shadow-sm mb-6 border-brand-500/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
              </span>
              <span className="text-sm font-medium text-snapid-muted">Free · Private · Print-ready</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-display text-snapid-text tracking-tight leading-[1.1] mb-6"
            >
              Print-ready passport photos{' '}
              <span className="text-gradient">in minutes</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-snapid-muted max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Create official passport and ID photos in your browser. No account, no upload, no watermarks —
              100% private with up to 1200 DPI export.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start mb-8"
            >
              <a href="/studio" className="btn-primary text-lg px-8 py-4">
                <Camera className="w-5 h-5" aria-hidden="true" />
                Create Your Photo Free
              </a>
              <Link to="/id-print" className="btn-ai text-lg px-8 py-4">
                <CreditCard className="w-5 h-5" aria-hidden="true" />
                Print ID Card Sheet
              </Link>
              <a href="#how-it-works" className="btn-outline text-lg px-8 py-4">
                See How It Works
                <ChevronDown className="w-5 h-5" aria-hidden="true" />
              </a>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-2 justify-center lg:justify-start text-sm text-snapid-muted"
            >
              <Lock className="w-4 h-4 text-brand-400" aria-hidden="true" />
              <span className="font-medium text-brand-300">100% private</span>
              <span>— runs entirely in your browser</span>
            </motion.div>

            <motion.p variants={fadeInUp} className="mt-6 text-sm text-snapid-muted/80">
              Trusted by travelers, students, and professionals worldwide
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -5 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
            style={{ perspective: '1000px' }}
          >
            <div className="relative z-10">
              <div className="glass-card rounded-xl shadow-2xl shadow-black/30 overflow-hidden border border-[#e8dcc8]/12 torii-accent">
                <div className="px-4 py-3 border-b border-[#e8dcc8]/10 flex items-center gap-2 bg-snapid-bg-elevated/80">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-brand-500" />
                    <div className="w-3 h-3 rounded-full bg-brand-300" />
                    <div className="w-3 h-3 rounded-full bg-brand-700" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs font-medium text-snapid-muted">SnapID Studio</span>
                  </div>
                </div>

                <div className="p-6 bg-snapid-bg-elevated/70 backdrop-blur-md">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-4">
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 shadow-inner group">
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300" />
                        <div className="absolute inset-4 bg-white rounded-lg shadow-sm flex items-center justify-center">
                          <div className="w-24 h-32 bg-gradient-to-b from-amber-100 to-amber-50 rounded border-2 border-brand-700/30 relative overflow-hidden">
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-amber-200" />
                            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-16 h-8 rounded-t-full bg-amber-200" />
                          </div>
                        </div>
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-brand-700" />
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-brand-700" />
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-brand-700" />
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-brand-700" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-snapid-bg/80 shadow-sm border border-[#e8dcc8]/8">
                        <div className="text-xs font-semibold text-snapid-text mb-2">Size</div>
                        <div className="space-y-1.5">
                          {['India (35×45mm)', 'US (2×2")', 'UK (35×45mm)'].map((size, i) => (
                            <div
                              key={size}
                              className={`text-xs px-2 py-1.5 rounded ${i === 0 ? 'bg-brand-700/20 text-brand-300 font-medium' : 'text-snapid-muted'}`}
                            >
                              {size}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-snapid-bg/80 shadow-sm border border-[#e8dcc8]/8">
                        <div className="text-xs font-semibold text-snapid-text mb-2">Background</div>
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-white border-2 border-brand-700 shadow-sm" />
                          <div className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200" />
                          <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100" />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-brand-500/10 border border-brand-500/20">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-brand-300">
                          <Shield className="w-3 h-3" />
                          Local Processing
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-6 glass-card rounded-xl p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-snapid-text">AI Removed</div>
                    <div className="text-[10px] text-snapid-muted">Background clean</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -left-4 glass-card rounded-xl p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-700/25 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-brand-300" />
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
