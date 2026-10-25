import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { notFound, pages, scrollThrough } from './pages';

const axe = (page: Page) =>
  new AxeBuilder({ page })
    .withTags([
      'wcag2a',
      'wcag2aa',
      'wcag21a',
      'wcag21aa',
      'wcag22aa',
      'best-practice',
    ])
    .analyze();

for (const { path } of [...pages, notFound]) {
  test.describe(path, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    // Sections fade in on scroll, so axe only sees their contrast once they are revealed
    test('axe: no violations at top and after scrolling through', async ({
      page,
    }) => {
      expect((await axe(page)).violations).toEqual([]);
      await scrollThrough(page);
      expect((await axe(page)).violations).toEqual([]);
    });

    test('one h1 and no skipped heading levels', async ({ page }) => {
      const levels = await page.$$eval('h1,h2,h3,h4,h5,h6', (hs) =>
        hs.map((h) => Number(h.tagName[1]))
      );
      expect(levels.filter((l) => l === 1)).toHaveLength(1);
      for (let i = 1; i < levels.length; i++)
        expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1);
    });

    test.describe('keyboard', () => {
      test.skip(
        ({ browserName }) => browserName === 'webkit',
        'WebKit, like Safari, does not Tab to links by default'
      );

      test('skip link is the first tab stop and moves to main', async ({
        page,
      }) => {
        await page.keyboard.press('Tab');
        const skipLink = page.locator('.skip-link');
        await expect(skipLink).toBeFocused();
        await expect(skipLink).toBeInViewport();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/#main-content$/);
        await expect(page.locator('#main-content')).toBeInViewport();
      });

      // An outline or a focus ring (a box-shadow that only appears on focus) both count
      test('every tab stop shows a focus indicator', async ({ page }) => {
        await page.$$eval('a[href], button, [tabindex]', (els) =>
          els.forEach((el) =>
            el.setAttribute('data-blur-shadow', getComputedStyle(el).boxShadow)
          )
        );
        const seen = new Set<string>();
        for (;;) {
          await page.keyboard.press('Tab');
          const focused = await page.evaluate(() => {
            const el = document.activeElement as HTMLElement | null;
            if (!el || el === document.body) return null;
            const style = getComputedStyle(el);
            return {
              id: el.outerHTML.slice(0, 120),
              visible:
                style.outlineStyle !== 'none' ||
                style.boxShadow !== el.getAttribute('data-blur-shadow'),
            };
          });
          // Focus left the page or wrapped around
          if (!focused || seen.has(focused.id)) break;
          seen.add(focused.id);
          expect(focused.visible, focused.id).toBe(true);
        }
        expect(seen.size).toBeGreaterThan(1);
      });
    });

    test('no horizontal scroll (reflow)', async ({ page }) => {
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        )
      ).toBeLessThanOrEqual(0);
    });

    test('reduced motion disables smooth scrolling', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      expect(
        await page.evaluate(
          () => getComputedStyle(document.documentElement).scrollBehavior
        )
      ).toBe('auto');
    });

    test('html has lang="en"', async ({ page }) => {
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    });
  });
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  // The nojs class stays on <html>, so content that would fade in is shown at once
  test('content that animates in is visible', async ({ page }) => {
    await page.goto('/');
    const animated = page.locator('.opacity-0.animate');
    expect(await animated.count()).toBeGreaterThan(0);
    for (const el of await animated.all())
      await expect(el).toHaveCSS('opacity', '1');
  });
});
