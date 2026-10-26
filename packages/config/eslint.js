import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import importXPlugin from 'eslint-plugin-import-x';
import tseslint from 'typescript-eslint';

const browser = {
  window: 'readonly',
  document: 'readonly',
  IntersectionObserver: 'readonly',
  AbortController: 'readonly',
  CustomEvent: 'readonly',
  Event: 'readonly',
  setTimeout: 'readonly',
  requestAnimationFrame: 'readonly',
};

export default defineConfig([
  globalIgnores([
    '**/dist/**',
    '**/.astro/**',
    '**/.wrangler/**',
    '**/playwright-report/**',
    '**/test-results/**',
  ]),
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      globals: browser,
    },
    plugins: {
      'import-x': importXPlugin,
    },
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-alert': 'warn',
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'import-x/no-unresolved': 'off',
      'import-x/no-absolute-path': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-cycle': 'warn',
      'import-x/no-useless-path-segments': 'error',
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: { 'no-undef': 'off' },
  },
  {
    // Declarations name parameters only to document them
    files: ['**/*.d.ts'],
    rules: { 'no-unused-vars': 'off' },
  },
  {
    // Tool config (Astro, Playwright, …) runs in Node
    files: ['**/*.config.{js,mjs,cjs}', 'packages/config/**/*.js'],
    languageOptions: {
      globals: { process: 'readonly', URL: 'readonly' },
    },
  },
  {
    files: ['scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly' },
    },
    rules: { 'no-console': 'off' },
  },
  eslintConfigPrettier,
]);
