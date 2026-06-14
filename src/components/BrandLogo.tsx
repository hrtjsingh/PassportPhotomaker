import { cn } from '../utils/cn';

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

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(s.box, 'rounded-xl shadow-md shadow-brand-600/25 flex items-center justify-center shrink-0 overflow-hidden')}>
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
          <defs>
            <linearGradient id="logo-bg" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4f46e5" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill="url(#logo-bg)" />
          <rect x="7" y="6" width="18" height="20" rx="2.5" fill="white" fillOpacity="0.95" />
          <circle cx="16" cy="12.5" r="3.5" fill="#4f46e5" fillOpacity="0.3" />
          <path d="M10 22.5c0-3.3 2.7-4.5 6-4.5s6 1.2 6 4.5" stroke="#4f46e5" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M7 9.5h2.5M7 9.5v2.5" stroke="#4f46e5" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M25 9.5h-2.5M25 9.5v2.5" stroke="#4f46e5" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M7 22.5h2.5M7 22.5v-2.5" stroke="#4f46e5" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M25 22.5h-2.5M25 22.5v-2.5" stroke="#4f46e5" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
      {showWordmark && (
        <div className="text-left hidden sm:block">
          <span className={cn(s.text, 'font-bold tracking-tight font-display leading-tight text-zinc-900 dark:text-zinc-50')}>
            Snap<span className="text-brand-600 dark:text-brand-400">ID</span>
          </span>
        </div>
      )}
    </div>
  );
}
