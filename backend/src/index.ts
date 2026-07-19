import './loadEnv.js';
import cors from 'cors';
import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import { apiRouter } from './routes/api.js';
import { warmupDefaultModels } from './services/modelManager.js';
import { getBackendPort } from './loadEnv.js';
import { MODEL_CACHE_DIR, isModelCachedOnDisk } from './config/transformersEnv.js';
import { DEFAULT_BG_REMOVAL_MODEL_ID, getBgRemovalModelById, HQ_ENHANCE_MODEL } from './config/models.js';

const PORT = getBackendPort();
const app = express();

app.use(cors());
app.use(clerkMiddleware());
app.use(express.json());

app.use('/api', apiRouter);

app.get('/', (_req, res) => {
  res.json({
    name: 'SnapID ML Backend',
    endpoints: {
      health: 'GET /api/health',
      models: 'GET /api/models',
      removeBackground: 'POST /api/remove-background',
      enhance: 'POST /api/enhance',
    },
  });
});

const shouldWarmup = process.env.ML_WARMUP !== 'false';

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SnapID ML backend → http://localhost:${PORT}`);
  console.log(`API base → http://localhost:${PORT}/api`);
  console.log(`Model cache → ${MODEL_CACHE_DIR}`);

  if (shouldWarmup) {
    const defaultModel = getBgRemovalModelById(DEFAULT_BG_REMOVAL_MODEL_ID);
    const bgCached = isModelCachedOnDisk(defaultModel.modelId);
    const enhanceCached = isModelCachedOnDisk(HQ_ENHANCE_MODEL);

    if (bgCached && enhanceCached) {
      console.log('Loading models from disk cache (no re-download)...');
    } else if (bgCached || enhanceCached) {
      console.log('Loading models — some cached, some may download on first use...');
    } else {
      console.log('First run — downloading models to cache (one-time)...');
    }

    warmupDefaultModels()
      .then(() => console.log('Default models ready.'))
      .catch((err) => console.warn('Model warmup failed — will load on first request:', err.message));
  }
});
