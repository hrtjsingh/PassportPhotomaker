import React from 'react';
import { Loader2, FileImage } from 'lucide-react';

interface A4PreviewProps {
  pages: string[];
  totalPages: number;
  photosPerPage: number;
  totalCopies: number;
  upscaleFactor: number;
  isLoading: boolean;
}

export const A4Preview: React.FC<A4PreviewProps> = ({
  pages,
  totalPages,
  photosPerPage,
  totalCopies,
  upscaleFactor,
  isLoading,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
            <FileImage className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">A4 Print Preview</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{300 * upscaleFactor} DPI output</p>
          </div>
        </div>
        {!isLoading && pages.length > 0 && (
          <div className="text-right">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {totalPages} page{totalPages > 1 ? 's' : ''} · {totalCopies} photo{totalCopies > 1 ? 's' : ''}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Up to {photosPerPage} per page
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="relative p-4 md:p-6 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <div className="relative w-full aspect-210/297 bg-white dark:bg-zinc-800 rounded-lg flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Generating layout…</p>
            </div>
          </div>
        ) : pages.length > 0 ? (
          pages.map((page, index) => (
            <div key={index} className="flex flex-col gap-2">
              {totalPages > 1 && (
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1">
                  Page {index + 1} of {totalPages}
                </p>
              )}
              <div className="relative p-4 md:p-6 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                <div className="relative w-full aspect-210/297 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-600 overflow-hidden">
                  <img
                    src={page}
                    alt={`A4 layout page ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="relative p-4 md:p-6 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <div className="relative w-full aspect-210/297 bg-white dark:bg-zinc-800 rounded-lg flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500">
              <FileImage className="w-8 h-8 opacity-50" />
              <p className="text-sm">Preview will appear here</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
        Preview scaled for screen · Download is full {300 * upscaleFactor} DPI resolution
        {totalPages > 1 ? ` across ${totalPages} pages` : ''}
      </p>
    </div>
  );
};
