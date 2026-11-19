import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const { adresSerwisu } = JSON.parse(readFileSync(path.resolve(__dirname, '../konfiguracja/boxes.json'), 'utf8'));

export default defineConfig({
  testDir: '.',
  testMatch: process.env.ADMIN ? ['admin.spec.ts'] : ['przypadki.spec.ts'],
  timeout: 120_000,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: `../dowody/e2e-wynik${process.env.ADMIN ? '-admin' : ''}.json` }]],
  outputDir: '/tmp/boxes-e2e-wyniki',
  use: {
    baseURL: process.env.ADRES ?? `https://${adresSerwisu}`,
    acceptDownloads: true,
    testIdAttribute: 'data-test',
  },
  projects: [
    { name: 'komputer', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'telefon', use: { ...devices['iPhone 13'], viewport: { width: 375, height: 812 }, defaultBrowserType: 'chromium' } },
  ],
});
