import { ML_API_URL } from '../config/backend';
import type { BgRemovalRunResult } from './runBgRemoval';
import { getSelectedBgModel } from './bgRemovalSettings';
import { canUseMlBackend, getMlAuthHeaders } from './mlAuth';

async function imageSrcToBlob(imageSrc: string): Promise<Blob> {
  const response = await fetch(imageSrc);
  if (!response.ok) {
    throw new Error('Could not read image for upload');
  }
  return response.blob();
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export async function checkMlBackendHealth(): Promise<boolean> {
  if (!canUseMlBackend()) return false;
  try {
    const headers = await getMlAuthHeaders();
    const response = await fetch(`${ML_API_URL}/health`, {
      headers,
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function removeBackgroundViaApi(
  imageSrc: string,
  onProgress?: (progress: number) => void,
  backgroundColor = '#ffffff'
): Promise<BgRemovalRunResult> {
  onProgress?.(5);
  const blob = await imageSrcToBlob(imageSrc);
  const model = getSelectedBgModel();

  const form = new FormData();
  form.append('image', blob, 'photo.png');
  form.append('modelId', model.id);
  form.append('backgroundColor', backgroundColor);

  onProgress?.(20);

  const headers = await getMlAuthHeaders();
  const response = await fetch(`${ML_API_URL}/remove-background`, {
    method: 'POST',
    headers,
    body: form,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  onProgress?.(90);

  const resultBlob = await response.blob();
  const url = URL.createObjectURL(resultBlob);

  const fallbackFrom = response.headers.get('X-Used-Fallback-From');
  const fallbackTo = response.headers.get('X-Used-Fallback-To');

  onProgress?.(100);

  if (fallbackFrom && fallbackTo) {
    return { url, usedFallback: { from: fallbackFrom, to: fallbackTo } };
  }

  return { url };
}

export async function enhanceViaApi(
  imageSrc: string,
  backgroundColor = '#ffffff',
  onProgress?: (progress: number) => void
): Promise<string> {
  onProgress?.(5);
  const blob = await imageSrcToBlob(imageSrc);

  const form = new FormData();
  form.append('image', blob, 'photo.png');
  form.append('backgroundColor', backgroundColor);

  onProgress?.(20);

  const headers = await getMlAuthHeaders();
  const response = await fetch(`${ML_API_URL}/enhance`, {
    method: 'POST',
    headers,
    body: form,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  onProgress?.(90);

  const resultBlob = await response.blob();
  const url = URL.createObjectURL(resultBlob);

  onProgress?.(100);
  return url;
}
