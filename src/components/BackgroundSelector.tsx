import React, { useRef } from 'react';
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
  const colorInputRef = useRef<HTMLInputElement>(null);
  const isCustomColor = !COLORS.some(c => c.value.toLowerCase() === selectedColor.toLowerCase());

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Background Color</label>
      <div className="flex flex-wrap gap-3">
        {COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => onChange(color.value)}
            className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all flex items-center justify-center",
              selectedColor.toLowerCase() === color.value.toLowerCase() 
                ? "border-zinc-900 dark:border-zinc-50 scale-110 shadow-md" 
                : "border-transparent hover:scale-105"
            )}
            title={color.name}
          >
            <div 
              className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-zinc-200 dark:border-zinc-700" 
              style={{ backgroundColor: color.value }}
            />
          </button>
        ))}

        {/* Custom Color Picker */}
        <div className="relative">
          <button
            onClick={() => colorInputRef.current?.click()}
            className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all flex items-center justify-center overflow-hidden",
              isCustomColor 
                ? "border-zinc-900 dark:border-zinc-50 scale-110 shadow-md" 
                : "border-zinc-200 dark:border-zinc-800 hover:scale-105 bg-zinc-50 dark:bg-zinc-800"
            )}
            title="Custom Color"
          >
            {isCustomColor ? (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: selectedColor }}
              >
                <Pipette className={cn(
                  "w-4 h-4 md:w-5 md:h-5",
                  // Simple luminance check for icon color
                  parseInt(selectedColor.replace('#', ''), 16) > 0xffffff / 2 ? 'text-zinc-900' : 'text-white'
                )} />
              </div>
            ) : (
              <Pipette className="w-4 h-4 md:w-5 md:h-5 text-zinc-500 dark:text-zinc-400" />
            )}
          </button>
          <input
            ref={colorInputRef}
            type="color"
            value={isCustomColor ? selectedColor : '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            style={{ visibility: 'hidden' }}
          />
        </div>
      </div>
    </div>
  );
};
