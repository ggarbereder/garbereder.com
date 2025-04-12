export default {
  semi: true,
  tabWidth: 2,
  printWidth: 80,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};
