import React, { useState, useEffect } from 'react';
import { Wand2, Sun, Contrast, Zap, Loader2, Sparkles } from 'lucide-react';
import { enhanceImage } from '../utils/enhanceImage';
import { aiEnhanceImage } from '../utils/aiEnhance';

interface ImageEnhancerProps {
  image: string;
  selectedColor: string;
  onComplete: (enhancedImage: string) => void;
}

export const ImageEnhancer: React.FC<ImageEnhancerProps> = ({ image,selectedColor , onComplete }) => {
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [sharpen, setSharpen] = useState(0.2);
  const [lighting, setLighting] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState(image);

  const handleEnhance = async (b = brightness, c = contrast, s = sharpen, l = lighting) => {
    setIsProcessing(true);
    try {
      // Lighting balance adjusts both brightness and contrast slightly
      const finalBrightness = b * (0.9 + (l * 0.1));
      const finalContrast = c * (0.9 + (l * 0.1));
      const result = await enhanceImage(image, { brightness: finalBrightness, contrast: finalContrast, sharpen: s });
      setPreviewImage(result);
      onComplete(result);
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const smartEnhance = () => {
    setBrightness(1.05);
    setContrast(1.1);
    setSharpen(0.4);
    setLighting(1.1);
    handleEnhance(1.05, 1.1, 0.4, 1.1);
  };

  const handleAiEnhance = async () => {
    setIsAiProcessing(true);
    try {
      const result = await aiEnhanceImage(image);
      setPreviewImage(result);
      onComplete(result);
    } catch (error) {
      console.error('AI Enhancement failed:', error);
      alert('AI Enhancement failed. Please try again later.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Initial enhancement
  useEffect(() => {
    handleEnhance();
  }, [image]);

  return (
    <div className="flex flex-col items-center gap-6 md:gap-8 w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 w-full items-start">
        <div className="relative w-full aspect-35/45 rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800" style={{ backgroundColor: selectedColor }}>
          <img src={previewImage} alt="Enhanced Preview" className="w-full h-full object-cover" />
          {(isProcessing || isAiProcessing) && (
            <div className="absolute inset-0 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-zinc-900 dark:text-zinc-50 animate-spin" />
              {isAiProcessing && (
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 animate-pulse">
                  AI is enhancing your photo...
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Enhance Quality</h3>
            <div className="flex gap-2">
              <button
                onClick={smartEnhance}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-xs font-bold rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shadow-sm"
              >
                <Zap className="w-3 h-3 fill-current" />
                SMART AUTO
              </button>
              <button
                onClick={handleAiEnhance}
                disabled={isAiProcessing}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md shadow-zinc-200 dark:shadow-none disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 fill-current" />
                AI SUPER ENHANCE
              </button>
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
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLighting(val);
                  handleEnhance(brightness, contrast, sharpen, val);
                }}
                className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-50"
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
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setBrightness(val);
                  handleEnhance(val, contrast, sharpen, lighting);
                }}
                className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-50"
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
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setContrast(val);
                  handleEnhance(brightness, val, sharpen, lighting);
                }}
                className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-50"
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
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSharpen(val);
                  handleEnhance(brightness, contrast, val, lighting);
                }}
                className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-50"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              <span className="font-bold text-zinc-700 dark:text-zinc-300">Pro Tip:</span> Slight sharpening and contrast boost usually make passport photos look more professional on print.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
