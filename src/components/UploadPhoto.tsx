import React, { useCallback, useState } from 'react';
import { Upload, Shield } from 'lucide-react';
import imageCompression, { type Options as CompressionOptions } from 'browser-image-compression';

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

interface UploadPhotoProps {
  onUpload: (original: string, compressed: string) => void;
}

export const UploadPhoto: React.FC<UploadPhotoProps> = ({ onUpload }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      alert('File size exceeds 25MB limit.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const originalUrl = URL.createObjectURL(file);

    const options: CompressionOptions = {
      maxSizeMB: 10,
      maxWidthOrHeight: 3000,
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
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`group relative w-full max-w-xl mx-auto p-6 sm:p-10 md:p-14 rounded-xl cursor-pointer flex flex-col items-center justify-center gap-4 sm:gap-5 transition-all duration-300 backdrop-blur-sm ${
        isDragging
          ? 'border-2 border-brand-400 bg-snapid-bg-elevated/80 scale-[1.01] shadow-xl shadow-brand-500/15'
          : 'border border-[#e8dcc8]/15 bg-snapid-bg-elevated/50 hover:bg-snapid-bg-elevated/70 hover:border-brand-400/30 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-brand-500/10'
      }`}
      onClick={() => !isProcessing && document.getElementById('fileInput')?.click()}
    >
      <div className="absolute inset-0 rounded-xl bg-linear-to-br from-brand-500/5 via-transparent to-brand-700/5 pointer-events-none" />

      <input
        id="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        onChange={onFileChange}
        disabled={isProcessing}
      />

      {isProcessing ? (
        <div className="relative flex flex-col items-center gap-5">
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4" className="text-snapid-bg" />
              <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-brand-600" strokeDasharray={`${progress * 2.26} 226`} />
            </svg>
            <span className="text-sm font-bold text-brand-300">{progress}%</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-snapid-text text-center">Optimizing your photo…</p>
            <p className="text-xs text-snapid-muted text-center mt-1">Preparing for best quality</p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl bg-linear-to-br from-brand-600 to-brand-700 shadow-lg shadow-brand-600/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Upload className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-lg md:text-xl font-semibold text-snapid-text font-display">
              {isDragging ? 'Drop your photo here' : 'Upload your photo'}
            </p>
            <p className="text-sm text-snapid-muted">
              Drag & drop or <span className="text-brand-400 font-medium">browse files</span>
            </p>
            <p className="text-xs text-snapid-muted/70">JPG or PNG · Max 25 MB</p>
          </div>
        </>
      )}

      <div className="flex items-center gap-2 text-xs text-snapid-muted bg-snapid-bg/80 px-3 py-1.5 rounded-lg border border-[#e8dcc8]/10">
        <Shield className="w-3.5 h-3.5 text-brand-400" />
        <span>Processed locally — never uploaded</span>
      </div>
    </div>
  );
};
