import React from 'react';
import { Layers } from 'lucide-react';
import { cn } from '../utils/cn';

interface UpscaleSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const OPTIONS = [
  { label: '1x (Standard 300 DPI)', value: 1 },
  { label: '2x (High Res 600 DPI)', value: 2 },
  { label: '4x (Ultra Res 1200 DPI)', value: 4 },
];

export const UpscaleSelector: React.FC<UpscaleSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-zinc-500" />
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Resolution Upscale</label>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left",
              value === option.value
                ? "bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50 text-white dark:text-zinc-900 shadow-md"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
            )}
          >
            <span className="text-sm font-medium">{option.label}</span>
            {value === option.value && (
              <div className="w-2 h-2 rounded-full bg-white dark:bg-zinc-900" />
            )}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
        Higher upscale values increase the pixel dimensions of your photo for sharper prints, but will result in larger file sizes.
      </p>
    </div>
  );
};
