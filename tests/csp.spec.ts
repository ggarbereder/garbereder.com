import { readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

import { notFound, pages, scrollThrough } from './pages';

// The preview server ignores public/_headers, so apply the production CSP to HTML responses here.
// upgrade-insecure-requests is dropped: it would turn the local http:// requests into https://.
const csp = readFileSync('public/_headers', 'utf8')
  .match(/^\s*Content-Security-Policy: (.+)$/m)![1]!
  .replace(/;\s*upgrade-insecure-requests/, '');

for (const { path } of [...pages, notFound]) {
  test(`no CSP violations on ${path}`, async ({ page }) => {
    await page.route('**/*', async (route) => {
      const response = await route.fetch();
      const headers = response.headers();
      if (headers['content-type']?.includes('text/html'))
        headers['content-security-policy'] = csp;
      await route.fulfill({ response, headers });
    });
    const violations: string[] = [];
    await page.exposeFunction('reportViolation', (v: string) =>
      violations.push(v)
    );
    await page.addInitScript(() =>
      document.addEventListener('securitypolicyviolation', (e) =>
        Reflect.get(
          window,
          'reportViolation'
        )(`${e.violatedDirective} ${e.blockedURI}`)
      )
    );

    await page.goto(path);
    await scrollThrough(page);
    await page.waitForLoadState('networkidle');
    expect(violations).toEqual([]);

    // The scripts ran (they would be blocked if Astro inlined them)
    await expect(page.locator('html')).not.toHaveClass(/\bnojs\b/);
  });
}
