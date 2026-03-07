import React from 'react';
import { Loader2 } from 'lucide-react';

interface A4PreviewProps {
  image: string | null;
  upscaleFactor: number;
  isLoading: boolean;
}

export const A4Preview: React.FC<A4PreviewProps> = ({ image, upscaleFactor, isLoading }) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">A4 Print Preview</h3>
        <span className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400">{300 * upscaleFactor} DPI High Resolution</span>
      </div>
      
      <div className="relative w-full aspect-210/297 bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-900">
            <Loader2 className="w-10 h-10 text-zinc-400 dark:text-zinc-500 animate-spin" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Generating layout...</p>
          </div>
        ) : image ? (
          <img 
            src={image} 
            alt="A4 Layout Preview" 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500 italic text-sm">
            Preview will appear here
          </div>
        )}
      </div>
      
      <p className="text-[10px] md:text-xs text-zinc-400 dark:text-zinc-500 text-center italic">
        Note: The preview is scaled down for display. Your download will be full {300 * upscaleFactor} DPI resolution.
      </p>
    </div>
  );
};
