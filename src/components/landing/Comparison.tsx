import React from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Star,
  Shield,
  Maximize2,
  Globe,
  Printer as PrinterIcon,
  Lock,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { BRAND_NAME, BRAND_SHORT } from '../../config/brand';
import { staggerContainer, fadeInUp } from './animations';
import { FrostedSectionBg } from './FrostedSectionBg';

const COMPARISON_ROWS = [
  { name: 'Price', snapid: 'Free', booth: '$10-20', online: 'Freemium / $5+', icon: Star },
  { name: 'Privacy', snapid: '100% Local', booth: 'N/A', online: 'Uploads to server', icon: Shield },
  { name: 'Max DPI', snapid: '1200 DPI', booth: '300-600 DPI', online: '300 DPI', icon: Maximize2 },
  { name: 'Country Sizes', snapid: 'India, US, UK, China +', booth: 'Limited', online: 'Limited', icon: Globe },
  { name: 'A4 Print Layout', snapid: 'Yes', booth: 'No', online: 'Rarely', icon: PrinterIcon },
  { name: 'Account Required', snapid: 'No', booth: 'No', online: 'Usually yes', icon: Lock },
  { name: 'AI Background', snapid: 'Yes, local', booth: 'No', online: 'Sometimes', icon: Sparkles },
  { name: 'Watermarks', snapid: 'None', booth: 'None', online: 'Often yes', icon: ImageIcon },
] as const;

export const Comparison = () => (
  <section id="sizes" className="relative py-24 lg:py-32 grain-overlay frosted-section" aria-labelledby="comparison-heading">
    <FrostedSectionBg mesh meshOpacity="opacity-35" />

    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
        className="text-center mb-16"
      >
        <motion.h2
          variants={fadeInUp}
          id="comparison-heading"
          className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-snapid-text tracking-tight mb-4"
        >
          Why choose <span className="text-gradient">{BRAND_SHORT}</span> Studio?
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
        className="glass-card rounded-2xl overflow-hidden shadow-xl border border-white/10"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
                <tr className="border-b border-white/[0.06] bg-zinc-900/50">
                <th className="px-6 py-4 text-sm font-semibold text-snapid-muted uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-4 text-sm font-bold text-brand-300 bg-zinc-900/60 backdrop-blur-sm">{BRAND_NAME}</th>
                <th className="px-6 py-4 text-sm font-semibold text-snapid-muted">Photo Booth</th>
                <th className="px-6 py-4 text-sm font-semibold text-snapid-muted">Generic Online</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-white/[0.06]">
              {COMPARISON_ROWS.map((feature) => (
                <tr key={feature.name} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <feature.icon className="w-4 h-4 text-snapid-muted" aria-hidden="true" />
                      <span className="font-medium text-snapid-text">{feature.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-zinc-900/40 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                      <span className="font-semibold text-emerald-400">{feature.snapid}</span>
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
