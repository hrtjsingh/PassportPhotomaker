import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Shield, ArrowLeft, Plus, Minus, X } from 'lucide-react';
import { PageBackground } from './PageBackground';
import { BrandLogo } from './BrandLogo';
import { ImageUploadSlot } from './ImageUploadSlot';
import { IdCardCropModal } from './IdCardCropModal';
import { UpscaleSelector } from './UpscaleSelector';
import { A4Preview } from './A4Preview';
import { DownloadButtons } from './DownloadButtons';
import { ID_CARD_ID1 } from '../config/idCardSizes';
import { BRAND_NAME } from '../config/brand';
import { generateIdCardA4Layout } from '../utils/generateIdCardA4Layout';
import { exportPDF } from '../utils/exportPDF';
import type { A4LayoutResult } from '../utils/generateA4Layout';
import { A4_SHEET } from '../config/sheetSizes';
import { useIdCardSessionStore } from '../stores/idCardSessionStore';

type IdSide = 'front' | 'back';

interface CropSession {
  side: IdSide;
  imageSrc: string;
  /** True when re-editing an already applied image (don't revoke imageSrc on cancel) */
  isEdit?: boolean;
}

const ID_CARD_ASPECT = ID_CARD_ID1.widthMm / ID_CARD_ID1.heightMm;

export default function IdCardPrint() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);
  const [upscaleFactor, setUpscaleFactor] = useState(1);
  const [layout, setLayout] = useState<A4LayoutResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCropModalReady, setIsCropModalReady] = useState(false);
  const [cropSession, setCropSession] = useState<CropSession | null>(null);

  const { cards: sessionCards, addOrUpdateCard, removeCard, setCardCopies, clear: clearSession } =
    useIdCardSessionStore();

  const handleCropModalReady = useCallback(() => {
    setIsCropModalReady(true);
  }, []);

  const uploadDisabled = !isCropModalReady || Boolean(cropSession);

  const revokeBlob = useCallback((url: string | null | undefined) => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  }, []);

  useEffect(() => {
    document.title = `ID Card Print Sheet — ${BRAND_NAME}`;
  }, []);

  const revokeLayout = useCallback((result: A4LayoutResult | null) => {
    result?.pages.forEach((url) => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
  }, []);

  const clearImage = (side: IdSide) => {
    const url = side === 'front' ? frontImage : backImage;
    revokeBlob(url);
    if (side === 'front') setFrontImage(null);
    else setBackImage(null);
  };

  const openCropModal = (side: IdSide, imageSrc: string, isEdit = false) => {
    setCropSession({ side, imageSrc, isEdit });
  };

  const handleImageSelected = (side: IdSide) => (url: string) => {
    openCropModal(side, url);
  };

  const handleEditImage = (side: IdSide) => () => {
    const url = side === 'front' ? frontImage : backImage;
    if (url) openCropModal(side, url, true);
  };

  const closeCropModal = () => {
    if (cropSession && !cropSession.isEdit) {
      revokeBlob(cropSession.imageSrc);
    }
    setCropSession(null);
  };

  const applyCrop = (croppedUrl: string) => {
    if (!cropSession) return;

    const { side, imageSrc, isEdit } = cropSession;
    const previous = side === 'front' ? frontImage : backImage;

    if (side === 'front') setFrontImage(croppedUrl);
    else setBackImage(croppedUrl);

    if (previous && previous !== croppedUrl) revokeBlob(previous);
    if (!isEdit) revokeBlob(imageSrc);

    setCropSession(null);
  };

  useEffect(() => {
    if (!frontImage || !backImage) return;

    const id = currentCardId ?? crypto.randomUUID();
    if (!currentCardId) setCurrentCardId(id);

    const existing = useIdCardSessionStore.getState().cards.find((c) => c.id === id);
    const cardNumber =
      existing?.label ??
      `ID ${useIdCardSessionStore.getState().cards.filter((c) => c.id !== id).length + 1}`;

    addOrUpdateCard({
      id,
      frontImage,
      backImage,
      copies: existing?.copies ?? 1,
      label: cardNumber,
    });
  }, [frontImage, backImage, currentCardId, addOrUpdateCard]);

  useEffect(() => {
    let cancelled = false;

    const buildLayout = async () => {
      if (sessionCards.length === 0) {
        setLayout((prev) => {
          revokeLayout(prev);
          return null;
        });
        return;
      }

      setIsGenerating(true);
      try {
        const result = await generateIdCardA4Layout(
          sessionCards.map((card) => ({
            frontSrc: card.frontImage,
            backSrc: card.backImage,
            copies: card.copies,
          })),
          ID_CARD_ID1.widthMm,
          ID_CARD_ID1.heightMm,
          300 * upscaleFactor
        );
        if (!cancelled) {
          setLayout((prev) => {
            revokeLayout(prev);
            return result;
          });
        } else {
          revokeLayout(result);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setLayout((prev) => {
            revokeLayout(prev);
            return null;
          });
        }
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    };

    buildLayout();
    return () => {
      cancelled = true;
    };
  }, [sessionCards, upscaleFactor, revokeLayout]);

  const handlePrint = () => {
    if (!layout?.pages.length) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const pagesHtml = layout.pages
      .map((src) => `<div class="page"><img src="${src}" alt="ID card print sheet" /></div>`)
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Print — ${BRAND_NAME}</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 0; }
            .page {
              width: 100vw;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              page-break-after: always;
              overflow: hidden;
            }
            .page:last-child { page-break-after: auto; }
            img { width: 100%; height: 100%; object-fit: contain; }
            @page { size: ${A4_SHEET.widthMm}mm ${A4_SHEET.heightMm}mm; margin: 0; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          ${pagesHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleAddAnotherId = () => {
    setFrontImage(null);
    setBackImage(null);
    setCurrentCardId(null);
  };

  const handleRemoveCard = (id: string) => {
    const card = sessionCards.find((c) => c.id === id);
    const isCurrent = id === currentCardId;
    removeCard(id);

    if (card && isCurrent) {
      revokeBlob(card.frontImage);
      revokeBlob(card.backImage);
      setFrontImage(null);
      setBackImage(null);
      setCurrentCardId(null);
      setLayout(null);
    } else if (card) {
      revokeBlob(card.frontImage);
      revokeBlob(card.backImage);
    }
  };

  const ready = sessionCards.length > 0;
  const currentReady = Boolean(frontImage && backImage);

  return (
    <div className="relative min-h-screen flex flex-col text-zinc-50 font-sans">
      <PageBackground />

      <header className="sticky top-0 z-50 glass-header px-3 sm:px-4 md:px-6 py-3 safe-top">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <Link to="/" className="shrink-0">
            <BrandLogo size="md" />
          </Link>
          <Link
            to="/studio"
            className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Passport photos
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 pb-16">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-900/40 text-brand-300 border border-brand-800/50">
            <CreditCard className="w-3.5 h-3.5" />
            New — ID print sheet
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-display">
            Print both sides of your <span className="gradient-text">ID card</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Upload front and back. Crop and rotate each side to fit standard card size ({ID_CARD_ID1.description}) — front above back, ready to print and cut.
          </p>
        </div>

        {sessionCards.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <p className="text-xs font-medium text-zinc-200 mb-2">IDs in this print</p>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {sessionCards.map((card) => (
                <div
                  key={card.id}
                  className="relative shrink-0 rounded-lg border border-white/10 bg-zinc-900/60 p-2"
                >
                  <div className="flex flex-col gap-0.5 w-16">
                    <img
                      src={card.frontImage}
                      alt=""
                      className="w-full h-8 object-cover rounded bg-white"
                    />
                    <img
                      src={card.backImage}
                      alt=""
                      className="w-full h-8 object-cover rounded bg-white"
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCardCopies(card.id, Math.max(1, card.copies - 1))}
                        disabled={card.copies <= 1}
                        className="p-1 rounded bg-zinc-800 border border-white/10 text-zinc-200 disabled:opacity-40 hover:border-brand-400/40"
                        aria-label="Decrease copies"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-mono text-zinc-200">
                        {card.copies}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCardCopies(card.id, card.copies + 1)}
                        className="p-1 rounded bg-zinc-800 border border-white/10 text-zinc-200 hover:border-brand-400/40"
                        aria-label="Increase copies"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCard(card.id)}
                      className="p-1 rounded text-brand-400 hover:text-brand-300 hover:bg-brand-400/10"
                      aria-label="Remove ID"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1 truncate max-w-[80px]">
                    {card.label}
                  </p>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddAnotherId}
                className="shrink-0 flex flex-col items-center justify-center gap-1.5 w-16 h-[108px] rounded-lg border border-dashed border-white/20 bg-zinc-900/40 text-zinc-500 hover:text-zinc-200 hover:border-brand-400/40 transition-colors"
                aria-label="Add another ID"
              >
                <Plus className="w-6 h-6" />
                <span className="text-[10px] font-medium text-center leading-tight px-1">Add</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Up to 2 ID sets (4 sides) per A4 page · adjust copies per ID below
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
          <div className="flex flex-col gap-6">
            <div className="card-elevated p-5 sm:p-6 flex flex-col gap-5">
              <p className="text-xs font-medium text-zinc-400">
                {sessionCards.length > 0 && !currentReady
                  ? 'Upload front and back for the next ID'
                  : 'Upload front and back'}
              </p>
              <ImageUploadSlot
                label="Front side"
                inputId="id-front-upload"
                preview={frontImage}
                onUpload={setFrontImage}
                onImageSelected={handleImageSelected('front')}
                onEdit={frontImage ? handleEditImage('front') : undefined}
                onClear={() => clearImage('front')}
                disabled={uploadDisabled}
              />
              <ImageUploadSlot
                label="Back side"
                inputId="id-back-upload"
                preview={backImage}
                onUpload={setBackImage}
                onImageSelected={handleImageSelected('back')}
                onEdit={backImage ? handleEditImage('back') : undefined}
                onClear={() => clearImage('back')}
                disabled={uploadDisabled}
              />
            </div>

            {ready && (
              <div className="card-elevated p-5 sm:p-6">
                <UpscaleSelector value={upscaleFactor} onChange={setUpscaleFactor} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* <div className="flex items-center gap-2 px-1">
              <Layout className="w-4 h-4 text-brand-400" />
              <h2 className="text-sm font-semibold text-zinc-200">A4 preview</h2>
            </div> */}

            <A4Preview
              pages={layout?.pages ?? []}
              totalPages={layout?.totalPages ?? 0}
              photosPerPage={layout?.photosPerPage ?? 0}
              totalCopies={layout?.totalCopies ?? 0}
              cols={layout?.cols ?? 1}
              rows={layout?.rows ?? 1}
              sheet={A4_SHEET}
              upscaleFactor={upscaleFactor}
              isLoading={isGenerating}
            />

            {ready && (
              <DownloadButtons
                onDownloadPdf={() =>
                  layout?.pages.length && exportPDF(layout.pages, 'id-card-print.pdf', A4_SHEET)
                }
                onDownloadPng={() => {
                  if (!layout?.pages.length) return;
                  layout.pages.forEach((page, index) => {
                    const link = document.createElement('a');
                    link.download =
                      layout.totalPages > 1 ? `id-card-sheet-${index + 1}.png` : 'id-card-sheet.png';
                    link.href = page;
                    link.click();
                  });
                }}
                onPrint={handlePrint}
                disabled={isGenerating || !layout?.pages.length}
              />
            )}

            {!ready && (
              <p className="text-xs text-zinc-500 text-center">
                Upload front and back to generate your print sheet
              </p>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-white/8 py-6 px-4 safe-bottom">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-1.5 text-xs text-zinc-500">
          <Shield className="w-3.5 h-3.5 text-brand-400" />
          All processing happens locally in your browser
        </div>
      </footer>

      <IdCardCropModal
        open={Boolean(cropSession)}
        imageSrc={cropSession?.imageSrc ?? ''}
        title={cropSession?.side === 'front' ? 'Front side' : 'Back side'}
        aspectRatio={ID_CARD_ASPECT}
        targetWidthMm={ID_CARD_ID1.widthMm}
        targetHeightMm={ID_CARD_ID1.heightMm}
        onApply={applyCrop}
        onCancel={closeCropModal}
        onReady={handleCropModalReady}
      />
    </div>
  );
}
