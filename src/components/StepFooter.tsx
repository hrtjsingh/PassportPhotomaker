import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  className,
}: StepFooterProps) {
  return (
    <div className={cn('w-full max-w-2xl mx-auto flex flex-col items-stretch gap-4', className)}>
      {continueHint && continueDisabled && (
        <p className="text-xs text-center text-amber-700 dark:text-amber-400 font-medium px-2 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50">
          {continueHint}
        </p>
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

      {secondaryAction && (
        <button
          type="button"
          onClick={secondaryAction.onClick}
          className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 underline-offset-4 hover:underline transition-colors mx-auto py-1"
        >
          {secondaryAction.label}
        </button>
      )}
    </div>
  );
}
