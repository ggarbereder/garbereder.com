// vite-imagetools imports used in .ts files
declare module '*&as=srcset' {
  const srcset: string;
  export default srcset;
}

declare module '*&format=webp' {
  const src: string;
  export default src;
}
