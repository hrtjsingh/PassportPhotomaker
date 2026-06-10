const IMGLY_VERSION = '1.7.0';
const ASSETS_DIR = 'bg-removal-assets';

/** CDN fallback when same-origin assets are not bundled. */
export const IMGLY_CDN_PUBLIC_PATH = `https://staticimgly.com/@imgly/background-removal-data/${IMGLY_VERSION}/dist/`;

let resolvedPublicPath: string | null = null;

/** Absolute same-origin URL including Vite base (subpath deploys). */
export function getLocalBgRemovalPublicPath(): string {
  const base = import.meta.env.BASE_URL || '/';
  const segment = `${base}${ASSETS_DIR}/`.replace(/\/{2,}/g, '/');
  if (typeof window === 'undefined') {
    return segment.startsWith('http') ? segment : `/${segment.replace(/^\//, '')}`;
  }
  return new URL(segment, window.location.origin).href;
}

/**
 * Probes same-origin resources.json (public/ or server proxy).
 * Falls back to imgly CDN when missing — production server should proxy or bundle assets.
 */
export async function ensureBgRemovalPublicPath(): Promise<string> {
  if (resolvedPublicPath) return resolvedPublicPath;

  const local = getLocalBgRemovalPublicPath();
  try {
    const res = await fetch(new URL('resources.json', local), { cache: 'no-cache' });
    if (res.ok) {
      resolvedPublicPath = local;
      return local;
    }
  } catch {
    // same-origin assets unavailable
  }

  resolvedPublicPath = IMGLY_CDN_PUBLIC_PATH;
  return IMGLY_CDN_PUBLIC_PATH;
}

/** Sync accessor — call ensureBgRemovalPublicPath() before first model use. */
export function getBgRemovalPublicPath(): string {
  return resolvedPublicPath ?? getLocalBgRemovalPublicPath();
}

export function getBgRemovalConfig() {
  return {
    publicPath: getBgRemovalPublicPath(),
    model: 'isnet_fp16' as const,
    output: {
      quality: 1.0,
      format: 'image/png' as const,
    },
  };
}

export { IMGLY_VERSION, ASSETS_DIR };
