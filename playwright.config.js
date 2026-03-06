// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/style-regression',
  outputDir: './tests/style-regression/test-results',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'tests/style-regression/report.json' }],
  ],
  use: {
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    screenshot: 'off',
    trace: 'off',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 812 },
      },
    },
  ],
});
