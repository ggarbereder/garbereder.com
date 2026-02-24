(function () {
  function OpacityObserver(cls) {
    this.observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add(cls);
      });
    });
  }
  OpacityObserver.prototype.observe = function (element, selector) {
    const self = this;
    element.querySelectorAll(selector).forEach(function (e) {
      self.observer.observe(e);
    });
  };
  document
    .querySelectorAll('[data-animate-section]')
    .forEach(function (section) {
      new OpacityObserver('opacity-100').observe(section, '.opacity-0.animate');
    });
})();
