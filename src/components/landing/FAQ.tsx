import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { BRAND_NAME } from '../../config/brand';
import { staggerContainer, fadeInUp } from './animations';
import { FrostedSectionBg } from './FrostedSectionBg';

const FAQS = [
  {
    q: 'Is my photo uploaded to a server?',
    a: `No. ${BRAND_NAME} processes everything locally in your browser using WebAssembly and TensorFlow.js. Your photos never leave your device, ensuring complete privacy.`,
  },
  {
    q: 'What passport sizes are supported?',
    a: 'We support official sizes for India (35×45mm), USA (2×2"), UK (35×45mm), China (33×48mm), and many more. You can also set custom dimensions for any ID requirement.',
  },
  {
    q: 'Will prints be accepted by embassies and consulates?',
    a: `${BRAND_NAME} follows official guidelines for each country. However, we always recommend checking the latest requirements on your embassy's website, as rules can change.`,
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
    a: `Yes, ${BRAND_NAME} is completely free with no watermarks or hidden fees. We're supported by optional donations and plan to offer premium templates for business users in the future.`,
  },
  {
    q: 'What file formats can I export?',
    a: 'You can download individual photos as PNG, or ready-to-print sheets as PDF. Both support up to 1200 DPI resolution.',
  },
  {
    q: 'Does it work on mobile phones?',
    a: `Yes, ${BRAND_NAME} is fully responsive and works on any modern browser including Safari on iOS and Chrome on Android. You can take a photo and edit it immediately.`,
  },
] as const;

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 lg:py-32 frosted-section grain-overlay" aria-labelledby="faq-heading">
      <FrostedSectionBg mesh meshOpacity="opacity-35" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            id="faq-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-snapid-text tracking-tight mb-4"
          >
            Frequently asked <span className="text-gradient">questions</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-snapid-muted">
            Everything you need to know about {BRAND_NAME}.
          </motion.p>
        </motion.div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-xl border border-[#e8dcc8]/12 overflow-hidden torii-accent"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset"
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
                <div className="px-6 pb-4 text-snapid-muted leading-relaxed">{faq.a}</div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
