import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { Plugin } from 'vite';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { PWA_MANIFEST } from './src/config/pwa';

/** SPA fallback for `vite preview` — direct URL loads must serve index.html. */
function spaPreviewFallback(): Plugin {
  return {
    name: 'spa-preview-fallback',
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        const isGet = req.method === 'GET' || req.method === 'HEAD';
        const hasExtension = /\.[a-zA-Z0-9]+$/.test(url);
        const isAssetPath =
          url.startsWith('/assets/') ||
          url.startsWith('/bg-removal-assets/') ||
          url === '/sw.js' ||
          url === '/manifest.webmanifest' ||
          url.startsWith('/workbox-');

        if (isGet && !hasExtension && !isAssetPath) {
          req.url = '/index.html';
        }
        next();
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      spaPreviewFallback(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.svg', 'robots.txt', 'sitemap.xml'],
        manifest: PWA_MANIFEST,
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/bg-removal-assets\//],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              urlPattern: /\/bg-removal-assets\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'bg-removal-assets',
                expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.AI_MODEL': JSON.stringify(env.AI_MODEL),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      exclude: ['@huggingface/transformers'],
    },
    worker: {
      format: 'es',
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Required by @imgly/background-removal (SharedArrayBuffer / WASM threads)
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
      // Same-origin proxy avoids CDN fetch failures (ad blockers, CORP, offline)
      proxy: {
        '/bg-removal-assets': {
          target: `https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist`,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/bg-removal-assets/, ''),
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.headers['cross-origin-resource-policy'] = 'cross-origin';
            });
          },
        },
      },
    },
    preview: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
      proxy: {
        '/bg-removal-assets': {
          target: `https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist`,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/bg-removal-assets/, ''),
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.headers['cross-origin-resource-policy'] = 'cross-origin';
            });
          },
        },
      },
    },
  };
});
