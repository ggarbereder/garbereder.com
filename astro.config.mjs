// @ts-check
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { imagetools } from 'vite-imagetools';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.garbereder.com',
  // Astro 7 default is 'jsx', which collapses "30</strong> or <strong>60".
  compressHTML: true,
  integrations: [
    preact(),
    // /start-at-05/ is canonical on start-at-05.com, so it is not listed here.
    sitemap({ filter: (page) => !page.includes('/start-at-05/') }),
  ],

  build: {
    // Never inline styles or scripts, so the Content-Security-Policy can stay at 'self'
    inlineStylesheets: 'never',
  },

  server: { host: true, port: 4321 },

  vite: {
    build: { assetsInlineLimit: 0 },
    css: {
      preprocessorOptions: {
        // rolldown-vite dropped node_modules from the Sass load path.
        scss: { loadPaths: ['node_modules'] },
      },
    },
    // Vite 8's dep scanner defaults to React JSX and skips Babel.
    optimizeDeps: {
      rolldownOptions: {
        transform: {
          jsx: { runtime: 'automatic', importSource: 'preact' },
        },
      },
    },
    // @ts-ignore Vite plugin type mismatch
    plugins: [tailwindcss(), imagetools()],
  },
});
