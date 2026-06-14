import { Camera, Crop, Sparkles, Wand2, Settings, Layout } from 'lucide-react';
import type { StepConfig } from '../components/StepProgress';

export const STUDIO_STEPS: StepConfig[] = [
  { id: 'upload', label: 'Upload', icon: Camera },
  { id: 'crop', label: 'Crop', icon: Crop },
  { id: 'background', label: 'Background', shortLabel: 'BG', icon: Sparkles },
  { id: 'enhance', label: 'Enhance', icon: Wand2 },
  { id: 'settings', label: 'Settings', shortLabel: 'Print', icon: Settings },
  { id: 'preview', label: 'Preview', icon: Layout },
];
