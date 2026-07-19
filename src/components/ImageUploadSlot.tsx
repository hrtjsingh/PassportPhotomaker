import React, { useCallback, useState } from 'react';
import { Upload, Shield, X, Pencil } from 'lucide-react';
import imageCompression, { type Options as CompressionOptions } from 'browser-image-compression';
import { cn } from '../utils/cn';

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

interface ImageUploadSlotProps {
  label: string;
  hint?: string;
  inputId: string;
  preview?: string | null;
  onUpload: (url: string) => void;
  /** When set, receives the processed image for crop/edit before final upload */
  onImageSelected?: (url: string) => void;
  onEdit?: () => void;
  onClear?: () => void;
  disabled?: boolean;
  disabledHint?: string;
  className?: string;
}

export const ImageUploadSlot: React.FC<ImageUploadSlotProps> = ({
  label,
  hint = 'JPG or PNG · Max 25 MB',
  inputId,
  preview,
  onUpload,
  onImageSelected,
  onEdit,
  onClear,
  disabled = false,
  disabledHint = 'Preparing crop editor…',
  className,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      if (disabled) return;
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
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        onProgress: (p: number) => setProgress(p),
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const url = URL.createObjectURL(compressedFile);
        if (onImageSelected) onImageSelected(url);
        else onUpload(url);
      } catch (error) {
        console.error('Compression failed:', error);
        if (onImageSelected) onImageSelected(originalUrl);
        else onUpload(originalUrl);
      } finally {
        setIsProcessing(false);
      }
    },
    [disabled, onUpload, onImageSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [disabled, processFile]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = '';
    },
    [disabled, processFile]
  );

  const isInteractive = !disabled && !isProcessing;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-zinc-50">{label}</p>
        {preview && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="text-xs font-medium text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
              >
                <Pencil className="w-3.5 h-3.5" />
                Adjust
              </button>
            )}
            {onClear && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="text-xs font-medium text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => isInteractive && document.getElementById(inputId)?.click()}
        className={cn(
          'relative rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 border backdrop-blur-sm min-h-[180px] p-6',
          disabled
            ? 'cursor-not-allowed opacity-50 border-white/10 bg-white/5'
            : 'cursor-pointer',
          !disabled &&
            (isDragging
              ? 'border-2 border-brand-400 bg-white/5 scale-[1.01]'
              : 'border-white/10 bg-white/5 hover:bg-white/8 hover:border-brand-500/30'),
          preview && 'min-h-0 p-3'
        )}
      >
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          className="hidden"
          onChange={onFileChange}
          disabled={isProcessing || disabled}
        />

        {disabled ? (
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <div className="w-10 h-10 rounded-full border-2 border-brand-400/30 border-t-brand-400 animate-spin" />
            <p className="text-sm font-medium text-zinc-300">{disabledHint}</p>
          </div>
        ) : isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-sm font-bold text-brand-300">{progress}%</div>
            <p className="text-xs text-zinc-400">Processing…</p>
          </div>
        ) : preview ? (
          <img src={preview} alt={label} className="w-full max-h-48 object-contain rounded-lg" />
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-md shadow-brand-600/25">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-zinc-100">Drop or browse</p>
              <p className="text-xs text-zinc-500">{hint}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
        <Shield className="w-3 h-3 text-brand-400" />
        <span>Processed locally</span>
      </div>
    </div>
  );
};
