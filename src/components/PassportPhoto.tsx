import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw,
  Shield,
  Zap,
  Printer,
  Layout,
  CreditCard,
} from 'lucide-react';
import { Area } from 'react-easy-crop';

import { UploadPhoto } from './UploadPhoto';
import { CropEditor } from './CropEditor';
import { BackgroundRemover } from './BackgroundRemover';
import { BackgroundSelector } from './BackgroundSelector';
import { SizeSelector } from './SizeSelector';
import { CopiesSelector } from './CopiesSelector';
import { UpscaleSelector } from './UpscaleSelector';
import { A4Preview } from './A4Preview';
import { DownloadButtons } from './DownloadButtons';

import getCroppedImg from '../utils/cropImage';
import { generatePassportPhoto } from '../utils/generatePassportPhoto';
import { generateA4Layout, type A4LayoutResult } from '../utils/generateA4Layout';
import { exportPDF } from '../utils/exportPDF';
import { PassportSize, PASSPORT_SIZES } from '../config/passportSizes';

import { ImageEnhancer } from './ImageEnhancer';
import { ModelPreloadIndicator } from './ModelPreloadIndicator';
import { PageBackground } from './PageBackground';
import { StepProgress, type StepConfig, type WizardStep } from './StepProgress';
import { STUDIO_STEPS } from '../config/studioSteps';
import { StepFooter } from './StepFooter';
import { Button } from './ui/Button';
import { BrandLogo } from './BrandLogo';
import { BRAND_NAME, BRAND_TAGLINE, BRAND_DESCRIPTION } from '../config/brand';
import { usePageSEO } from '../hooks/usePageSEO';
import { Link } from 'react-router-dom';

type Step = WizardStep;

const STEPS: StepConfig[] = STUDIO_STEPS;

function StepHeader({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="text-center space-y-2 sm:space-y-3 max-w-lg mx-auto px-2">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">
        Step {step} of {STEPS.length}
      </span>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-display">{title}</h2>
      <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

export default function PassportPhoto() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [transparentImage, setTransparentImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [passportPhoto, setPassportPhoto] = useState<string | null>(null);
  const [a4Layout, setA4Layout] = useState<A4LayoutResult | null>(null);
  
  const [pixelCrop, setPixelCrop] = useState<Area | null>(null);
  const [cropArea, setCropArea] = useState<Area | null>(null);
  const [selectedSize, setSelectedSize] = useState<PassportSize>(PASSPORT_SIZES[0]);
  const [customWidth, setCustomWidth] = useState(35);
  const [customHeight, setCustomHeight] = useState(45);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [numCopies, setNumCopies] = useState(8);
  const [upscaleFactor, setUpscaleFactor] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [enhanceSkipped, setEnhanceSkipped] = useState(false);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  usePageSEO(currentStep);

  const completedSteps = new Set<Step>();
  if (originalImage) completedSteps.add('upload');
  if (croppedImage) completedSteps.add('crop');
  if (transparentImage) completedSteps.add('background');
  if (enhancedImage || enhanceSkipped) completedSteps.add('enhance');
  if (passportPhoto) completedSteps.add('settings');
  if (a4Layout) completedSteps.add('preview');

  const canNavigateToStep = (target: Step): boolean => {
    if (target === 'upload') return true;
    const targetIdx = STEPS.findIndex((s) => s.id === target);
    const required: Record<Step, boolean> = {
      upload: true,
      crop: Boolean(originalImage),
      background: Boolean(croppedImage),
      enhance: Boolean(transparentImage),
      settings: Boolean(transparentImage),
      preview: Boolean(passportPhoto),
    };
    for (let i = 0; i <= targetIdx; i++) {
      const id = STEPS[i].id;
      if (!required[id]) return false;
    }
    return true;
  };

  const goToStep = (step: Step) => {
    if (canNavigateToStep(step)) setCurrentStep(step);
  };

  // Handle image upload
  const handleUpload = (original: string, compressed: string) => {
    setOriginalImage(original);
    setCompressedImage(compressed);
    setCurrentStep('crop');
  };

  // Handle crop completion
  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCropArea(croppedArea);
    setPixelCrop(croppedAreaPixels);
  }, []);

  const handleCropNext = async () => {
    const cropSource = compressedImage;
    const exportSource = originalImage || compressedImage;
    if (!cropSource || !exportSource || !cropArea) return;
    setIsCropping(true);
    try {
      // Crop percentages come from the compressed preview — scale to full resolution.
      const [previewImg, exportImg] = await Promise.all([
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = cropSource;
        }),
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = exportSource;
        }),
      ]);

      const scaleX = exportImg.width / previewImg.width;
      const scaleY = exportImg.height / previewImg.height;
      const pixels = pixelCrop
        ? {
            x: pixelCrop.x * scaleX,
            y: pixelCrop.y * scaleY,
            width: pixelCrop.width * scaleX,
            height: pixelCrop.height * scaleY,
          }
        : {
            x: (cropArea.x * exportImg.width) / 100,
            y: (cropArea.y * exportImg.height) / 100,
            width: (cropArea.width * exportImg.width) / 100,
            height: (cropArea.height * exportImg.height) / 100,
          };

      const cropped = await getCroppedImg(exportSource, pixels);
      setCroppedImage(cropped);
      setTransparentImage(null);
      setEnhancedImage(null);
      setEnhanceSkipped(false);
      setCurrentStep('background');
    } catch (e) {
      console.error(e);
    } finally {
      setIsCropping(false);
    }
  };

  // Handle background removal
  const handleBackgroundComplete = (transparent: string) => {
    setTransparentImage(transparent);
    setEnhancedImage(null);
    setEnhanceSkipped(false);
  };

  const handleEnhanceComplete = (enhanced: string) => {
    setEnhancedImage(enhanced);
    setEnhanceSkipped(false);
  };

  const handleSkipEnhance = () => {
    setEnhanceSkipped(true);
    setEnhancedImage(null);
    setCurrentStep('settings');
  };

  // Generate passport photo when background or size changes
  useEffect(() => {
    const updatePassportPhoto = async () => {
      const source = enhancedImage || transparentImage || croppedImage;
      if (!source) return;

      const width = selectedSize.id === 'custom' ? customWidth : selectedSize.widthMm;
      const height = selectedSize.id === 'custom' ? customHeight : selectedSize.heightMm;

      try {
        const result = await generatePassportPhoto(source, width, height, bgColor, upscaleFactor);
        setPassportPhoto(result);
      } catch (e) {
        console.error(e);
      }
    };

    updatePassportPhoto();
  }, [enhancedImage, transparentImage, croppedImage, selectedSize, customWidth, customHeight, bgColor, upscaleFactor]);

  // Generate A4 layout when passport photo or copies change
  useEffect(() => {
    const revokePages = (pages: string[]) => {
      pages.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };

    const updateA4Layout = async () => {
      if (!passportPhoto) return;
      setIsGenerating(true);

      const width = selectedSize.id === 'custom' ? customWidth : selectedSize.widthMm;
      const height = selectedSize.id === 'custom' ? customHeight : selectedSize.heightMm;

      try {
        const result = await generateA4Layout(
          passportPhoto,
          width,
          height,
          numCopies,
          300 * upscaleFactor
        );
        setA4Layout((prev) => {
          if (prev) revokePages(prev.pages);
          return result;
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsGenerating(false);
      }
    };

    if (currentStep === 'preview') {
      updateA4Layout();
    }
  }, [passportPhoto, numCopies, currentStep, selectedSize, customWidth, customHeight, upscaleFactor]);

  const performReset = () => {
    setA4Layout((prev) => {
      if (prev) {
        prev.pages.forEach((url) => {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url);
        });
      }
      return null;
    });
    setOriginalImage(null);
    setCompressedImage(null);
    setCroppedImage(null);
    setTransparentImage(null);
    setEnhancedImage(null);
    setPassportPhoto(null);
    setUpscaleFactor(1);
    setEnhanceSkipped(false);
    setCurrentStep('upload');
    setShowResetConfirm(false);
  };

  const handlePrint = () => {
    if (!a4Layout?.pages.length) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const pagesHtml = a4Layout.pages
      .map(
        (src) =>
          `<div class="page"><img src="${src}" alt="Passport photo sheet" /></div>`
      )
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
            @page { size: A4; margin: 0; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          ${pagesHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="relative min-h-screen flex flex-col text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-300">
      <PageBackground />
      {/* Header */}
      <header className="sticky top-0 z-50 glass-header px-3 sm:px-4 md:px-6 py-3 safe-top">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 lg:gap-3">
          <Link to="/" className="group shrink-0 text-left">
            <BrandLogo size="md" />
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 hidden xl:block mt-0.5 ml-11">{BRAND_TAGLINE}</p>
          </Link>
          
          <div className="hidden lg:flex flex-1 min-w-0 justify-center px-2">
            {currentStep !== 'upload' && (
              <StepProgress
                steps={STEPS}
                currentStep={currentStep}
                completedSteps={completedSteps}
                canNavigateTo={canNavigateToStep}
                onStepClick={goToStep}
              />
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Link
              to="/id-print"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-zinc-400 hover:text-brand-300 hover:bg-zinc-800/60 transition-colors touch-target"
              title="ID card print sheet"
            >
              <CreditCard className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">ID Print</span>
            </Link>
            {currentStep !== 'upload' && (
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500 dark:text-zinc-400 touch-target"
                title="Start over"
                aria-label="Start over"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 ${
          currentStep !== 'upload' ? 'pb-28 sm:pb-12' : 'pb-6'
        }`}
      >
        {currentStep !== 'upload' && (
          <div className="lg:hidden mb-2">
            <StepProgress
              steps={STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
              canNavigateTo={canNavigateToStep}
              onStepClick={goToStep}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            {currentStep === 'upload' && (
              <div className="w-full max-w-3xl text-center flex flex-col gap-8 sm:gap-10">
                <div className="space-y-3 sm:space-y-4">
                  <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50">
                    <Shield className="w-3.5 h-3.5" />
                    100% private — runs in your browser
                  </span>
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 font-display leading-[1.15] px-1">
                    Print-ready ID photos in <span className="gradient-text">minutes</span>
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed px-1">
                    {BRAND_DESCRIPTION}
                  </p>
                </div>
                <UploadPhoto onUpload={handleUpload} />
                <section aria-label="Features" className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { icon: Printer, label: '300–1200 DPI', desc: 'Print-shop ready quality' },
                    { icon: Zap, label: 'AI Background', desc: 'Local open-source models' },
                    { icon: Layout, label: 'A4 Layout', desc: 'Multiple copies, one sheet' },
                  ].map((item, i) => (
                    <div key={i} className="card p-5 text-left hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mb-3">
                        <item.icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                      </div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-50">{item.label}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </section>
              </div>
            )}

            {currentStep === 'crop' && compressedImage && (
              <div className="w-full flex flex-col items-center gap-8 md:gap-10">
                <StepHeader
                  step={2}
                  title="Crop your photo"
                  description="Position your face in the frame. Most countries require head centered with a little space above."
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl items-start">
                  <CropEditor 
                    key={selectedSize.id === 'custom' ? `custom-${customWidth}x${customHeight}` : selectedSize.id}
                    image={compressedImage} 
                    aspectRatio={
                      (selectedSize.id === 'custom' ? customWidth : selectedSize.widthMm) /
                      (selectedSize.id === 'custom' ? customHeight : selectedSize.heightMm)
                    }
                    targetWidth={selectedSize.id === 'custom' ? customWidth : selectedSize.widthMm}
                    targetHeight={selectedSize.id === 'custom' ? customHeight : selectedSize.heightMm}
                    onCropComplete={onCropComplete}
                  />
                  
                  <div className="card-elevated p-6 md:p-8 flex flex-col gap-6">
                    <SizeSelector 
                      selectedId={selectedSize.id} 
                      onChange={setSelectedSize}
                      customWidth={customWidth}
                      customHeight={customHeight}
                      onCustomChange={(w, h) => {
                        setCustomWidth(w);
                        setCustomHeight(h);
                      }}
                    />
                  </div>
                </div>

                <StepFooter
                  onBack={() => setCurrentStep('upload')}
                  backLabel="Back to Upload"
                  onContinue={handleCropNext}
                  continueLabel="Remove Background"
                  continueLoading={isCropping}
                />
              </div>
            )}

            {currentStep === 'background' && croppedImage && (
              <div className="w-full flex flex-col items-center gap-8 md:gap-10">
                <StepHeader
                  step={3}
                  title="Remove background"
                  description="AI removes the backdrop locally. Then pick your passport background color."
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl items-start">
                  <BackgroundRemover 
                    image={croppedImage} 
                    selectedColor={bgColor}
                    resultImage={transparentImage}
                    onComplete={handleBackgroundComplete} 
                  />
                  
                  <div className="card-elevated p-6 md:p-8 flex flex-col gap-6">
                    <div className="space-y-6">
                      <BackgroundSelector selectedColor={bgColor} onChange={setBgColor} />
                      
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700">
                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3">Live preview</p>
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-16 md:w-20 aspect-35/45 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden"
                            style={{ backgroundColor: bgColor }}
                          >
                            {transparentImage ? (
                              <img src={transparentImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 dark:text-zinc-500 text-center p-2">
                                Remove background to preview color
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Live Preview</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">The background color will be applied behind the subject.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <StepFooter
                  onBack={() => setCurrentStep('crop')}
                  onContinue={() => setCurrentStep('enhance')}
                  continueLabel="Continue to Enhance"
                  continueDisabled={!transparentImage}
                  continueHint="Remove the background first using the button above"
                />
              </div>
            )}

            {currentStep === 'enhance' && transparentImage && (
              <div className="w-full flex flex-col items-center gap-8 md:gap-10">
                <StepHeader
                  step={4}
                  title="Enhance quality"
                  description="Optional step — sharpen and brighten, or skip straight to print settings."
                />

                <ImageEnhancer 
                  image={transparentImage} 
                  selectedColor={bgColor}
                  onComplete={handleEnhanceComplete} 
                />

                <StepFooter
                  onBack={() => setCurrentStep('background')}
                  onContinue={() => setCurrentStep('settings')}
                  continueLabel="Continue to Print Settings"
                  secondaryAction={{
                    label: 'Skip enhancement',
                    onClick: handleSkipEnhance,
                  }}
                />
              </div>
            )}

            {currentStep === 'settings' && transparentImage && (
              <div className="w-full flex flex-col items-center gap-8 md:gap-10">
                <StepHeader
                  step={5}
                  title="Print settings"
                  description="Choose how many copies fit on your A4 sheet and the output resolution."
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl items-start">
                  <div className="flex flex-col gap-6 order-2 lg:order-1">
                    <div className="card-elevated p-6 md:p-8 space-y-8">
                      <CopiesSelector value={numCopies} onChange={setNumCopies} />
                      <UpscaleSelector value={upscaleFactor} onChange={setUpscaleFactor} />
                    </div>
                    
                    <StepFooter
                      onBack={() => setCurrentStep('enhance')}
                      onContinue={() => setCurrentStep('preview')}
                      continueLabel="Generate A4 Preview"
                    />
                  </div>

                  <div className="flex flex-col items-center gap-4 order-1 lg:order-2">
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Passport preview</p>
                    <div className="relative group">
                      <div className="absolute -inset-6 bg-brand-500/10 rounded-[2rem] blur-2xl group-hover:bg-brand-500/15 transition-all" />
                      <div 
                        className="relative card-elevated overflow-hidden"
                        style={{ 
                          width: '200px', 
                          height: `${(200 / (selectedSize.id === 'custom' ? customWidth : selectedSize.widthMm)) * (selectedSize.id === 'custom' ? customHeight : selectedSize.heightMm)}px` 
                        }}
                      >
                        <img src={passportPhoto ?? transparentImage} alt="Passport Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {selectedSize.id === 'custom' ? `${customWidth}mm × ${customHeight}mm` : selectedSize.description}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Final Print Dimensions</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'preview' && (
              <div className="w-full flex flex-col items-center gap-8 md:gap-10">
                <StepHeader
                  step={6}
                  title="Ready to print"
                  description="Download your A4 sheet as PDF or PNG, or print directly from the browser."
                />

                <A4Preview
                  pages={a4Layout?.pages ?? []}
                  totalPages={a4Layout?.totalPages ?? 0}
                  photosPerPage={a4Layout?.photosPerPage ?? 0}
                  totalCopies={a4Layout?.totalCopies ?? 0}
                  upscaleFactor={upscaleFactor}
                  isLoading={isGenerating}
                />

                <DownloadButtons 
                  onDownloadPng={() => {
                    if (!a4Layout?.pages.length) return;
                    a4Layout.pages.forEach((page, index) => {
                      const link = document.createElement('a');
                      link.download =
                        a4Layout.totalPages > 1
                          ? `passport-photos-page-${index + 1}.png`
                          : 'passport-photos.png';
                      link.href = page;
                      link.click();
                    });
                  }}
                  onDownloadPdf={() => {
                    if (!a4Layout?.pages.length) return;
                    exportPDF(a4Layout.pages);
                  }}
                  onPrint={handlePrint}
                  disabled={isGenerating || !a4Layout?.pages.length}
                />

                <StepFooter
                  onBack={() => setCurrentStep('settings')}
                  backLabel="Back to Print Settings"
                  className="mt-2"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center sm:p-4 bg-zinc-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="card-elevated p-6 md:p-8 w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl safe-bottom"
            >
              <h3 className="text-xl font-bold mb-2 font-display">Start over?</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm leading-relaxed">
                All progress will be lost — uploaded photo, crop, and settings.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" size="md" fullWidth onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="md" fullWidth onClick={performReset}>
                  Reset
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200/60 dark:border-zinc-800/60 py-6 sm:py-8 px-3 sm:px-4 md:px-6 safe-bottom">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <BrandLogo size="sm" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            All processing happens locally in your browser
          </p>
        </div>
      </footer>

      <ModelPreloadIndicator />
    </div>
  );
}
