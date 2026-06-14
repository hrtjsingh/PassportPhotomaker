export interface PrintDpiConfig {
  canvasWidth: number;
  canvasHeight: number;
  renderDPI: number;
  metaDPI: number;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

function configForDpi(dpi: number): PrintDpiConfig {
  return {
    canvasWidth: mmToPxAtDpi(A4_WIDTH_MM, dpi),
    canvasHeight: mmToPxAtDpi(A4_HEIGHT_MM, dpi),
    renderDPI: dpi,
    metaDPI: dpi,
  };
}

/** True render + metadata DPI for each A4 export tier. */
export const PRINT_DPI_CONFIG: Record<number, PrintDpiConfig> = {
  300: configForDpi(300),
  600: configForDpi(600),
  1200: configForDpi(1200),
};

export function getPrintDpiConfig(dpi: number): PrintDpiConfig {
  return PRINT_DPI_CONFIG[dpi] ?? PRINT_DPI_CONFIG[300];
}

export function mmToPxAtDpi(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

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

export function injectPngDpi(pngBuffer: ArrayBuffer, dpi: number): Uint8Array {
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

async function canvasToPngBuffer(canvas: HTMLCanvasElement): Promise<ArrayBuffer> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))), 'image/png');
  });
  return blob.arrayBuffer();
}

/** Blob URL — used for A4 sheet pages. */
export async function canvasToPngBlobUrl(canvas: HTMLCanvasElement, metaDpi: number): Promise<string> {
  const pngWithDpi = injectPngDpi(await canvasToPngBuffer(canvas), metaDpi);
  return URL.createObjectURL(new Blob([pngWithDpi], { type: 'image/png' }));
}

/** Data URL — used for in-memory passport photo pipeline. */
export async function canvasToPngDataUrl(canvas: HTMLCanvasElement, metaDpi: number): Promise<string> {
  const pngWithDpi = injectPngDpi(await canvasToPngBuffer(canvas), metaDpi);
  const blob = new Blob([pngWithDpi], { type: 'image/png' });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read PNG'));
    reader.readAsDataURL(blob);
  });
}

export function createA4Canvas(config: PrintDpiConfig): HTMLCanvasElement {
  const { canvasWidth, canvasHeight } = config;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error(
      `Could not create ${config.renderDPI} DPI canvas (${canvasWidth}×${canvasHeight}px). Try a lower resolution.`
    );
  }
  return canvas;
}
