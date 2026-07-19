/** ML backend config — server inference when signed in + Clerk enabled. */
export const USE_ML_BACKEND = import.meta.env.VITE_USE_ML_BACKEND !== 'false';
export const ML_API_URL = (import.meta.env.VITE_ML_API_URL || '/api').replace(/\/$/, '');
