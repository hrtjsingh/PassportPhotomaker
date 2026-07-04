import React from 'react';
import { Loader2, FileImage } from 'lucide-react';
import type { SheetSize } from '../config/sheetSizes';

interface A4PreviewProps {
  pages: string[];
  totalPages: number;
  photosPerPage: number;
  totalCopies: number;
  cols: number;
  rows: number;
  sheet: SheetSize;
  upscaleFactor: number;
  isLoading: boolean;
}

export const A4Preview: React.FC<A4PreviewProps> = ({
  pages,
  totalPages,
  photosPerPage,
  totalCopies,
  cols,
  rows,
  sheet,
  upscaleFactor,
  isLoading,
}) => {
  const aspectRatio = `${sheet.widthMm}/${sheet.heightMm}`;

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-700/20 flex items-center justify-center">
            <FileImage className="w-4 h-4 text-brand-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-snapid-text">{sheet.label} Photo Paper Preview</h3>
            <p className="text-xs text-snapid-muted">{300 * upscaleFactor} DPI · {cols}×{rows} grid</p>
          </div>
        </div>
        {!isLoading && pages.length > 0 && (
          <div className="text-right">
            <p className="text-xs font-semibold text-snapid-text">
              {totalPages} page{totalPages > 1 ? 's' : ''} · {totalCopies} photo{totalCopies > 1 ? 's' : ''}
            </p>
            <p className="text-[11px] text-snapid-muted">
              {photosPerPage} per page
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="relative p-4 md:p-6 rounded-lg bg-snapid-bg-elevated/60 border border-[#e8dcc8]/10">
            <div
              className="relative w-full bg-brand-50 rounded-lg flex flex-col items-center justify-center gap-4"
              style={{ aspectRatio }}
            >
              <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
              <p className="text-sm font-medium text-snapid-muted">Generating layout…</p>
            </div>
          </div>
        ) : pages.length > 0 ? (
          pages.map((page, index) => (
            <div key={index} className="flex flex-col gap-2">
              {totalPages > 1 && (
                <p className="text-xs font-semibold text-snapid-muted px-1">
                  Page {index + 1} of {totalPages}
                </p>
              )}
              <div className="relative p-4 md:p-6 rounded-lg bg-snapid-bg-elevated/60 border border-[#e8dcc8]/10">
                <div
                  className="relative w-full bg-brand-50 rounded-lg shadow-xl border border-[#e8dcc8]/15 overflow-hidden"
                  style={{ aspectRatio }}
                >
                  <img
                    src={page}
                    alt={`${sheet.label} layout page ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="relative p-4 md:p-6 rounded-lg bg-snapid-bg-elevated/60 border border-[#e8dcc8]/10">
            <div
              className="relative w-full bg-snapid-bg-elevated rounded-lg flex flex-col items-center justify-center gap-2 text-snapid-muted"
              style={{ aspectRatio }}
            >
              <FileImage className="w-8 h-8 opacity-50" />
              <p className="text-sm">Preview will appear here</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-snapid-muted text-center">
        Preview scaled for screen · Download is full {300 * upscaleFactor} DPI resolution
        {totalPages > 1 ? ` across ${totalPages} pages` : ''}
      </p>
    </div>
  );
};
