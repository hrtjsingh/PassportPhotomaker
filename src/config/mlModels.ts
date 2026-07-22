export const HQ_ENHANCE_MODEL = 'Xenova/swin2SR-classical-sr-x2-64';

/** Bump when models change to invalidate localStorage skip flag. */
export const PRELOAD_CACHE_VERSION = '1.8.7-rmbg-1.4-default';

/** Max longest edge sent to Swin2SR — 2× output; keep low for browser WASM memory. */
export const MAX_ENHANCE_INPUT_PX = 384;
