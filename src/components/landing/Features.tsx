import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Sparkles,
  Globe,
  Printer as PrinterIcon,
  Maximize2,
  FileText,
  CreditCard,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { staggerContainer, fadeInUp } from './animations';
import { FrostedSectionBg } from './FrostedSectionBg';

const PASSPORT_FEATURES = [
  {
    icon: Sparkles,
    title: 'Local AI Background Removal',
    description: 'ML models run in your browser — your photo never leaves your device.',
    iconColor: 'text-brand-700',
    bgColor: 'bg-brand-700/15',
  },
  {
    icon: Globe,
    title: 'Official Country Sizes',
    description: 'India, USA, UK, China, and custom dimensions for any embassy.',
    iconColor: 'text-brand-500',
    bgColor: 'bg-brand-500/15',
  },
  {
    icon: PrinterIcon,
    title: 'A4 Multi-Page Layout',
    description: '8–12 copies per sheet, optimized for home and studio printers.',
    iconColor: 'text-brand-300',
    bgColor: 'bg-brand-300/15',
  },
  {
    icon: Maximize2,
    title: 'Up to 1200 DPI',
    description: 'True high-resolution PNG or PDF for the strictest print standards.',
    iconColor: 'text-snapid-emerald',
    bgColor: 'bg-snapid-emerald/15',
  },
  {
    icon: FileText,
    title: 'PDF + PNG Download',
    description: 'Single photos or ready-to-print sheets for digital submissions.',
    iconColor: 'text-brand-300',
    bgColor: 'bg-brand-300/15',
  },
  {
    icon: Zap,
    title: 'Optional AI Enhancement',
    description: 'Sharpen, brighten, and refine — only when you want it.',
    iconColor: 'text-snapid-sakura',
    bgColor: 'bg-snapid-sakura/15',
  },
] as const;

function FeatureCard({
  icon: Icon,
  title,
  description,
  iconColor,
  bgColor,
}: (typeof PASSPORT_FEATURES)[number]) {
  return (
    <div className="h-full glass-card rounded-xl p-6 border border-[#e8dcc8]/12 hover:border-[#e8dcc8]/20 transition-colors">
      <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center mb-4`}>
        <Icon className={`w-5 h-5 ${iconColor}`} aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-snapid-text mb-1.5 font-display">{title}</h3>
      <p className="text-sm text-snapid-muted leading-relaxed">{description}</p>
    </div>
  );
}

function IdPrintCard() {
  return (
    <div className="glass-card rounded-xl p-6 sm:p-8 border border-brand-500/25 bg-brand-950/20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 text-brand-400" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-400 mb-1">Also included</p>
            <h3 className="text-lg sm:text-xl font-bold text-snapid-text font-display mb-2">
              ID card print sheet
            </h3>
            <p className="text-sm text-snapid-muted leading-relaxed max-w-xl">
              Upload front and back of any ID card. We stack them on A4 at standard credit-card size —
              front above back — then export PDF or PNG at up to 1200 DPI.
            </p>
          </div>
        </div>
        <Link to="/id-print" className="btn-ai shrink-0 px-6 py-3 text-sm w-full md:w-auto justify-center">
          Open ID Print
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export const Features = () => (
  <section id="features" className="relative py-24 lg:py-32 grain-overlay frosted-section" aria-labelledby="features-heading">
    <FrostedSectionBg mesh meshOpacity="opacity-60" />

    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
        className="text-center mb-14"
      >
        <motion.h2
          variants={fadeInUp}
          id="features-heading"
          className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-snapid-text tracking-tight mb-4"
        >
          Everything you need for <span className="text-gradient">perfect ID photos</span>
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-lg text-snapid-muted max-w-2xl mx-auto">
          Professional-grade tools that run locally. No compromises on quality or privacy.
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PASSPORT_FEATURES.map((feature) => (
          <motion.div
            key={feature.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeInUp}
          >
            <FeatureCard {...feature} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={fadeInUp}
        className="mt-5"
      >
        <IdPrintCard />
      </motion.div>
    </div>
  </section>
);
