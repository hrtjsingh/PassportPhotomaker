import React from 'react';
import { cn } from '../utils/cn';
import { Copy } from 'lucide-react';
import { parseDigitsInput } from '../utils/numericInput';

interface CopiesSelectorProps {
  value: number;
  onChange: (val: number) => void;
}

const PRESETS = [4, 8, 12, 16, 24];

export const CopiesSelector: React.FC<CopiesSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
          <Copy className="w-4 h-4 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Number of Copies</label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Photos per A4 sheet</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className={cn(
              'min-w-[3rem] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border',
              value === preset
                ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/25'
                : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400'
            )}
          >
            {preset}
          </button>
        ))}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Custom</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onChange={(e) => {
              const parsed = parseDigitsInput(e.target.value, 1, 48);
              if (parsed !== null) onChange(parsed);
            }}
            className="w-14 bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-50 focus:outline-none text-center"
          />
        </div>
      </div>
    </div>
  );
};
