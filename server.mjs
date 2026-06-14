#!/usr/bin/env node
/**
 * Production server: static dist + COOP/COEP + imgly asset proxy.
 * Usage: npm run build && npm start
 */
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const LOCAL_ASSETS = path.join(DIST, 'bg-removal-assets');
const IMGLY_CDN = 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist';
const PORT = Number(process.env.PORT) || 4173;

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('Missing dist/index.html — run npm run build first.');
  process.exit(1);
}

const app = express();

app.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

/** Same-origin imgly assets (bundled or proxied with CORP for WASM/COEP). */
app.use('/bg-removal-assets', async (req, res, next) => {
  const rel = req.path.replace(/^\//, '');
  const localFile = path.join(LOCAL_ASSETS, rel);

  if (rel && fs.existsSync(localFile) && fs.statSync(localFile).isFile()) {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return res.sendFile(localFile);
  }

  const cdnUrl = `${IMGLY_CDN}/${rel}`;
  try {
    const upstream = await fetch(cdnUrl);
    if (!upstream.ok) {
      res.status(upstream.status).send(`Asset not found: ${rel}`);
      return;
    }
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    const type = upstream.headers.get('content-type');
    if (type) res.setHeader('Content-Type', type);
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.send(buf);
  } catch (err) {
    next(err);
  }
});

app.use((req, res, next) => {
  if (
    req.path === '/sw.js' ||
    req.path === '/manifest.webmanifest' ||
    req.path.startsWith('/workbox-')
  ) {
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
});

app.use(express.static(DIST, { index: false }));

app.get('*', (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  const hasLocal = fs.existsSync(path.join(LOCAL_ASSETS, 'resources.json'));
  console.log(`SnapID Studio → http://localhost:${PORT}`);
  console.log(
    hasLocal
      ? 'Background removal assets: bundled in dist/bg-removal-assets/'
      : 'Background removal assets: proxied from imgly CDN at /bg-removal-assets/'
  );
});
