import { defineConfig, devices } from '@playwright/test';

/**
 * Web end-to-end tests (ADR-0020). Exports apps/web as a static single-page app with the in-app
 * mock API on, serves it locally, and drives it in Chromium (all three engines with --project).
 * Selectors use the same testIDs as the Maestro flows (React Native Web renders `data-testid`).
 */
const PORT = 4173;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `pnpm --filter @starter/web exec expo export --platform web --output-dir ../../e2e/web/.dist && node serve.mjs .dist ${PORT}`,
    cwd: __dirname,
    env: { EXPO_PUBLIC_API_MOCKS: 'true', EXPO_PUBLIC_APP_VARIANT: 'development', CI: '1' },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
