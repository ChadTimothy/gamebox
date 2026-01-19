import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Word Challenge E2E testing
 * Tests the MCP server endpoints and game functionality
 */
export default defineConfig({
  testDir: './e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: 'html',

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:8000',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
  },

  /* Configure projects for different browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-widget',
      testMatch: '**/widget-*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4444',
      },
    },
  ],

  /* Run your local dev servers before starting the tests */
  webServer: [
    {
      command: 'cd server && npm run dev',
      url: 'http://localhost:8000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'cd web && npm run dev',
      url: 'http://localhost:4444',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
