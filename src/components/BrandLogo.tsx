import { useId } from 'react';
import { cn } from '../utils/cn';
import { THEME } from '../config/theme';
import { BRAND_NAME } from '../config/brand';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

const sizes = {
  sm: { box: 'w-8 h-8', text: 'text-sm' },
  md: { box: 'w-9 h-9', text: 'text-sm lg:text-base' },
  lg: { box: 'w-10 h-10', text: 'text-lg' },
};

export function BrandLogo({ size = 'md', showWordmark = true, className }: BrandLogoProps) {
  const s = sizes[size];
  const stampId = useId();

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          s.box,
          'rounded-md shadow-md shadow-brand-600/30 flex items-center justify-center shrink-0 overflow-hidden border border-brand-500/40'
        )}
      >
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
          <rect width="32" height="32" rx="4" fill={THEME.colors.violet} />
          <rect x="2" y="2" width="28" height="28" rx="3" fill="none" stroke={THEME.colors.gold} strokeWidth="0.8" strokeOpacity="0.6" />
          <rect x="7" y="6" width="18" height="20" rx="1.5" fill={THEME.colors.text} fillOpacity="0.95" />
          <circle cx="16" cy="12.5" r="3.5" fill={THEME.colors.indigo} fillOpacity="0.35" />
          <path
            d="M10 22.5c0-3.3 2.7-4.5 6-4.5s6 1.2 6 4.5"
            stroke={THEME.colors.indigo}
            strokeOpacity="0.45"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <text x="16" y="30" textAnchor="middle" fill={THEME.colors.gold} fontSize="3" fontFamily="serif" opacity="0.9">
            印
          </text>
        </svg>
      </div>
      {showWordmark && (
        <div className="text-left hidden sm:block leading-tight">
          <span className={cn(s.text, 'font-bold tracking-wide font-display text-snapid-text')} aria-label={BRAND_NAME}>
            Snap<span className="text-brand-400">ID</span>
            <span className="text-snapid-muted font-medium"> Studio</span>
          </span>
        </div>
      )}
    </div>
  );
}
