import React from 'react';
import { cn } from '../utils/cn';

interface CopiesSelectorProps {
  value: number;
  onChange: (val: number) => void;
}

const PRESETS = [4, 8, 12, 16, 24];

export const CopiesSelector: React.FC<CopiesSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Number of Copies</label>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className={cn(
              "px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-all border",
              value === preset
                ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-50 shadow-sm"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
            )}
          >
            {preset}
          </button>
        ))}
        <div className="relative flex items-center">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
            className="w-16 md:w-20 px-2 py-1.5 md:px-3 md:py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-50/10 dark:text-zinc-50"
            placeholder="Custom"
          />
        </div>
      </div>
    </div>
  );
};
