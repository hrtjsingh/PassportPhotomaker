import { jsPDF } from 'jspdf';
import type { SheetSize } from '../config/sheetSizes';
import { DEFAULT_SHEET } from '../config/sheetSizes';

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
  sheet: SheetSize = DEFAULT_SHEET
) {
  if (imagePages.length === 0) return;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: sheet.pdfFormat,
  });

  for (let index = 0; index < imagePages.length; index++) {
    if (index > 0) pdf.addPage(sheet.pdfFormat);
    const { data, format } = await resolveImageForPdf(imagePages[index]);
    pdf.addImage(data, format, 0, 0, sheet.widthMm, sheet.heightMm);
  }

  pdf.save(fileName);
}
