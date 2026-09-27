import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from '@playwright/test';

dotenv.config();

const environment = process.env.ENVIRONMENT || 'qa';

const environmentFile = path.resolve(
  `config/environments/${environment}.json`,
);

if (!fs.existsSync(environmentFile)) {
  throw new Error(
    `Environment configuration not found: ${environment}`,
  );
}

const environmentConfig = JSON.parse(
  fs.readFileSync(environmentFile, 'utf-8'),
);

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: 0,

  reporter: [['html', { open: 'never' }]],

  use: {
    baseURL: environmentConfig.baseURL,
    headless: false,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // ...
});