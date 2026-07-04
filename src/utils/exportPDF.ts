import { jsPDF } from 'jspdf';
import type { SheetSize } from '../config/sheetSizes';
import { DEFAULT_SHEET } from '../config/sheetSizes';
import {
  getPrintPageDimensions,
  preparePageForPrint,
} from './preparePrintPage';

async function resolveImageForPdf(
  imageRef: string
): Promise<{ data: string; format: 'PNG' | 'JPEG' }> {
  if (imageRef.startsWith('data:image/jpeg')) {
    return { data: imageRef, format: 'JPEG' };
  }
  if (imageRef.startsWith('data:image/png')) {
    return { data: imageRef, format: 'PNG' };
  }
  if (imageRef.startsWith('blob:')) {
    const blob = await fetch(imageRef).then((r) => r.blob());
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image blob'));
      reader.readAsDataURL(blob);
    });
    return { data, format: blob.type.includes('jpeg') ? 'JPEG' : 'PNG' };
  }
  return { data: imageRef, format: 'PNG' };
}

export async function exportPDF(
  imagePages: string[],
  fileName: string = 'passport-photos.pdf',
  sheet: SheetSize = DEFAULT_SHEET,
  landscape = false
) {
  if (imagePages.length === 0) return;

  const printPage = getPrintPageDimensions(sheet, landscape);
  const jsPdfOrientation =
    printPage.widthMm > printPage.heightMm ? 'landscape' : 'portrait';

  const pdf = new jsPDF({
    orientation: jsPdfOrientation,
    unit: 'mm',
    format: [sheet.widthMm, sheet.heightMm],
  });

  for (let index = 0; index < imagePages.length; index++) {
    if (index > 0) {
      pdf.addPage([sheet.widthMm, sheet.heightMm], jsPdfOrientation);
    }
    const prepared = await preparePageForPrint(imagePages[index], printPage);
    const { data, format } = await resolveImageForPdf(prepared);
    pdf.addImage(data, format, 0, 0, printPage.widthMm, printPage.heightMm);
  }

  pdf.save(fileName);
}
