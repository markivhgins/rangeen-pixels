/**
 * vite.config.js
 * ─────────────────────────────────────────────────────────────
 * Bundles the modular frontend JS + CSS.
 * In dev mode, proxies /api calls to the Express backend.
 * ─────────────────────────────────────────────────────────────
 */

import { defineConfig } from 'vite';
import { resolve }      from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: '.',              // index.html is at project root
  publicDir: 'public',   // static assets (favicon, robots.txt, etc.)

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      // During development, forward /api calls to Express
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
