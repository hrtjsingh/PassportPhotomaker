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
          : 'border-brand-200/60 bg-white/95 dark:border-brand-800/40 dark:bg-zinc-900/95'
      }`}
    >
      <div className="flex items-center gap-3">
        {isError ? (
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
        ) : (
          <Loader2 className="w-4 h-4 animate-spin text-zinc-700 dark:text-zinc-200 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50 truncate">
            {isError ? 'Model preload failed' : isCachedWarmup ? 'Loading cached models' : label ?? 'Preparing models'}
          </p>
          {!isError && (
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {isCachedWarmup ? 'Skipped download — already on device' : status === 'warming' ? 'Almost ready…' : 'Downloading in background…'}
            </p>
          )}
          {isError && (
            <p className="text-[10px] text-red-600 dark:text-red-400 truncate">{error}</p>
          )}
        </div>
        {!isError && (
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">{progress}%</span>
        )}
      </div>
      {!isError && (
        <div className="mt-2 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-brand-600 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
