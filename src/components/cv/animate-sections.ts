class OpacityObserver {
  observer: IntersectionObserver;
  private className: string;

  constructor(cls: string) {
    this.className = cls;
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(this.className);
            // Unobserve after animation to improve performance
            this.observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px' // Start animation slightly before element is fully visible
      }
    );
  }

  observe(element: Element, selector: string) {
    const elements = element.querySelectorAll(selector);
    elements.forEach((el) => {
      // Only observe elements that haven't been animated yet
      if (!el.classList.contains(this.className)) {
        this.observer.observe(el);
      }
    });
  }

  disconnect() {
    this.observer.disconnect();
  }
}

// Initialize animation when DOM is ready
function initAnimations() {
  const sections = document.querySelectorAll<HTMLElement>('[data-animate-section]');
  
  if (sections.length === 0) {
    console.warn('No animate sections found');
    return;
  }

  sections.forEach((section) => {
    new OpacityObserver('opacity-100').observe(section, '.opacity-0.animate');
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

