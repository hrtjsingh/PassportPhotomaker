import React from 'react';
import { motion } from 'motion/react';
import { Upload, Crop, Sparkles, Zap, Settings, Download } from 'lucide-react';
import { staggerContainer, fadeInUp } from './animations';
import { FrostedSectionBg } from './FrostedSectionBg';

const STEPS = [
  { icon: Upload, title: 'Upload', description: 'Drop any photo from your phone or computer.', color: 'bg-brand-700' },
  { icon: Crop, title: 'Crop', description: 'Auto-detect face and align to official ratios.', color: 'bg-brand-600' },
  { icon: Sparkles, title: 'Remove Background', description: 'AI instantly replaces messy backgrounds with clean white.', color: 'bg-brand-700' },
  { icon: Zap, title: 'Enhance', description: 'Optional: sharpen, brighten, and perfect skin tones.', color: 'bg-brand-500' },
  { icon: Settings, title: 'Print Settings', description: 'Choose country, paper size, and copies per sheet.', color: 'bg-brand-700' },
  { icon: Download, title: 'Download / Print', description: 'Export PNG or PDF at up to 1200 DPI resolution.', color: 'bg-brand-600' },
] as const;

export const HowItWorks = () => (
  <section
    id="how-it-works"
    className="relative py-24 lg:py-32 frosted-section grain-overlay"
    aria-labelledby="how-it-works-heading"
  >
    <FrostedSectionBg mesh meshOpacity="opacity-40" />

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
          id="how-it-works-heading"
          className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-snapid-text tracking-tight mb-4"
        >
          From photo to print in <span className="text-gradient">6 steps</span>
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-lg text-snapid-muted max-w-2xl mx-auto">
          No learning curve. The wizard guides you through everything.
        </motion.p>
      </motion.div>

      <div className="relative">
        <div
          className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-linear-to-r from-brand-800 via-brand-500 to-brand-300"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              className="relative text-center group"
            >
              <div
                className={`w-12 h-12 rounded-lg ${step.color} text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/20 relative z-10 group-hover:scale-110 transition-transform`}
              >
                <step.icon className="w-5 h-5" aria-hidden="true" />
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className="lg:hidden absolute left-1/2 top-12 w-0.5 h-8 bg-linear-to-b from-brand-700 to-transparent -translate-x-1/2"
                  aria-hidden="true"
                />
              )}

              <h3 className="text-lg font-bold text-snapid-text mb-1 font-display">{step.title}</h3>
              <p className="text-sm text-snapid-muted leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
