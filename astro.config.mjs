// @ts-check
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { imagetools } from 'vite-imagetools';
import istanbul from 'vite-plugin-istanbul';

// https://astro.build/config
export default defineConfig({
  integrations: [preact()],

  server: {
    host: true, // listen on all addresses (helps avoid localhost resolution issues on Windows)
    port: 4321,
  },

  vite: {
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
