export interface PrintDpiConfig {
  canvasWidth: number;
  canvasHeight: number;
  renderDPI: number;
  metaDPI: number;
  exportWidth: number;
  exportHeight: number;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

export function mmToPxAtDpi(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

/** Whether browser can allocate and draw on a canvas of this size. */
export function canCreateCanvas(width: number, height: number): boolean {
  if (typeof document === 'undefined') return false;
  if (width <= 0 || height <= 0) return false;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    if (canvas.width !== width || canvas.height !== height) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    ctx.fillRect(0, 0, 1, 1);
    return ctx.getImageData(0, 0, 1, 1).data[3] > 0;
  } catch {
    return false;
  }
}

function configForDpi(targetDpi: number): PrintDpiConfig {
  const exportWidth = mmToPxAtDpi(A4_WIDTH_MM, targetDpi);
  const exportHeight = mmToPxAtDpi(A4_HEIGHT_MM, targetDpi);

  let renderDpi = targetDpi;
  while (renderDpi >= 300) {
    const w = mmToPxAtDpi(A4_WIDTH_MM, renderDpi);
    const h = mmToPxAtDpi(A4_HEIGHT_MM, renderDpi);
    if (canCreateCanvas(w, h)) break;
    renderDpi -= 50;
  }

  if (renderDpi < 300) {
    renderDpi = 300;
  }

  const canvasWidth = mmToPxAtDpi(A4_WIDTH_MM, renderDpi);
  const canvasHeight = mmToPxAtDpi(A4_HEIGHT_MM, renderDpi);
  const canExportAtTarget =
    renderDpi === targetDpi && canCreateCanvas(exportWidth, exportHeight);

  return {
    canvasWidth,
    canvasHeight,
    renderDPI: renderDpi,
    metaDPI: canExportAtTarget ? targetDpi : renderDpi,
    exportWidth: canExportAtTarget ? exportWidth : canvasWidth,
    exportHeight: canExportAtTarget ? exportHeight : canvasHeight,
  };
}

/** Render + metadata DPI for each A4 export tier (recomputed per call for live canvas limits). */
export function getPrintDpiConfig(dpi: number): PrintDpiConfig {
  return configForDpi(dpi);
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

function chunkEndAfterIhdr(png: Uint8Array): number {
  let offset = 8;
  while (offset + 8 <= png.length) {
    const length =
      (png[offset] << 24) | (png[offset + 1] << 16) | (png[offset + 2] << 8) | png[offset + 3];
    const type = String.fromCharCode(png[offset + 4], png[offset + 5], png[offset + 6], png[offset + 7]);
    if (type === 'IHDR') {
      return offset + 12 + length;
    }
    offset += 12 + length;
  }
  return 33;
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
  const insertAt = chunkEndAfterIhdr(src);
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

/** Upscale rendered page to export dimensions when browser supports the target canvas. */
export function finalizeA4Canvas(canvas: HTMLCanvasElement, config: PrintDpiConfig): HTMLCanvasElement {
  if (canvas.width === config.exportWidth && canvas.height === config.exportHeight) {
    return canvas;
  }

  if (!canCreateCanvas(config.exportWidth, config.exportHeight)) {
    return canvas;
  }

  const output = document.createElement('canvas');
  output.width = config.exportWidth;
  output.height = config.exportHeight;
  const ctx = output.getContext('2d');
  if (!ctx) {
    return canvas;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, config.exportWidth, config.exportHeight);
  return output;
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

  if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
    throw new Error(
      `Could not create ${config.renderDPI} DPI canvas (${canvasWidth}×${canvasHeight}px). Try a lower resolution.`
    );
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error(
      `Could not create ${config.renderDPI} DPI canvas (${canvasWidth}×${canvasHeight}px). Try a lower resolution.`
    );
  }
  return canvas;
}
