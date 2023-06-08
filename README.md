# Garbereder.com

## Build
The compiled page is published into the `dist` directory using either of the build methods.

### Local
```
npm install
npx browserslist@latest --update-db
npm run build
```

### VS Code
`CTRL` + `SHIFT` + `B` to run build. Note: Docker must be running.

### Docker
Bash
```Bash
docker build -t build .
docker run --rm -v $(pwd):/dev/mnt build
```
Powershell
```Powershell
docker build -t build .
docker run --rm -v ${PWD}:/dev/mnt build
```