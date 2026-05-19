/// <reference types="cypress" />

const THRESHOLD = 0.01;

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 812 },
];

function disableAnimations(win) {
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
  describe(`Start at :05 — visual [${name}]`, () => {
    beforeEach(() => {
      cy.viewport(width, height);
      cy.visit('/start-at-05/', { onBeforeLoad: disableAnimations });
      cy.document().then((doc) => {
        const style = doc.createElement('style');
        style.textContent =
          '*, *::before, *::after { animation: none !important; transition: none !important; }';
        doc.head.appendChild(style);
      });
      cy.document().its('fonts.ready').should('exist');
    });

    it(`initial view [${name}]`, () => {
      cy.compareSnapshot({
        name: `start-at-05-initial-${name}`,
        testThreshold: THRESHOLD,
        cypressScreenshotOptions: { capture: 'viewport' },
      });
    });
  });
});
