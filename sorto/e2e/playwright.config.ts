import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: process.env.ADMIN ? ['admin.spec.ts'] : ['przypadki.spec.ts'],
  timeout: 120_000,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: `../dowody/e2e-wynik${process.env.ADMIN ? '-admin' : ''}.json` }]],
  outputDir: '/tmp/boxes-e2e-wyniki',
  use: {
    baseURL: process.env.ADRES ?? 'https://boxes.dev.sorto.ai',
    acceptDownloads: true,
    testIdAttribute: 'data-test',
  },
  projects: [
    { name: 'komputer', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'telefon', use: { ...devices['iPhone 13'], viewport: { width: 375, height: 812 }, defaultBrowserType: 'chromium' } },
  ],
});
