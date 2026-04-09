if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const header = document.querySelector('header');
  const wrapper = document.querySelector('.portrait-glow-wrapper');

  if (header && wrapper) {
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0,
      rafId = null;

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    header.addEventListener('mousemove', (e) => {
      const r = wrapper.getBoundingClientRect();
      const px = r.left + r.width / 2;
      const py = r.top + r.height / 2;
      tx = ((e.clientY - py) / (window.innerHeight * 0.5)) * -12;
      ty = ((e.clientX - px) / (window.innerWidth * 0.5)) * 12;
      if (!rafId) animate();
    });

    header.addEventListener('mouseleave', () => {
      tx = 0;
      ty = 0;
      if (!rafId) animate();
    });

    function animate() {
      cx = lerp(cx, tx, 0.08);
      cy = lerp(cy, ty, 0.08);
      const scale = 1 + Math.abs(cx * cy) * 0.0003;
      wrapper.style.transform = `perspective(700px) rotateX(${cx}deg) rotateY(${cy}deg) scale(${scale})`;

      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
        rafId = requestAnimationFrame(animate);
      } else {
        wrapper.style.transform = '';
        rafId = null;
      }
    }
  }
}
