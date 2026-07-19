import { env } from '@huggingface/transformers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '../..');
const repoRoot = path.resolve(backendRoot, '..');

/** Persistent on-disk Hugging Face model cache (survives restarts). */
export const MODEL_CACHE_DIR =
  process.env.ML_MODEL_CACHE_DIR?.trim() ||
  path.join(repoRoot, '.cache', 'ml-models');

function ensureCacheDir(): void {
  fs.mkdirSync(MODEL_CACHE_DIR, { recursive: true });
}

export function configureTransformersEnv(): void {
  ensureCacheDir();

  env.useFSCache = true;
  env.useBrowserCache = false;
  env.allowLocalModels = true;
  env.allowRemoteModels = true;
  env.cacheDir = MODEL_CACHE_DIR;
}

export function modelIdToCacheFolder(modelId: string): string {
  return `models--${modelId.replace(/\//g, '--')}`;
}

export function isModelCachedOnDisk(modelId: string): boolean {
  const folder = path.join(MODEL_CACHE_DIR, modelIdToCacheFolder(modelId));
  if (!fs.existsSync(folder)) return false;

  try {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      if (entry.isFile()) return true;
      if (entry.isDirectory()) {
        const nested = path.join(folder, entry.name);
        if (fs.readdirSync(nested).length > 0) return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

configureTransformersEnv();
