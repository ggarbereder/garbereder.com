import { expect, test, type Page } from '@playwright/test';

const policy = (page: Page) =>
  page.getByRole('group', { name: 'Copyable meeting policy' });

/** Replace the clipboard with one that records the text, or fails */
const stubClipboard = (page: Page, fail: boolean) =>
  page.evaluate((fail) => {
    const copied: string[] = [];
    (window as unknown as { copied: string[] }).copied = copied;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (text: string) =>
          fail
            ? Promise.reject(new Error('Clipboard unavailable'))
            : (copied.push(text), Promise.resolve()),
      },
    });
  }, fail);

test.beforeEach(async ({ page }) => {
  const response = await page.goto('/');
  expect(response!.status()).toBe(200);
});

test('title, landmarks and labels', async ({ page }) => {
  await expect(page).toHaveTitle(/Start at :05/);
  await expect(page).toHaveTitle(/Smarter meeting times/);
  await expect(page.locator('main#main-content')).toHaveCount(1);
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  await expect(
    page.locator('article[aria-label="Start at :05 meeting policy"]')
  ).toHaveCount(1);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /Start meetings/
  );
});

test.describe('hero', () => {
  test('headline and tagline', async ({ page }) => {
    await expect(page.locator('header h1')).toHaveText(/Start at\s*:05/);
    const lead = page.locator('header .lead');
    for (const text of [
      'Start meetings five minutes after the hour',
      'Fewer late arrivals',
      'calmer transitions',
      'built-in breaks',
    ])
      await expect(lead).toContainText(text);
  });

  test('timeline is a labelled image with its times', async ({ page }) => {
    const timeline = page.getByRole('img', { name: /50-minute meeting/ });
    for (const time of ['10:00', '10:05', '10:55', '11:00'])
      await expect(timeline).toHaveAttribute('aria-label', new RegExp(time));
    const root = page.locator('.start-at-05');
    for (const label of ['10:00', '10:05 Start', '10:55 End', '11:00'])
      expect(
        await root.getByText(label, { exact: true }).count()
      ).toBeGreaterThan(0);
  });
});

test.describe('sections', () => {
  test('why not on the hour', async ({ page }) => {
    const main = page.locator('main');
    await expect(main.locator('h2').first()).toHaveText(
      /Why not .*on the hour/
    );
    for (const text of [
      '30- or 60-minute blocks',
      '50-minute meeting',
      '25-minute meeting',
    ])
      await expect(main).toContainText(text);
    await expect(main.locator('h3').first()).toHaveText(
      /starting on the hour.*friction/i
    );
    expect(await page.locator('.card .list li').count()).toBeGreaterThan(2);
  });

  test('the fix', async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 2, name: 'The fix: Start at :05' })
    ).toBeVisible();
    await expect(page.locator('main')).toContainText(':35');
    await expect(
      page.locator('main h3', { hasText: 'Why it works' })
    ).toHaveCount(1);
    expect(
      await page.locator('.card.highlight .list li').count()
    ).toBeGreaterThan(3);
  });

  test('examples show each meeting inside its calendar block', async ({
    page,
  }) => {
    const main = page.locator('main');
    await expect(main.locator('h3', { hasText: 'Examples' })).toHaveCount(1);
    await expect(main).toContainText(
      '60-minute calendar block, schedule a 50-minute meeting'
    );
    await expect(main).toContainText(
      '30-minute calendar block, schedule a 25-minute meeting'
    );

    const times = page.locator('.slot .time');
    const labels = page.locator('.slot .label');
    await expect(page.locator('.slot')).toHaveCount(3);
    await expect(times.nth(0)).toHaveText(/10:05.*10:55/);
    await expect(times.nth(1)).toHaveText(/10:05.*10:30/);
    await expect(times.nth(2)).toHaveText(/10:35.*11:00/);
    await expect(labels.nth(0)).toContainText('50-minute meeting');
    await expect(labels.nth(0)).toContainText('60-minute block');
    await expect(labels.nth(1)).toContainText('25-minute meeting');
    await expect(labels.nth(2)).toContainText('25-minute meeting');
  });

  test('summary', async ({ page }) => {
    const main = page.locator('main');
    await expect(main.locator('h2', { hasText: 'Summary' })).toHaveCount(1);
    for (const text of [
      'Start at :05',
      'Reduce lateness',
      'mental scheduling',
      'Make room transitions easier',
      'Build in short but meaningful breaks between sessions',
    ])
      await expect(main).toContainText(text);
  });
});

test.describe('shareable policy', () => {
  test('lists a rule for each calendar block', async ({ page }) => {
    await expect(
      policy(page).getByRole('heading', { name: 'The team standard' })
    ).toBeVisible();
    for (const text of [
      '60-minute calendar block',
      '50-minute meeting',
      'Start :05',
      '30-minute calendar block',
      '25-minute meeting',
      'Keep the transition time between meetings clear.',
    ])
      await expect(policy(page)).toContainText(text);
  });

  test('copies the policy and announces success', async ({ page }) => {
    await stubClipboard(page, false);
    await page.locator('#sa05-copy-policy').click();
    await expect(page.locator('#sa05-copy-status')).toHaveText(
      'Policy copied to clipboard.'
    );
    const copied = await page.evaluate(
      () => (window as unknown as { copied: string[] }).copied
    );
    expect(copied).toHaveLength(1);
    expect(copied[0]).toContain(
      '60-minute calendar block: 50-minute meeting, :05 to :55.'
    );
    expect(copied[0]).toContain(
      '30-minute calendar block: 25-minute meeting, :05 to :30 or :35 to :00.'
    );
  });

  test('explains how to copy by hand when the clipboard fails', async ({
    page,
  }) => {
    await stubClipboard(page, true);
    await page.locator('#sa05-copy-policy').click();
    await expect(page.locator('#sa05-copy-status')).toHaveText(
      'Could not copy automatically. Select the policy text above and copy it.'
    );
  });
});

test('footer links back to garbereder.com in a new tab', async ({ page }) => {
  const footer = page.getByRole('contentinfo');
  await expect(footer).toContainText(/Start at\s*:05/);
  await expect(footer).toContainText('Smarter meeting times');
  const link = footer.locator('a[href="https://www.garbereder.com"]');
  await expect(link).toContainText('Gerrit Garbereder');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
  await expect(link).toHaveAttribute('rel', /noreferrer/);
});
