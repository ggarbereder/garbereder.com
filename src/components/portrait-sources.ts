// Shared by the portrait <img> and its LCP preload, so both pick the same file.
// Widths go up to the 845px source; AVIF is ~2.5x smaller than WebP at the same width.
import avifSrcset from '../assets/portrait.jpg?w=256;384;512;640;768;845&format=avif&as=srcset';
import webpSrcset from '../assets/portrait.jpg?w=256;384;512;640;768;845&format=webp&as=srcset';
import webpSrc from '../assets/portrait.jpg?w=400&format=webp';

// Matches the Tailwind widths on the image: w-64, xl:w-80, 2xl:w-[400px]
export const sizes =
  '(min-width: 1536px) 400px, (min-width: 1280px) 320px, 256px';

export { avifSrcset, webpSrcset, webpSrc };
