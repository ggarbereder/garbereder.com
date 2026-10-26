function OpacityObserver(cls) {
  const self = this;
  let remaining = 0;
  this.observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add(cls);
        self.observer.unobserve(e.target);
        remaining -= 1;
        if (remaining <= 0) {
          self.observer.disconnect();
        }
      }
    });
  });
  this.observe = function (element, selector) {
    const targets = element.querySelectorAll(selector);
    remaining += targets.length;
    targets.forEach(function (el) {
      self.observer.observe(el);
    });
  };
}

document.querySelectorAll('[data-animate-section]').forEach(function (section) {
  const observer = new OpacityObserver('opacity-100');
  observer.observe(section, '.opacity-0.animate');
});
