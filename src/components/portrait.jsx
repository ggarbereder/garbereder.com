import { avifSrcset, webpSrcset, webpSrc, sizes } from './portrait-sources';

export default function Portrait() {
  return (
    <picture>
      <source type="image/avif" srcset={avifSrcset} sizes={sizes} />
      <img
        src={webpSrc}
        srcset={webpSrcset}
        sizes={sizes}
        width="400"
        height="400"
        alt="Portrait of Gerrit Garbereder"
        loading="eager"
        fetchpriority="high"
        decoding="async"
        class="rounded-full border-slate-300 border-8 w-64 lg:w-64 xl:w-80 2xl:w-[400px] h-64 lg:h-64 xl:h-80 2xl:h-[400px] shadow-2xl transition-all duration-300 hover:scale-105 hover:border-orange-500 hover:shadow-orange-200"
        id="portrait"
      />
    </picture>
  );
}
