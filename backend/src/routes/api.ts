import { Router } from 'express';
import multer from 'multer';
import {
  BG_REMOVAL_MODELS,
  DEFAULT_BG_REMOVAL_MODEL_ID,
  HQ_ENHANCE_MODEL,
  MAX_ENHANCE_INPUT_PX,
} from '../config/models.js';
import { requireAuth } from '../middleware/auth.js';
import { removeBackground } from '../services/bgRemovalService.js';
import { enhanceImage } from '../services/enhanceService.js';
import { getModelLoadState } from '../services/modelManager.js';
import { MODEL_CACHE_DIR, isModelCachedOnDisk } from '../config/transformersEnv.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  const defaultBg = BG_REMOVAL_MODELS.find((m) => m.id === DEFAULT_BG_REMOVAL_MODEL_ID) ?? BG_REMOVAL_MODELS[0];
  res.json({
    status: 'ok',
    models: getModelLoadState(),
    cache: {
      dir: MODEL_CACHE_DIR,
      backgroundRemoval: isModelCachedOnDisk(defaultBg.modelId),
      enhance: isModelCachedOnDisk(HQ_ENHANCE_MODEL),
    },
    timestamp: new Date().toISOString(),
  });
});

apiRouter.get('/models', requireAuth(), (_req, res) => {
  res.json({
    backgroundRemoval: BG_REMOVAL_MODELS,
    enhance: {
      modelId: HQ_ENHANCE_MODEL,
      maxInputPx: MAX_ENHANCE_INPUT_PX,
    },
    defaultBgModelId: DEFAULT_BG_REMOVAL_MODEL_ID,
  });
});

apiRouter.post('/remove-background', requireAuth(), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Missing image file. Send multipart field "image".' });
      return;
    }

    const modelId = typeof req.body.modelId === 'string' ? req.body.modelId : undefined;
    const backgroundColor =
      typeof req.body.backgroundColor === 'string' ? req.body.backgroundColor : undefined;

    const result = await removeBackground(req.file.buffer, modelId, backgroundColor);

    if (result.usedFallback) {
      res.setHeader('X-Used-Fallback-From', result.usedFallback.from);
      res.setHeader('X-Used-Fallback-To', result.usedFallback.to);
    }

    res.setHeader('Content-Type', 'image/png');
    res.send(result.buffer);
  } catch (error) {
    console.error('Background removal failed:', error);
    const message = error instanceof Error ? error.message : 'Background removal failed';
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/enhance', requireAuth(), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Missing image file. Send multipart field "image".' });
      return;
    }

    const backgroundColor =
      typeof req.body.backgroundColor === 'string' ? req.body.backgroundColor : '#ffffff';

    const result = await enhanceImage(req.file.buffer, backgroundColor);

    res.setHeader('Content-Type', 'image/png');
    res.send(result);
  } catch (error) {
    console.error('Enhancement failed:', error);
    const message = error instanceof Error ? error.message : 'Enhancement failed';
    res.status(500).json({ error: message });
  }
});
