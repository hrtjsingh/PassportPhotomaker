import React from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { Button } from './ui/Button';

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
  disabled,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mx-auto mt-6 md:mt-8">
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        disabled={disabled}
        onClick={onDownloadPng}
        icon={<Download className="w-4 h-4" />}
      >
        Download PNG
      </Button>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={disabled}
        onClick={onDownloadPdf}
        icon={<FileText className="w-4 h-4" />}
      >
        Download PDF
      </Button>

      <Button
        variant="secondary"
        size="lg"
        fullWidth
        disabled={disabled}
        onClick={onPrint}
        icon={<Printer className="w-4 h-4" />}
      >
        Print A4
      </Button>
    </div>
  );
};
