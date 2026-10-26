import { defineSiteConfig } from '@garbereder/config/playwright';

export default defineSiteConfig({
  port: 4330,
  desktopOnly: /(start-at-05|seo|icons)\.spec\.ts/,
  perEngine: /csp\.spec\.ts/,
});
