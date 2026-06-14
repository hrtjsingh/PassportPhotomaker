import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Globe,
  Printer as PrinterIcon,
  Maximize2,
  FileText,
  CreditCard,
  Zap,
} from 'lucide-react';
import { staggerContainer, fadeInUp } from './animations';
import { FrostedSectionBg } from './FrostedSectionBg';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Local AI Background Removal',
    description:
      'Open-source ML models run directly in your browser. Your photo never leaves your device.',
    color: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-500/15',
    size: 'large' as const,
  },
  {
    icon: Globe,
    title: 'Official Country Sizes',
    description:
      'India, USA, UK, China, and custom dimensions. Always up-to-date with embassy requirements.',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/15',
    size: 'normal' as const,
  },
  {
    icon: PrinterIcon,
    title: 'A4 Multi-Page Print Layout',
    description: 'Smart sheet arrangement fits 8-12 copies per page. Optimized for home and studio printers.',
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/15',
    size: 'normal' as const,
  },
  {
    icon: Maximize2,
    title: 'Up to 1200 DPI Export',
    description: 'Crystal-clear resolution meets the strictest print standards. PNG or PDF output.',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/15',
    size: 'normal' as const,
  },
  {
    icon: FileText,
    title: 'PDF + PNG Download',
    description: 'Export as single photos or ready-to-print A4 sheets. Perfect for digital submissions too.',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/15',
    size: 'normal' as const,
  },
  {
    icon: CreditCard,
    title: 'ID Card Print Sheet',
    description:
      'Upload front and back of any ID — stacked on A4 at standard card size, ready to print and cut.',
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-500/15',
    size: 'normal' as const,
  },
  {
    icon: Zap,
    title: 'Optional AI Enhancement',
    description: 'Subtle sharpening, brightness correction, and skin clearing — only if you want it.',
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-500/15',
    size: 'normal' as const,
  },
];

export const Features = () => (
  <section id="features" className="relative py-24 lg:py-32 grain-overlay frosted-section" aria-labelledby="features-heading">
    <FrostedSectionBg mesh meshOpacity="opacity-60" />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
        className="text-center mb-16"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature) => (
          <motion.div
            key={feature.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
            className={`group relative ${feature.size === 'large' ? 'md:col-span-2 lg:col-span-2' : ''}`}
          >
            <div className="relative h-full glass-card rounded-2xl p-6 lg:p-8 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 border border-white/10 overflow-hidden">
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${feature.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500 blur-2xl`}
              />

              <div
                className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon
                  className={`w-6 h-6 bg-gradient-to-br ${feature.color} [&>path]:stroke-white`}
                  style={{ stroke: 'url(#gradient)' }}
                  aria-hidden="true"
                />
              </div>

              <h3 className="text-xl font-bold text-snapid-text mb-2 font-display">{feature.title}</h3>
              <p className="text-snapid-muted leading-relaxed">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
