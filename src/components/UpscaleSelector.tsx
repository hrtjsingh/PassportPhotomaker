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
        <div className="w-8 h-8 rounded-lg bg-brand-700/20 flex items-center justify-center">
          <Layers className="w-4 h-4 text-brand-300" />
        </div>
        <div>
          <label className="text-sm font-semibold text-snapid-text">Print Resolution</label>
          <p className="text-xs text-snapid-muted">Higher = sharper, larger file</p>
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
                'flex items-center gap-3 px-4 py-3.5 rounded-lg border transition-all text-left',
                selected
                  ? 'bg-brand-950/40 border-brand-500 ring-1 ring-brand-500/20'
                  : 'bg-snapid-bg-elevated/60 border-[#e8dcc8]/10 hover:border-brand-400/25'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                selected ? 'border-brand-600 bg-brand-600' : 'border-snapid-muted/40'
              )}>
                {selected && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className={cn(
                  'text-sm font-semibold block',
                  selected ? 'text-brand-300' : 'text-snapid-text'
                )}>
                  {option.value}x · {option.label}
                </span>
                <span className="text-xs text-snapid-muted">{option.sublabel}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
