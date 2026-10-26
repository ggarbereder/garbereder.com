# AGENTS.md

Instructions for AI coding agents working in this repository.

## Project

An npm workspaces monorepo of static Astro sites, each deployed to its own Cloudflare Worker serving static assets (`apps/<name>/wrangler.jsonc`):

- `apps/garbereder.com` – the personal website, with Preact islands, Tailwind CSS v4 and Sass.
- `apps/start-at-05` – start-at-05.com, a one-page meeting-policy site (Tailwind CSS v4, Sass, self-hosted Fraunces and Inter). It shares no code with garbereder.com.

## Layout

- `apps/<name>/` – one Astro site each, with its own `src/`, `public/`, `tests/`, `package.json` and `wrangler.jsonc`. Paths below are relative to the app.
- `packages/config/` – shared tsconfig, ESLint, Prettier, Playwright (`defineSiteConfig`) and html-validate config. Change it once for every app.
- Root `package.json` – `workspaces`, `overrides`, `allowScripts` and lint-staged for the whole repo. App dependencies go in the app's `package.json` (`npm install <pkg> -w apps/<name>`); there is one `package-lock.json`.
- `workers/` – standalone Cloudflare Workers with their own `package.json` and `wrangler.toml`
- `tests/pages.ts` lists every page the Playwright suites visit

## Commands

Run commands from the repository root. App tasks take `-w apps/<name>` (`npm run dev -w apps/garbereder.com`); `npm run build` and `npm run lint` cover every workspace. npm 12 rejects the `-ws` shorthand, use `--workspaces`.

Run `npm run lint` and `npm run build` before considering a change done. Run `npm run build -w apps/<name>` and the relevant Playwright specs (`npm run test:e2e -w apps/<name>`) when changing markup, styles or behavior; they test `dist/`, not the dev server.

## Conventions

- Prefer static output and minimal client-side JavaScript. Only hydrate components that need interactivity, using the least eager `client:*` directive that works.
- Content belongs in `src/data/*.json` rather than hard-coded in components.
- Use Tailwind utility classes; follow the existing SCSS files for patterns already established there.
- Formatting is enforced by Prettier and ESLint (lint-staged runs on commit). Do not hand-format against them.
- Match the style, naming and comment density of surrounding code.
- No inline scripts, styles or `style=""` attributes: the Content-Security-Policy in `public/_headers` only allows `'self'`, and `tests/csp.spec.ts` fails on violations.

## Accessibility

The site targets WCAG 2.2 Level AA. Use semantic HTML, keep keyboard navigation working, and make sure `npm run test:a11y` passes. Update `src/pages/accessibility.astro` if a change affects the accessibility statement.

## Visual baselines

Intentional visual changes require updating the Linux baseline screenshots in `apps/<name>/tests/visual.spec.ts-snapshots/` with the `update-visual-baselines` workflow (pick the app and the branch). `npm run test:visual:update` makes local baselines for your own platform, which are gitignored. Do not update baselines to hide unintended regressions.

## Dependencies and security

- `.npmrc` sets `strict-allow-scripts=true`; install scripts must be explicitly allowed in `allowScripts` in `package.json`. Do not allow new ones without a reason.
- Security pins live in `overrides`. Keep them unless the underlying advisory is resolved.
- The pre-commit hook runs `npm run security:audit` and lint-staged. Do not bypass hooks.

## Git and CI

- Do not commit directly to `main`; work on a branch and open a pull request.
- Use Conventional Commit prefixes (`feat:`, `fix:`, `chore:`, `ci:`, …).
- Bump the version before opening a pull request: `npm run version:patch` (or `version:minor`/`version:major`), and commit `package.json` and `package-lock.json` with the change. The `version-bump` workflow only bumps when the PR's version isn't higher than `main`'s, and its bot commit re-triggers CI, which then has to be approved. If `main` moves past your version before merging, bump again.
- CI runs per app: a change under `apps/<name>/` only builds, tests and deploys that app; anything outside `apps/` runs every app. `test` is the required check.
- Each pull request gets a Cloudflare Preview (`preview.yml`) of every app it touches at `https://pr-<number>-<worker>.<subdomain>.workers.dev`, linked in one PR comment per app. They are deleted when the PR is merged or closed. Dependabot PRs get no preview.
