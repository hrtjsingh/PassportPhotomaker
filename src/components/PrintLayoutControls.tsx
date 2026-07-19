import React from 'react';
import { LayoutGrid, FileText, Minus, Plus, Smartphone, RotateCw } from 'lucide-react';
import { cn } from '../utils/cn';
import { SHEET_SIZES, type SheetSize } from '../config/sheetSizes';
import type { PrintGridLimits } from '../utils/computePrintGrid';
import { parseDigitsInput } from '../utils/numericInput';

interface PrintLayoutControlsProps {
  sheetId: string;
  onSheetChange: (id: string) => void;
  cols: number;
  rows: number;
  onColsChange: (cols: number) => void;
  onRowsChange: (rows: number) => void;
  gridLimits: PrintGridLimits;
  photoWidthMm: number;
  photoHeightMm: number;
  landscape: boolean;
  onLandscapeChange: (landscape: boolean) => void;
  /** Strip card chrome — for embedding in print preview sidebar. */
  embedded?: boolean;
  /** full = all controls; paper-only / grid-only for basic vs advanced split */
  variant?: 'full' | 'paper-only' | 'grid-only';
}

function GridStepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-snapid-text">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          className="p-2 rounded-lg border border-[#e8dcc8]/10 bg-snapid-bg-elevated/60 text-snapid-text hover:border-brand-400/25 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => {
            const parsed = parseDigitsInput(e.target.value, min, max);
            if (parsed !== null) onChange(parsed);
          }}
          className="w-14 text-center text-sm font-semibold font-mono bg-snapid-bg-elevated/60 border border-[#e8dcc8]/10 rounded-lg py-2 text-snapid-text focus:outline-none focus:border-brand-400/40"
          aria-label={label}
        />
        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          className="p-2 rounded-lg border border-[#e8dcc8]/10 bg-snapid-bg-elevated/60 text-snapid-text hover:border-brand-400/25 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label={`Increase ${label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
        <span className="text-[11px] text-snapid-muted ml-1">max {max}</span>
      </div>
    </div>
  );
}

export const PrintLayoutControls: React.FC<PrintLayoutControlsProps> = ({
  sheetId,
  onSheetChange,
  cols,
  rows,
  onColsChange,
  onRowsChange,
  gridLimits,
  photoWidthMm,
  photoHeightMm,
  landscape,
  onLandscapeChange,
  embedded = false,
  variant = 'full',
}) => {
  const photosPerPage = cols * rows;
  const selectedSheet = SHEET_SIZES.find((s) => s.id === sheetId) ?? SHEET_SIZES[0];
  const showPaper = variant === 'full' || variant === 'paper-only';
  const showGrid = variant === 'full' || variant === 'grid-only';

  const paperSection = showPaper ? (
    <>
      {!embedded && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-700/20 flex items-center justify-center">
            <FileText className="w-4 h-4 text-brand-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-snapid-text">Photo paper &amp; layout</h3>
            <p className="text-xs text-snapid-muted">Paper size and photo grid per sheet</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium text-snapid-text">Photo paper size</p>
        <div className="grid grid-cols-2 gap-2">
          {SHEET_SIZES.map((sheet: SheetSize) => {
            const selected = sheet.id === sheetId;
            return (
              <button
                key={sheet.id}
                type="button"
                onClick={() => onSheetChange(sheet.id)}
                className={cn(
                  'flex flex-col items-start px-3 py-2.5 rounded-lg border text-left transition-all',
                  selected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/25'
                    : 'bg-snapid-bg-elevated/60 text-snapid-muted border-[#e8dcc8]/10 hover:border-brand-400/30 hover:text-brand-300'
                )}
              >
                <span className="text-sm font-semibold">{sheet.label}</span>
                <span className={cn('text-[10px]', selected ? 'text-white/80' : 'text-snapid-muted')}>
                  {sheet.sublabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {!selectedSheet.portraitOnly && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-snapid-text">Orientation</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onLandscapeChange(false)}
              className={cn(
                'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all',
                !landscape
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/25'
                  : 'bg-snapid-bg-elevated/60 text-snapid-muted border-[#e8dcc8]/10 hover:border-brand-400/30 hover:text-brand-300'
              )}
            >
              <Smartphone className="w-4 h-4" />
              Portrait
            </button>
            <button
              type="button"
              onClick={() => onLandscapeChange(true)}
              className={cn(
                'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all',
                landscape
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/25'
                  : 'bg-snapid-bg-elevated/60 text-snapid-muted border-[#e8dcc8]/10 hover:border-brand-400/30 hover:text-brand-300'
              )}
            >
              <RotateCw className="w-4 h-4" />
              Landscape
            </button>
          </div>
        </div>
      )}
    </>
  ) : null;

  const gridSection = showGrid ? (
    <div className={cn('space-y-3', showPaper && 'pt-1 border-t border-[#e8dcc8]/10')}>
      <div className="flex items-center gap-2">
        <LayoutGrid className="w-4 h-4 text-brand-300" />
        <p className="text-xs font-medium text-snapid-text">Grid on {selectedSheet.label}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <GridStepper
          label="Columns"
          value={cols}
          min={1}
          max={gridLimits.maxCols}
          onChange={onColsChange}
        />
        <GridStepper
          label="Rows"
          value={rows}
          min={1}
          max={gridLimits.maxRows}
          onChange={onRowsChange}
        />
      </div>
      <p className="text-xs text-snapid-muted">
        {photosPerPage} photo{photosPerPage !== 1 ? 's' : ''} per page
        {photosPerPage < gridLimits.photosPerPage && (
          <span> · max fit {gridLimits.maxCols}×{gridLimits.maxRows}</span>
        )}
      </p>
      {/* <p className="text-[11px] text-snapid-muted font-mono">
        Each photo locked at {photoWidthMm}×{photoHeightMm} mm — grid changes count only
      </p>
      {selectedSheet.portraitOnly && selectedSheet.rotatePhotosOnSheet && (
        <p className="text-[11px] text-snapid-muted">
          Portrait 4×6 · photos rotated 90° · grid centered · 8 per page at true print size.
        </p>
      )}
      {selectedSheet.portraitOnly && !selectedSheet.rotatePhotosOnSheet && (
        <p className="text-[11px] text-snapid-muted">
          Portrait only — layout stays inside sheet edges so nothing is clipped when printing.
        </p>
      )} */}
    </div>
  ) : null;

  const content = (
    <>
      {paperSection}
      {gridSection}
    </>
  );

  if (embedded) {
    return <div className="space-y-5">{content}</div>;
  }

  return <div className="card-elevated p-4 md:p-6 space-y-6 w-full">{content}</div>;
};
