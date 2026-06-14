// ─── DPI Configuration ────────────────────────────────────────────────────────
//
//  A4 physical size: 210 × 297 mm
//
//  Browser canvas limit: ~16384px on any side (Chrome/Firefox)
//  Max safe canvas: ~268 megapixels total
//
//  Strategy:
//   - 300 DPI  → render at 300 DPI natively  (2480  × 3508)
//   - 600 DPI  → render at 600 DPI natively  (4961  × 7016)
//   - 1200 DPI → render at 300 DPI, embed 1200 DPI pHYs chunk in PNG
//                (canvas at 9921×14031 would be ~139MP — crashes browsers)
//
export type PrintDPI = number; // 300 | 600 | 1200

export interface A4LayoutResult {
  pages: string[];
  photosPerPage: number;
  totalPages: number;
  totalCopies: number;
}

interface DPIConfig {
  canvasWidth: number;
  canvasHeight: number;
  renderDPI: number;
  metaDPI: number;
}

const DPI_CONFIG: Record<PrintDPI, DPIConfig> = {
  300: { canvasWidth: 2480, canvasHeight: 3508, renderDPI: 300, metaDPI: 300 },
  600: { canvasWidth: 4961, canvasHeight: 7016, renderDPI: 600, metaDPI: 600 },
  1200: { canvasWidth: 2480, canvasHeight: 3508, renderDPI: 300, metaDPI: 1200 },
};

const COLS = 5;
const PAGE_PADDING_MM = 5;
const PHOTO_MARGIN_MM = 5;

/** mm → pixels at a given DPI */
function mmToPx(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

// ─── PNG pHYs chunk injection ─────────────────────────────────────────────────

function crc32(buf: Uint8Array): number {
  const table = makeCrcTable();
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

let _crcTable: number[] | null = null;
function makeCrcTable(): number[] {
  if (_crcTable) return _crcTable;
  _crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    _crcTable[n] = c;
  }
  return _crcTable;
}

function uint32BE(val: number): Uint8Array {
  return new Uint8Array([(val >>> 24) & 0xff, (val >>> 16) & 0xff, (val >>> 8) & 0xff, val & 0xff]);
}

function injectPngDPI(pngBuffer: ArrayBuffer, dpi: number): Uint8Array {
  const src = new Uint8Array(pngBuffer);
  const ppm = Math.round(dpi * (1000 / 25.4));

  const type = new TextEncoder().encode('pHYs');
  const data = new Uint8Array(9);
  data.set(uint32BE(ppm), 0);
  data.set(uint32BE(ppm), 4);
  data[8] = 1;

  const chunkBody = new Uint8Array([...type, ...data]);
  const crc = uint32BE(crc32(chunkBody));
  const length = uint32BE(9);
  const phys = new Uint8Array([...length, ...chunkBody, ...crc]);

  const insertAt = 8 + 25;
  const out = new Uint8Array(src.length + phys.length);
  out.set(src.slice(0, insertAt), 0);
  out.set(phys, insertAt);
  out.set(src.slice(insertAt), insertAt + phys.length);
  return out;
}

async function canvasToArrayBuffer(canvas: HTMLCanvasElement): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas toBlob failed'));
        blob.arrayBuffer().then(resolve).catch(reject);
      },
      'image/png'
    );
  });
}

async function canvasToPageDataUrl(
  canvas: HTMLCanvasElement,
  renderDPI: number,
  metaDPI: number
): Promise<string> {
  if (metaDPI !== renderDPI) {
    const pngBuffer = await canvasToArrayBuffer(canvas);
    const pngWithDPI = injectPngDPI(pngBuffer, metaDPI);
    const blob = new Blob([pngWithDPI], { type: 'image/png' });
    return URL.createObjectURL(blob);
  }
  return canvas.toDataURL('image/jpeg', 0.97);
}

function drawPhotoOnPage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  indexOnPage: number,
  fittedPhotoWidth: number,
  fittedPhotoHeight: number,
  paddingPx: number,
  marginPx: number,
  scaleFactor: number
) {
  const col = indexOnPage % COLS;
  const row = Math.floor(indexOnPage / COLS);
  const x = paddingPx + col * (fittedPhotoWidth + marginPx);
  const y = paddingPx + row * (fittedPhotoHeight + marginPx);

  ctx.drawImage(img, x, y, fittedPhotoWidth, fittedPhotoHeight);

  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2 * scaleFactor;
  ctx.strokeRect(x, y, fittedPhotoWidth, fittedPhotoHeight);

  ctx.save();
  ctx.strokeStyle = '#aaaaaa';
  ctx.lineWidth = 1 * scaleFactor;
  ctx.setLineDash([6 * scaleFactor, 4 * scaleFactor]);
  ctx.strokeRect(
    x - scaleFactor,
    y - scaleFactor,
    fittedPhotoWidth + 2 * scaleFactor,
    fittedPhotoHeight + 2 * scaleFactor
  );
  ctx.restore();
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateA4Layout(
  passportPhotoSrc: string,
  photoWidthMm: number,
  photoHeightMm: number,
  numCopies: number,
  dpi: PrintDPI = 300
): Promise<A4LayoutResult> {
  const { canvasWidth, canvasHeight, renderDPI, metaDPI } = DPI_CONFIG[dpi];

  const paddingPx = mmToPx(PAGE_PADDING_MM, renderDPI);
  const marginPx = mmToPx(PHOTO_MARGIN_MM, renderDPI);

  const usableWidth = canvasWidth - 2 * paddingPx;
  const fittedPhotoWidth = Math.floor((usableWidth - (COLS - 1) * marginPx) / COLS);

  const aspectRatio = photoHeightMm / photoWidthMm;
  const fittedPhotoHeight = Math.round(fittedPhotoWidth * aspectRatio);

  const usableHeight = canvasHeight - 2 * paddingPx;
  const maxRows = Math.max(
    1,
    Math.floor((usableHeight + marginPx) / (fittedPhotoHeight + marginPx))
  );
  const photosPerPage = COLS * maxRows;
  const totalPages = Math.max(1, Math.ceil(numCopies / photosPerPage));
  const scaleFactor = renderDPI / 300;

  const img = new Image();
  img.src = passportPhotoSrc;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load passport photo'));
  });

  const pages: string[] = [];

  for (let page = 0; page < totalPages; page++) {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const startCopy = page * photosPerPage;
    const endCopy = Math.min(numCopies, startCopy + photosPerPage);

    for (let i = startCopy; i < endCopy; i++) {
      drawPhotoOnPage(
        ctx,
        img,
        i - startCopy,
        fittedPhotoWidth,
        fittedPhotoHeight,
        paddingPx,
        marginPx,
        scaleFactor
      );
    }

    pages.push(await canvasToPageDataUrl(canvas, renderDPI, metaDPI));
  }

  return {
    pages,
    photosPerPage,
    totalPages,
    totalCopies: numCopies,
  };
}
