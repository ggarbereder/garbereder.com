import { expect, test } from '@playwright/test';

import { notFound, pages, scrollThrough, site } from './pages';

for (const { path, canonical } of pages) {
  test.describe(`seo ${path}`, () => {
    test('head: canonical, title, description, share image, structured data', async ({
      page,
      request,
    }) => {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        canonical
      );
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        'content',
        canonical
      );
      await expect(page).toHaveTitle(/Start at :05/);

      const description = (await page
        .locator('meta[name="description"]')
        .getAttribute('content'))!;
      expect(description.length).toBeGreaterThan(70);
      expect(description.length).toBeLessThanOrEqual(160);

      const image = (await page
        .locator('meta[property="og:image"]')
        .getAttribute('content'))!;
      expect((await request.get(new URL(image).pathname)).ok()).toBe(true);

      const json = JSON.parse(
        (await page
          .locator('script[type="application/ld+json"]')
          .textContent())!
      );
      expect(json['@type']).toBe('WebSite');
      expect(json.url).toBe(`${site}/`);
    });

    test('no failed requests (images, fonts, styles)', async ({ page }) => {
      const failed: string[] = [];
      page.on(
        'response',
        (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`)
      );
      await page.goto(path);
      await scrollThrough(page);
      await page.waitForLoadState('networkidle');
      expect(failed).toEqual([]);
    });
  });
}

test('sitemap lists exactly the canonical URLs on this site', async ({
  request,
}) => {
  const xml = await (await request.get('/sitemap-0.xml')).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs.sort()).toEqual(
    pages
      .map((p) => p.canonical)
      .filter((url) => url.startsWith(site))
      .sort()
  );
});

test('robots.txt points to the sitemap index', async ({ request }) => {
  expect(await (await request.get('/robots.txt')).text()).toContain(
    `Sitemap: ${site}/sitemap-index.xml`
  );
});

// Hidden in dist/, so CI must carry it through the build artifact (include-hidden-files)
test('security.txt is served, canonical to this site and not about to expire', async ({
  request,
}) => {
  const response = await request.get('/.well-known/security.txt');
  expect(response.ok()).toBe(true);
  const text = await response.text();
  expect(text).toContain(`Canonical: ${site}/.well-known/security.txt`);
  const expires = Date.parse(text.match(/^Expires: (.+)$/m)![1]!);
  // RFC 9116 wants it renewed before it lapses; fail a month early to leave time for that
  expect(expires - Date.now()).toBeGreaterThan(30 * 24 * 60 * 60 * 1000);
});

test('unknown URLs get the 404 page, kept out of search results', async ({
  page,
}) => {
  const response = await page.goto(notFound.path);
  expect(response!.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Page not found');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex'
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});
