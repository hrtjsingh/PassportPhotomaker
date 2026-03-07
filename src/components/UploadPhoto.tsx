import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface UploadPhotoProps {
  onUpload: (original: string, compressed: string) => void;
}

export const UploadPhoto: React.FC<UploadPhotoProps> = ({ onUpload }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const originalUrl = URL.createObjectURL(file);

    // Increase limits to preserve high quality for 1200 DPI printing
    const options = {
      maxSizeMB: 4, // Increased from 1MB
      maxWidthOrHeight: 3000, // Increased from 1200px
      useWebWorker: true,
      onProgress: (p: number) => setProgress(p),
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const compressedUrl = URL.createObjectURL(compressedFile);
      onUpload(originalUrl, compressedUrl);
    } catch (error) {
      console.error('Compression failed:', error);
      onUpload(originalUrl, originalUrl);
    } finally {
      setIsProcessing(false);
    }
  }, [onUpload]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="w-full max-w-xl mx-auto p-8 md:p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group"
      onClick={() => !isProcessing && document.getElementById('fileInput')?.click()}
    >
      <input
        id="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        onChange={onFileChange}
        disabled={isProcessing}
      />
      {isProcessing ? (
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-zinc-900 dark:text-zinc-50 animate-spin" />
            <span className="absolute text-[10px] md:text-xs font-bold text-zinc-900 dark:text-zinc-50">{progress}%</span>
          </div>
          <div className="w-40 md:w-48 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-zinc-900 dark:bg-zinc-50 transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Optimizing photo...</p>
        </div>
      ) : (
        <>
          <div className="w-14 h-14 md:w-16 md:h-16 bg-white dark:bg-zinc-800 rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 md:w-8 md:h-8 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="text-center">
            <p className="text-base md:text-lg font-medium text-zinc-900 dark:text-zinc-50">Click or drag photo here</p>
            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-1">Supports JPG, PNG (Max 10MB)</p>
          </div>
        </>
      )}
      <div className="mt-2 md:mt-4 flex items-center gap-2 text-[10px] md:text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        <ImageIcon className="w-3 h-3 md:w-4 md:h-4" />
        <span>High Quality upto 1200 DPI</span>
      </div>
    </div>
  );
};
