import { Loader2, AlertCircle } from 'lucide-react';
import { useModelPreload } from '../hooks/useModelPreload';

export function ModelPreloadIndicator() {
  const { status, label, progress, error } = useModelPreload();

  if (status === 'ready' || status === 'idle') return null;

  const isCachedWarmup = status === 'warming' && progress >= 98;

  const isError = status === 'error';

  return (
    <div
      className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-[min(94vw,24rem)] rounded-2xl border px-4 py-3.5 shadow-xl backdrop-blur-md mb-[env(safe-area-inset-bottom)] ${
        isError
          ? 'border-red-200 bg-red-50/95 dark:border-red-900 dark:bg-red-950/90'
          : 'border-brand-800/40 bg-snapid-bg/95'
      }`}
    >
      <div className="flex items-center gap-3">
        {isError ? (
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
        ) : (
          <Loader2 className="w-4 h-4 animate-spin text-brand-300 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-snapid-text truncate">
            {isError ? 'Model preload failed' : isCachedWarmup ? 'Loading cached models' : label ?? 'Preparing models'}
          </p>
          {!isError && (
            <p className="text-[10px] text-snapid-muted">
              {isCachedWarmup ? 'Skipped download — already on device' : status === 'warming' ? 'Almost ready…' : 'Downloading in background…'}
            </p>
          )}
          {isError && (
            <p className="text-[10px] text-red-600 dark:text-red-400 truncate">{error}</p>
          )}
        </div>
        {!isError && (
          <span className="text-[10px] font-mono text-snapid-muted">{progress}%</span>
        )}
      </div>
      {!isError && (
        <div className="mt-2 h-1 bg-snapid-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-brand-600 to-brand-800 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
