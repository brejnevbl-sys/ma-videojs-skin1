import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: process.env.MA_PREVIEW_URL ?? 'http://127.0.0.1:4173',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {},
      },
    },
    // Existing CDP/touch regressions stay in Chromium; every engine runs the same unmocked desktop suite.
    { name: 'firefox', testMatch: /desktop\.spec\.ts/, use: { browserName: 'firefox' } },
    { name: 'webkit', testMatch: /desktop\.spec\.ts/, use: { browserName: 'webkit' } },
  ],
  webServer: process.env.MA_PREVIEW_URL ? undefined : {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/ma.html',
    reuseExistingServer: !process.env.CI,
  },
});
