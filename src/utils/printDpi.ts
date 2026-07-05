export interface PrintDpiConfig {
  canvasWidth: number;
  canvasHeight: number;
  renderDPI: number;
  metaDPI: number;
  exportWidth: number;
  exportHeight: number;
  targetDPI: number;
  sheetWidthMm: number;
  sheetHeightMm: number;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/** Conservative pixel-area cap — toBlob often fails above this even when alloc succeeds. */
const SAFE_MAX_AREA_PX = 56 * 1024 * 1024;

let _maxCanvasEdgePx: number | null = null;

export function mmToPxAtDpi(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

function probeMaxCanvasEdgePx(): number {
  if (typeof document === 'undefined') return 8192;

  for (const size of [16384, 8192, 4096, 2048]) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      if (canvas.width !== size || canvas.height !== size) continue;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      ctx.fillRect(0, 0, 1, 1);
      if (ctx.getImageData(0, 0, 1, 1).data[3] > 0) return size;
    } catch {
      // try next size
    }
  }

  return 2048;
}

/** Longest canvas edge this browser can reliably allocate (cached). */
export function getMaxCanvasEdgePx(): number {
  if (_maxCanvasEdgePx === null) {
    _maxCanvasEdgePx = probeMaxCanvasEdgePx();
  }
  return _maxCanvasEdgePx;
}

export function fitsCanvasLimits(width: number, height: number): boolean {
  const maxEdge = getMaxCanvasEdgePx();
  return (
    width > 0 &&
    height > 0 &&
    width <= maxEdge &&
    height <= maxEdge &&
    width * height <= SAFE_MAX_AREA_PX
  );
}

/** Whether browser can allocate and draw on a canvas of this size. */
export function canCreateCanvas(width: number, height: number): boolean {
  if (typeof document === 'undefined') return false;
  if (!fitsCanvasLimits(width, height)) return false;

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

/** Highest DPI that fits canvas limits for a sheet at true pixel dimensions. */
export function getMaxNativeDpi(
  targetDpi: number,
  sheetWidthMm: number,
  sheetHeightMm: number
): number {
  let best = 300;
  for (let dpi = 300; dpi <= targetDpi; dpi += 50) {
    const w = mmToPxAtDpi(sheetWidthMm, dpi);
    const h = mmToPxAtDpi(sheetHeightMm, dpi);
    if (canCreateCanvas(w, h)) {
      best = dpi;
    } else {
      break;
    }
  }
  return best;
}

function configForDpi(
  targetDpi: number,
  sheetWidthMm: number = A4_WIDTH_MM,
  sheetHeightMm: number = A4_HEIGHT_MM
): PrintDpiConfig {
  const nativeDpi = getMaxNativeDpi(targetDpi, sheetWidthMm, sheetHeightMm);
  const canvasWidth = mmToPxAtDpi(sheetWidthMm, nativeDpi);
  const canvasHeight = mmToPxAtDpi(sheetHeightMm, nativeDpi);
  const exportWidth = mmToPxAtDpi(sheetWidthMm, targetDpi);
  const exportHeight = mmToPxAtDpi(sheetHeightMm, targetDpi);

  return {
    canvasWidth,
    canvasHeight,
    renderDPI: nativeDpi,
    metaDPI: targetDpi,
    exportWidth,
    exportHeight,
    targetDPI: targetDpi,
    sheetWidthMm,
    sheetHeightMm,
  };
}

/** Render + metadata DPI for a sheet size (recomputed per call for live canvas limits). */
export function getPrintDpiConfig(
  dpi: number,
  sheetWidthMm: number = A4_WIDTH_MM,
  sheetHeightMm: number = A4_HEIGHT_MM
): PrintDpiConfig {
  return configForDpi(dpi, sheetWidthMm, sheetHeightMm);
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

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, config.exportWidth, config.exportHeight);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, config.exportWidth, config.exportHeight);
  return output;
}

/** Upscale in vertical tiles when the full export canvas is too large (e.g. A4 @ 1200 DPI). */
async function finalizeA4CanvasTiled(
  canvas: HTMLCanvasElement,
  config: PrintDpiConfig
): Promise<HTMLCanvasElement | null> {
  const { exportWidth, exportHeight } = config;
  if (canvas.width === exportWidth && canvas.height === exportHeight) {
    return canvas;
  }

  const maxEdge = getMaxCanvasEdgePx();
  const tileHeight = Math.min(
    maxEdge,
    Math.max(512, Math.floor(SAFE_MAX_AREA_PX / exportWidth))
  );
  const tileCount = Math.ceil(exportHeight / tileHeight);
  const tileCanvases: HTMLCanvasElement[] = [];

  for (let i = 0; i < tileCount; i++) {
    const destY = i * tileHeight;
    const destH = Math.min(tileHeight, exportHeight - destY);
    if (!canCreateCanvas(exportWidth, destH)) {
      return null;
    }

    const tile = document.createElement('canvas');
    tile.width = exportWidth;
    tile.height = destH;
    const ctx = tile.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportWidth, destH);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const srcY = (destY / exportHeight) * canvas.height;
    const srcH = (destH / exportHeight) * canvas.height;
    ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, exportWidth, destH);
    tileCanvases.push(tile);
  }

  if (!canCreateCanvas(exportWidth, exportHeight)) {
    return null;
  }

  const output = document.createElement('canvas');
  output.width = exportWidth;
  output.height = exportHeight;
  const outCtx = output.getContext('2d');
  if (!outCtx) return null;

  outCtx.fillStyle = '#ffffff';
  outCtx.fillRect(0, 0, exportWidth, exportHeight);
  for (let i = 0; i < tileCanvases.length; i++) {
    outCtx.drawImage(tileCanvases[i], 0, i * tileHeight);
  }

  return output;
}

type ExportLayoutResult =
  | { kind: 'canvas'; canvas: HTMLCanvasElement; metaDpi: number }
  | { kind: 'buffer'; pngBuffer: ArrayBuffer; metaDpi: number };

/** GPU resize path — often succeeds when allocating a full export canvas does not. */
async function upscaleViaImageBitmap(
  canvas: HTMLCanvasElement,
  config: PrintDpiConfig
): Promise<ExportLayoutResult | null> {
  const { exportWidth, exportHeight } = config;
  if (canvas.width === exportWidth && canvas.height === exportHeight) {
    return { kind: 'canvas', canvas, metaDpi: config.targetDPI };
  }

  if (typeof createImageBitmap !== 'function') {
    return null;
  }

  try {
    const bitmap = await createImageBitmap(canvas, {
      resizeWidth: exportWidth,
      resizeHeight: exportHeight,
      resizeQuality: 'high',
    });

    if (typeof OffscreenCanvas !== 'undefined') {
      const offscreen = new OffscreenCanvas(exportWidth, exportHeight);
      const ctx = offscreen.getContext('2d');
      if (!ctx) {
        bitmap.close();
        return null;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, exportWidth, exportHeight);
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      try {
        const blob = await offscreen.convertToBlob({ type: 'image/png' });
        return { kind: 'buffer', pngBuffer: await blob.arrayBuffer(), metaDpi: config.targetDPI };
      } catch {
        return null;
      }
    }

    if (!canCreateCanvas(exportWidth, exportHeight)) {
      bitmap.close();
      return null;
    }

    const output = document.createElement('canvas');
    output.width = exportWidth;
    output.height = exportHeight;
    const ctx = output.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return null;
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportWidth, exportHeight);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return { kind: 'canvas', canvas: output, metaDpi: config.targetDPI };
  } catch {
    return null;
  }
}

async function exportLayoutCanvas(
  canvas: HTMLCanvasElement,
  config: PrintDpiConfig
): Promise<ExportLayoutResult> {
  if (canvas.width === config.exportWidth && canvas.height === config.exportHeight) {
    return { kind: 'canvas', canvas, metaDpi: config.targetDPI };
  }

  const direct = finalizeA4Canvas(canvas, config);
  if (direct.width === config.exportWidth && direct.height === config.exportHeight) {
    try {
      await canvasToPngBuffer(direct);
      return { kind: 'canvas', canvas: direct, metaDpi: config.targetDPI };
    } catch {
      // try other upscale paths
    }
  }

  const bitmapUpscale = await upscaleViaImageBitmap(canvas, config);
  if (bitmapUpscale) {
    if (bitmapUpscale.kind === 'buffer') {
      return bitmapUpscale;
    }
    try {
      await canvasToPngBuffer(bitmapUpscale.canvas);
      return bitmapUpscale;
    } catch {
      // try tiled upscale below
    }
  }

  const tiled = await finalizeA4CanvasTiled(canvas, config);
  if (tiled) {
    try {
      await canvasToPngBuffer(tiled);
      return { kind: 'canvas', canvas: tiled, metaDpi: config.targetDPI };
    } catch {
      // fall back to native render resolution
    }
  }

  return { kind: 'canvas', canvas, metaDpi: config.renderDPI };
}

/** Blob URL — used for A4 sheet pages. */
export async function canvasToPngBlobUrl(canvas: HTMLCanvasElement, metaDpi: number): Promise<string> {
  const pngWithDpi = injectPngDpi(await canvasToPngBuffer(canvas), metaDpi);
  return URL.createObjectURL(new Blob([pngWithDpi], { type: 'image/png' }));
}

/** Export a rendered layout page, upscaling to target DPI when possible. */
export async function canvasToPngBlobUrlForPrint(
  canvas: HTMLCanvasElement,
  config: PrintDpiConfig
): Promise<string> {
  const exported = await exportLayoutCanvas(canvas, config);
  if (exported.kind === 'buffer') {
    const pngWithDpi = injectPngDpi(exported.pngBuffer, exported.metaDpi);
    return URL.createObjectURL(new Blob([pngWithDpi], { type: 'image/png' }));
  }
  return canvasToPngBlobUrl(exported.canvas, exported.metaDpi);
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
