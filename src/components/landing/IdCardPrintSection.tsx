import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Upload, Layout, Download, CreditCard, ArrowRight } from 'lucide-react';
import { staggerContainer, fadeInUp } from './animations';
import { FrostedSectionBg } from './FrostedSectionBg';

const STEPS = [
  { icon: Upload, label: 'Upload front & back', desc: 'Two photos of your ID — any phone camera works.' },
  { icon: Layout, label: 'Auto-fit on A4', desc: 'Standard card size, front above back with cut guides.' },
  { icon: Download, label: 'Print or download', desc: 'PDF or PNG at up to 1200 DPI.' },
] as const;

export const IdCardPrintSection = () => (
  <section
    id="id-print"
    className="relative py-24 lg:py-32 overflow-hidden grain-overlay frosted-section"
    aria-labelledby="id-print-heading"
  >
    <FrostedSectionBg mesh meshOpacity="opacity-50" />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.span
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-900/50 text-brand-300 border border-brand-700/40 mb-5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            New feature
          </motion.span>

          <motion.h2
            variants={fadeInUp}
            id="id-print-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-snapid-text tracking-tight mb-4"
          >
            Print both sides of your <span className="text-gradient">ID on one sheet</span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-lg text-snapid-muted mb-8 leading-relaxed">
            Upload the front and back of any ID card. SnapID Studio stacks them on A4 at standard credit-card
            size — front on top, back below — labeled and ready to print and cut.
          </motion.p>

          <motion.ul variants={fadeInUp} className="space-y-4 mb-8">
            {STEPS.map((step) => (
              <li key={step.label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <step.icon className="w-4 h-4 text-brand-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-snapid-text">{step.label}</p>
                  <p className="text-sm text-snapid-muted">{step.desc}</p>
                </div>
              </li>
            ))}
          </motion.ul>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
            <Link to="/id-print" className="btn-primary px-6 py-3.5">
              <CreditCard className="w-4 h-4" aria-hidden="true" />
              Open ID Print Sheet
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a
              href="#how-it-works"
              className="btn-outline px-6 py-3.5"
            >
              Passport photos
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
          className="relative"
        >
          <div className="glass-card rounded-xl p-6 sm:p-8 shadow-2xl shadow-black/30 border border-[#e8dcc8]/12 torii-accent">
            <p className="text-xs font-semibold text-snapid-muted uppercase tracking-wider mb-4 text-center">
              A4 print preview
            </p>
            <div className="aspect-210/297 bg-white rounded-lg shadow-inner border border-zinc-200/80 p-4 sm:p-6 flex flex-col items-center justify-center gap-3">
              <div className="w-[55%] flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-zinc-500 tracking-wider">FRONT</span>
                <div className="w-full aspect-[85.6/54] rounded-md bg-zinc-100/90 border-2 border-dashed border-zinc-300/80 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-zinc-400/60" />
                </div>
              </div>
              <div className="w-[55%] flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-zinc-500 tracking-wider">BACK</span>
                <div className="w-full aspect-[85.6/54] rounded-md bg-zinc-50 border-2 border-dashed border-zinc-300/80 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-zinc-400/60" />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-snapid-muted text-center mt-4">
              85.6 × 54 mm · front above back · up to 2 sets per sheet
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);
