import React from 'react';
import { PASSPORT_SIZES, PassportSize } from '../config/passportSizes';
import { Ruler } from 'lucide-react';
import { parseDigitsInput } from '../utils/numericInput';

interface SizeSelectorProps {
  selectedId: string;
  onChange: (size: PassportSize) => void;
  customWidth?: number;
  customHeight?: number;
  onCustomChange?: (w: number, h: number) => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  selectedId,
  onChange,
  customWidth,
  customHeight,
  onCustomChange
}) => {
  const selectedSize = PASSPORT_SIZES.find(s => s.id === selectedId) || PASSPORT_SIZES[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-700/20 flex items-center justify-center">
          <Ruler className="w-4 h-4 text-brand-300" />
        </div>
        <div>
          <label className="text-sm font-semibold text-snapid-text">Passport Size</label>
          <p className="text-xs text-snapid-muted">Select your country's standard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {PASSPORT_SIZES.map((size) => {
          const selected = selectedId === size.id;
          return (
            <button
              key={size.id}
              onClick={() => onChange(size)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all ${
                selected
                  ? 'bg-brand-950/40 border-brand-500 ring-1 ring-brand-500/20'
                  : 'bg-snapid-bg-elevated/60 border-[#e8dcc8]/10 hover:border-brand-400/25'
              }`}
            >
              <div>
                <span className={`text-sm font-semibold block ${selected ? 'text-brand-300' : 'text-snapid-text'}`}>
                  {size.name}
                </span>
                <span className="text-xs text-snapid-muted">{size.description}</span>
              </div>
              {selected && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-900/50 px-2 py-0.5 rounded-md">
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedId === 'custom' && onCustomChange && (
        <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-snapid-bg-elevated/60 border border-[#e8dcc8]/10">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-snapid-muted">Width (mm)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={customWidth ?? ''}
              onChange={(e) => {
                const parsed = parseDigitsInput(e.target.value, 1, 200);
                if (parsed !== null) onCustomChange(parsed, customHeight || 45);
              }}
              className="w-full bg-snapid-bg border border-[#e8dcc8]/10 rounded-lg px-3 py-2.5 text-sm font-medium text-snapid-text focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-snapid-muted">Height (mm)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={customHeight ?? ''}
              onChange={(e) => {
                const parsed = parseDigitsInput(e.target.value, 1, 200);
                if (parsed !== null) onCustomChange(customWidth || 35, parsed);
              }}
              className="w-full bg-snapid-bg border border-[#e8dcc8]/10 rounded-lg px-3 py-2.5 text-sm font-medium text-snapid-text focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        </div>
      )}

      <p className="text-xs text-snapid-muted">
        Currently: <span className="font-medium text-snapid-text">{selectedSize.description}</span>
      </p>
    </div>
  );
};
