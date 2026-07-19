import { getBgRemovalConfig, ensureBgRemovalPublicPath } from './bgRemovalConfig';
import { getSelectedBgModel } from './bgRemovalSettings';
import { areModelsCached, markModelsCached } from './modelCacheCheck';
import type { WorkerPreloadCommand, WorkerPreloadEvent } from '../workers/modelPreload.worker';

export type ModelPreloadStatus = 'idle' | 'loading' | 'warming' | 'ready' | 'error';

export interface ModelPreloadState {
  status: ModelPreloadStatus;
  stage: string | null;
  label: string | null;
  progress: number;
  error: string | null;
}

let preloadPromise: Promise<void> | null = null;
let worker: Worker | null = null;

const state: ModelPreloadState = {
  status: 'idle',
  stage: null,
  label: null,
  progress: 0,
  error: null,
};

const listeners = new Set<(state: ModelPreloadState) => void>();

function emit() {
  const snapshot = { ...state };
  listeners.forEach((listener) => listener(snapshot));
}

function setState(partial: Partial<ModelPreloadState>) {
  Object.assign(state, partial);
  emit();
}

async function warmupMainThreadModels(): Promise<void> {
  const model = getSelectedBgModel();
  if (model.backend !== 'transformers') {
    setState({ status: 'warming', label: 'Initializing models', progress: 98 });
    return;
  }

  setState({ status: 'warming', label: 'Initializing models', progress: 98 });
  const { warmupBgRemover } = await import('./hqRemoveBackground');
  await warmupBgRemover();
}

async function finishPreload(): Promise<void> {
  await warmupMainThreadModels();
  markModelsCached();
  setState({ status: 'ready', stage: null, label: null, progress: 100, error: null });
}

function runWorkerPreload(resolve: () => void): void {
  const model = getSelectedBgModel();

  setState({
    status: 'loading',
    stage: model.id,
    label: `Loading ${model.name}`,
    progress: 0,
    error: null,
  });

  worker = new Worker(new URL('../workers/modelPreload.worker.ts', import.meta.url), {
    type: 'module',
  });

  worker.onmessage = (event: MessageEvent<WorkerPreloadEvent>) => {
    const data = event.data;

    if (data.type === 'progress') {
      setState({
        status: 'loading',
        stage: data.stage,
        label: data.label,
        progress: data.progress,
      });
      return;
    }

    if (data.type === 'error') {
      worker?.terminate();
      worker = null;
      setState({ status: 'error', error: data.message, progress: 0 });
      resolve();
      return;
    }

    if (data.type === 'complete') {
      worker?.terminate();
      worker = null;
      finishPreload()
        .then(resolve)
        .catch((error) => {
          const message = error instanceof Error ? error.message : 'Model warmup failed';
          setState({ status: 'error', error: message, progress: 0 });
          resolve();
        });
    }
  };

  worker.onerror = () => {
    worker?.terminate();
    worker = null;
    setState({ status: 'error', error: 'Model preload worker failed', progress: 0 });
    resolve();
  };

  void (async () => {
    const resolved = await ensureBgRemovalPublicPath();
    const command: WorkerPreloadCommand = {
      type: 'start',
      publicPath: resolved,
      backend: model.backend,
      modelId: model.modelId,
      modelConfigId: model.id,
      stage: model.id,
      label: `Loading ${model.name}`,
    };
    worker?.postMessage(command);
  })();
}

export function getModelPreloadState(): ModelPreloadState {
  return { ...state };
}

export function subscribeModelPreload(listener: (state: ModelPreloadState) => void): () => void {
  listeners.add(listener);
  listener({ ...state });
  return () => listeners.delete(listener);
}

export function startModelPreload(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (state.status === 'ready') return Promise.resolve();
  if (preloadPromise) return preloadPromise;

  preloadPromise = new Promise<void>((resolve) => {
    areModelsCached()
      .then(async (cached) => {
        if (cached) {
          try {
            await finishPreload();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Model warmup failed';
            setState({ status: 'error', error: message, progress: 0 });
          }
          resolve();
          return;
        }
        runWorkerPreload(resolve);
      })
      .catch(() => {
        runWorkerPreload(resolve);
      });
  });

  return preloadPromise;
}

export function restartModelPreload(): Promise<void> {
  worker?.terminate();
  worker = null;
  preloadPromise = null;
  setState({ status: 'idle', stage: null, label: null, progress: 0, error: null });
  return startModelPreload();
}

export function waitForModelPreload(): Promise<void> {
  return preloadPromise ?? startModelPreload();
}
