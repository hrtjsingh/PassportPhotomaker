import React from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '../utils/cn';

interface IdCardCopiesSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const PRESETS = [1, 2, 3];

export const IdCardCopiesSelector: React.FC<IdCardCopiesSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-700/20 flex items-center justify-center">
          <Copy className="w-4 h-4 text-brand-300" />
        </div>
        <div>
          <label className="text-sm font-semibold text-snapid-text">Sets per sheet</label>
          <p className="text-xs text-snapid-muted">Each set = front above back on one sheet</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((preset) => {
          const selected = value === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-3 rounded-lg border transition-all',
                selected
                  ? 'bg-brand-950/40 border-brand-500 ring-1 ring-brand-500/20'
                  : 'bg-snapid-bg-elevated/60 border-[#e8dcc8]/10 hover:border-brand-400/25'
              )}
            >
              <span className={cn('text-lg font-bold', selected ? 'text-brand-300' : 'text-snapid-text')}>
                {preset}
              </span>
              <span className="text-[10px] text-snapid-muted">set{preset > 1 ? 's' : ''}</span>
              {selected && <Check className="w-3.5 h-3.5 text-brand-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
