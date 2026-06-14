import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { staggerContainer, fadeInUp } from './animations';
import { FrostedSectionBg } from './FrostedSectionBg';
import { StudioLayoutPreview } from './StudioLayoutPreview';

export const DemoShowcase = () => (
  <section
    className="relative py-24 lg:py-32 overflow-hidden frosted-section"
    aria-labelledby="demo-heading"
  >
    <FrostedSectionBg />
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }}
      aria-hidden="true"
    />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
        className="text-center mb-12"
      >
        <motion.h2
          variants={fadeInUp}
          id="demo-heading"
          className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-snapid-text tracking-tight mb-4"
        >
          The full studio runs in your <span className="text-gradient">browser</span>
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-lg text-snapid-muted max-w-2xl mx-auto">
          Same wizard you get at /studio — step progress, crop tools, size presets, and print layout. No install
          required.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-5xl mx-auto"
      >
        <StudioLayoutPreview />

        <div className="mt-8 text-center">
          <Link
            to="/studio"
            className="btn-outline text-lg"
          >
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            Try it now — free
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);
