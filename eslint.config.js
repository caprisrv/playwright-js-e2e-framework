import eslint from '@eslint/js';
import playwright from 'eslint-plugin-playwright';

export default [
  // Globally exclude generated files and dependencies.
  {
    ignores: [
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      'blob-report/**',
      'playwright/.cache/**',
    ],
  },

  eslint.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
        fetch: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      playwright,
    },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
    },
  },

  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
      },
    },
  },
];