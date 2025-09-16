// eslint.config.js
import { defineConfig, globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['**/dist/**', '**/.astro/**']),
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        IntersectionObserver: 'readonly',
        // Cypress globals
        cy: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        expect: 'readonly',
      },
    },
    plugins: {
      import: importPlugin,
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
      'import/no-unresolved': 'off', // Disabled due to module resolution issues
      'import/no-absolute-path': 'error',
      'import/no-self-import': 'error',
      'import/no-cycle': 'warn',
      'import/no-useless-path-segments': 'error',
      'import/order': [
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
]);
