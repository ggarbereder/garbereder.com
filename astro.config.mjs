// @ts-check
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import { imagetools } from 'vite-imagetools';
import istanbul from 'vite-plugin-istanbul';

// https://astro.build/config
export default defineConfig({
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
