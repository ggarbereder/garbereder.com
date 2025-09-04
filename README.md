<p><a target="_blank" href="https://app.eraser.io/workspace/13CWfCo0qAe1BLFjrEXT" id="edit-in-eraser-github-link"><img alt="Edit in Eraser" src="https://firebasestorage.googleapis.com/v0/b/second-petal-295822.appspot.com/o/images%2Fgithub%2FOpen%20in%20Eraser.svg?alt=media&amp;token=968381c8-a7e7-472a-8ed6-4a6626da5501"></a></p>

# Garbereder.com
## Architecture


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



<!-- eraser-additional-content -->
## Diagrams
<!-- eraser-additional-files -->
<a href="/README-Static Website Architecture with GitHub, Cloudflare, and BetterStack-1.eraserdiagram" data-element-id="iCwAF-Hf-3PkRkqWnDDsh"><img src="/.eraser/13CWfCo0qAe1BLFjrEXT___zyEvvzgyoedHnT9WaAfDjOScVsT2___---diagram----23f49d818a1d847e98286ae21c4ea9c6-Static-Website-Architecture-with-GitHub--Cloudflare--and-BetterStack.png" alt="" data-element-id="iCwAF-Hf-3PkRkqWnDDsh" /></a>
<!-- end-eraser-additional-files -->
<!-- end-eraser-additional-content -->
<!--- Eraser file: https://app.eraser.io/workspace/13CWfCo0qAe1BLFjrEXT --->