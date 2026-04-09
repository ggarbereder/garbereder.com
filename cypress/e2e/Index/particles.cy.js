/// <reference types="cypress" />

describe('Particle Canvas', () => {
  it('renders canvas with correct accessibility attributes', () => {
    cy.visit('/');
    cy.get('#particle-canvas')
      .should('exist')
      .and('have.attr', 'aria-hidden', 'true');
  });

  it('canvas lives inside the header', () => {
    cy.visit('/');
    cy.get('header #particle-canvas').should('exist');
  });

  it('canvas does not block pointer events', () => {
    cy.visit('/');
    cy.get('#particle-canvas').should('have.css', 'pointer-events', 'none');
  });

  it('initialises canvas dimensions to fill the header', () => {
    cy.visit('/');
    // resize() sets canvas.width = canvas.offsetWidth; expect > the 300px HTML default
    cy.get('#particle-canvas').then(($canvas) => {
      expect($canvas[0].width).to.be.greaterThan(300);
    });
  });

  it('skips animation when prefers-reduced-motion is set', () => {
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
    // resize() is never called, so canvas.width stays at the 300px HTML default
    cy.get('#particle-canvas').then(($canvas) => {
      expect($canvas[0].width).to.equal(300);
    });
  });
});
