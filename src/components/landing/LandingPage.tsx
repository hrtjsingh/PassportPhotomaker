import React from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { TrustBar } from './TrustBar';
import { Features } from './Features';
import { IdCardPrintSection } from './IdCardPrintSection';
import { HowItWorks } from './HowItWorks';
import { DemoShowcase } from './DemoShowcase';
import { Comparison } from './Comparison';
import { FAQ } from './FAQ';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';
import { LandingSEO } from './LandingSEO';
import { SkipLink } from './SkipLink';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-snapid-bg font-sans text-snapid-text antialiased">
      <LandingSEO />
      <SkipLink />

      <Header />

      <main id="main-content">
        <Hero />
        <TrustBar />
        <Features />
        <IdCardPrintSection />
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
