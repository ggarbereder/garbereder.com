# Garbereder.com
[![Build and Deploy (main only) content to Pages](https://github.com/ggarbereder/garbereder.com/actions/workflows/static.yml/badge.svg?branch=main)](https://github.com/ggarbereder/garbereder.com/actions/workflows/static.yml)

## Build
The compiled page is published into the `dist` directory using either of the build methods.

### VS Code
`CTRL` + `SHIFT` + `B` to run build. Note: Docker must be running.

### Local
```
npm install
npx browserslist@latest --update-db
npm run dev
```

### Github Actions
Github Actions are executed on pull requests and for the `main` branch.
The Cypress test suite is executed on a local instance before deployment and against the deployment target after deployment for verification.