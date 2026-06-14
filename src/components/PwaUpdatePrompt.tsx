import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

export function PwaUpdatePrompt({ onUpdate }: { onUpdate: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => setVisible(true);
    window.addEventListener('snapid:pwa-update', show);
    return () => window.removeEventListener('snapid:pwa-update', show);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-4 left-1/2 z-[90] w-[min(94vw,22rem)] -translate-x-1/2 rounded-xl border border-brand-700/40 bg-snapid-bg/95 backdrop-blur-xl px-4 py-3 shadow-xl safe-top"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <RefreshCw className="w-4 h-4 text-brand-400 shrink-0" aria-hidden="true" />
        <p className="flex-1 text-xs sm:text-sm text-snapid-text">A new version is ready.</p>
        <button
          type="button"
          onClick={() => {
            onUpdate();
            setVisible(false);
          }}
          className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
        >
          Reload
        </button>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="p-1 text-snapid-muted hover:text-snapid-text"
          aria-label="Dismiss update notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
