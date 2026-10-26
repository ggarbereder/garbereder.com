import { expect, test } from '@playwright/test';

import { pages } from './pages';

// Icons are linked with absolute paths, so they also resolve on subpages
for (const { path } of pages) {
  test(`favicon, touch icon and manifest are linked and load on ${path}`, async ({
    page,
    request,
  }) => {
    await page.goto(path);
    const hrefs = await page.$$eval(
      'link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]',
      (ls) => ls.map((l) => l.getAttribute('href')!)
    );
    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/favicon.ico',
        '/apple-touch-icon.png',
        '/site.webmanifest',
      ])
    );
    for (const href of hrefs)
      expect(
        (await request.get(new URL(href, page.url()).href)).ok(),
        href
      ).toBe(true);
  });
}

test('manifest icons load', async ({ request }) => {
  const manifest = await (await request.get('/site.webmanifest')).json();
  for (const icon of manifest.icons)
    expect((await request.get(icon.src)).ok(), icon.src).toBe(true);
});
