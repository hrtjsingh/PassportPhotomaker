import React from 'react';
import { CreditCard, RotateCcw, ChevronLeft, ChevronRight, Ruler } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import { StepProgress, type WizardStep } from '../StepProgress';
import { STUDIO_STEPS } from '../../config/studioSteps';
import { PASSPORT_SIZES } from '../../config/passportSizes';
import { cn } from '../../utils/cn';

const PREVIEW_STEP: WizardStep = 'crop';
const PREVIEW_COMPLETED = new Set<WizardStep>(['upload']);

const PREVIEW_SIZES = PASSPORT_SIZES.filter((s) => s.id !== 'custom').slice(0, 4);

export const StudioLayoutPreview = () => (
  <div className="relative rounded-xl overflow-hidden border border-[#e8dcc8]/12 shadow-2xl shadow-black/40 bg-snapid-bg text-snapid-text torii-accent">
    <div className="absolute inset-0 mesh-gradient opacity-40 pointer-events-none" aria-hidden="true" />
    <div className="absolute inset-0 pattern-asanoha opacity-20 pointer-events-none" aria-hidden="true" />

    <header className="relative glass-header px-4 sm:px-5 py-3 border-b border-[#e8dcc8]/10">
      <div className="flex items-center justify-between gap-3">
        <BrandLogo size="sm" />

        <div className="flex flex-1 min-w-0 justify-center px-2 scale-[0.9] sm:scale-100 origin-center">
          <StepProgress
            steps={STUDIO_STEPS}
            currentStep={PREVIEW_STEP}
            completedSteps={PREVIEW_COMPLETED}
            layout="desktop"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold text-snapid-muted bg-snapid-bg-elevated/80 border border-[#e8dcc8]/10">
            <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden md:inline">ID Print</span>
          </span>
          <span className="p-1.5 rounded-lg text-snapid-muted bg-snapid-bg-elevated/60" aria-hidden="true">
            <RotateCcw className="w-4 h-4" />
          </span>
        </div>
      </div>
    </header>

    <main className="relative px-4 sm:px-6 py-6 sm:py-8">
      <div className="text-center space-y-2 max-w-lg mx-auto mb-6 sm:mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] sm:text-xs font-semibold bg-brand-900/40 text-brand-300 border border-brand-700/40">
          Step 2 of {STUDIO_STEPS.length}
        </span>
        <h3 className="text-lg sm:text-xl font-bold tracking-tight font-display">Crop your photo</h3>
        <p className="text-xs sm:text-sm text-snapid-muted leading-relaxed">
          Position your face in the frame. Most countries require head centered with a little space above.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto items-start">
        <div className="relative w-full aspect-4/5 sm:aspect-square lg:aspect-video bg-snapid-bg rounded-xl sm:rounded-xl overflow-hidden border border-[#e8dcc8]/10 shadow-xl">
          <div className="absolute inset-0 bg-linear-to-b from-brand-900/40 to-snapid-bg" />
          <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[28%] aspect-square rounded-full bg-snapid-muted/30" />
          <div className="absolute top-[42%] left-1/2 -translate-x-1/2 w-[36%] h-[14%] rounded-t-full bg-snapid-muted/25" />

          <div className="absolute inset-[10%] sm:inset-[12%] border-2 border-brand-50/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] pointer-events-none">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/15" />
              ))}
            </div>
          </div>

          <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#e8dcc8]/15">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              <span className="text-[9px] uppercase tracking-wider font-bold text-white/50">Target Size</span>
            </div>
            <span className="text-xs font-mono text-white font-bold">35mm × 45mm</span>
          </div>
        </div>

        <div className="card-elevated p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-900/40 flex items-center justify-center">
              <Ruler className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-snapid-text">Passport Size</p>
              <p className="text-xs text-snapid-muted">Select your country&apos;s standard</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {PREVIEW_SIZES.map((size) => {
              const selected = size.id === 'india';
              return (
                <div
                  key={size.id}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg border text-left',
                    selected
                      ? 'bg-brand-950/40 border-brand-500 ring-1 ring-brand-500/20'
                      : 'bg-snapid-bg-elevated/60 border-[#e8dcc8]/10'
                  )}
                >
                  <div>
                    <span
                      className={cn(
                        'text-xs sm:text-sm font-semibold block',
                        selected ? 'text-brand-300' : 'text-snapid-muted'
                      )}
                    >
                      {size.name}
                    </span>
                    <span className="text-[10px] sm:text-xs text-snapid-muted/70">{size.description}</span>
                  </div>
                  {selected && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand-400 bg-brand-900/50 px-1.5 py-0.5 rounded-md">
                      Selected
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 max-w-2xl mx-auto grid grid-cols-2 gap-3">
        <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-snapid-bg-elevated/80 border border-[#e8dcc8]/10 text-xs sm:text-sm font-semibold text-snapid-muted">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back to Upload
        </div>
        <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg btn-gradient text-xs sm:text-sm font-semibold">
          Remove Background
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </div>
      </div>
    </main>
  </div>
);
