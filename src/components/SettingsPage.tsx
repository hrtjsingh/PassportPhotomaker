import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, Sparkles, Gauge, HardDrive, CheckCircle2 } from 'lucide-react';
import { PageBackground } from './PageBackground';
import { BrandLogo } from './BrandLogo';
import { ModelPreloadIndicator } from './ModelPreloadIndicator';
import { Button } from './ui/Button';
import { useBgRemovalSettings } from '../hooks/useBgRemovalSettings';
import { BG_REMOVAL_MODELS, getBgRemovalModelById } from '../config/bgRemovalModels';
import { USE_ML_BACKEND } from '../config/backend';
import { isClerkEnabled } from '../config/clerk';
import { AuthControls } from './AuthControls';
import { BRAND_NAME } from '../config/brand';
import { cn } from '../utils/cn';

const TIER_LABELS = {
  fast: 'Fast',
  balanced: 'Balanced',
  quality: 'Best quality',
} as const;

function setPageMeta() {
  document.title = `Settings — ${BRAND_NAME}`;
}

function SettingsPageContent({ isSignedIn }: { isSignedIn: boolean }) {
  const { selectedModel, saveModel } = useBgRemovalSettings();
  const [draftModelId, setDraftModelId] = useState(selectedModel.id);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPageMeta();
  }, []);

  useEffect(() => {
    setDraftModelId(selectedModel.id);
  }, [selectedModel.id]);

  const useBackendMl = USE_ML_BACKEND && isClerkEnabled && Boolean(isSignedIn);
  const availableModels = useBackendMl
    ? BG_REMOVAL_MODELS.filter((model) => model.backend === 'transformers')
    : BG_REMOVAL_MODELS;

  const draftModel = getBgRemovalModelById(draftModelId);
  const hasChanges = draftModelId !== selectedModel.id;

  const handleSave = () => {
    if (!hasChanges) return;
    saveModel(draftModelId);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-dvh flex flex-col relative">
      <PageBackground />
      <ModelPreloadIndicator />

      <header className="sticky top-0 z-50 glass-header px-3 sm:px-4 md:px-6 py-3 safe-top">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <Link to="/studio" className="group shrink-0">
            <BrandLogo size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <AuthControls />
            <Link
              to="/studio"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-snapid-muted hover:text-brand-300 hover:bg-snapid-bg-elevated/60 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to Studio
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-10 pb-16">
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-snapid-text font-display">
            Settings
          </h1>
          <p className="text-sm sm:text-base text-snapid-muted leading-relaxed">
            {useBackendMl
              ? 'Signed in — cloud backend handles background removal. Pick the server model below.'
              : isClerkEnabled
                ? 'Not signed in — models run locally in your browser. Sign in to use the cloud backend.'
                : 'Choose which local AI model removes backgrounds. Models run in your browser — nothing is uploaded.'}
          </p>
        </div>

        <section aria-labelledby="bg-model-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-700/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-300" />
            </div>
            <div>
              <h2 id="bg-model-heading" className="text-sm font-semibold text-snapid-text">
                Background removal model
              </h2>
              <p className="text-xs text-snapid-muted">
                Active: {selectedModel.name} · {selectedModel.sizeHint}
                {hasChanges && (
                  <span className="text-brand-300"> · unsaved: {draftModel.name}</span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {availableModels.map((model) => {
              const selected = draftModelId === model.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setDraftModelId(model.id)}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all',
                    selected
                      ? 'bg-brand-950/40 border-brand-500 ring-1 ring-brand-500/20'
                      : 'bg-snapid-bg-elevated/60 border-[#e8dcc8]/10 hover:border-brand-400/25'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 w-4 h-4 rounded-full border shrink-0 flex items-center justify-center',
                      selected ? 'border-brand-400 bg-brand-500' : 'border-[#e8dcc8]/25'
                    )}
                    aria-hidden="true"
                  >
                    {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          selected ? 'text-brand-300' : 'text-snapid-text'
                        )}
                      >
                        {model.name}
                      </span>
                      {model.recommended && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300 bg-brand-900/50 px-2 py-0.5 rounded-md">
                          Recommended
                        </span>
                      )}
                      {model.memoryHeavy && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-md">
                          High RAM
                        </span>
                      )}
                      <span className="text-[10px] font-medium text-snapid-muted bg-snapid-bg px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                        <Gauge className="w-3 h-3" aria-hidden="true" />
                        {TIER_LABELS[model.tier]}
                      </span>
                      <span className="text-[10px] font-medium text-snapid-muted bg-snapid-bg px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                        <HardDrive className="w-3 h-3" aria-hidden="true" />
                        {model.sizeHint}
                      </span>
                    </div>
                    <p className="text-xs text-snapid-muted leading-relaxed">{model.description}</p>
                  </div>

                  {selected && (
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!hasChanges}
              onClick={handleSave}
            >
              {saved ? 'Saved — downloading model…' : hasChanges ? 'Save & download model' : 'Saved'}
            </Button>
            {hasChanges && (
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => setDraftModelId(selectedModel.id)}
              >
                Cancel
              </Button>
            )}
          </div>

          <p className="text-xs text-snapid-muted leading-relaxed">
            {useBackendMl
              ? 'Model choice applies on the next cloud request. Backend loads weights on first use.'
              : 'Model downloads only after you save. Weights cache on this device. Models marked High RAM need 4GB+ free memory — use ModNet on older devices.'}
          </p>
        </section>
      </main>
    </div>
  );
}

function SettingsPageAuthed() {
  const { isSignedIn } = useAuth();
  return <SettingsPageContent isSignedIn={Boolean(isSignedIn)} />;
}

export default function SettingsPage() {
  if (isClerkEnabled) return <SettingsPageAuthed />;
  return <SettingsPageContent isSignedIn={false} />;
}
