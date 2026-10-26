import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('header', () => {
  test('shows portrait, name, description and navigation', async ({ page }) => {
    await expect(page.locator('img#portrait')).toBeVisible();
    await expect(page.locator('h1')).toHaveText(/Gerrit\s+Garbereder/);
    await expect(page.locator('h1 .text-orange-500')).toHaveText(
      /Gerrit\s+Garbereder/
    );
    await expect(page.locator('header p')).toContainText(
      'Senior Engineering Manager'
    );

    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    const links = nav.getByRole('link');
    await expect(links.nth(0)).toHaveText('Resumé');
    await expect(links.nth(0)).toHaveAttribute('href', '#cv');
    await expect(links.nth(1)).toHaveText('Start at :05');
    await expect(links.nth(1)).toHaveAttribute('href', '//start-at-05.com/');
    await expect(links.nth(1)).toHaveAttribute('target', '_blank');
  });

  test('particle canvas is decorative and does not block the pointer', async ({
    page,
  }) => {
    const canvas = page.locator('header #particle-canvas');
    await expect(canvas).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas).toHaveCSS('pointer-events', 'none');
  });
});

test.describe('portrait', () => {
  test('has alt text, loads eagerly for LCP and is responsive', async ({
    page,
  }) => {
    const portrait = page.locator('img#portrait');
    await expect(portrait).toHaveAttribute(
      'alt',
      'Portrait of Gerrit Garbereder'
    );
    await expect(portrait).toHaveAttribute('loading', 'eager');
    await expect(portrait).toHaveAttribute('fetchpriority', 'high');
    await expect(portrait).toHaveAttribute('srcset', /256w.*845w/);
    await expect(portrait).toHaveAttribute('sizes', /256px/);
    expect(
      await portrait.evaluate((img: HTMLImageElement) => img.naturalWidth)
    ).toBeGreaterThan(0);
  });

  test('loads the AVIF version', async ({ page }) => {
    const current = await page
      .locator('img#portrait')
      .evaluate((img: HTMLImageElement) => img.currentSrc);
    expect(current).toMatch(/\.avif$/);
  });

  test('is preloaded from the head with the same AVIF srcset', async ({
    page,
  }) => {
    const srcset = await page
      .locator('picture source[type="image/avif"]')
      .getAttribute('srcset');
    const preload = page.locator(
      'link[rel="preload"][as="image"][type="image/avif"]'
    );
    await expect(preload).toHaveCount(1);
    await expect(preload).toHaveAttribute('imagesrcset', srcset ?? '');
  });
});

test.describe('resume', () => {
  test('is a labelled section with six entries', async ({ page }) => {
    await expect(
      page.locator('section#cv[aria-labelledby="cv-heading"]')
    ).toHaveCount(1);
    await expect(page.locator('#cv-heading')).toContainText('Experience');
    await expect(page.locator('#cv ol li')).toHaveCount(6);
  });

  test('every entry has a date, title and description', async ({ page }) => {
    for (const li of await page.locator('#cv ol li').all()) {
      await expect(li.locator('.bullet')).toHaveCount(1);
      await expect(li.locator('.job-date')).toHaveText(
        /^20\d{2}\s[–-]\s(Present|20\d{2})$/
      );
      await expect(li.locator('.job-title')).not.toBeEmpty();
      expect(await li.locator('.job-description p').count()).toBeGreaterThan(0);
    }
  });

  test('entries are newest first', async ({ page }) => {
    const starts = (await page.locator('#cv .job-date').allTextContents()).map(
      (d) => Number(d.trim().slice(0, 4))
    );
    expect(starts).toEqual([...starts].sort((a, b) => b - a));
  });
});

test.describe('patents', () => {
  test('is a labelled section listing patents', async ({ page }) => {
    await expect(page.locator('#patents')).toHaveAttribute(
      'aria-labelledby',
      'patents-heading'
    );
    await expect(page.locator('#patents-heading')).toContainText('Patents');
    for (const li of await page.locator('#patents ul li').all()) {
      await expect(li).toHaveText(/US\d+/);
      await expect(li).toHaveText(/20\d{2}/);
      expect(
        await li.locator('a[href*="patents.google.com"]').count()
      ).toBeGreaterThan(0);
    }
  });

  test('US12197614B1 links to Google Patents in a new tab', async ({
    page,
  }) => {
    const link = page.locator(
      '#patents a[href="https://patents.google.com/patent/US12197614B1"]'
    );
    await expect(link.locator('span').first()).toContainText('US12197614B1');
    await expect(link).toContainText('2025');
    await expect(link).toContainText(
      'Stateless system to enable data breach lookup'
    );
    await expect(link).toContainText('Privacy-preserving system');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('rel', /noreferrer/);
  });
});

test.describe('testimonials', () => {
  test('every slide has a quote and an attribution', async ({ page }) => {
    await expect(
      page.locator('section[aria-labelledby="testimonials-heading"]')
    ).toHaveCount(1);
    const slides = page.locator('.testimonial-slide');
    await expect(slides).toHaveCount(3);
    for (const slide of await slides.all()) {
      await expect(
        slide.locator('blockquote.testimonial-blockquote .testimonial-text')
      ).not.toBeEmpty();
      await expect(slide.locator('.testimonial-source')).not.toBeEmpty();
    }
  });

  test('controls are labelled', async ({ page }) => {
    await expect(page.locator('.testimonials-viewport')).toHaveAttribute(
      'aria-label',
      'Testimonials carousel'
    );
    await expect(
      page.getByRole('group', { name: 'Slideshow controls' })
    ).toBeVisible();
    await expect(page.locator('.testimonials-prev')).toHaveAttribute(
      'aria-label',
      'Previous testimonial'
    );
    await expect(page.locator('.testimonials-next')).toHaveAttribute(
      'aria-label',
      'Next testimonial'
    );
    await expect(page.locator('.testimonials-dots')).toHaveAttribute(
      'role',
      'tablist'
    );
    await expect(page.locator('.testimonials-dot')).toHaveCount(3);
  });
});

test.describe('contact', () => {
  test('shows email and phone', async ({ page }) => {
    await expect(
      page.locator('a[href="mailto:gerrit@garbereder.com"]')
    ).toHaveText('Gerrit@Garbereder.com');
    await expect(page.locator('a[href="tel:+37069456497"]')).toHaveText(
      '+370 6 945 6497'
    );
  });

  test('social links are labelled icons', async ({ page }) => {
    for (const [href, name] of [
      [
        'https://www.linkedin.com/in/gerrit-garbereder-a74b6a96/',
        'Follow me on LinkedIn',
      ],
      [
        'https://github.com/ggarbereder/garbereder.com',
        'See my work on GitHub',
      ],
      [
        'https://keys.openpgp.org/search?q=gerrit%40garbereder.com',
        'View my PGP public key',
      ],
    ] as const) {
      const link = page.locator(`a[href="${href}"]`);
      await expect(link).toHaveAttribute('aria-label', name);
      await expect(link.locator('svg')).toHaveCount(1);
    }
  });

  test('credits the icons and links the accessibility statement', async ({
    page,
  }) => {
    await expect(page.locator('footer div.text-xs a')).toHaveCount(5);
    for (const href of [
      '//icons8.com/icon/84888/linkedin',
      '//icons8.com/icon/20675/github',
      '//icons8.com/icon/s51tEydjGlsF/key',
      '//icons8.com',
    ])
      await expect(page.locator(`a[href="${href}"]`)).toHaveCount(1);
    await expect(page.locator('a[href="/accessibility/"]')).toHaveText(
      'Accessibility'
    );
  });
});

test('skip link targets the main landmark', async ({ page }) => {
  await expect(page.locator('a[href="#main-content"]')).toHaveText(
    'Skip to main content'
  );
  await expect(page.locator('main#main-content')).toHaveCount(1);
});

test.describe('responsive layout', () => {
  test('portrait sits above the text on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('header .flex-col-reverse')).toHaveCSS(
      'flex-direction',
      'column-reverse'
    );
    await expect(page.locator('img#portrait')).toBeVisible();
    await expect(page.locator('header nav a').first()).toBeVisible();
  });

  test('portrait sits beside the text from the xl breakpoint', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('header .flex-col-reverse')).toHaveCSS(
      'flex-direction',
      'row'
    );
    await expect(page.locator('header nav a').first()).toBeVisible();
  });
});
