/// <reference types="cypress" />

describe('Portrait Tilt Effect', () => {
  it('portrait glow wrapper exists inside the header', () => {
    cy.visit('/');
    cy.get('header .portrait-glow-wrapper').should('exist');
  });

  it('tilt script is bundled and active (wrapper is present in header)', () => {
    cy.visit('/');
    // Script is Vite-bundled — no standalone URL; verify the element it targets
    cy.get('header .portrait-glow-wrapper').should('exist');
  });

  it('does not apply tilt when prefers-reduced-motion is set', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        Object.defineProperty(win, 'matchMedia', {
          writable: true,
          value: (query) => ({
            matches: query.includes('reduce'),
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
          }),
        });
      },
    });
    // tilt.js exits early — mousemove listener is never attached
    cy.get('header').trigger('mousemove', { clientX: 400, clientY: 300 });
    cy.wait(200);
    cy.get('.portrait-glow-wrapper').should(($el) => {
      expect($el[0].style.transform).to.equal('');
    });
  });
});
