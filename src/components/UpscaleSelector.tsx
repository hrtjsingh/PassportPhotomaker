import React from 'react';
import { Layers, Check } from 'lucide-react';
import { cn } from '../utils/cn';

interface UpscaleSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const OPTIONS = [
  { label: 'Standard', sublabel: '300 DPI — most print shops', value: 1 },
  { label: 'High Res', sublabel: '600 DPI — sharper detail', value: 2 },
  { label: 'Ultra Res', sublabel: '1200 DPI — true native render, largest files', value: 4 },
];

export const UpscaleSelector: React.FC<UpscaleSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Print Resolution</label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Higher = sharper, larger file</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left',
                selected
                  ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 ring-1 ring-brand-500/20'
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                selected ? 'border-brand-600 bg-brand-600' : 'border-zinc-300 dark:border-zinc-600'
              )}>
                {selected && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className={cn(
                  'text-sm font-semibold block',
                  selected ? 'text-brand-700 dark:text-brand-300' : 'text-zinc-700 dark:text-zinc-300'
                )}>
                  {option.value}x · {option.label}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{option.sublabel}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
