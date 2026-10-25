import { defineConfig, devices } from '@playwright/test';

// Content, SEO and icon tests only check markup and files, so one browser is enough.
// The CSP and interaction tests run once per engine (Chromium, Firefox, WebKit); a11y runs everywhere.
// Visual baselines are taken on desktop and mobile Chromium only.
const desktopOnly = /(home|start-at-05|seo|icons)\.spec\.ts/;
const perEngine = /(csp|interactions)\.spec\.ts/;
const visual = /visual\.spec\.ts/;

export default defineConfig({
  testDir: 'tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  // Run against the production build (npm run build first), not the dev server
  webServer: {
    command: 'npm run preview -- --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
  use: { baseURL: 'http://localhost:4321' },
  expect: {
    // Real layout regressions are far larger (the Astro 7 whitespace collapse was 8%)
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 800 },
      },
      testIgnore: [desktopOnly, visual],
    },
    {
      name: 'iphone',
      use: { ...devices['iPhone 14'] },
      testIgnore: [desktopOnly, visual],
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      testIgnore: [desktopOnly, perEngine],
    },
    {
      name: 'reflow',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 320, height: 640 },
      },
      testIgnore: [desktopOnly, perEngine, visual],
    },
  ],
});
