import type { EnhanceWorkerCommand, EnhanceWorkerEvent } from '../workers/enhance.worker';

let worker: Worker | null = null;
let jobCounter = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/enhance.worker.ts', import.meta.url), {
      type: 'module',
    });
  }
  return worker;
}

function runJob<T extends EnhanceWorkerEvent['type']>(
  command: EnhanceWorkerCommand,
  transfer: Transferable[] | undefined,
  matchType: T
): Promise<Extract<EnhanceWorkerEvent, { type: T }>> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    const id = command.type === 'enhance' || command.type === 'preload' ? command.id : ++jobCounter;

    const onMessage = (event: MessageEvent<EnhanceWorkerEvent>) => {
      if (event.data.id !== id) return;
      if (event.data.type === 'progress') return;

      w.removeEventListener('message', onMessage);
      w.removeEventListener('error', onError);

      if (event.data.type === matchType) {
        resolve(event.data as Extract<EnhanceWorkerEvent, { type: T }>);
        return;
      }
      if (event.data.type === 'error') {
        reject(new Error(event.data.message));
      }
    };

    const onError = () => {
      w.removeEventListener('message', onMessage);
      w.removeEventListener('error', onError);
      reject(new Error('Enhance worker crashed'));
    };

    w.addEventListener('message', onMessage);
    w.addEventListener('error', onError);
    w.postMessage(command, transfer ?? []);
  });
}

export function preloadEnhanceModelInWorker(): Promise<void> {
  const id = ++jobCounter;
  return runJob({ type: 'preload', id }, undefined, 'preloaded').then(() => undefined);
}

export function runEnhanceInWorker(
  blob: Blob,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const id = ++jobCounter;
  const w = getWorker();

  return new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent<EnhanceWorkerEvent>) => {
      if (event.data.id !== id) return;

      if (event.data.type === 'progress') {
        onProgress?.(event.data.progress);
        return;
      }

      w.removeEventListener('message', onMessage);
      w.removeEventListener('error', onError);

      if (event.data.type === 'complete') {
        resolve(event.data.blob);
        return;
      }
      if (event.data.type === 'error') {
        reject(new Error(event.data.message));
        return;
      }
      reject(new Error('Unexpected enhance worker response'));
    };

    const onError = () => {
      w.removeEventListener('message', onMessage);
      w.removeEventListener('error', onError);
      reject(new Error('Enhance worker crashed'));
    };

    w.addEventListener('message', onMessage);
    w.addEventListener('error', onError);
    w.postMessage({ type: 'enhance', id, blob } satisfies EnhanceWorkerCommand);
  });
}

export function terminateEnhanceWorker(): void {
  worker?.terminate();
  worker = null;
}
