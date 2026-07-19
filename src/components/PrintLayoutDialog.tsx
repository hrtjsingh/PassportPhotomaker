import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ChevronDown, Loader2, Printer, RotateCcw, RotateCw, Smartphone, X } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';
import { PrintLayoutControls } from './PrintLayoutControls';
import { CopiesSelector } from './CopiesSelector';
import type { PrintGridLimits } from '../utils/computePrintGrid';
import {
  PRINT_PAPER_SIZES,
  getOrientedPrintPaper,
  getPrintPaperSize,
  type PrintPaperSize,
} from '../config/printPaperSizes';
import {
  CSS_MM_TO_PX,
  LAYOUT_BLEED_MAX,
  LAYOUT_BLEED_MIN,
  LAYOUT_DEFAULT_BLEED,
  LAYOUT_DEFAULT_SCALE,
  LAYOUT_ROTATION_MAX,
  LAYOUT_ROTATION_MIN,
  LAYOUT_SCALE_MAX,
  LAYOUT_SCALE_MIN,
  computeContentRectMm,
  computePreviewScale,
  createDefaultLayoutState,
  type PhotoLayoutState,
} from '../utils/printLayoutMath';

const PRINT_PAGE_STYLE_ID = 'snapid-print-layout-page';
const PREVIEW_MAX_WIDTH_PX = 520;
const PREVIEW_MAX_HEIGHT_PX = 560;

export interface PrintLayoutEditorHandle {
  print: () => void;
  canPrint: boolean;
}

export interface PrintLayoutEditorProps {
  variant?: 'inline' | 'dialog';
  open?: boolean;
  onClose?: () => void;
  imageSrc: string;
  photoWidthMm: number;
  photoHeightMm: number;
  /** Sync paper with parent controls (e.g. PrintLayoutControls). */
  paperId?: string;
  landscape?: boolean;
  showPaperControls?: boolean;
  initialPaperId?: string;
  initialLandscape?: boolean;
  sheetPages?: string[];
  isSheetLoading?: boolean;
  /** Regenerating layout — keep preview visible with overlay instead of full spinner. */
  isSheetRefreshing?: boolean;
  sheetLabel?: string;
  sheetCols?: number;
  sheetRows?: number;
  totalPages?: number;
  totalCopies?: number;
  sheetPageWidthMm?: number;
  sheetPageHeightMm?: number;
  sheetControls?: {
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
  };
  copyControls?: {
    value: number;
    onChange: (value: number) => void;
  };
}

function setRangeProgress(el: HTMLInputElement | null, value: number, min: number, max: number) {
  if (!el) return;
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  el.style.setProperty('--range-progress', `${pct}%`);
}

export const PrintLayoutEditor = forwardRef<PrintLayoutEditorHandle, PrintLayoutEditorProps>(
  function PrintLayoutEditor(
    {
      variant = 'inline',
      open = false,
      onClose,
      imageSrc,
      photoWidthMm,
      photoHeightMm,
      paperId: controlledPaperId,
      landscape: controlledLandscape,
      showPaperControls,
      initialPaperId = PRINT_PAPER_SIZES[0].id,
      initialLandscape = false,
      sheetPages = [],
      isSheetLoading = false,
      isSheetRefreshing = false,
      sheetLabel,
      sheetCols = 0,
      sheetRows = 0,
      totalPages = 0,
      totalCopies = 0,
      sheetPageWidthMm,
      sheetPageHeightMm,
      sheetControls,
      copyControls,
    },
    ref
  ) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const scaleInputRef = useRef<HTMLInputElement>(null);
    const rotationInputRef = useRef<HTMLInputElement>(null);
    const bleedInputRef = useRef<HTMLInputElement>(null);

    const isControlledPaper = controlledPaperId != null && controlledLandscape != null;
    const showPaper = showPaperControls ?? !isControlledPaper;

    const [internalPaperId, setInternalPaperId] = useState(initialPaperId);
    const [internalLandscape, setInternalLandscape] = useState(initialLandscape);
    const paperId = controlledPaperId ?? internalPaperId;
    const landscape = controlledLandscape ?? internalLandscape;

    const [layout, setLayout] = useState<PhotoLayoutState>(createDefaultLayoutState);
    const [bleedMm, setBleedMm] = useState(LAYOUT_DEFAULT_BLEED);
    const [previewPageIndex, setPreviewPageIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const dragRef = useRef<{
      pointerId: number;
      startClientX: number;
      startClientY: number;
      startOffsetXMm: number;
      startOffsetYMm: number;
      previewPxPerMm: number;
    } | null>(null);

    const isActive = variant === 'inline' ? true : open;
    const paper = useMemo(() => getPrintPaperSize(paperId), [paperId]);
    const page = useMemo(() => getOrientedPrintPaper(paper, landscape), [paper, landscape]);
    const hasSheet = sheetPages.length > 0;

    const contentNativeWidthMm = hasSheet
      ? (sheetPageWidthMm ?? page.widthMm)
      : photoWidthMm;
    const contentNativeHeightMm = hasSheet
      ? (sheetPageHeightMm ?? page.heightMm)
      : photoHeightMm;

    const contentRect = useMemo(
      () =>
        computeContentRectMm(
          page.widthMm,
          page.heightMm,
          contentNativeWidthMm,
          contentNativeHeightMm,
          layout
        ),
      [page.widthMm, page.heightMm, contentNativeWidthMm, contentNativeHeightMm, layout]
    );

    const previewScale = useMemo(
      () => computePreviewScale(page.widthMm, page.heightMm, PREVIEW_MAX_WIDTH_PX, PREVIEW_MAX_HEIGHT_PX),
      [page.widthMm, page.heightMm]
    );
    const previewPxPerMm = CSS_MM_TO_PX * previewScale;

    const previewContentSrc = hasSheet
      ? (sheetPages[previewPageIndex] ?? sheetPages[0])
      : imageSrc;

    const resetLayout = useCallback(() => {
      setLayout(createDefaultLayoutState());
      setBleedMm(LAYOUT_DEFAULT_BLEED);
      setPreviewPageIndex(0);
      if (!isControlledPaper) {
        setInternalLandscape(initialLandscape);
        setInternalPaperId(initialPaperId);
      }
    }, [initialLandscape, initialPaperId, isControlledPaper]);

    useEffect(() => {
      if (variant === 'dialog' && open) resetLayout();
    }, [variant, open, imageSrc, resetLayout]);

    useEffect(() => {
      if (variant === 'inline') {
        setLayout(createDefaultLayoutState());
        setBleedMm(LAYOUT_DEFAULT_BLEED);
        setPreviewPageIndex(0);
      }
    }, [variant, paperId, landscape, sheetPages.length]);

    useEffect(() => {
      setPreviewPageIndex((index) => Math.min(index, Math.max(sheetPages.length - 1, 0)));
    }, [sheetPages.length]);

    useEffect(() => {
      setRangeProgress(scaleInputRef.current, layout.scalePercent, LAYOUT_SCALE_MIN, LAYOUT_SCALE_MAX);
    }, [layout.scalePercent]);

    useEffect(() => {
      setRangeProgress(rotationInputRef.current, layout.rotationDeg, LAYOUT_ROTATION_MIN, LAYOUT_ROTATION_MAX);
    }, [layout.rotationDeg]);

    useEffect(() => {
      setRangeProgress(bleedInputRef.current, bleedMm, LAYOUT_BLEED_MIN, LAYOUT_BLEED_MAX);
    }, [bleedMm]);

    useEffect(() => {
      if (variant !== 'dialog' || !open) return;

      const dialog = dialogRef.current;
      const focusables = dialog?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusables?.[0];
      const last = focusables?.[focusables.length - 1];
      first?.focus();

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose?.();
          return;
        }
        if (event.key !== 'Tab' || !focusables?.length) return;

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          }
        } else if (document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      };

      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }, [variant, open, onClose]);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startOffsetXMm: layout.offsetXMm,
        startOffsetYMm: layout.offsetYMm,
        previewPxPerMm,
      };
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      setLayout((prev) => ({
        ...prev,
        offsetXMm: drag.startOffsetXMm + (event.clientX - drag.startClientX) / drag.previewPxPerMm,
        offsetYMm: drag.startOffsetYMm + (event.clientY - drag.startClientY) / drag.previewPxPerMm,
      }));
    };

    const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      setIsDragging(false);
      event.currentTarget.releasePointerCapture(event.pointerId);
    };

    const injectPrintPageStyle = useCallback(() => {
      let styleEl = document.getElementById(PRINT_PAGE_STYLE_ID) as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = PRINT_PAGE_STYLE_ID;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `@page { size: ${page.widthMm}mm ${page.heightMm}mm; margin: 0; }`;
    }, [page.widthMm, page.heightMm]);

    const handlePrint = useCallback(() => {
      document.body.classList.add('snapid-print-layout');
      injectPrintPageStyle();
      window.print();
    }, [injectPrintPageStyle]);

    useEffect(() => {
      const cleanup = () => {
        document.body.classList.remove('snapid-print-layout');
        document.getElementById(PRINT_PAGE_STYLE_ID)?.remove();
      };
      window.addEventListener('afterprint', cleanup);
      return () => window.removeEventListener('afterprint', cleanup);
    }, []);

    const canPrint = !isSheetLoading && (hasSheet || Boolean(imageSrc));

    useImperativeHandle(ref, () => ({ print: handlePrint, canPrint }), [handlePrint, canPrint]);

    const pageStyle = { width: `${page.widthMm}mm`, height: `${page.heightMm}mm` } as const;
    const contentStyle = {
      left: `${contentRect.leftMm}mm`,
      top: `${contentRect.topMm}mm`,
      width: `${contentRect.widthMm}mm`,
      height: `${contentRect.heightMm}mm`,
      transform: `rotate(${layout.rotationDeg}deg)`,
      transformOrigin: 'center center',
    } as const;
    const bleedStyle = { inset: `${bleedMm}mm` } as const;

    const rotateBy = (degrees: number) => {
      setLayout((prev) => {
        let next = prev.rotationDeg + degrees;
        while (next > 180) next -= 360;
        while (next < -180) next += 360;
        return { ...prev, rotationDeg: next };
      });
    };

    const scaleHint = hasSheet
      ? `${LAYOUT_SCALE_MIN}–${LAYOUT_SCALE_MAX}% of sheet on page`
      : `${LAYOUT_SCALE_MIN}–${LAYOUT_SCALE_MAX}% of native ${photoWidthMm}×${photoHeightMm} mm`;

    const controlsPanel = (
      <div className="print-layout-dialog-controls w-full lg:w-[340px] xl:w-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#e8dcc8]/10 overflow-y-auto p-4 sm:p-5 space-y-5 max-h-[420px] lg:max-h-none">
        {sheetControls && (
          <PrintLayoutControls embedded variant="paper-only" {...sheetControls} />
        )}

        {copyControls && (
          <div className="border-t border-[#e8dcc8]/10 pt-5">
            <CopiesSelector value={copyControls.value} onChange={copyControls.onChange} />
          </div>
        )}

        {hasSheet && (
          <div className="rounded-lg border border-[#e8dcc8]/10 bg-snapid-bg-elevated/60 px-3 py-2.5 space-y-1">
            <p className="text-xs font-semibold text-snapid-text">
              {sheetLabel ?? paper.label} · {sheetCols}×{sheetRows} grid
            </p>
            <p className="text-[11px] text-snapid-muted">
              {totalPages || sheetPages.length} page{(totalPages || sheetPages.length) !== 1 ? 's' : ''}
              {(copyControls?.value ?? totalCopies) > 0
                ? ` · ${copyControls?.value ?? totalCopies} photo${(copyControls?.value ?? totalCopies) !== 1 ? 's' : ''}`
                : ''}
              {isSheetRefreshing && (
                <span className="text-brand-400"> · updating…</span>
              )}
            </p>
          </div>
        )}

        <div className="border-t border-[#e8dcc8]/10 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced((open) => !open)}
            aria-expanded={showAdvanced}
            className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left bg-snapid-bg-elevated/60 border border-[#e8dcc8]/10 hover:border-brand-400/25 transition-colors"
          >
            <span className="text-sm font-semibold text-snapid-text">Advanced</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-snapid-muted shrink-0 transition-transform duration-200',
                showAdvanced && 'rotate-180'
              )}
              aria-hidden
            />
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-5">
              {sheetControls && (
                <PrintLayoutControls embedded variant="grid-only" {...sheetControls} />
              )}

              {/* {sheetControls && (
                <div className="space-y-1 border-t border-[#e8dcc8]/10 pt-4">
                  <p className="text-xs font-semibold text-snapid-text">Print placement</p>
                  <p className="text-[11px] text-snapid-muted">Position on page before printing</p>
                </div>
              )} */}

              {/* {showPaper && !sheetControls && (
                <>
                  <PaperSizePicker
                    paperId={paperId}
                    onPaperChange={isControlledPaper ? () => { } : setInternalPaperId}
                  />
                  <OrientationPicker
                    landscape={landscape}
                    onLandscapeChange={isControlledPaper ? () => { } : setInternalLandscape}
                  />
                </>
              )} */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-snapid-text">Rotation</span>
                  <span className="font-mono text-snapid-muted">{layout.rotationDeg}°</span>
                </div>
   
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-snapid-text">Scale on page</span>
                  <span className="font-mono text-snapid-muted">{layout.scalePercent}%</span>
                </div>
                <input
                  ref={scaleInputRef}
                  type="range"
                  min={LAYOUT_SCALE_MIN}
                  max={LAYOUT_SCALE_MAX}
                  step={1}
                  value={layout.scalePercent}
                  onChange={(event) =>
                    setLayout((prev) => ({ ...prev, scalePercent: Number(event.target.value) }))
                  }
                  className="w-full"
                  aria-label="Scale on page"
                />
                <p className="text-[11px] text-snapid-muted">{scaleHint}</p>
              </div>


              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-snapid-text">Bleed margin</span>
                  <span className="font-mono text-snapid-muted">{bleedMm} mm</span>
                </div>
                <input
                  ref={bleedInputRef}
                  type="range"
                  min={LAYOUT_BLEED_MIN}
                  max={LAYOUT_BLEED_MAX}
                  step={0.5}
                  value={bleedMm}
                  onChange={(event) => setBleedMm(Number(event.target.value))}
                  className="w-full"
                  aria-label="Bleed margin"
                />
                <p className="text-[11px] text-snapid-muted">Preview guide only — not included in print</p>
              </div>
             <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => rotateBy(-90)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-snapid-bg-elevated border border-[#e8dcc8]/10 text-xs font-semibold text-snapid-text hover:border-brand-400/25 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    −90°
                  </button>
                  <button
                    type="button"
                    onClick={() => rotateBy(90)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-snapid-bg-elevated border border-[#e8dcc8]/10 text-xs font-semibold text-snapid-text hover:border-brand-400/25 transition-colors"
                  >
                    +90°
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={resetLayout}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Reset layout
              </Button>
            </div>
          )}
        </div>
      </div>
    );

    const previewPanel = (
      <div className="relative flex-1 min-h-0 flex flex-col min-h-[320px] lg:min-h-[400px]">
        {isSheetLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-white">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            <p className="text-sm text-snapid-muted">Generating printable sheet…</p>
          </div>
        ) : (
          <>
            <PrintWorkspace
              paperLabel={paper.label}
              pageWidthMm={page.widthMm}
              pageHeightMm={page.heightMm}
              landscape={landscape}
              previewScale={previewScale}
              pageStyle={pageStyle}
              bleedStyle={bleedStyle}
              contentStyle={contentStyle}
              contentSrc={previewContentSrc}
              isDragging={isDragging}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              pageCount={hasSheet ? sheetPages.length : 1}
              previewPageIndex={previewPageIndex}
              onPreviewPageChange={setPreviewPageIndex}
            />
            {isSheetRefreshing && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-snapid-bg/40 backdrop-blur-[1px] pointer-events-none">
                <div className="flex items-center gap-2 rounded-lg bg-snapid-bg/90 border border-[#e8dcc8]/15 px-3 py-2 shadow-lg">
                  <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                  <span className="text-xs font-medium text-snapid-text">Updating layout…</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );

    const editorBody = (
      <>
        <div className="flex flex-col lg:flex-row min-h-0 flex-1 overflow-hidden">
          {controlsPanel}
          {previewPanel}
        </div>

        {variant === 'dialog' && (
          <div className="grid grid-cols-2 gap-3 px-4 sm:px-6 py-4 border-t border-[#e8dcc8]/10 shrink-0 print-layout-dialog-controls">
            <Button variant="secondary" size="md" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={handlePrint}
              icon={<Printer className="w-4 h-4" />}
              disabled={!canPrint}
            >
              Print
            </Button>
          </div>
        )}
      </>
    );

    const printPortal =
      isActive &&
      createPortal(
        <div className="snapid-print-surface hidden print:block">
          {(hasSheet ? sheetPages : [imageSrc]).map((src, index) => (
            <PrintPageCanvas
              key={`print-${index}`}
              pageStyle={pageStyle}
              bleedStyle={bleedStyle}
              contentStyle={contentStyle}
              contentSrc={src}
              pageBreak={hasSheet && index < sheetPages.length - 1}
            />
          ))}
        </div>,
        document.body
      );

    if (variant === 'inline') {
      return (
        <>
          <div className="card-elevated w-full overflow-hidden rounded-2xl flex flex-col lg:flex-row lg:min-h-[480px]">
            {controlsPanel}
            <div className="flex flex-1 flex-col min-w-0 min-h-[320px]">
              {previewPanel}
            </div>
          </div>
          {printPortal}
        </>
      );
    }

    return (
      <AnimatePresence>
        {open && (
          <div
            className="print-layout-dialog-backdrop fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-snapid-bg/80 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) onClose?.();
            }}
          >
            <motion.div
              ref={dialogRef}
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 16 }}
              className="card-elevated w-full sm:max-w-5xl max-h-[94vh] sm:max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden safe-bottom"
              role="dialog"
              aria-modal="true"
              aria-labelledby="print-layout-title"
            >
              <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[#e8dcc8]/10 shrink-0">
                <div>
                  <h2 id="print-layout-title" className="text-lg font-bold font-display text-snapid-text">
                    Print preview
                  </h2>
                  <p className="text-xs text-snapid-muted mt-0.5">
                    Adjust layout on the page — what you see is what prints
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg text-snapid-muted hover:text-snapid-text hover:bg-snapid-bg-elevated transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {editorBody}
            </motion.div>
            {printPortal}
          </div>
        )}
      </AnimatePresence>
    );
  }
);

/** @deprecated Use PrintLayoutEditor inline on the preview step. */
export const PrintLayoutDialog = forwardRef<
  PrintLayoutEditorHandle,
  Omit<PrintLayoutEditorProps, 'variant'> & { open: boolean; onClose: () => void }
>(function PrintLayoutDialog(props, ref) {
  return <PrintLayoutEditor ref={ref} variant="dialog" {...props} />;
});

interface PrintWorkspaceProps {
  paperLabel: string;
  pageWidthMm: number;
  pageHeightMm: number;
  landscape: boolean;
  previewScale: number;
  pageStyle: { width: string; height: string };
  bleedStyle: { inset: string };
  contentStyle: {
    left: string;
    top: string;
    width: string;
    height: string;
    transform: string;
    transformOrigin: string;
  };
  contentSrc: string;
  isDragging: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
  pageCount: number;
  previewPageIndex: number;
  onPreviewPageChange: (index: number) => void;
}

function PrintWorkspace({
  paperLabel,
  pageWidthMm,
  pageHeightMm,
  landscape,
  previewScale,
  pageStyle,
  bleedStyle,
  contentStyle,
  contentSrc,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  pageCount,
  previewPageIndex,
  onPreviewPageChange,
}: PrintWorkspaceProps) {
  const scaledW = pageWidthMm * CSS_MM_TO_PX * previewScale;
  const scaledH = pageHeightMm * CSS_MM_TO_PX * previewScale;

  return (
    <div className="flex flex-1 flex-col bg-white min-h-0">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[#e8dcc8]/15 shrink-0">
        <p className="text-[11px] font-mono text-snapid-muted truncate">
          {paperLabel} · {pageWidthMm.toFixed(1)}×{pageHeightMm.toFixed(1)} mm ·{' '}
          {landscape ? 'landscape' : 'portrait'}
        </p>
        {pageCount > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              disabled={previewPageIndex <= 0}
              onClick={() => onPreviewPageChange(previewPageIndex - 1)}
              className="p-1 rounded text-snapid-muted hover:text-snapid-text disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-snapid-muted tabular-nums">
              {previewPageIndex + 1}/{pageCount}
            </span>
            <button
              type="button"
              disabled={previewPageIndex >= pageCount - 1}
              onClick={() => onPreviewPageChange(previewPageIndex + 1)}
              className="p-1 rounded text-snapid-muted hover:text-snapid-text disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        <div className="relative shrink-0 mx-auto" style={{ width: scaledW, height: scaledH }}>
          <div
            className="print-layout-preview-scale absolute top-0 left-0 origin-top-left"
            style={{ transform: `scale(${previewScale})` }}
          >
            <PrintPageCanvas
              pageStyle={pageStyle}
              bleedStyle={bleedStyle}
              contentStyle={contentStyle}
              contentSrc={contentSrc}
              isDragging={isDragging}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              previewChrome
            />
          </div>
        </div>
      </div>

      <p className="text-[11px] text-snapid-muted text-center px-3 py-2 border-t border-[#e8dcc8]/15 shrink-0 print-layout-dialog-controls">
        Drag · scale · rotate · dashed line = bleed safe area · preview = print
      </p>
    </div>
  );
}

interface PrintPageCanvasProps {
  pageStyle: { width: string; height: string };
  bleedStyle: { inset: string };
  contentStyle: {
    left: string;
    top: string;
    width: string;
    height: string;
    transform: string;
    transformOrigin: string;
  };
  contentSrc: string;
  isDragging?: boolean;
  onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel?: (event: React.PointerEvent<HTMLDivElement>) => void;
  pageBreak?: boolean;
  previewChrome?: boolean;
}

function PrintPageCanvas({
  pageStyle,
  bleedStyle,
  contentStyle,
  contentSrc,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  pageBreak = false,
  previewChrome = false,
}: PrintPageCanvasProps) {
  const interactive = Boolean(onPointerDown);

  return (
    <div
      className={cn(
        'print-layout-page relative overflow-hidden',
        pageBreak && 'print-layout-page-break',
        previewChrome && 'border border-[#e8dcc8]/25'
      )}
      style={pageStyle}
    >
      <div
        className={cn(
          'absolute z-20',
          interactive && 'touch-none select-none',
          interactive && (isDragging ? 'cursor-grabbing' : 'cursor-grab'),
          interactive && !isDragging && 'ring-2 ring-brand-400/0 hover:ring-brand-400/40 transition-shadow'
        )}
        style={contentStyle}
        data-print-content
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <img
          src={contentSrc}
          alt=""
          className="w-full h-full object-fill pointer-events-none block"
          draggable={false}
        />
      </div>

      <div
        className="print-bleed-guide absolute border-2 border-dashed border-brand-500 pointer-events-none z-30"
        style={bleedStyle}
        aria-hidden
      />
    </div>
  );
}

function PaperSizePicker({
  paperId,
  onPaperChange,
}: {
  paperId: string;
  onPaperChange: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-snapid-text">Paper size</p>
      <div className="grid grid-cols-2 gap-2">
        {PRINT_PAPER_SIZES.map((size: PrintPaperSize) => {
          const selected = size.id === paperId;
          return (
            <button
              key={size.id}
              type="button"
              onClick={() => onPaperChange(size.id)}
              className={cn(
                'flex flex-col items-start px-3 py-2.5 rounded-lg border text-left transition-all',
                selected
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/25'
                  : 'bg-snapid-bg-elevated/60 text-snapid-muted border-[#e8dcc8]/10 hover:border-brand-400/30 hover:text-brand-300'
              )}
            >
              <span className="text-sm font-semibold">{size.label}</span>
              <span className={cn('text-[10px]', selected ? 'text-white/80' : 'text-snapid-muted')}>
                {size.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OrientationPicker({
  landscape,
  onLandscapeChange,
}: {
  landscape: boolean;
  onLandscapeChange: (value: boolean) => void;
}) {
  return (
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
  );
}
