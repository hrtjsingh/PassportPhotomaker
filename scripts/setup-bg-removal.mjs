#!/usr/bin/env node
/**
 * Downloads @imgly/background-removal WASM + ONNX assets for offline / same-origin serving.
 * Run once: npm run setup:bg-removal
 */
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { pipeline } from 'stream/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const VERSION = '1.7.0';
const OUT_DIR = path.join(ROOT, 'public', 'bg-removal-assets');
const MARKER = path.join(OUT_DIR, 'resources.json');
const URL = `https://staticimgly.com/@imgly/background-removal-data/${VERSION}/package.tgz`;
const TGZ = path.join(ROOT, '.cache', 'background-removal-data.tgz');

if (existsSync(MARKER)) {
  console.log('Background removal assets already present at public/bg-removal-assets/');
  process.exit(0);
}

mkdirSync(path.dirname(TGZ), { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

console.log(`Downloading background removal assets (~270 MB)...`);
console.log(`Source: ${URL}`);

const res = await fetch(URL);
if (!res.ok) {
  console.error(`Download failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}

await pipeline(res.body, createWriteStream(TGZ));
console.log('Extracting...');

execSync(`tar -xzf "${TGZ}" -C "${OUT_DIR}" --strip-components=2 package/dist`, {
  stdio: 'inherit',
});

console.log('Done. Assets are in public/bg-removal-assets/');
