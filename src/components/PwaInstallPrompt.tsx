import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { BRAND_NAME } from '../config/brand';

const DISMISS_KEY = 'snapid-pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1'
  );
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (isStandalone || dismissed || !deferredPrompt) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
    setDeferredPrompt(null);
  };

  const install = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') localStorage.setItem(DISMISS_KEY, '1');
  };

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[90] w-[min(94vw,24rem)] -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl px-4 py-3.5 shadow-2xl shadow-black/40 safe-bottom"
      role="region"
      aria-label="Install app"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-600 to-brand-800 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-50">Install {BRAND_NAME}</p>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            Add to your home screen for quick access — works offline after first visit.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={install}
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
            >
              Install
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 shrink-0"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
