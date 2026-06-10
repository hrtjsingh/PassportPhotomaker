const ASSETS_PATH = '/bg-removal-assets/';

/** imgly requires an absolute URL base (not a path like `/foo/`). */
export function getBgRemovalPublicPath(): string {
  if (typeof window === 'undefined') {
    return `https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/`;
  }
  return new URL(ASSETS_PATH, window.location.origin).href;
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
