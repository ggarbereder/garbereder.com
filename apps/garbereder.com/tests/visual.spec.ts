import { expect, test } from '@playwright/test';

// Baselines are per platform; CI keeps the Linux ones (update-visual-baselines workflow).
// Particles and tilt check prefers-reduced-motion, so they stay still.
test.use({ reducedMotion: 'reduce' });

test.beforeEach(async ({ page }) => {
  // Reveal every scroll-animated section before the screenshot
  await page.addInitScript(() => {
    window.IntersectionObserver = class {
      callback: IntersectionObserverCallback;
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }
      observe(target: Element) {
        this.callback(
          [{ isIntersecting: true, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver
        );
      }
      unobserve() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
  });
});

for (const [name, path] of [
  ['index', '/'],
  ['start-at-05', '/start-at-05/'],
] as const) {
  test(`${name} initial view`, { tag: '@visual' }, async ({ page }) => {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${name}-initial.png`, {
      stylePath: 'tests/visual.css',
    });
  });
}
