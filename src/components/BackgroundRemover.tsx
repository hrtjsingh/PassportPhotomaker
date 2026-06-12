import React, { useState } from 'react';
import { Sparkles, Loader2, Zap, CheckCircle2 } from 'lucide-react';
import { removeBackground } from '../utils/removeBackground';
import { aiRemoveBackground } from '../utils/aiRemoveBackground';
import { Button } from './ui/Button';

interface BackgroundRemoverProps {
  image: string;
  selectedColor: string;
  resultImage: string | null;
  onComplete: (transparentImage: string) => void;
}

export const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({
  image,
  selectedColor,
  resultImage,
  onComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const busy = isProcessing || isAiProcessing;

  const handleRemoveBackground = async () => {
    setIsProcessing(true);
    setProgress(0);
    try {
      const result = await removeBackground(image, (p) => setProgress(p), selectedColor);
      onComplete(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to remove background. Please try again.';
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAiRemoveBackground = async () => {
    setIsAiProcessing(true);
    setProgress(0);
    try {
      const result = await aiRemoveBackground(image, selectedColor, (p) => setProgress(p));
      onComplete(result);
    } catch (error) {
      console.error('HQ background removal failed:', error);
      const message =
        error instanceof Error ? error.message : 'Background removal failed. Please try again.';
      alert(message);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto">
      <div
        className="relative w-full aspect-35/45 rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800 transition-colors duration-300"
        style={{ backgroundColor: selectedColor }}
      >
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10">
          <div
            className="w-3 h-3 rounded-full border border-white/20"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Target BG</span>
        </div>

        <img src={resultImage || image} alt="To process" className="w-full h-full object-cover" />

        {resultImage && !busy && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600/95 backdrop-blur-md text-white text-xs font-semibold shadow-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Background removed — pick a color and continue
          </div>
        )}

        {busy && (
          <div className="absolute inset-0 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 px-6">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-11 h-11 text-zinc-900 dark:text-zinc-50 animate-spin" />
              <span className="absolute text-[10px] font-bold text-zinc-900 dark:text-zinc-50">
                {progress}%
              </span>
            </div>
            <div className="w-full max-w-[12rem] h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 dark:bg-zinc-50 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 text-center">
              {isAiProcessing ? 'Running ModNet…' : 'Removing background…'}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5 w-full">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={busy}
          loading={isAiProcessing}
          onClick={handleAiRemoveBackground}
          icon={!isAiProcessing ? <Zap className="w-4 h-4 fill-current" /> : undefined}
          description={!isAiProcessing ? 'Sharpest edges · removes background halos' : undefined}
        >
          {isAiProcessing ? 'Processing…' : 'Remove Backgroud (HQ)'}
        </Button>

        {/* <Button
          variant="secondary"
          size="lg"
          fullWidth
          disabled={busy}
          loading={isProcessing}
          onClick={handleRemoveBackground}
          icon={!isProcessing ? <Sparkles className="w-4 h-4" /> : undefined}
          description={!isProcessing ? 'Faster preview · lighter model' : undefined}
        >
          {isProcessing ? 'Processing…' : 'Fast Removal'}
        </Button> */}
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center leading-relaxed">
        Runs 100% in your browser — no uploads. Leave a little margin when cropping for clean edges.
      </p>
    </div>
  );
};
