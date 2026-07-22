export type BgRemovalBackend = 'transformers' | 'imgly';
export type TransformersDtype = 'fp32' | 'fp16' | 'q4' | 'q4f16';

export interface BgRemovalModelOption {
  id: string;
  name: string;
  description: string;
  backend: BgRemovalBackend;
  /** Hugging Face model id or imgly variant name */
  modelId: string;
  /** ONNX dtype — required when repo lacks quantized weights */
  dtype?: TransformersDtype;
  /** Max longest edge sent to model — avoids WASM OOM on large photos */
  maxInputPx?: number;
  /** Show memory warning in settings */
  memoryHeavy?: boolean;
  tier: 'fast' | 'balanced' | 'quality';
  sizeHint: string;
  recommended?: boolean;
}

export const BG_REMOVAL_MODELS: BgRemovalModelOption[] = [
  {
    id: 'ben2',
    name: 'BEN2',
    description: 'Default — strong general-purpose removal. Falls back to ModNet if memory runs out.',
    backend: 'transformers',
    modelId: 'onnx-community/BEN2-ONNX',
    dtype: 'fp16',
    maxInputPx: 512,
    memoryHeavy: true,
    tier: 'quality',
    sizeHint: '~220 MB',
  },
  {
    id: 'rmbg-2.0',
    name: 'RMBG 2.0',
    description:
      'Latest BRIA matting (BiRefNet ONNX from briaai/RMBG-2.0). Best quality — large download.',
    backend: 'transformers',
    /** Fixed ONNX export — same weights as briaai/RMBG-2.0/onnx, browser-compatible config. */
    modelId: 'baby2008/RMBG-2.0-ONNX',
    dtype: 'q4',
    maxInputPx: 768,
    memoryHeavy: true,
    tier: 'quality',
    sizeHint: '~350 MB',
  },
  {
    id: 'rmbg-1.4',
    name: 'RMBG 1.4',
    description:
      'BRIA IS-Net matting — official ONNX (briaai/RMBG-1.4/onnx). Balanced quality and size.',
    backend: 'transformers',
    modelId: 'briaai/RMBG-1.4',
    dtype: 'fp16',
    maxInputPx: 896,
    tier: 'quality',
    sizeHint: '~88 MB',
    recommended: true,
  },
  {
    id: 'ormbg',
    name: 'ORMBG',
    description: 'Lightweight ONNX matting alternative when RMBG models fail or run out of memory.',
    backend: 'transformers',
    modelId: 'onnx-community/ormbg-ONNX',
    dtype: 'fp16',
    maxInputPx: 896,
    tier: 'quality',
    sizeHint: '~88 MB',
  },
  {
    id: 'modnet',
    name: 'ModNet',
    description: 'Lightweight portrait matting. Faster download, good for quick previews.',
    backend: 'transformers',
    modelId: 'Xenova/modnet',
    maxInputPx: 2048,
    tier: 'balanced',
    sizeHint: '~25 MB',
  },
  {
    id: 'isnet-fp16',
    name: 'ISNet (Fast)',
    description: 'Fast imgly model. Good speed on slower devices.',
    backend: 'imgly',
    modelId: 'isnet_fp16',
    maxInputPx: 2048,
    tier: 'fast',
    sizeHint: '~80 MB',
  },
  {
    id: 'isnet-full',
    name: 'ISNet (Full)',
    description: 'Highest imgly quality. Larger download, slower inference.',
    backend: 'imgly',
    modelId: 'isnet',
    maxInputPx: 1536,
    tier: 'quality',
    sizeHint: '~170 MB',
  },
];

export const DEFAULT_BG_REMOVAL_MODEL_ID = 'rmbg-1.4';

/** Fallback when memory-heavy models OOM in the browser. */
export const OOM_FALLBACK_MODEL_ID = 'modnet';

export function getBgRemovalModelById(id: string): BgRemovalModelOption {
  return BG_REMOVAL_MODELS.find((model) => model.id === id) ?? BG_REMOVAL_MODELS[0];
}

/** Per-model config fixes for transformers.js background-removal pipeline. */
const MODEL_CONFIG_OVERRIDES: Record<string, Record<string, unknown>> = {
  /** Repo config says Segformer — override for transformers.js background-removal. */
  'briaai/RMBG-1.4': { model_type: 'isnet' },
  'briaai/RMBG-2.0': { model_type: 'birefnet' },
};

export function getTransformersPipelineOptions(
  model: BgRemovalModelOption,
  progressCallback?: (progress: number, file?: string) => void
): Record<string, unknown> {
  const options: Record<string, unknown> = {};
  if (model.dtype) options.dtype = model.dtype;
  const configOverride = MODEL_CONFIG_OVERRIDES[model.modelId];
  if (configOverride) options.config = configOverride;
  if (progressCallback) {
    options.progress_callback = (info: { status: string; progress?: number; file?: string }) => {
      if (info.status === 'progress' && info.progress != null) {
        progressCallback(Math.round(info.progress), info.file);
      }
    };
  }
  return options;
}
