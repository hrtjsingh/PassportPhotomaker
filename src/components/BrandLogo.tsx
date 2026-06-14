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
  sm: { box: 'w-8 h-8', icon: 32, text: 'text-sm' },
  md: { box: 'w-9 h-9', icon: 36, text: 'text-sm lg:text-base' },
  lg: { box: 'w-10 h-10', icon: 40, text: 'text-lg' },
};

export function BrandLogo({ size = 'md', showWordmark = true, className }: BrandLogoProps) {
  const s = sizes[size];
  const gradientId = useId();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(s.box, 'rounded-xl shadow-md shadow-brand-600/25 flex items-center justify-center shrink-0 overflow-hidden')}>
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
          <defs>
            <linearGradient id={gradientId} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor={THEME.colors.indigo} />
              <stop offset="1" stopColor={THEME.colors.violet} />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`} />
          <rect x="7" y="6" width="18" height="20" rx="2.5" fill="white" fillOpacity="0.95" />
          <circle cx="16" cy="12.5" r="3.5" fill={THEME.colors.indigo} fillOpacity="0.3" />
          <path d="M10 22.5c0-3.3 2.7-4.5 6-4.5s6 1.2 6 4.5" stroke={THEME.colors.indigo} strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M7 9.5h2.5M7 9.5v2.5" stroke={THEME.colors.indigo} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M25 9.5h-2.5M25 9.5v2.5" stroke={THEME.colors.indigo} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M7 22.5h2.5M7 22.5v-2.5" stroke={THEME.colors.indigo} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M25 22.5h-2.5M25 22.5v-2.5" stroke={THEME.colors.indigo} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
      {showWordmark && (
        <div className="text-left hidden sm:block leading-tight">
          <span className={cn(s.text, 'font-bold tracking-tight font-display text-zinc-50')} aria-label={BRAND_NAME}>
            Snap<span className="text-brand-400">ID</span>
            <span className="text-zinc-400 font-semibold"> Studio</span>
          </span>
        </div>
      )}
    </div>
  );
}
