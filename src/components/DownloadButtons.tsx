import React from 'react';
import { Download, FileText, Printer } from 'lucide-react';

interface DownloadButtonsProps {
  onDownloadPng: () => void;
  onDownloadPdf: () => void;
  onPrint: () => void;
  disabled?: boolean;
}

export const DownloadButtons: React.FC<DownloadButtonsProps> = ({
  onDownloadPng,
  onDownloadPdf,
  onPrint,
  disabled
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 w-full max-w-2xl mx-auto mt-6 md:mt-8">
      <button
        onClick={onDownloadPng}
        disabled={disabled}
        className="flex items-center justify-center gap-2 py-3 md:py-4 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-sm"
      >
        <Download className="w-5 h-5" />
        PNG
      </button>
      
      <button
        onClick={onDownloadPdf}
        disabled={disabled}
        className="flex items-center justify-center gap-2 py-3 md:py-4 px-6 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 shadow-lg shadow-zinc-200 dark:shadow-none"
      >
        <FileText className="w-5 h-5" />
        PDF
      </button>

      <button
        onClick={onPrint}
        disabled={disabled}
        className="flex items-center justify-center gap-2 py-3 md:py-4 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-sm"
      >
        <Printer className="w-5 h-5" />
        Print
      </button>
    </div>
  );
};
