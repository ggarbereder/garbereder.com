// @ts-check
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { imagetools } from 'vite-imagetools';

// https://astro.build/config
export default defineConfig({
  integrations: [preact()],

  vite: {
    // @ts-ignore - Plugin compatibility issues with newer Vite versions
    plugins: [tailwindcss(), imagetools()],
  },
});
