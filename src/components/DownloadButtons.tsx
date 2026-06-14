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
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={disabled}
        onClick={onDownloadPdf}
        icon={<FileText className="w-5 h-5" />}
        description="Best for printing at any shop"
      >
        Download PDF
      </Button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          variant="secondary"
          size="lg"
          fullWidth
          disabled={disabled}
          onClick={onPrint}
          icon={<Printer className="w-4 h-4" />}
        >
          Print Now
        </Button>
      </div>
    </div>
  );
};
