// @ts-check
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import { imagetools } from 'vite-imagetools';
import istanbul from 'vite-plugin-istanbul';

// https://astro.build/config
export default defineConfig({
  // Astro 7 changed the compressHTML default from `true` to `'jsx'`, which
  // strips whitespace *around* inline elements (JSX rules) and collapsed
  // meaningful spaces like "30</strong> or <strong>60". Keep the v6
  // HTML-aware behaviour.
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

  server: {
    host: true, // listen on all addresses (helps avoid localhost resolution issues on Windows)
    port: 4321,
  },

  vite: {
    css: {
      preprocessorOptions: {
        // Astro 7 (rolldown-vite) no longer adds node_modules to dart-sass's
        // load path, so `@use 'tailwindcss'` in src/styles/index.scss can't
        // resolve. Restore it explicitly.
        scss: { loadPaths: ['node_modules'] },
      },
    },
    // @ts-ignore - Plugin compatibility issues with newer Vite versions
    plugins: [
      tailwindcss(),
      imagetools(),
      istanbul({
        include: 'src/**/*',
        exclude: ['node_modules', 'cypress'],
        extension: ['.js', '.ts', '.jsx', '.tsx', '.astro'],
        cypress: true,
        requireEnv: true,
        forceBuildInstrument: false,
      }),
    ],
  },
});
