// @ts-check
import { defineConfig } from 'astro/config';

import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { imagetools } from 'vite-imagetools';

// https://astro.build/config
export default defineConfig({
  integrations: [preact()],

  vite: {
    plugins: [
      tailwindcss(),
      imagetools()
    ]
  }
});