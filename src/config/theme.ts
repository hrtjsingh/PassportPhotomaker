/** SnapID Studio — Wabi-Sabi / Japanese ink & washi design tokens. */
export const THEME = {
  colors: {
    /** Ai-zome (indigo dye) */
    indigo: '#3d5a6e',
    /** Aka (vermillion / torii red) */
    violet: '#c24c4c',
    /** Moss green */
    cyan: '#6b8f71',
    /** Sumi ink base */
    bg: '#12100e',
    bgElevated: '#1e1b17',
    /** Kinari (unbleached paper) */
    text: '#f2ebe0',
    muted: '#9a8f7f',
    emerald: '#5a7d5e',
    sakura: '#e8a0a8',
    gold: '#c9a66b',
    glass: 'rgba(30, 27, 23, 0.82)',
  },
  fonts: {
    display: '"Shippori Mincho", "Noto Serif JP", Georgia, serif',
    body: '"Zen Kaku Gothic New", "Noto Sans JP", system-ui, sans-serif',
  },
  gradients: {
    brand: 'linear-gradient(135deg, #9e3a3a 0%, #c24c4c 50%, #c9a66b 100%)',
    brandHorizontal: 'linear-gradient(to right, #9e3a3a, #c24c4c)',
    mesh: `
      radial-gradient(ellipse 70% 45% at 15% 35%, rgba(61, 90, 110, 0.18), transparent),
      radial-gradient(ellipse 55% 40% at 85% 55%, rgba(194, 76, 76, 0.12), transparent),
      radial-gradient(ellipse 45% 50% at 50% 95%, rgba(201, 166, 107, 0.08), transparent),
      linear-gradient(to bottom, #12100e, #12100e)
    `,
  },
} as const;

/** Apply dark warm theme on <html> before first paint. */
export function initDarkTheme() {
  document.documentElement.classList.add('dark');
  document.documentElement.style.colorScheme = 'dark';
  localStorage.setItem('darkMode', 'true');
}
