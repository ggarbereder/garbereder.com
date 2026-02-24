(function () {
  function initTestimonialsSlideshow(container) {
    var viewport = container.querySelector('.testimonials-viewport');
    var prevBtn = container.querySelector('.testimonials-prev');
    var nextBtn = container.querySelector('.testimonials-next');
    var dots = container.querySelectorAll('.testimonials-dot');
    var slides = container.querySelectorAll('.testimonial-slide');
    if (!viewport || !prevBtn || !nextBtn || !slides.length) return;

    var total = slides.length;
    var isProgrammaticScroll = false;
    var fallbackTimerId;

    function getScrollPosition() {
      return viewport.scrollLeft;
    }
    var GAP_PX = 24;
    function getScrollDistance() {
      var first = slides[0];
      return first ? first.offsetWidth + GAP_PX : viewport.clientWidth + GAP_PX;
    }
    function goToIndex(index) {
      window.clearTimeout(fallbackTimerId);
      fallbackTimerId = undefined;
      var i = Math.max(0, Math.min(index, total - 1));
      var step = getScrollDistance();
      isProgrammaticScroll = true;
      viewport.scrollTo({ left: i * step, behavior: 'smooth' });
      updateDots(i);
      updateButtons(i);
      function onScrollEnd() {
        isProgrammaticScroll = false;
      }
      var myFallbackId = window.setTimeout(onScrollEnd, 400);
      fallbackTimerId = myFallbackId;
      viewport.addEventListener('scrollend', function () {
        window.clearTimeout(myFallbackId);
        onScrollEnd();
      }, { once: true });
    }
    function updateDots(current) {
      dots.forEach(function (dot, i) {
        dot.setAttribute('aria-selected', String(i === current));
        dot.classList.toggle('!bg-cyan-900', i === current);
        dot.classList.toggle('scale-125', i === current);
      });
    }
    function updateButtons(current) {
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === total - 1;
    }
    function updateFromScroll() {
      if (isProgrammaticScroll) return;
      var step = getScrollDistance();
      var scroll = getScrollPosition();
      var index = Math.round(scroll / step);
      var clamped = Math.max(0, Math.min(index, total - 1));
      updateDots(clamped);
      updateButtons(clamped);
    }
    prevBtn.addEventListener('click', function () {
      goToIndex(Math.round(getScrollPosition() / getScrollDistance()) - 1);
    });
    nextBtn.addEventListener('click', function () {
      goToIndex(Math.round(getScrollPosition() / getScrollDistance()) + 1);
    });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goToIndex(i);
      });
    });
    viewport.addEventListener('testimonials-navigate', function (e) {
      var delta = e.detail.delta;
      goToIndex(Math.round(getScrollPosition() / getScrollDistance()) + delta);
    });
    viewport.addEventListener('scroll', updateFromScroll);
    updateDots(0);
    updateButtons(0);
  }

  document.querySelectorAll('.testimonials-slideshow').forEach(function (el) {
    initTestimonialsSlideshow(el);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var slideshows = document.querySelectorAll('.testimonials-slideshow');
    for (var i = 0; i < slideshows.length; i++) {
      var el = slideshows[i];
      var rect = el.getBoundingClientRect();
      if (rect.top >= window.innerHeight || rect.bottom <= 0) continue;
      var viewport = el.querySelector('.testimonials-viewport');
      if (viewport) {
        e.preventDefault();
        viewport.dispatchEvent(new CustomEvent('testimonials-navigate', {
          detail: { delta: e.key === 'ArrowLeft' ? -1 : 1 },
          bubbles: true
        }));
        break;
      }
    }
  });
})();
