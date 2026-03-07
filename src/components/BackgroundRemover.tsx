import React, { useState } from 'react';
import { Sparkles, Loader2, Zap } from 'lucide-react';
import { removeBackground } from '../utils/removeBackground';
import { aiRemoveBackground } from '../utils/aiRemoveBackground';

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
  onComplete 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRemoveBackground = async () => {
    setIsProcessing(true);
    setProgress(0);
    try {
      const result = await removeBackground(image, (p) => setProgress(p));
      onComplete(result);
    } catch (error) {
      alert('Failed to remove background. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAiRemoveBackground = async () => {
    setIsAiProcessing(true);
    try {
      const result = await aiRemoveBackground(image, selectedColor);
      onComplete(result);
    } catch (error) {
      console.error('AI Background removal failed:', error);
      alert('AI Background removal failed. Please try again later.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-md mx-auto">
      <div 
        className="relative w-full aspect-35/45 rounded-xl overflow-hidden shadow-md border border-zinc-200 dark:border-zinc-800 transition-colors duration-300"
        style={{ backgroundColor: selectedColor }}
      >
        {/* Selected Color Indicator */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
          <div 
            className="w-3 h-3 rounded-full border border-white/20" 
            style={{ backgroundColor: selectedColor }}
          />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Target BG</span>
        </div>

        <img 
          src={resultImage || image} 
          alt="To process" 
          className="w-full h-full object-cover" 
        />
        
        {(isProcessing || isAiProcessing) && (
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-zinc-900 dark:text-zinc-50 animate-spin" />
              {!isAiProcessing && <span className="absolute text-[10px] font-bold text-zinc-900 dark:text-zinc-50">{progress}%</span>}
            </div>
            {!isAiProcessing && (
              <div className="w-40 md:w-48 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-zinc-900 dark:bg-zinc-50 transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {isAiProcessing ? 'AI is removing background...' : 'Removing background...'}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isAiProcessing ? 'Analyzing image with Gemini' : 'Processing image data'}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={handleAiRemoveBackground}
          disabled={isProcessing || isAiProcessing}
          className="w-full py-3 md:py-4 px-6 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl font-medium flex flex-col items-center justify-center gap-1 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-200 dark:shadow-none"
        >
          <div className="flex items-center gap-2">
            {isAiProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Zap className="w-5 h-5 fill-current" />
            )}
            <span>{isAiProcessing ? 'AI Processing...' : 'AI SUPER REMOVAL'}</span>
          </div>
          {!isAiProcessing && (
            <span className="text-[10px] opacity-60 font-normal">
              Applying {selectedColor === 'transparent' ? 'Transparency' : `Solid ${selectedColor}`}
            </span>
          )}
        </button>

        <button
          onClick={handleRemoveBackground}
          disabled={isProcessing || isAiProcessing}
          className="w-full py-3 md:py-4 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-xl font-medium flex flex-col items-center justify-center gap-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>{isProcessing ? 'Local Processing...' : 'LOCAL REMOVAL (WASM)'}</span>
          </div>
          {!isProcessing && (
            <span className="text-[10px] opacity-60 font-normal">
              Returns Transparency (Fast)
            </span>
          )}
        </button>
      </div>
      
      <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
        AI Super Removal uses Gemini for high-precision edges. 
        <span className="block mt-1 text-zinc-500 dark:text-zinc-400">
          Tip: If you change the background color, re-run AI removal for the best results.
        </span>
      </p>
    </div>
  );
};
