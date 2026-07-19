import { ModelRegistry } from '@huggingface/transformers';
import { ensureBgRemovalPublicPath, getBgRemovalPublicPath } from './bgRemovalConfig';
import { getSelectedBgModel } from './bgRemovalSettings';
import { PRELOAD_CACHE_VERSION } from '../config/mlModels';

const STORAGE_KEY = 'snapid:models-cache';

interface ModelsCacheRecord {
  version: string;
  savedAt: number;
  bgModelId: string;
}

function readCacheRecord(): ModelsCacheRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ModelsCacheRecord;
    if (parsed.version !== PRELOAD_CACHE_VERSION) return null;
    if (parsed.bgModelId !== getSelectedBgModel().id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function markModelsCached(): void {
  const record: ModelsCacheRecord = {
    version: PRELOAD_CACHE_VERSION,
    savedAt: Date.now(),
    bgModelId: getSelectedBgModel().id,
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

/** True when selected model is already in browser storage — skip worker download. */
export async function areModelsCached(): Promise<boolean> {
  const record = readCacheRecord();
  if (!record) return false;

  const model = getSelectedBgModel();
  await ensureBgRemovalPublicPath();

  if (model.backend === 'transformers') {
    return ModelRegistry.is_pipeline_cached('background-removal', model.modelId);
  }

  const publicPath = getBgRemovalPublicPath();
  return isImglyModelCached(publicPath, model.modelId);
}
