import { preload } from '@imgly/background-removal';
import { pipeline, env } from '@huggingface/transformers';
import type { BgRemovalBackend } from '../config/bgRemovalModels';
import { getTransformersPipelineOptions, getBgRemovalModelById } from '../config/bgRemovalModels';

export type WorkerPreloadCommand = {
  type: 'start';
  publicPath: string;
  backend: BgRemovalBackend;
  modelId: string;
  modelConfigId: string;
  stage: string;
  label: string;
};

export type WorkerPreloadEvent =
  | { type: 'progress'; stage: string; label: string; progress: number; key?: string }
  | { type: 'complete' }
  | { type: 'error'; message: string };

env.allowLocalModels = false;
env.useBrowserCache = true;

self.onmessage = async (event: MessageEvent<WorkerPreloadCommand>) => {
  if (event.data.type !== 'start') return;

  const { publicPath, backend, modelId, modelConfigId, stage, label } = event.data;

  const postProgress = (progress: number, key?: string) => {
    const payload: WorkerPreloadEvent = { type: 'progress', stage, label, progress, key };
    self.postMessage(payload);
  };

  try {
    postProgress(0);

    if (backend === 'imgly') {
      await preload({
        publicPath,
        model: modelId as 'isnet' | 'isnet_fp16' | 'isnet_quint8',
        progress: (key, current, total) => {
          postProgress(Math.round((current / total) * 100), key);
        },
      });
    } else {
      const model = getBgRemovalModelById(modelConfigId);
      await pipeline('background-removal', modelId, getTransformersPipelineOptions(model, postProgress));
    }

    self.postMessage({ type: 'complete' } satisfies WorkerPreloadEvent);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Model preload failed';
    self.postMessage({ type: 'error', message } satisfies WorkerPreloadEvent);
  }
};
