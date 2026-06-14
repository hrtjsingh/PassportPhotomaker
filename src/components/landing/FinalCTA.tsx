import React from 'react';
import { motion } from 'motion/react';
import { Shield, Camera, ArrowRight, Lock } from 'lucide-react';
import { BRAND_NAME } from '../../config/brand';
import { staggerContainer, fadeInUp } from './animations';
import { FrostedSectionBg } from './FrostedSectionBg';

export const FinalCTA = () => (
  <section
    id="privacy"
    className="relative py-24 lg:py-32 overflow-hidden frosted-section"
    aria-labelledby="cta-heading"
  >
    <FrostedSectionBg mesh meshOpacity="opacity-40" />

    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
      >
        <motion.div
          variants={fadeInUp}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-snapid-muted text-sm font-medium mb-8"
        >
          <Shield className="w-4 h-4" aria-hidden="true" />
          Privacy-first. Always free.
        </motion.div>

        <motion.h2
          variants={fadeInUp}
          id="cta-heading"
          className="text-3xl sm:text-4xl lg:text-6xl font-bold font-display text-snapid-text tracking-tight mb-6 leading-tight"
        >
          Your passport photo, <span className="text-gradient">ready in 5 minutes</span>
        </motion.h2>

        <motion.p variants={fadeInUp} className="text-lg text-snapid-muted max-w-2xl mx-auto mb-10">
          Join thousands who trust {BRAND_NAME} for their official ID photos. No account, no upload, no
          compromises.
        </motion.p>

        <motion.div variants={fadeInUp}>
          <a href="/studio" className="btn-primary text-lg px-10 py-5">
            <Camera className="w-6 h-6" aria-hidden="true" />
            Create Your Photo Free
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </a>
        </motion.div>

        <motion.p variants={fadeInUp} className="mt-6 text-sm text-snapid-muted">
          <Lock className="w-3 h-3 inline mr-1" aria-hidden="true" />
          All processing happens locally in your browser
        </motion.p>
      </motion.div>
    </div>
  </section>
);
