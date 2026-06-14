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
}

export function StepProgress({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  canNavigateTo,
}: StepProgressProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const progressPct = ((currentIndex + 1) / steps.length) * 100;

  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden w-full mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold">
              {currentIndex + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{steps[currentIndex]?.label}</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Step {currentIndex + 1} of {steps.length}</p>
            </div>
          </div>
          <span className="text-xs font-medium text-brand-600 dark:text-brand-200">{Math.round(progressPct)}%</span>
        </div>
        <div className="h-2 bg-zinc-200/80 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-brand-600 to-indigo-500 transition-all duration-500 ease-out rounded-full"
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
                  !active && done && 'bg-brand-300 dark:bg-brand-700',
                  !active && !done && 'bg-zinc-200 dark:bg-zinc-800',
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

      {/* Desktop */}
      <nav
        className="hidden lg:flex items-center gap-0.5 p-1 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 w-full max-w-fit mx-auto"
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
                'flex items-center gap-1.5 px-2 xl:px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0',
                isActive && 'bg-white dark:bg-zinc-700 text-brand-700 dark:text-brand-200 shadow-sm ring-1 ring-brand-500/20',
                !isActive && isDone && 'text-zinc-600 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-zinc-700/50',
                !isActive && !isDone && 'text-zinc-400 dark:text-zinc-500',
                clickable ? 'cursor-pointer' : 'cursor-default opacity-50'
              )}
            >
              <span className={cn(
                'flex items-center justify-center w-5 h-5 rounded-md shrink-0',
                isActive && 'bg-brand-600 text-white',
                !isActive && isDone && 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
                !isActive && !isDone && 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
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
