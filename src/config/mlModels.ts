export const HQ_BG_MODEL = 'Xenova/modnet';
export const HQ_ENHANCE_MODEL = 'Xenova/swin2SR-classical-sr-x2-64';
export const IMLY_BG_MODEL = 'isnet_fp16' as const;

/** Bump when models change to invalidate localStorage skip flag. */
export const PRELOAD_CACHE_VERSION = '1.7.0-isnet-modnet';

/** Max longest edge sent to Swin2SR — balance sharpness vs memory (2× output = 4× pixels). */
export const MAX_ENHANCE_INPUT_PX = 640;
