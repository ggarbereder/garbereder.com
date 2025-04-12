# Garbereder.com

[![Build and Deploy (main only) content to Pages](https://github.com/ggarbereder/garbereder.com/actions/workflows/static.yml/badge.svg?branch=main)](https://github.com/ggarbereder/garbereder.com/actions/workflows/static.yml)

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

#### Run Unit Tests

```bash
npm run test
```

#### Run E2E Tests (Cypress)

```bash
# Run tests in headless mode
npm run test:e2e
```

## CI/CD

Github Actions handle continuous integration and deployment:

- Runs on pull requests and main branch
- Executes full test suite before deployment
- Deploys to GitHub Pages on successful main branch builds
- Runs post-deployment verification tests
