import { defineConfig, devices } from '@playwright/test';

// Shared by every app, so CI can run the same projects per engine:
// chromium = desktop, mobile, reflow; firefox = firefox; webkit = iphone.
// Content, SEO and icon tests only check markup and files, so one browser is enough (desktopOnly).
// Some tests run once per engine (perEngine); a11y runs everywhere.
// Visual baselines are taken on desktop and mobile Chromium only.
const visual = /visual\.spec\.ts/;

/**
 * @param {{ port: number, desktopOnly: RegExp, perEngine: RegExp }} options
 *   port: its own port, so a running `astro dev` on 4321 is never reused by mistake
 */
export function defineSiteConfig({ port, desktopOnly, perEngine }) {
  return defineConfig({
    testDir: 'tests',
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: [['list'], ['html', { open: 'never' }]],
    // Run against the production build (npm run build first), not the dev server.
    webServer: {
      command: `npm run preview -- --port ${port}`,
      url: `http://localhost:${port}`,
      reuseExistingServer: !process.env.CI,
    },
    use: { baseURL: `http://localhost:${port}` },
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
}
