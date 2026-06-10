import { useEffect, useState } from 'react';
import {
  getModelPreloadState,
  startModelPreload,
  subscribeModelPreload,
  type ModelPreloadState,
} from '../utils/modelPreload';

export function useModelPreload(): ModelPreloadState {
  const [preloadState, setPreloadState] = useState<ModelPreloadState>(getModelPreloadState);

  useEffect(() => {
    const unsubscribe = subscribeModelPreload(setPreloadState);
    startModelPreload();
    return unsubscribe;
  }, []);

  return preloadState;
}
