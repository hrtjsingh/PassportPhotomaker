import { useCallback, useEffect, useState } from 'react';
import type { BgRemovalModelOption } from '../config/bgRemovalModels';
import {
  getSelectedBgModel,
  setSelectedBgModelId,
  subscribeBgRemovalSettings,
} from '../utils/bgRemovalSettings';
import { restartModelPreload } from '../utils/modelPreload';
import { resetBgRemoverCache } from '../utils/hqRemoveBackground';

export function useBgRemovalSettings() {
  const [selectedModel, setSelectedModel] = useState<BgRemovalModelOption>(getSelectedBgModel);

  useEffect(() => subscribeBgRemovalSettings(setSelectedModel), []);

  const saveModel = useCallback((id: string) => {
    const previousId = getSelectedBgModel().id;
    if (previousId === id) return false;

    setSelectedBgModelId(id);
    resetBgRemoverCache();
    void restartModelPreload();
    return true;
  }, []);

  return { selectedModel, saveModel };
}
