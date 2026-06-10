import { pipeline, env } from '@huggingface/transformers';
import { HQ_ENHANCE_MODEL } from '../config/mlModels';

export type EnhanceWorkerCommand =
  | { type: 'enhance'; id: number; blob: Blob }
  | { type: 'preload'; id: number };

export type EnhanceWorkerEvent =
  | { type: 'progress'; id: number; progress: number }
  | { type: 'complete'; id: number; blob: Blob }
  | { type: 'preloaded'; id: number }
  | { type: 'error'; id: number; message: string };

env.allowLocalModels = false;
env.useBrowserCache = true;

if (env.backends.onnx.wasm) {
  env.backends.onnx.wasm.numThreads = 1;
}

type Upscaler = (image: Blob) => Promise<{ toBlob: (type?: string) => Promise<Blob> }>;

let upscalerPromise: Promise<Upscaler> | null = null;

function getUpscaler(onProgress?: (progress: number) => void): Promise<Upscaler> {
  if (!upscalerPromise) {
    upscalerPromise = (
      pipeline('image-to-image', HQ_ENHANCE_MODEL, {
        dtype: 'q4',
        device: 'wasm',
        progress_callback: (info: { status: string; progress?: number }) => {
          if (info.status === 'progress' && info.progress != null) {
            onProgress?.(Math.round(info.progress));
          }
        },
      }) as Promise<Upscaler>
    ).catch((err) => {
      upscalerPromise = null;
      throw err;
    });
  }
  return upscalerPromise;
}

self.onmessage = async (event: MessageEvent<EnhanceWorkerCommand>) => {
  const data = event.data;

  if (data.type === 'preload') {
    try {
      await getUpscaler();
      self.postMessage({ type: 'preloaded', id: data.id } satisfies EnhanceWorkerEvent);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Enhance model preload failed';
      self.postMessage({ type: 'error', id: data.id, message } satisfies EnhanceWorkerEvent);
    }
    return;
  }

  if (data.type === 'enhance') {
    try {
      const upscaler = await getUpscaler((progress) => {
        self.postMessage({ type: 'progress', id: data.id, progress } satisfies EnhanceWorkerEvent);
      });
      const result = await upscaler(data.blob);
      const outBlob = await result.toBlob('image/png');
      self.postMessage({ type: 'complete', id: data.id, blob: outBlob } satisfies EnhanceWorkerEvent, {
        transfer: [outBlob],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Enhancement failed';
      self.postMessage({ type: 'error', id: data.id, message } satisfies EnhanceWorkerEvent);
    }
  }
};
