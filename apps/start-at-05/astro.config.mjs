// @ts-check
import { fileURLToPath } from 'node:url';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://start-at-05.com',
  // Astro 7 default is 'jsx', which collapses "30</strong> or <strong>60".
  compressHTML: true,
  integrations: [sitemap()],

  build: {
    // Never inline styles or scripts, so the Content-Security-Policy can stay at 'self'
    inlineStylesheets: 'never',
  },

  server: { host: true, port: 4322 },

  vite: {
    build: { assetsInlineLimit: 0 },
    css: {
      preprocessorOptions: {
        // rolldown-vite dropped node_modules from the Sass load path; workspaces hoist packages to the repo root.
        scss: {
          loadPaths: [
            fileURLToPath(new URL('../../node_modules', import.meta.url)),
          ],
        },
      },
    },
    // @ts-ignore Vite plugin type mismatch
    plugins: [tailwindcss()],
  },
});
