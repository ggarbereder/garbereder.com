function initTestimonialsSlideshow(container: HTMLElement) {
  const viewport = container.querySelector(
    '.testimonials-viewport'
  ) as HTMLElement;
  const track = container.querySelector('.testimonials-track') as HTMLElement;
  const prevBtn = container.querySelector(
    '.testimonials-prev'
  ) as HTMLButtonElement;
  const nextBtn = container.querySelector(
    '.testimonials-next'
  ) as HTMLButtonElement;
  const dots = container.querySelectorAll(
    '.testimonials-dot'
  ) as NodeListOf<HTMLButtonElement>;
  const slides = container.querySelectorAll(
    '.testimonial-slide'
  ) as NodeListOf<HTMLElement>;

  if (!viewport || !track || !prevBtn || !nextBtn || slides.length === 0)
    return;

  const total = slides.length;
  let isProgrammaticScroll = false;
  let fallbackTimerId: ReturnType<typeof setTimeout> | undefined;

  function getScrollPosition() {
    return viewport.scrollLeft;
  }

  const GAP_PX = 24; // gap-6

  function getScrollDistance() {
    const first = slides[0];
    if (!first) return viewport.clientWidth + GAP_PX;
    return first.offsetWidth + GAP_PX;
  }

  function goToIndex(index: number) {
    clearTimeout(fallbackTimerId);
    fallbackTimerId = undefined;

    const i = Math.max(0, Math.min(index, total - 1));
    const step = getScrollDistance();
    isProgrammaticScroll = true;
    viewport.scrollTo({ left: i * step, behavior: 'smooth' });
    updateDots(i);
    updateButtons(i);

    const onScrollEnd = () => {
      isProgrammaticScroll = false;
    };
    const myFallbackId = setTimeout(onScrollEnd, 400);
    fallbackTimerId = myFallbackId;
    viewport.addEventListener('scrollend', () => {
      clearTimeout(myFallbackId);
      onScrollEnd();
    }, { once: true });
  }

  function updateDots(current: number) {
    dots.forEach((dot, i) => {
      dot.setAttribute('aria-selected', String(i === current));
      dot.classList.toggle('!bg-cyan-900', i === current);
      dot.classList.toggle('scale-125', i === current);
    });
  }

  function updateButtons(current: number) {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }

  function updateFromScroll() {
    if (isProgrammaticScroll) return;
    const step = getScrollDistance();
    const scroll = getScrollPosition();
    const index = Math.round(scroll / step);
    const clamped = Math.max(0, Math.min(index, total - 1));
    updateDots(clamped);
    updateButtons(clamped);
  }

  prevBtn.addEventListener('click', () => {
    const step = getScrollDistance();
    const current = Math.round(getScrollPosition() / step);
    goToIndex(current - 1);
  });
  nextBtn.addEventListener('click', () => {
    const step = getScrollDistance();
    const current = Math.round(getScrollPosition() / step);
    goToIndex(current + 1);
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goToIndex(i));
  });

  viewport.addEventListener('testimonials-navigate', (e: Event) => {
    const { delta } = (e as CustomEvent<{ delta: number }>).detail;
    const step = getScrollDistance();
    const current = Math.round(getScrollPosition() / step);
    goToIndex(current + delta);
  });

  viewport.addEventListener('scroll', updateFromScroll);

  updateDots(0);
  updateButtons(0);
}

document
  .querySelectorAll('.testimonials-slideshow')
  .forEach((el) => initTestimonialsSlideshow(el as HTMLElement));

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const slideshows = document.querySelectorAll('.testimonials-slideshow');
  for (const el of slideshows) {
    const rect = (el as HTMLElement).getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) continue;
    const viewport = (el as HTMLElement).querySelector(
      '.testimonials-viewport'
    ) as HTMLElement | null;
    if (!viewport) continue;
    e.preventDefault();
    viewport.dispatchEvent(
      new CustomEvent('testimonials-navigate', {
        detail: { delta: e.key === 'ArrowLeft' ? -1 : 1 },
        bubbles: true,
      })
    );
    break;
  }
});
