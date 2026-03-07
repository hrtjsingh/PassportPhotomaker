import React from 'react';
import { PASSPORT_SIZES, PassportSize } from '../config/passportSizes';
import { ChevronDown } from 'lucide-react';

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
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Passport Dimension</label>
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => {
              const size = PASSPORT_SIZES.find(s => s.id === e.target.value);
              if (size) onChange(size);
            }}
            className="w-full appearance-none bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 pr-10 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-50/10 transition-all"
          >
            {PASSPORT_SIZES.map((size) => (
              <option key={size.id} value={size.id} className="dark:bg-zinc-800">
                {size.name} ({size.description})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {selectedId === 'custom' && onCustomChange && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] md:text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Width (mm)</label>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => onCustomChange(Number(e.target.value), customHeight || 45)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-50/10 dark:text-zinc-50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] md:text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Height (mm)</label>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => onCustomChange(customWidth || 35, Number(e.target.value))}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-50/10 dark:text-zinc-50"
            />
          </div>
        </div>
      )}
    </div>
  );
};
