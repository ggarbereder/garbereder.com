# Garbereder.com

[![Build and Deploy (main only) content to Pages](https://github.com/ggarbereder/garbereder.com/actions/workflows/static.yml/badge.svg?branch=main)](https://github.com/ggarbereder/garbereder.com/actions/workflows/static.yml)
[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/24fip.svg)](https://uptime.betterstack.com/?utm_source=status_badge)

## Architecture

```mermaid
flowchart LR
    subgraph GH[GitHub Repository]
        SC[Source Code]
        CT[Content]
        GA[GitHub Actions]
    end

    CW[Cloudflare Worker]
    UD[United Domains]
    CF[Cloudflare]
    BS[BetterStack]
    U([User])
    A([Admin])

    SC --> GA
    CT --> GA
    GA -.->|deploy site| CW
    UD -->|domain delegation| CF
    CF -->|DNS points to site| CW
    BS -.->|monitor uptime| CW
    U -->|requests website| CF
    BS -->|alerts| A
```

## Prerequisites

- Node.js (LTS version recommended)
- VS Code (optional)

## Development

### Local Development

```bash
# Install dependencies
npm install

# Update browserslist database
npx browserslist@latest --update-db

# Start development server
npm run dev
```

### Build

The compiled page is published into the `dist` directory:

```bash
npm run build
```

### Testing

Tests use [Playwright](https://playwright.dev/) against the production build (`astro preview`), in Chromium, Firefox and WebKit, on desktop, phone and 320px viewports.

```bash
npx playwright install    # once, downloads the browsers
npm run build             # the tests serve dist/
npm run test:html         # html-validate on dist/
npm run test:e2e          # end-to-end, accessibility, SEO and CSP tests
npm run test:a11y         # accessibility tests only
npm run test:visual       # visual regression (baselines are per platform)
npm run test              # lint, build, html-validate and end-to-end
```

## CI/CD

Github Actions handle continuous integration and deployment:

- Runs on pull requests and main branch
- Builds once, validates the HTML and runs the Playwright suite against that build
- Deploys the tested build on main to a Cloudflare Worker (static assets)

## Security

This project implements several security measures:

- **Dependency Scanning**: Automated vulnerability scanning with `npm audit`
- **Security headers**: strict Content-Security-Policy and related headers in `public/_headers`, verified in every browser engine by `tests/csp.spec.ts`
- **Code Quality**: ESLint with security-focused rules
- **TypeScript**: Strict type checking to prevent runtime errors
- **Responsible Disclosure**: Security vulnerabilities can be reported via [security.txt](/.well-known/security.txt)

## Accessibility

- **Conformance target**: [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/)
- **Statement**: [Accessibility page](/accessibility/)
- **Automated checks**: axe-core (WCAG 2.2 AA and best practices) and keyboard tests run in CI via Playwright (`npm run test:a11y`)

### Security Scripts

```bash
# Run security audit
npm run security:audit

# Check for outdated dependencies
npm run security:outdated
```
