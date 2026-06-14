import React from 'react';
import { cn } from '../utils/cn';
import { Pipette } from 'lucide-react';

interface BackgroundSelectorProps {
  selectedColor: string;
  onChange: (color: string) => void;
}

const COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Light Blue', value: '#add8e6' },
  { name: 'Light Gray', value: '#f3f4f6' },
  { name: 'Blue', value: '#3b82f6' },
];

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ selectedColor, onChange }) => {
  const colorInputRef = React.useRef<HTMLInputElement>(null);
  const isCustomColor = !COLORS.some(c => c.value.toLowerCase() === selectedColor.toLowerCase());

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Background Color</label>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Choose a standard passport backdrop</p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        {COLORS.map((color) => {
          const selected = selectedColor.toLowerCase() === color.value.toLowerCase();
          return (
            <button
              key={color.value}
              onClick={() => onChange(color.value)}
              className="flex flex-col items-center gap-2 group"
              title={color.name}
            >
              <div className={cn(
                'w-11 h-11 md:w-12 md:h-12 rounded-xl border-2 transition-all flex items-center justify-center shadow-sm',
                selected
                  ? 'border-brand-600 scale-105 ring-2 ring-brand-500/30'
                  : 'border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-300 dark:group-hover:border-zinc-600 group-hover:scale-105'
              )}>
                <div
                  className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-zinc-200/50 dark:border-zinc-600/50"
                  style={{ backgroundColor: color.value }}
                />
              </div>
              <span className={cn(
                'text-[10px] font-medium transition-colors',
                selected ? 'text-brand-600 dark:text-brand-400' : 'text-zinc-500 dark:text-zinc-400'
              )}>
                {color.name}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => colorInputRef.current?.click()}
          className="flex flex-col items-center gap-2 group"
          title="Custom Color"
        >
          <div className={cn(
            'w-11 h-11 md:w-12 md:h-12 rounded-xl border-2 transition-all flex items-center justify-center shadow-sm overflow-hidden',
            isCustomColor
              ? 'border-brand-600 scale-105 ring-2 ring-brand-500/30'
              : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 group-hover:border-zinc-300 dark:group-hover:border-zinc-600 group-hover:scale-105'
          )}>
            {isCustomColor ? (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: selectedColor }}>
                <Pipette className={cn(
                  'w-4 h-4',
                  parseInt(selectedColor.replace('#', ''), 16) > 0xffffff / 2 ? 'text-zinc-900' : 'text-white'
                )} />
              </div>
            ) : (
              <Pipette className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            )}
          </div>
          <span className={cn(
            'text-[10px] font-medium transition-colors',
            isCustomColor ? 'text-brand-600 dark:text-brand-400' : 'text-zinc-500 dark:text-zinc-400'
          )}>
            Custom
          </span>
          <input
            ref={colorInputRef}
            type="color"
            value={isCustomColor ? selectedColor : '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
        </button>
      </div>
    </div>
  );
};
