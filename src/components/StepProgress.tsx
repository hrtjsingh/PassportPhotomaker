import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import { cn } from '../utils/cn';

export type WizardStep = 'upload' | 'crop' | 'background' | 'enhance' | 'settings' | 'preview';

export interface StepConfig {
  id: WizardStep;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
}

interface StepProgressProps {
  steps: StepConfig[];
  currentStep: WizardStep;
  completedSteps: Set<WizardStep>;
  onStepClick?: (step: WizardStep) => void;
  canNavigateTo?: (step: WizardStep) => boolean;
  layout?: 'responsive' | 'desktop';
}

export function StepProgress({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  canNavigateTo,
  layout = 'responsive',
}: StepProgressProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const progressPct = ((currentIndex + 1) / steps.length) * 100;

  return (
    <>
      {layout === 'responsive' && (
      <div className="lg:hidden w-full mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand-600 text-white text-xs font-bold">
              {currentIndex + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-snapid-text">{steps[currentIndex]?.label}</p>
              <p className="text-[11px] text-snapid-muted">Step {currentIndex + 1} of {steps.length}</p>
            </div>
          </div>
          <span className="text-xs font-medium text-brand-300">{Math.round(progressPct)}%</span>
        </div>
        <div className="h-2 bg-snapid-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-brand-600 to-brand-700 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between gap-1.5">
          {steps.map((step) => {
            const done = completedSteps.has(step.id);
            const active = step.id === currentStep;
            const clickable = canNavigateTo?.(step.id) ?? false;
            return (
              <button
                key={step.id}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(step.id)}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-all',
                  active && 'bg-brand-600',
                  !active && done && 'bg-brand-300',
                  !active && !done && 'bg-snapid-bg-elevated',
                  clickable && !active && 'cursor-pointer hover:opacity-80',
                  !clickable && 'cursor-default'
                )}
                title={step.label}
                aria-label={`${step.label}${done ? ' (completed)' : ''}`}
              />
            );
          })}
        </div>
      </div>
      )}

      <nav
        className={cn(
          'items-center gap-0.5 p-1 rounded-xl bg-snapid-bg-elevated/80 border border-[#e8dcc8]/10 w-full max-w-fit mx-auto',
          layout === 'desktop' ? 'flex' : 'hidden lg:flex'
        )}
        aria-label="Progress"
      >
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isDone = completedSteps.has(step.id);
          const clickable = canNavigateTo?.(step.id) ?? false;
          const displayShort = step.shortLabel ?? step.label;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(step.id)}
              title={step.label}
              aria-label={`${step.label}${isDone ? ' (completed)' : ''}${isActive ? ' (current)' : ''}`}
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'flex items-center gap-1.5 px-2 xl:px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0',
                isActive && 'bg-snapid-bg text-brand-300 shadow-sm ring-1 ring-brand-500/20',
                !isActive && isDone && 'text-snapid-muted hover:bg-snapid-bg/60',
                !isActive && !isDone && 'text-snapid-muted/60',
                clickable ? 'cursor-pointer' : 'cursor-default opacity-50'
              )}
            >
              <span className={cn(
                'flex items-center justify-center w-5 h-5 rounded-md shrink-0',
                isActive && 'bg-brand-600 text-white',
                !isActive && isDone && 'bg-brand-700/30 text-brand-300',
                !isActive && !isDone && 'bg-snapid-bg text-snapid-muted'
              )}>
                {isDone && !isActive ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
              </span>
              <span className="whitespace-nowrap leading-none">
                <span className="2xl:hidden">{displayShort}</span>
                <span className="hidden 2xl:inline">{step.label}</span>
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
