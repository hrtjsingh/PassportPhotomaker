import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';
import { injectJsonLd } from './hooks/usePageSEO';
import { initDarkTheme } from './config/theme';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';

initDarkTheme();

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new Event('snapid:pwa-update'));
  },
});

function Root() {
  const [offline, setOffline] = useState(
    () => typeof navigator !== 'undefined' && !navigator.onLine
  );

  useEffect(() => {
    injectJsonLd();
  }, []);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <StrictMode>
      <PwaUpdatePrompt onUpdate={() => updateSW(true)} />
      {offline && (
        <div
          className="fixed top-0 inset-x-0 z-[95] px-4 py-2 text-center text-xs font-medium text-amber-100 bg-amber-950/90 border-b border-amber-800/50 safe-top"
          role="status"
        >
          You&apos;re offline — cached pages work; AI models need a prior visit or connection.
        </div>
      )}
      <App />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);
