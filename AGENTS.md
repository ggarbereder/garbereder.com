# AGENTS.md

Instructions for AI coding agents working in this repository.

## Project

Personal website for garbereder.com: a static Astro site with Preact islands, styled with Tailwind CSS v4 and Sass. It is deployed to GitHub Pages and, in parallel, to a Cloudflare Worker serving static assets (`wrangler.jsonc`).

## Layout

- `src/pages/` – routes (file-based routing)
- `src/layouts/` – page layouts
- `src/components/` – `.astro` components and Preact (`.jsx`) islands
- `src/data/` – JSON content (CV entries, patents, testimonials)
- `src/scripts/` – small client-side scripts
- `src/styles/` – global SCSS
- `public/` – static files copied as-is
- `workers/` – standalone Cloudflare Workers (own `package.json` and `wrangler.toml`)
- `cypress/e2e/` – end-to-end, accessibility and visual regression tests
- `scripts/` – Node helper scripts (security audit, npm env)

## Commands

```bash
npm install            # Node >= 24.15 required (engine-strict)
npm run dev            # dev server on http://localhost:4321
npm run build          # output in dist/
npm run lint           # ESLint + Prettier check + typecheck
npm run test:e2e       # Cypress against the dev server
npm run test:a11y      # axe-core accessibility checks
npm run test:visual    # visual regression tests
npm run security:audit
```

Run `npm run lint` and `npm run build` before considering a change done. Run the relevant Cypress suite when changing markup, styles or behavior.

## Conventions

- Prefer static output and minimal client-side JavaScript. Only hydrate components that need interactivity, using the least eager `client:*` directive that works.
- Content belongs in `src/data/*.json` rather than hard-coded in components.
- Use Tailwind utility classes; follow the existing SCSS files for patterns already established there.
- Formatting is enforced by Prettier and ESLint (lint-staged runs on commit). Do not hand-format against them.
- Match the style, naming and comment density of surrounding code.

## Accessibility

The site targets WCAG 2.2 Level AA. Use semantic HTML, keep keyboard navigation working, and make sure `npm run test:a11y` passes. Update `src/pages/accessibility.astro` if a change affects the accessibility statement.

## Visual baselines

Intentional visual changes require updating the baseline screenshots in `cypress-image-diff-screenshots/` (`npm run test:visual:update`, or the `update-visual-baselines` workflow). Do not update baselines to hide unintended regressions.

## Dependencies and security

- `.npmrc` sets `strict-allow-scripts=true`; install scripts must be explicitly allowed in `allowScripts` in `package.json`. Do not allow new ones without a reason.
- Security pins live in `overrides`. Keep them unless the underlying advisory is resolved.
- The pre-commit hook runs `npm run security:audit` and lint-staged. Do not bypass hooks.

## Git and CI

- Do not commit directly to `main`; work on a branch and open a pull request.
- Use Conventional Commit prefixes (`feat:`, `fix:`, `chore:`, `ci:`, …).
- The version in `package.json` is bumped automatically by the `version-bump` workflow on pull requests; do not bump it manually unless asked.
