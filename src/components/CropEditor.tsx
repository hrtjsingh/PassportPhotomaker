import React, { useState } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';

interface CropEditorProps {
  image: string;
  aspectRatio: number;
  targetWidth: number;
  targetHeight: number;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
}

export const CropEditor: React.FC<CropEditorProps> = ({ 
  image, 
  aspectRatio, 
  targetWidth, 
  targetHeight, 
  onCropComplete 
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [currentPixels, setCurrentPixels] = useState<{ width: number; height: number } | null>(null);

  const handleCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCurrentPixels({ width: Math.round(croppedAreaPixels.width), height: Math.round(croppedAreaPixels.height) });
    onCropComplete(croppedArea, croppedAreaPixels);
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full max-w-2xl mx-auto">
      <div className="relative w-full aspect-square md:aspect-video bg-zinc-900 dark:bg-zinc-950 rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          showGrid={true}
        />
        
        {/* Dimensions Overlay */}
        <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 flex flex-col gap-0.5 pointer-events-none shadow-lg">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-white/50">Target Size</span>
          </div>
          <span className="text-sm md:text-base font-mono text-white font-bold">
            {targetWidth}mm × {targetHeight}mm
          </span>
        </div>

        {/* Resolution Overlay */}
        {currentPixels && (
          <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 pointer-events-none">
            <span className="text-[10px] font-mono text-white/70">
              Crop: {currentPixels.width} × {currentPixels.height} px
            </span>
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Zoom Level</label>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Adjust to fit your face in the frame</p>
          </div>
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{Math.round(zoom * 100)}%</span>
        </div>
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-50"
        />
        <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 italic">
          Tip: Center your face within the grid for best results.
        </p>
      </div>
    </div>
  );
};
