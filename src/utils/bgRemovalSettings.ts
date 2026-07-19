import {
  DEFAULT_BG_REMOVAL_MODEL_ID,
  getBgRemovalModelById,
  type BgRemovalModelOption,
} from '../config/bgRemovalModels';

const STORAGE_KEY = 'snapid:bg-removal-model';

type Listener = (model: BgRemovalModelOption) => void;

const listeners = new Set<Listener>();

function readStoredId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && getBgRemovalModelById(stored).id === stored) return stored;
  } catch {
    // ignore
  }
  return DEFAULT_BG_REMOVAL_MODEL_ID;
}

export function getSelectedBgModelId(): string {
  return readStoredId();
}

export function getSelectedBgModel(): BgRemovalModelOption {
  return getBgRemovalModelById(readStoredId());
}

export function setSelectedBgModelId(id: string): BgRemovalModelOption {
  const model = getBgRemovalModelById(id);
  localStorage.setItem(STORAGE_KEY, model.id);
  listeners.forEach((listener) => listener(model));
  return model;
}

export function subscribeBgRemovalSettings(listener: Listener): () => void {
  listeners.add(listener);
  listener(getSelectedBgModel());
  return () => listeners.delete(listener);
}
