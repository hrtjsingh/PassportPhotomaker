import '../config/transformersEnv.js';
import { pipeline, type RawImage } from '@huggingface/transformers';
import type { BgRemovalModelOption } from '../config/models.js';
import { HQ_ENHANCE_MODEL } from '../config/models.js';

type BackgroundRemover = (image: Blob, options?: Record<string, unknown>) => Promise<RawImage>;
type Upscaler = (image: Blob) => Promise<RawImage>;

interface LoadedModel {
  key: string;
  promise: Promise<BackgroundRemover | Upscaler>;
}

const bgRemovers = new Map<string, LoadedModel>();
let upscalerEntry: LoadedModel | null = null;

export interface ModelLoadState {
  bgRemoval: Record<string, 'idle' | 'loading' | 'ready' | 'error'>;
  enhance: 'idle' | 'loading' | 'ready' | 'error';
}

const loadState: ModelLoadState = {
  bgRemoval: {},
  enhance: 'idle',
};

export function getModelLoadState(): ModelLoadState {
  return {
    bgRemoval: { ...loadState.bgRemoval },
    enhance: loadState.enhance,
  };
}

function getPipelineOptions(model: BgRemovalModelOption): Record<string, unknown> {
  const options: Record<string, unknown> = { device: 'cpu' };
  if (model.dtype) options.dtype = model.dtype;
  return options;
}

export function getBgRemover(model: BgRemovalModelOption): Promise<BackgroundRemover> {
  const key = `${model.modelId}:${model.dtype ?? 'default'}`;
  let entry = bgRemovers.get(key);

  if (!entry) {
    loadState.bgRemoval[model.id] = 'loading';
    const promise = (
      pipeline('background-removal', model.modelId, getPipelineOptions(model)) as Promise<BackgroundRemover>
    )
      .then((remover) => {
        loadState.bgRemoval[model.id] = 'ready';
        return remover;
      })
      .catch((err) => {
        loadState.bgRemoval[model.id] = 'error';
        bgRemovers.delete(key);
        throw err;
      });

    entry = { key, promise };
    bgRemovers.set(key, entry);
  }

  return entry.promise as Promise<BackgroundRemover>;
}

export function getUpscaler(): Promise<Upscaler> {
  if (!upscalerEntry) {
    loadState.enhance = 'loading';
    const promise = (
      pipeline('image-to-image', HQ_ENHANCE_MODEL, {
        dtype: 'q4',
        device: 'cpu',
      }) as Promise<Upscaler>
    )
      .then((upscaler) => {
        loadState.enhance = 'ready';
        return upscaler;
      })
      .catch((err) => {
        loadState.enhance = 'error';
        upscalerEntry = null;
        throw err;
      });

    upscalerEntry = { key: HQ_ENHANCE_MODEL, promise };
  }

  return upscalerEntry.promise as Promise<Upscaler>;
}

export async function warmupDefaultModels(): Promise<void> {
  const { getBgRemovalModelById, DEFAULT_BG_REMOVAL_MODEL_ID } = await import('../config/models.js');
  const defaultModel = getBgRemovalModelById(DEFAULT_BG_REMOVAL_MODEL_ID);
  await Promise.all([getBgRemover(defaultModel), getUpscaler()]);
}

export function clearLoadedModels(): void {
  bgRemovers.clear();
  upscalerEntry = null;
  loadState.enhance = 'idle';
  for (const key of Object.keys(loadState.bgRemoval)) {
    loadState.bgRemoval[key] = 'idle';
  }
}
