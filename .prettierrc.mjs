export default {
  singleQuote: true,
  trailingComma: 'es5',
  plugins: ['prettier-plugin-astro'],
  // Must mirror compressHTML in astro.config.mjs so formatting never changes rendered whitespace.
  astroCompressHTML: 'html',
  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
};
