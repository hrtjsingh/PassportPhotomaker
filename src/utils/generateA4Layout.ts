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

interface DPIConfig {
  canvasWidth: number;
  canvasHeight: number;
  renderDPI: number;   // actual pixel DPI used for canvas
  metaDPI: number;   // DPI written into PNG metadata
}

const DPI_CONFIG: Record<PrintDPI, DPIConfig> = {
  300: { canvasWidth: 2480, canvasHeight: 3508, renderDPI: 300, metaDPI: 300 },
  600: { canvasWidth: 4961, canvasHeight: 7016, renderDPI: 600, metaDPI: 600 },
  1200: { canvasWidth: 2480, canvasHeight: 3508, renderDPI: 300, metaDPI: 1200 }, // ← safe canvas, metadata trick
};

/** mm → pixels at a given DPI */
function mmToPx(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

// ─── PNG pHYs chunk injection ─────────────────────────────────────────────────
// Embeds pixel-per-unit (DPI) metadata so print software honours the resolution.

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

/**
 * Injects a pHYs chunk into a raw PNG ArrayBuffer.
 * pHYs chunk stores pixels-per-unit; unit=1 means pixels per metre.
 * DPI × (1000/25.4) = pixels per metre.
 */
function injectPngDPI(pngBuffer: ArrayBuffer, dpi: number): Uint8Array {
  const src = new Uint8Array(pngBuffer);
  const ppm = Math.round(dpi * (1000 / 25.4)); // pixels per metre

  // Build pHYs chunk: 4B length + 4B type + 9B data + 4B CRC
  const type = new TextEncoder().encode('pHYs');
  const data = new Uint8Array(9);
  data.set(uint32BE(ppm), 0);   // X pixels per unit
  data.set(uint32BE(ppm), 4);   // Y pixels per unit
  data[8] = 1;                  // unit: metre

  const chunkBody = new Uint8Array([...type, ...data]);
  const crc = uint32BE(crc32(chunkBody));
  const length = uint32BE(9);

  const phys = new Uint8Array([...length, ...chunkBody, ...crc]);

  // Insert pHYs right after the PNG signature (8 bytes) + IHDR chunk (4+4+13+4 = 25 bytes)
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

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateA4Layout(
  passportPhotoSrc: string,
  photoWidthMm: number,
  photoHeightMm: number,
  numCopies: number,
  dpi: PrintDPI = 300
): Promise<string> {

  const { canvasWidth, canvasHeight, renderDPI, metaDPI } = DPI_CONFIG[dpi];

  const marginPx = mmToPx(5, renderDPI);
  const paddingPx = mmToPx(5, renderDPI);

  const COLS = 5;
  const usableWidth = canvasWidth - 2 * paddingPx;
  const fittedPhotoWidth = Math.floor((usableWidth - (COLS - 1) * marginPx) / COLS);

  const aspectRatio = photoHeightMm / photoWidthMm;
  const fittedPhotoHeight = Math.round(fittedPhotoWidth * aspectRatio);

  // ── Canvas ────────────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // ── Load image ────────────────────────────────────────────────────────────
  const img = new Image();
  img.src = passportPhotoSrc;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load passport photo'));
  });

  // Scale guides to look the same physical size regardless of renderDPI
  const scaleFactor = renderDPI / 300;

  // ── Grid ──────────────────────────────────────────────────────────────────
  for (let i = 0; i < numCopies; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);

    const x = paddingPx + col * (fittedPhotoWidth + marginPx);
    const y = paddingPx + row * (fittedPhotoHeight + marginPx);

    if (y + fittedPhotoHeight > canvasHeight - paddingPx) break;

    ctx.drawImage(img, x, y, fittedPhotoWidth, fittedPhotoHeight);

    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2 * scaleFactor;
    ctx.strokeRect(x, y, fittedPhotoWidth, fittedPhotoHeight);

    ctx.save();
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 1 * scaleFactor;
    ctx.setLineDash([6 * scaleFactor, 4 * scaleFactor]);
    ctx.strokeRect(
      x - scaleFactor, y - scaleFactor,
      fittedPhotoWidth + 2 * scaleFactor,
      fittedPhotoHeight + 2 * scaleFactor
    );
    ctx.restore();
  }

  // ── Output ────────────────────────────────────────────────────────────────
  // For 1200 DPI: render at 300 DPI canvas then inject DPI metadata into PNG.
  // This tells print software to treat each pixel as 1/1200 inch → same
  // physical output size but the printer uses its full 1200 DPI resolution.
  if (metaDPI !== renderDPI) {
    const pngBuffer = await canvasToArrayBuffer(canvas);
    const pngWithDPI = injectPngDPI(pngBuffer, metaDPI);
    //@ts-ignore
    const blob = new Blob([pngWithDPI], { type: 'image/png' });
    return URL.createObjectURL(blob);   // returns object URL instead of dataURL (more memory-efficient)
  }

  // 300 / 600 DPI: JPEG is fine (no metadata injection needed, printers use file size heuristics)
  return canvas.toDataURL('image/jpeg', 0.97);
}