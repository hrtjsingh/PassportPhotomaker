import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from './ui/Button';

interface StepFooterProps {
  onBack?: () => void;
  backLabel?: string;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  continueLoading?: boolean;
  continueHint?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  undoAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  className?: string;
}

export function StepFooter({
  onBack,
  backLabel = 'Back',
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  continueLoading = false,
  continueHint,
  secondaryAction,
  undoAction,
  className,
}: StepFooterProps) {
  return (
    <div
      className={cn(
        'w-full max-w-2xl mx-auto flex flex-col items-stretch gap-3 sm:gap-4',
        'fixed bottom-0 inset-x-0 z-40 sm:static',
        'px-3 py-3 safe-bottom sm:px-0 sm:py-0',
        'bg-snapid-bg/95 sm:bg-transparent',
        'backdrop-blur-xl sm:backdrop-blur-none',
        'border-t border-[#e8dcc8]/10 sm:border-0',
        className
      )}
    >
      {continueHint && continueDisabled && (
        <div className="flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300 font-medium px-3.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50">
          <span className="shrink-0 w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-[10px] font-bold">!</span>
          <span>{continueHint}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {onBack ? (
          <Button variant="secondary" size="lg" fullWidth onClick={onBack}>
            <ChevronLeft className="w-4 h-4 shrink-0" />
            {backLabel}
          </Button>
        ) : (
          <div className="hidden sm:block" />
        )}

        {onContinue && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onContinue}
            disabled={continueDisabled}
            loading={continueLoading}
            className={cn(!onBack && 'sm:col-span-2')}
          >
            {continueLabel}
            {!continueLoading && <ChevronRight className="w-4 h-4 shrink-0" />}
          </Button>
        )}
      </div>

      {undoAction && (
        <button
          type="button"
          onClick={undoAction.onClick}
          disabled={undoAction.disabled}
          className="inline-flex items-center justify-center gap-2 text-sm font-medium text-snapid-muted hover:text-brand-300 transition-colors mx-auto py-1.5 px-3 rounded-lg hover:bg-snapid-bg-elevated disabled:opacity-40 disabled:pointer-events-none"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {undoAction.label}
        </button>
      )}

      {secondaryAction && (
        <button
          type="button"
          onClick={secondaryAction.onClick}
          className="text-sm font-medium text-snapid-muted hover:text-brand-300 transition-colors mx-auto py-1.5 px-3 rounded-lg hover:bg-snapid-bg-elevated"
        >
          {secondaryAction.label}
        </button>
      )}
    </div>
  );
}
