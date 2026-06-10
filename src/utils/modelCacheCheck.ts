import { ModelRegistry } from '@huggingface/transformers';
import { getBgRemovalConfig, ensureBgRemovalPublicPath } from './bgRemovalConfig';
import { HQ_BG_MODEL, PRELOAD_CACHE_VERSION } from '../config/mlModels';

const STORAGE_KEY = 'passportmaker:models-cache';

interface ModelsCacheRecord {
  version: string;
  savedAt: number;
}

function readCacheRecord(): ModelsCacheRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ModelsCacheRecord;
    if (parsed.version !== PRELOAD_CACHE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function markModelsCached(): void {
  const record: ModelsCacheRecord = {
    version: PRELOAD_CACHE_VERSION,
    savedAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function clearModelsCacheRecord(): void {
  localStorage.removeItem(STORAGE_KEY);
}

async function isFetchCached(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'GET', cache: 'only-if-cached' });
    return response.ok;
  } catch {
    return false;
  }
}

/** Check imgly ISNet assets via resources.json + sample chunks in HTTP cache. */
async function isImglyModelCached(publicPath: string, model: string): Promise<boolean> {
  try {
    const resources = await fetch(`${publicPath}resources.json`).then((r) => r.json());
    const entry = resources[`/models/${model}`];
    if (!entry?.chunks?.length) return false;

    const samples = [entry.chunks[0], entry.chunks[entry.chunks.length - 1]];
    const checks = await Promise.all(
      samples.map((chunk: { name: string }) => isFetchCached(`${publicPath}${chunk.name}`))
    );
    return checks.every(Boolean);
  } catch {
    return false;
  }
}

/** True when all models are already in browser storage — skip worker download. */
export async function areModelsCached(): Promise<boolean> {
  const record = readCacheRecord();
  if (!record) return false;

  await ensureBgRemovalPublicPath();
  const { publicPath, model } = getBgRemovalConfig();

  const [modnetCached, imglyCached] = await Promise.all([
    ModelRegistry.is_pipeline_cached('background-removal', HQ_BG_MODEL),
    isImglyModelCached(publicPath, model),
  ]);

  if (modnetCached && imglyCached) return true;

  clearModelsCacheRecord();
  return false;
}
