import type { PlaywrightTestConfig } from '@playwright/test';

export function defineSiteConfig(options: {
  port: number;
  desktopOnly: RegExp;
  perEngine: RegExp;
}): PlaywrightTestConfig;
