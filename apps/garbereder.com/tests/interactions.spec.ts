import { expect, test, type Page } from '@playwright/test';

import { scrollThrough } from './pages';

const dotIndex = (page: Page) =>
  page
    .locator('.testimonials-dot')
    .evaluateAll((dots) =>
      dots.findIndex((d) => d.getAttribute('aria-selected') === 'true')
    );

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('scroll reveal', () => {
  test('jobs start hidden and fade in when scrolled into view', async ({
    page,
  }) => {
    const jobs = page.locator('.job');
    await expect(jobs.first()).toHaveClass(/\bopacity-0\b/);
    await expect(jobs.first()).not.toHaveClass(/\bopacity-100\b/);

    await jobs.first().scrollIntoViewIfNeeded();
    await expect(jobs.first()).toHaveClass(/\bopacity-100\b/);
  });

  test('every job is revealed after scrolling through and stays revealed', async ({
    page,
  }) => {
    await scrollThrough(page);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    for (const job of await page.locator('.job').all())
      await expect(job).toHaveClass(/\bopacity-100\b/);
  });
});

test.describe('particles', () => {
  // resize() sets canvas.width to its rendered width; 300px is the HTML default
  test('the canvas is sized to the header', async ({ page }) => {
    await expect
      .poll(() =>
        page
          .locator('#particle-canvas')
          .evaluate((c: HTMLCanvasElement) => c.width)
      )
      .toBe(
        await page
          .locator('#particle-canvas')
          .evaluate((c: HTMLCanvasElement) => c.offsetWidth)
      );
  });

  test('do not start with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    expect(
      await page
        .locator('#particle-canvas')
        .evaluate((c: HTMLCanvasElement) => c.width)
    ).toBe(300);
  });
});

test.describe('portrait tilt', () => {
  test.skip(({ isMobile }) => isMobile, 'Needs a mouse');

  const transform = (page: Page) =>
    page
      .locator('.portrait-glow-wrapper')
      .evaluate((el: HTMLElement) => el.style.transform);

  test('tilts towards the mouse and settles when it leaves', async ({
    page,
  }) => {
    await page.mouse.move(400, 200);
    await page.mouse.move(420, 220);
    await expect.poll(() => transform(page)).not.toBe('');
    await page.locator('header').dispatchEvent('mouseleave');
    await expect.poll(() => transform(page), { timeout: 3000 }).toBe('');
  });

  test('stays still with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.mouse.move(400, 300);
    await page.mouse.move(420, 320);
    await page.waitForTimeout(200);
    expect(await transform(page)).toBe('');
  });
});

test.describe('testimonials', () => {
  test.beforeEach(async ({ page }) => {
    await page.locator('.testimonials-slideshow').scrollIntoViewIfNeeded();
  });

  test('starts on the first slide with Previous disabled', async ({ page }) => {
    expect(await dotIndex(page)).toBe(0);
    await expect(page.locator('.testimonials-prev')).toBeDisabled();
    await expect(page.locator('.testimonials-next')).toBeEnabled();
  });

  test('each slide fills the carousel and is fully shown when selected', async ({
    page,
  }) => {
    const viewport = page.locator('.testimonials-viewport');
    for (const [i, dot] of (
      await page.locator('.testimonials-dot').all()
    ).entries()) {
      await dot.click();
      await expect.poll(() => dotIndex(page)).toBe(i);
      const slide = page.locator('.testimonial-slide').nth(i);
      // The slide lies inside the carousel once its scroll has settled
      await expect
        .poll(async () => {
          const [s, v] = await Promise.all([
            slide.boundingBox(),
            viewport.boundingBox(),
          ]);
          return s!.x >= v!.x - 1 && s!.x + s!.width <= v!.x + v!.width + 1;
        })
        .toBe(true);
      const [slideBox, viewportBox] = await Promise.all([
        slide.boundingBox(),
        viewport.boundingBox(),
      ]);
      expect(slideBox!.width).toBeGreaterThan(viewportBox!.width * 0.8);
    }
  });

  test('Next and Previous move one slide and disable at the ends', async ({
    page,
  }) => {
    const next = page.locator('.testimonials-next');
    const prev = page.locator('.testimonials-prev');
    await next.click();
    await expect.poll(() => dotIndex(page)).toBe(1);
    await next.click();
    await expect.poll(() => dotIndex(page)).toBe(2);
    await expect(next).toBeDisabled();
    await prev.click();
    await expect.poll(() => dotIndex(page)).toBe(1);
  });

  test('scrolling the carousel by hand updates the dots', async ({ page }) => {
    await page
      .locator('.testimonials-viewport')
      .evaluate((v) =>
        v.scrollTo({ left: v.scrollWidth, behavior: 'instant' })
      );
    await expect.poll(() => dotIndex(page)).toBe(2);
  });

  test('arrow keys navigate while the carousel is on screen', async ({
    page,
  }) => {
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => dotIndex(page)).toBe(1);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => dotIndex(page)).toBe(0);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    expect(await dotIndex(page)).toBe(0);
  });

  test('arrow keys do nothing while the carousel is off screen', async ({
    page,
  }) => {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    expect(await dotIndex(page)).toBe(0);
  });
});
