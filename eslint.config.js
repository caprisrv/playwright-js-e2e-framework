import eslint from '@eslint/js';
import playwright from 'eslint-plugin-playwright';

export default [
  eslint.configs.recommended,

  {
    files: ['**/*.js'],
    ignores: ['node_modules/**', 'test-results/**', 'playwright-report/**', 'blob-report/**'],
    plugins: {
      playwright,
    },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
    },
  },
];
