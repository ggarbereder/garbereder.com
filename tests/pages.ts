import type { Page } from '@playwright/test';

export const site = 'https://www.garbereder.com';

type SitePage = { path: string; canonical: string };

/** Every page; /start-at-05/ is served on start-at-05.com by workers/start-at-05-proxy */
export const pages: SitePage[] = [
  { path: '/', canonical: `${site}/` },
  { path: '/accessibility/', canonical: `${site}/accessibility/` },
  { path: '/start-at-05/', canonical: 'https://start-at-05.com/' },
];

/** Any unknown URL renders the 404 page */
export const notFound = { path: '/does-not-exist/' };

/** Scroll down one screen at a time so every scroll-triggered reveal runs, ending at the bottom */
export async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  const step = page.viewportSize()!.height;
  for (let y = 0; y < height; y += step) {
    await page.evaluate(
      (top) => window.scrollTo({ top, behavior: 'instant' }),
      y
    );
    await page.waitForTimeout(50);
  }
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
  );
}
