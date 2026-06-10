import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Crop, 
  Sparkles, 
  Settings, 
  Layout, 
  Download, 
  RotateCcw,
  Wand2,
  Moon,
  Sun
} from 'lucide-react';
import { Area } from 'react-easy-crop';

import { UploadPhoto } from './components/UploadPhoto';
import { CropEditor } from './components/CropEditor';
import { BackgroundRemover } from './components/BackgroundRemover';
import { BackgroundSelector } from './components/BackgroundSelector';
import { SizeSelector } from './components/SizeSelector';
import { CopiesSelector } from './components/CopiesSelector';
import { UpscaleSelector } from './components/UpscaleSelector';
import { A4Preview } from './components/A4Preview';
import { DownloadButtons } from './components/DownloadButtons';

import getCroppedImg from './utils/cropImage';
import { generatePassportPhoto } from './utils/generatePassportPhoto';
import { generateA4Layout } from './utils/generateA4Layout';
import { exportPDF } from './utils/exportPDF';
import { PassportSize, PASSPORT_SIZES } from './config/passportSizes';

import { ImageEnhancer } from './components/ImageEnhancer';
import { ModelPreloadIndicator } from './components/ModelPreloadIndicator';
import { StepProgress, type StepConfig, type WizardStep } from './components/StepProgress';
import { StepFooter } from './components/StepFooter';
import { Button } from './components/ui/Button';

type Step = WizardStep;

const STEPS: StepConfig[] = [
  { id: 'upload', label: 'Upload', icon: Camera },
  { id: 'crop', label: 'Crop', icon: Crop },
  { id: 'background', label: 'Background', icon: Sparkles },
  { id: 'enhance', label: 'Enhance', icon: Wand2 },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'preview', label: 'Preview', icon: Layout },
];

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [transparentImage, setTransparentImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [passportPhoto, setPassportPhoto] = useState<string | null>(null);
  const [a4Layout, setA4Layout] = useState<string | null>(null);
  
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
    const updateA4Layout = async () => {
      if (!passportPhoto) return;
      setIsGenerating(true);
      
      const width = selectedSize.id === 'custom' ? customWidth : selectedSize.widthMm;
      const height = selectedSize.id === 'custom' ? customHeight : selectedSize.heightMm;

      try {
        const result = await generateA4Layout(passportPhoto, width, height, numCopies ,(300 * upscaleFactor));
        setA4Layout(result);
      } catch (e) {
        console.error(e);
      } finally {
        setIsGenerating(false);
      }
    };

    if (currentStep === 'preview') {
      updateA4Layout();
    }
  }, [passportPhoto, numCopies, currentStep, selectedSize, customWidth, customHeight]);

  const performReset = () => {
    setOriginalImage(null);
    setCompressedImage(null);
    setCroppedImage(null);
    setTransparentImage(null);
    setEnhancedImage(null);
    setPassportPhoto(null);
    setA4Layout(null);
    setUpscaleFactor(1);
    setEnhanceSkipped(false);
    setCurrentStep('upload');
    setShowResetConfirm(false);
  };

  const handlePrint = () => {
    if (!a4Layout) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Passport Photos</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
            img { max-width: 100%; height: auto; }
            @page { size: A4; margin: 0; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <img src="${a4Layout}" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-900 selection:text-white transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentStep('upload')}>
            <div className="w-9 h-9 md:w-10 md:h-10 bg-zinc-900 dark:bg-zinc-50 rounded-xl flex items-center justify-center">
              <Camera className="text-white dark:text-zinc-900 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight font-display">PassportMaker</h1>
          </div>
          
          <div className="hidden lg:block">
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

          <div className="flex items-center gap-2">
            {/* <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 dark:text-zinc-400"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button> */}
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 dark:text-zinc-400"
              title="Start Over"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
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
              <div className="w-full max-w-2xl text-center flex flex-col gap-8">
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-display">Create Print-Ready Passport Photos</h2>
                  <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400">Professional quality, upto 1200 DPI, open-source background removal. All in your browser.</p>
                </div>
                <UploadPhoto onUpload={handleUpload} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-8">
                  {[
                    { label: '300 DPI Quality', desc: 'Print-ready resolution' },
                    { label: 'Open-Source AI', desc: 'Local background removal models' },
                    { label: 'A4 Layout', desc: 'Multiple copies on one sheet' }
                  ].map((item, i) => (
                    <div key={i} className="text-left p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-50">{item.label}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'crop' && compressedImage && (
              <div className="w-full flex flex-col items-center gap-6 md:gap-8">
                <div className="text-center space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold">Crop Your Photo</h2>
                  <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400">Select size and adjust the frame to focus on your face.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 w-full max-w-5xl items-start">
                  <CropEditor 
                    image={compressedImage} 
                    aspectRatio={selectedSize.widthMm / selectedSize.heightMm}
                    targetWidth={selectedSize.id === 'custom' ? customWidth : selectedSize.widthMm}
                    targetHeight={selectedSize.id === 'custom' ? customHeight : selectedSize.heightMm}
                    onCropComplete={onCropComplete}
                  />
                  
                  <div className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
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
                    
                    <StepFooter
                      onBack={() => setCurrentStep('upload')}
                      backLabel="Back to Upload"
                      onContinue={handleCropNext}
                      continueLabel="Remove Background"
                      continueLoading={isCropping}
                      className="pt-4 border-t border-zinc-100 dark:border-zinc-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'background' && croppedImage && (
              <div className="w-full flex flex-col items-center gap-6 md:gap-8">
                <div className="text-center space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold">Background Removal</h2>
                  <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400">Remove the background, then pick your passport backdrop color.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 w-full max-w-4xl items-start">
                  <BackgroundRemover 
                    image={croppedImage} 
                    selectedColor={bgColor}
                    resultImage={transparentImage}
                    onComplete={handleBackgroundComplete} 
                  />
                  
                  <div className="flex flex-col gap-6 md:gap-8 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="space-y-6">
                      <BackgroundSelector selectedColor={bgColor} onChange={setBgColor} />
                      
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase mb-2">Preview</p>
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

                    <StepFooter
                      onBack={() => setCurrentStep('crop')}
                      onContinue={() => setCurrentStep('enhance')}
                      continueLabel="Continue to Enhance"
                      continueDisabled={!transparentImage}
                      continueHint="Remove the background first using one of the buttons on the left"
                      className="pt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'enhance' && transparentImage && (
              <div className="w-full flex flex-col items-center gap-6 md:gap-8">
                <div className="text-center space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold">Enhance Photo Quality</h2>
                  <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400">Optional — sharpen features and clear skin, or skip to print settings.</p>
                </div>

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
              <div className="w-full flex flex-col items-center gap-6 md:gap-8">
                <div className="text-center space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold">Print Settings</h2>
                  <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400">Choose the number of copies for your A4 sheet.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 w-full max-w-4xl items-start">
                  <div className="flex flex-col gap-6 order-2 lg:order-1">
                    <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
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
                    <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Passport Preview</p>
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-zinc-900/5 dark:bg-zinc-50/5 rounded-[2rem] blur-2xl group-hover:bg-zinc-900/10 dark:group-hover:bg-zinc-50/10 transition-all" />
                      <div 
                        className="relative bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden"
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
              <div className="w-full flex flex-col items-center gap-6 md:gap-8">
                <div className="text-center space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold">Ready for Printing</h2>
                  <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400">Download your A4 sheet in high-quality PNG or PDF format.</p>
                </div>

                <A4Preview upscaleFactor={upscaleFactor} image={a4Layout} isLoading={isGenerating} />

                <DownloadButtons 
                  onDownloadPng={() => {
                    if (!a4Layout) return;
                    const link = document.createElement('a');
                    link.download = 'passport-photos.png';
                    link.href = a4Layout;
                    link.click();
                  }}
                  onDownloadPdf={() => {
                    if (!a4Layout) return;
                    exportPDF(a4Layout);
                  }}
                  onPrint={handlePrint}
                  disabled={isGenerating || !a4Layout}
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
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <h3 className="text-xl font-bold mb-2">Start Over?</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                Are you sure you want to start over? All your current progress will be lost.
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
      <footer className="mt-auto  border-t border-zinc-200 dark:border-zinc-800 py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
              <Camera className="text-zinc-500 dark:text-zinc-400 w-5 h-5" />
            </div>
            <span className="font-bold text-zinc-900 dark:text-zinc-50">PassportMaker</span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center md:text-left">© 2026 Passport Photo Maker. All processing happens locally in your browser.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50">Privacy</a>
            <a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50">Terms</a>
            <a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50">Support</a>
          </div>
        </div>
      </footer>

      <ModelPreloadIndicator />
    </div>
  );
}
