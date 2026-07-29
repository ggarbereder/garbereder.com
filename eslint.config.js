// eslint.config.js
import { defineConfig, globalIgnores } from 'eslint/config';
import importXPlugin from 'eslint-plugin-import-x';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['**/dist/**', '**/.astro/**', '**/workers/**']),
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      globals: {
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        HTMLButtonElement: 'readonly',
        Element: 'readonly',
        NodeListOf: 'readonly',
        IntersectionObserver: 'readonly',
        AbortController: 'readonly',
        setTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        KeyboardEvent: 'readonly',
        cy: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        expect: 'readonly',
      },
    },
    plugins: {
      'import-x': importXPlugin,
    },
    rules: {
      // Security-focused rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-alert': 'warn',
      'no-console': 'warn',
      'no-debugger': 'warn',

      // General code quality
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',

      // Import security
      'import-x/no-unresolved': 'off', // Disabled due to module resolution issues
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
    files: ['scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['cypress/**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: {
        cy: 'readonly',
        Cypress: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        expect: 'readonly',
      },
    },
  },
]);
