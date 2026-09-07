// @ts-check
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import { imagetools } from 'vite-imagetools';
import istanbul from 'vite-plugin-istanbul';

// https://astro.build/config
export default defineConfig({
  // Astro 7 default is 'jsx', which collapses "30</strong> or <strong>60".
  compressHTML: true,
  integrations: [preact()],

  fonts: [
    {
      name: 'Quicksand',
      provider: fontProviders.google(),
      cssVariable: '--font-quicksand',
    },
    {
      name: 'Fraunces',
      provider: fontProviders.google(),
      cssVariable: '--font-fraunces',
      weights: ['300', '400', '600'],
      styles: ['normal', 'italic'],
    },
  ],

  server: { host: true, port: 4321 },

  vite: {
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
    plugins: [
      tailwindcss(),
      imagetools(),
      istanbul({
        include: 'src/**/*',
        exclude: ['node_modules', 'cypress'],
        extension: ['.js', '.ts', '.jsx', '.tsx', '.astro'],
        cypress: true,
        requireEnv: true,
      }),
    ],
  },
});
