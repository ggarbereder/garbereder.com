import { defineSiteConfig } from '@garbereder/config/playwright';

export default defineSiteConfig({
  port: 4329,
  desktopOnly: /(home|start-at-05|seo|icons)\.spec\.ts/,
  perEngine: /(csp|interactions)\.spec\.ts/,
});
