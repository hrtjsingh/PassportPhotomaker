import type { LucideIcon } from 'lucide-react';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

export type WizardStep = 'upload' | 'crop' | 'background' | 'enhance' | 'settings' | 'preview';

export interface StepConfig {
  id: WizardStep;
  label: string;
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
      {/* Mobile progress */}
      <div className="lg:hidden w-full mb-6 space-y-3">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-zinc-500 dark:text-zinc-400">
            Step {currentIndex + 1} of {steps.length}
          </span>
          <span className="text-zinc-900 dark:text-zinc-50">{steps[currentIndex]?.label}</span>
        </div>
        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-900 dark:bg-zinc-50 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between gap-1">
          {steps.map((step, idx) => {
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
                  active && 'bg-zinc-900 dark:bg-zinc-50',
                  !active && done && 'bg-zinc-400 dark:bg-zinc-500',
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

      {/* Desktop stepper */}
      <div className="hidden lg:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isDone = completedSteps.has(step.id);
          const clickable = canNavigateTo?.(step.id) ?? false;

          return (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(step.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive && 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm',
                  !isActive && isDone && 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/50',
                  !isActive && !isDone && 'text-zinc-400 dark:text-zinc-500',
                  clickable ? 'cursor-pointer' : 'cursor-default opacity-60'
                )}
              >
                {isDone && !isActive ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span>{step.label}</span>
              </button>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 mx-0.5 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
