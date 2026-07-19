import React, { useState } from 'react';
import { Loader2, Zap, CheckCircle2, RotateCcw, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { runBgRemoval } from '../utils/runBgRemoval';
import { useBgRemovalSettings } from '../hooks/useBgRemovalSettings';
import { Button } from './ui/Button';

interface BackgroundRemoverProps {
  image: string;
  selectedColor: string;
  resultImage: string | null;
  onComplete: (transparentImage: string) => void;
  onUndo?: () => void;
}

export const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({
  image,
  selectedColor,
  resultImage,
  onComplete,
  onUndo,
}) => {
  const { selectedModel } = useBgRemovalSettings();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fallbackNote, setFallbackNote] = useState<string | null>(null);

  const handleRemoveBackground = async () => {
    setIsProcessing(true);
    setProgress(0);
    setFallbackNote(null);
    try {
      const result = await runBgRemoval(image, (p) => setProgress(p), selectedColor);
      if (result.usedFallback) {
        setFallbackNote(
          `${result.usedFallback.from} ran out of memory — completed with ${result.usedFallback.to} instead.`
        );
      }
      onComplete(result.url);
    } catch (error) {
      console.error('Background removal failed:', error);
      const message =
        error instanceof Error ? error.message : 'Background removal failed. Please try again.';
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto">
      <div
        className="relative w-full aspect-35/45 rounded-xl overflow-hidden shadow-lg border border-[#e8dcc8]/10 transition-colors duration-300"
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

        {resultImage && !isProcessing && (
          <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2">
            {fallbackNote && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-600/95 backdrop-blur-md text-white text-xs font-semibold shadow-lg">
                {fallbackNote}
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-brand-600/95 backdrop-blur-md text-white text-xs font-semibold shadow-lg">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Background removed — pick a color and continue
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-snapid-bg/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 px-6">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-11 h-11 text-snapid-text animate-spin" />
              <span className="absolute text-[10px] font-bold text-snapid-text">
                {progress}%
              </span>
            </div>
            <div className="w-full max-w-[12rem] h-1.5 bg-snapid-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm font-semibold text-snapid-text text-center">
              Running {selectedModel.name}…
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5 w-full">
        {resultImage && onUndo ? (
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            disabled={isProcessing}
            onClick={onUndo}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Undo background removal
          </Button>
        ):

        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={isProcessing || resultImage !== null}
          loading={isProcessing}
          onClick={handleRemoveBackground}
          icon={!isProcessing ? <Zap className="w-4 h-4 fill-current" /> : undefined}
          // description={!isProcessing ? `Using ${selectedModel.name} · ${selectedModel.sizeHint}` : undefined}
        >
          {isProcessing ? 'Processing…' : 'Remove Background'}
        </Button>
}
{/* 
        <Link
          to="/settings"
          className="inline-flex items-center justify-center gap-2 min-h-11 px-5 text-sm font-semibold rounded-xl text-snapid-muted hover:text-brand-300 hover:bg-snapid-bg-elevated/60 transition-colors"
        >
          <Settings2 className="w-4 h-4" aria-hidden="true" />
          Change model
        </Link> */}
      </div>

      <p className="text-xs text-snapid-muted text-center leading-relaxed">
        Runs 100% in your browser — no uploads. Leave a little margin when cropping for clean edges.
      </p>
    </div>
  );
};
