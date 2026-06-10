#!/usr/bin/env node
/**
 * Runs automatically before `npm run build` (npm prebuild lifecycle).
 * Ensures imgly WASM/ONNX assets exist in public/bg-removal-assets/.
 *
 * Skip download (CDN/proxy at runtime): SKIP_BG_REMOVAL_ASSETS=1 npm run build
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const setupScript = path.join(__dirname, 'setup-bg-removal.mjs');

if (process.env.SKIP_BG_REMOVAL_ASSETS === '1') {
  console.log('prebuild: SKIP_BG_REMOVAL_ASSETS=1 — skipping bg-removal asset download');
  process.exit(0);
}

console.log('prebuild: ensuring background removal assets…');

const result = spawnSync(process.execPath, [setupScript], {
  stdio: 'inherit',
  env: process.env,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
