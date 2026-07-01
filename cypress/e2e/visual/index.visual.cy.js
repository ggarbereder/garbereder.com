/// <reference types="cypress" />

// 4% tolerance: text-heavy pages show ~2% run-to-run sub-pixel/font-render
// variance even with fonts.ready awaited. Real layout regressions are far
// larger (the astro 7 whitespace collapse was 8%).
const THRESHOLD = 0.04;

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 812 },
];

function disableAnimations(win) {
  // Disables particles.js and tilt.js (both check prefers-reduced-motion)
  Object.defineProperty(win, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  // Immediately trigger IntersectionObserver so animate-sections.js
  // adds opacity-100 to all targets before any screenshot is taken
  win.IntersectionObserver = class {
    constructor(callback) {
      this._cb = callback;
    }
    observe(target) {
      this._cb([{ isIntersecting: true, target }]);
    }
    unobserve() {}
    disconnect() {}
  };
}

viewports.forEach(({ name, width, height }) => {
  describe(`Landing Page — visual [${name}]`, () => {
    beforeEach(() => {
      cy.viewport(width, height);
      cy.visit('/', { onBeforeLoad: disableAnimations });
      cy.document().then((doc) => {
        const style = doc.createElement('style');
        style.textContent =
          '*, *::before, *::after { animation: none !important; transition: none !important; } ::-webkit-scrollbar { display: none !important; } * { scrollbar-width: none !important; }';
        doc.head.appendChild(style);
      });
      cy.document().then((doc) => cy.wrap(doc.fonts.ready, { timeout: 10000 }));
    });

    it(`initial view [${name}]`, () => {
      cy.compareSnapshot({
        name: `index-initial-${name}`,
        testThreshold: THRESHOLD,
        cypressScreenshotOptions: { capture: 'viewport' },
      });
    });
  });
});
