import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Cropper, { type Area } from 'react-easy-crop';
import { RotateCcw, RotateCw, X } from 'lucide-react';
import getCroppedImg from '../utils/cropImage';
import { Button } from './ui/Button';

interface IdCardCropModalProps {
  open: boolean;
  imageSrc: string;
  title: string;
  aspectRatio: number;
  targetWidthMm: number;
  targetHeightMm: number;
  onApply: (croppedUrl: string) => void;
  onCancel: () => void;
}

export const IdCardCropModal: React.FC<IdCardCropModalProps> = ({
  open,
  imageSrc,
  title,
  aspectRatio,
  targetWidthMm,
  targetHeightMm,
  onApply,
  onCancel,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pixelCrop, setPixelCrop] = useState<Area | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setPixelCrop(null);
    }
  }, [open, imageSrc]);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setPixelCrop(areaPixels);
  }, []);

  const rotateBy = (degrees: number) => {
    setRotation((prev) => prev + degrees);
  };

  const handleApply = async () => {
    if (!pixelCrop) return;
    setIsApplying(true);
    try {
      const cropped = await getCroppedImg(imageSrc, pixelCrop, rotation);
      if (cropped) onApply(cropped);
    } catch (e) {
      console.error(e);
      alert('Could not crop image. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-snapid-bg/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            className="card-elevated w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden safe-bottom"
            role="dialog"
            aria-modal="true"
            aria-labelledby="id-crop-title"
          >
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[#e8dcc8]/10 shrink-0">
              <div>
                <h2 id="id-crop-title" className="text-lg font-bold font-display text-snapid-text">
                  Crop &amp; rotate — {title}
                </h2>
                <p className="text-xs text-snapid-muted mt-0.5">
                  Fit to {targetWidthMm} × {targetHeightMm} mm card
                </p>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="p-2 rounded-lg text-snapid-muted hover:text-snapid-text hover:bg-snapid-bg-elevated transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full aspect-[4/3] sm:aspect-video bg-snapid-bg shrink-0 touch-none">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                showGrid
              />

              <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 pointer-events-none">
                <span className="text-[10px] font-mono text-white font-semibold">
                  {targetWidthMm} × {targetHeightMm} mm
                </span>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => rotateBy(-90)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-snapid-bg-elevated border border-[#e8dcc8]/10 text-xs font-semibold text-snapid-text hover:border-brand-400/25 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  −90°
                </button>
                <span className="text-xs font-mono text-snapid-muted w-14 text-center">{rotation}°</span>
                <button
                  type="button"
                  onClick={() => rotateBy(90)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-snapid-bg-elevated border border-[#e8dcc8]/10 text-xs font-semibold text-snapid-text hover:border-brand-400/25 transition-colors"
                >
                  +90°
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-snapid-text">Zoom</span>
                  <span className="font-mono text-snapid-muted">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                  aria-label="Zoom"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-snapid-text">Rotation</span>
                  <span className="font-mono text-snapid-muted">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full"
                  aria-label="Rotation"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-4 sm:px-6 py-4 border-t border-[#e8dcc8]/10 shrink-0">
              <Button variant="secondary" size="md" fullWidth onClick={onCancel} disabled={isApplying}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleApply}
                loading={isApplying}
                disabled={!pixelCrop}
              >
                Apply
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
