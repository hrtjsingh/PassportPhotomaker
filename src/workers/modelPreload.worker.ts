import { preload } from '@imgly/background-removal';
import { pipeline, env } from '@huggingface/transformers';

export type WorkerPreloadCommand = {
  type: 'start';
  publicPath: string;
  imglyModel: 'isnet_fp16';
  modnetModel: string;
};

export type WorkerPreloadEvent =
  | { type: 'progress'; stage: string; label: string; progress: number; key?: string }
  | { type: 'complete' }
  | { type: 'error'; message: string };

env.allowLocalModels = false;
env.useBrowserCache = true;

self.onmessage = async (event: MessageEvent<WorkerPreloadCommand>) => {
  if (event.data.type !== 'start') return;

  const { publicPath, imglyModel, modnetModel } = event.data;

  const postProgress = (stage: string, label: string, progress: number, key?: string) => {
    const payload: WorkerPreloadEvent = { type: 'progress', stage, label, progress, key };
    self.postMessage(payload);
  };

  try {
    postProgress('isnet', 'Fast background removal', 0);
    await preload({
      publicPath,
      model: imglyModel,
      progress: (key, current, total) => {
        postProgress('isnet', 'Fast background removal', Math.round((current / total) * 100), key);
      },
    });

    postProgress('modnet', 'Portrait matting', 0);
    await pipeline('background-removal', modnetModel, {
      progress_callback: (info: { status: string; progress?: number; file?: string }) => {
        if (info.status === 'progress' && info.progress != null) {
          postProgress('modnet', 'Portrait matting', Math.round(info.progress), info.file);
        }
      },
    });

    self.postMessage({ type: 'complete' } satisfies WorkerPreloadEvent);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Model preload failed';
    self.postMessage({ type: 'error', message } satisfies WorkerPreloadEvent);
  }
};
