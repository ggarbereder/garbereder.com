import images from '../assets/portrait.jpg?w=400;800;1600&format=webp';

export default function Portrait() {
  return (
    <img
      src={images[0]}
      srcset={`${images[0]} 1x, ${images[1]} 2x, ${images[2]} 3x`}
      alt="Portrait of Gerrit Garberder"
      decoding="async"
      class="rounded-full border-slate-300 border-8 w-64 lg:w-64 xl:w-80 2xl:w-[400px] h-64 lg:h-64 xl:h-80 2xl:h-[400px] shadow-2xl transition-all duration-300 hover:scale-105 hover:border-orange-500 hover:shadow-orange-200"
      id="portrait"
    />
  );
}
