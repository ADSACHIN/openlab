import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for OPENLAB.
 *
 * - `tests/e2e`           : end-to-end user journeys
 * - `tests/accessibility` : axe-core audits (project "accessibility")
 *
 * The dev server is started automatically unless PLAYWRIGHT_BASE_URL is set,
 * which lets CI run against the production `dist/` preview instead.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173/openlab/';

export default defineConfig({
  testDir: './tests',
  testMatch: ['e2e/**/*.spec.ts', 'accessibility/**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Capped everywhere: more parallel browsers saturate a laptop and cause false 30 s timeouts (seen at 3 workers with ~60 tests).
  workers: 2,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', testDir: './tests/e2e', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testDir: './tests/e2e', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-chrome', testDir: './tests/e2e', use: { ...devices['Pixel 7'] } },
    {
      name: 'accessibility',
      testDir: './tests/accessibility',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
