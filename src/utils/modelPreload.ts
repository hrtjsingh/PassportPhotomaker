import { getBgRemovalConfig } from './bgRemovalConfig';
import { HQ_BG_MODEL } from '../config/mlModels';
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

const STAGES = ['isnet', 'modnet'] as const;
const STAGE_WEIGHT = 100 / STAGES.length;

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

function overallProgress(stage: string, stageProgress: number): number {
  const index = STAGES.indexOf(stage as (typeof STAGES)[number]);
  if (index === -1) return stageProgress;
  return Math.min(100, Math.round(index * STAGE_WEIGHT + (stageProgress / 100) * STAGE_WEIGHT));
}

async function warmupMainThreadModels(): Promise<void> {
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
  setState({ status: 'loading', stage: 'isnet', label: 'Preparing models', progress: 0, error: null });

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
        progress: overallProgress(data.stage, data.progress),
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

  const { publicPath, model } = getBgRemovalConfig();
  const command: WorkerPreloadCommand = {
    type: 'start',
    publicPath,
    imglyModel: model,
    modnetModel: HQ_BG_MODEL,
  };
  worker.postMessage(command);
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

export function waitForModelPreload(): Promise<void> {
  return preloadPromise ?? Promise.resolve();
}
