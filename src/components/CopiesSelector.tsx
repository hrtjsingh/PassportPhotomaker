import React from 'react';
import { cn } from '../utils/cn';
import { Copy, Minus, Plus } from 'lucide-react';
import { parseDigitsInput } from '../utils/numericInput';

interface CopiesSelectorProps {
  value: number;
  onChange: (val: number) => void;
}

const PRESETS = [5, 10, 15, 20];
const MIN_COPIES = 1;
const MAX_COPIES = 48;

export const CopiesSelector: React.FC<CopiesSelectorProps> = ({ value, onChange }) => {
  const dec = () => onChange(Math.max(MIN_COPIES, value - 1));
  const inc = () => onChange(Math.min(MAX_COPIES, value + 1));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-700/20 flex items-center justify-center">
          <Copy className="w-4 h-4 text-brand-300" />
        </div>
        <div>
          <label className="text-sm font-semibold text-snapid-text">Number of Copies</label>
          <p className="text-xs text-snapid-muted">Total photos to print</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={cn(
              'min-w-[3rem] px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border',
              value === preset
                ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/25'
                : 'bg-snapid-bg-elevated/60 text-snapid-muted border-[#e8dcc8]/10 hover:border-brand-400/30 hover:text-brand-300'
            )}
          >
            {preset}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-snapid-text">Custom count</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={dec}
            disabled={value <= MIN_COPIES}
            className="p-2 rounded-lg border border-[#e8dcc8]/10 bg-snapid-bg-elevated/60 text-snapid-text hover:border-brand-400/25 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Decrease copies"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onChange={(e) => {
              const parsed = parseDigitsInput(e.target.value, MIN_COPIES, MAX_COPIES);
              if (parsed !== null) onChange(parsed);
            }}
            className="w-14 text-center text-sm font-semibold font-mono bg-snapid-bg-elevated/60 border border-[#e8dcc8]/10 rounded-lg py-2 text-snapid-text focus:outline-none focus:border-brand-400/40"
            aria-label="Number of copies"
          />
          <button
            type="button"
            onClick={inc}
            disabled={value >= MAX_COPIES}
            className="p-2 rounded-lg border border-[#e8dcc8]/10 bg-snapid-bg-elevated/60 text-snapid-text hover:border-brand-400/25 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Increase copies"
          >
            <Plus className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-snapid-muted ml-1">max {MAX_COPIES}</span>
        </div>
      </div>
    </div>
  );
};
