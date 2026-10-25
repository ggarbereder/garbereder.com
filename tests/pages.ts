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

/** Scroll down half a screen at a time so every scroll-triggered reveal runs, ending at the bottom */
export async function scrollThrough(page: Page) {
  // The page's own innerHeight, which can be smaller than the emulated viewport on phones
  const { height, step } = await page.evaluate(() => ({
    height: document.body.scrollHeight,
    step: Math.floor(window.innerHeight / 2),
  }));
  for (let y = 0; y <= height; y += step) {
    await page.evaluate(async (top) => {
      window.scrollTo({ top, behavior: 'instant' });
      // IntersectionObserver callbacks run with rendering; wait two frames for them
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r))
      );
    }, y);
  }
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
  );
}
