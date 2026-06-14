import { jsPDF } from 'jspdf';

function imageFormat(dataUrl: string): 'PNG' | 'JPEG' {
  return dataUrl.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
}

export async function exportPDF(
  imagePages: string[],
  fileName: string = 'passport-photos.pdf'
) {
  if (imagePages.length === 0) return;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  imagePages.forEach((imageData, index) => {
    if (index > 0) pdf.addPage();
    pdf.addImage(imageData, imageFormat(imageData), 0, 0, 210, 297);
  });

  pdf.save(fileName);
}
