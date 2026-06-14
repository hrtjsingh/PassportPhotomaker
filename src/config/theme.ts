/** SnapID Studio design tokens — dark-first palette. */
export const THEME = {
  colors: {
    indigo: '#4f46e5',
    violet: '#7c3aed',
    cyan: '#06b6d4',
    bg: '#06060a',
    bgElevated: '#0f0f14',
    text: '#fafafa',
    muted: '#a1a1aa',
    emerald: '#10b981',
    glass: 'rgba(15, 15, 20, 0.72)',
  },
  fonts: {
    display: '"Plus Jakarta Sans", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
  },
  gradients: {
    brand: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    brandHorizontal: 'linear-gradient(to right, #4f46e5, #7c3aed)',
    mesh: `
      radial-gradient(ellipse 80% 50% at 20% 40%, rgba(79, 70, 229, 0.22), transparent),
      radial-gradient(ellipse 60% 40% at 80% 60%, rgba(124, 58, 237, 0.18), transparent),
      radial-gradient(ellipse 50% 60% at 50% 100%, rgba(6, 182, 212, 0.1), transparent),
      linear-gradient(to bottom, #06060a, #06060a)
    `,
  },
} as const;

/** Apply dark theme on <html> before first paint when possible. */
export function initDarkTheme() {
  document.documentElement.classList.add('dark');
  document.documentElement.style.colorScheme = 'dark';
  localStorage.setItem('darkMode', 'true');
}
