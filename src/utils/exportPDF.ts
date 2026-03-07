import { jsPDF } from 'jspdf';

export async function exportPDF(imageData: string, fileName: string = 'passport-photos.pdf') {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // A4 is 210 x 297 mm
  pdf.addImage(imageData, 'PNG', 0, 0, 210, 297);
  pdf.save(fileName);
}
