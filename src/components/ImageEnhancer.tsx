import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wand2, Sun, Contrast, Zap, Loader2, Sparkles, ScanFace, RotateCcw } from 'lucide-react';
import { enhanceImage, finishPortraitEnhance } from '../utils/enhanceImage';
import { aiEnhanceImage } from '../utils/aiEnhance';
import { Button } from './ui/Button';

interface ImageEnhancerProps {
  image: string;
  selectedColor: string;
  onComplete: (enhancedImage: string) => void;
}

export const ImageEnhancer: React.FC<ImageEnhancerProps> = ({ image, selectedColor, onComplete }) => {
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [sharpen, setSharpen] = useState(0.2);
  const [skinClear, setSkinClear] = useState(0.35);
  const [lighting, setLighting] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(image);
  const [hasEdited, setHasEdited] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setPreviewImage(image);
    setHasEdited(false);
    setBrightness(1);
    setContrast(1);
    setSharpen(0.2);
    setSkinClear(0.35);
    setLighting(1);
  }, [image]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleEnhance = useCallback(
    async (
      b = brightness,
      c = contrast,
      s = sharpen,
      l = lighting,
      skin = skinClear
    ) => {
      setIsProcessing(true);
      try {
        const finalBrightness = b * (0.9 + l * 0.1);
        const finalContrast = c * (0.9 + l * 0.1);
        const result = await enhanceImage(image, {
          brightness: finalBrightness,
          contrast: finalContrast,
          sharpen: s,
          skinClear: skin,
        });
        setPreviewImage(result);
        setHasEdited(true);
        onComplete(result);
      } catch (error) {
        console.error('Enhancement failed:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    [brightness, contrast, sharpen, lighting, skinClear, image, onComplete]
  );

  const scheduleEnhance = useCallback(
    (b: number, c: number, s: number, l: number, skin: number) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => handleEnhance(b, c, s, l, skin), 280);
    },
    [handleEnhance]
  );

  const resetPreview = () => {
    clearTimeout(debounceRef.current);
    setPreviewImage(image);
    setHasEdited(false);
    setBrightness(1);
    setContrast(1);
    setSharpen(0.2);
    setSkinClear(0.35);
    setLighting(1);
    onComplete(image);
  };

  const smartEnhance = async () => {
    setBrightness(1.05);
    setContrast(1.1);
    setSharpen(0.4);
    setSkinClear(0.45);
    setLighting(1.1);
    setIsProcessing(true);
    try {
      const result = await finishPortraitEnhance(image);
      setPreviewImage(result);
      setHasEdited(true);
      onComplete(result);
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAiEnhance = async () => {
    setIsAiProcessing(true);
    setModelProgress(0);
    try {
      const result = await aiEnhanceImage(image, selectedColor, (p) => setModelProgress(p));
      setPreviewImage(result);
      setHasEdited(true);
      onComplete(result);
    } catch (error) {
      console.error('HQ enhancement failed:', error);
      const message =
        error instanceof Error ? error.message : 'Enhancement failed. Please try again.';
      alert(message);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const busy = isProcessing || isAiProcessing;

  return (
    <div className="flex flex-col items-center gap-6 md:gap-8 w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 w-full items-start">
        <div
          className="relative w-full aspect-35/45 rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800"
          style={{ backgroundColor: selectedColor }}
        >
          <img src={previewImage} alt="Enhanced Preview" className="w-full h-full object-cover" />
          {!hasEdited && !busy && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
              Original
            </div>
          )}
          {hasEdited && !busy && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
              Enhanced
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-zinc-900 dark:text-zinc-50 animate-spin" />
              {isAiProcessing && (
                <>
                  <div className="w-40 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 dark:bg-zinc-50 transition-all duration-300"
                      style={{ width: `${modelProgress}%` }}
                    />
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 animate-pulse">
                    Enhancing… {modelProgress}%
                  </p>
                </>
              )}
              {isProcessing && !isAiProcessing && (
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Applying filters…</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Enhance Quality</h3>
              {hasEdited && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetPreview}
                  disabled={busy}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Reset
                </Button>
              )}
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 -mt-2">
              Optional — adjust sliders or use a preset below.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                disabled={busy}
                loading={isProcessing && !isAiProcessing}
                onClick={smartEnhance}
                icon={<Zap className="w-3.5 h-3.5 fill-current" />}
              >
                Smart Auto
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                disabled={busy}
                loading={isAiProcessing}
                onClick={handleAiEnhance}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                HQ Enhance
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Zap className="w-4 h-4" />
                  Lighting Balance
                </div>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{Math.round(lighting * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.01"
                value={lighting}
                disabled={busy}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLighting(val);
                  scheduleEnhance(brightness, contrast, sharpen, val, skinClear);
                }}
                className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-50 disabled:opacity-50"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Sun className="w-4 h-4" />
                  Brightness
                </div>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{Math.round(brightness * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.01"
                value={brightness}
                disabled={busy}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setBrightness(val);
                  scheduleEnhance(val, contrast, sharpen, lighting, skinClear);
                }}
                className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-50 disabled:opacity-50"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Contrast className="w-4 h-4" />
                  Contrast
                </div>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{Math.round(contrast * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.01"
                value={contrast}
                disabled={busy}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setContrast(val);
                  scheduleEnhance(brightness, val, sharpen, lighting, skinClear);
                }}
                className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-50 disabled:opacity-50"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <ScanFace className="w-4 h-4" />
                  Skin Clear
                </div>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{Math.round(skinClear * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={skinClear}
                disabled={busy}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSkinClear(val);
                  scheduleEnhance(brightness, contrast, sharpen, lighting, val);
                }}
                className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-50 disabled:opacity-50"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Wand2 className="w-4 h-4" />
                  Sharpness
                </div>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{Math.round(sharpen * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sharpen}
                disabled={busy}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSharpen(val);
                  scheduleEnhance(brightness, contrast, val, lighting, skinClear);
                }}
                className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-50 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
