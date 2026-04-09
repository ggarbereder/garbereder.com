const canvas = document.getElementById('particle-canvas');
if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // nothing to do
} else {
  const ctx = canvas.getContext('2d');
  const COUNT = 100;
  const CONNECT_DIST = 160;
  const MOUSE_DIST = 200;

  let w, h, particles, vignette;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    vignette = ctx.createRadialGradient(
      w / 2,
      h / 2,
      h * 0.1,
      w / 2,
      h / 2,
      h * 0.9
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(8,47,73,0.65)');
  }

  function spawn() {
    particles = Array.from({ length: COUNT }, () => {
      const depth = Math.random();
      const speed = 0.12 + depth * 0.38;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: 0.5 + depth * 2.5,
        depth,
      };
    });
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      const alpha = 0.25 + p.depth * 0.75;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(186,230,253,${alpha})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECT_DIST) {
          const lineAlpha =
            ((p.depth + q.depth) / 2) * 0.5 * (1 - d / CONNECT_DIST);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(186,230,253,${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const md = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < MOUSE_DIST) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(249,115,22,${0.8 * (1 - md / MOUSE_DIST)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        p.vx += (mouse.x - p.x) * 0.00004;
        p.vy += (mouse.y - p.y) * 0.00004;
        const speed = Math.hypot(p.vx, p.vy);
        /* istanbul ignore next -- speed cap requires many frames of attraction to hit */
        if (speed > 1.5) {
          p.vx = (p.vx / speed) * 1.5;
          p.vy = (p.vy / speed) * 1.5;
        }
      }
    }

    // Vignette over particles — edges fade into the background
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    requestAnimationFrame(tick);
  }

  const header = canvas.closest('header');
  header?.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  header?.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', resize);

  resize();
  spawn();
  tick();
}
