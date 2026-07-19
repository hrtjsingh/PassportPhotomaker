export type TransformersDtype = 'fp32' | 'fp16';

export interface BgRemovalModelOption {
  id: string;
  name: string;
  description: string;
  modelId: string;
  dtype?: TransformersDtype;
  maxInputPx?: number;
  memoryHeavy?: boolean;
  tier: 'fast' | 'balanced' | 'quality';
  sizeHint: string;
  recommended?: boolean;
}

export const BG_REMOVAL_MODELS: BgRemovalModelOption[] = [
  {
    id: 'ben2',
    name: 'BEN2',
    description: 'Default — strong general-purpose removal. Falls back to RMBG 1.4 on memory errors.',
    modelId: 'onnx-community/BEN2-ONNX',
    dtype: 'fp16',
    maxInputPx: 1024,
    memoryHeavy: true,
    tier: 'quality',
    sizeHint: '~220 MB',
    recommended: true,
  },
  {
    id: 'rmbg-1.4',
    name: 'RMBG 1.4',
    description: 'High-quality commercial-grade matting.',
    modelId: 'briaai/RMBG-1.4',
    dtype: 'fp16',
    maxInputPx: 1536,
    tier: 'quality',
    sizeHint: '~88 MB',
  },
  {
    id: 'modnet',
    name: 'ModNet',
    description: 'Lightweight portrait matting.',
    modelId: 'Xenova/modnet',
    maxInputPx: 2048,
    tier: 'balanced',
    sizeHint: '~25 MB',
  },
];

export const DEFAULT_BG_REMOVAL_MODEL_ID = 'ben2';
export const OOM_FALLBACK_MODEL_ID = 'rmbg-1.4';
export const HQ_ENHANCE_MODEL = 'Xenova/swin2SR-classical-sr-x2-64';
export const MAX_ENHANCE_INPUT_PX = 512;

export function getBgRemovalModelById(id: string): BgRemovalModelOption {
  return BG_REMOVAL_MODELS.find((model) => model.id === id) ?? BG_REMOVAL_MODELS[0];
}
