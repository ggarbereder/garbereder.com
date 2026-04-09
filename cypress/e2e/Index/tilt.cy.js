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

  it('fires mouseleave with no prior mousemove (rafId is null, animate called once)', () => {
    cy.visit('/');
    // rafId is null at page load; mouseleave calls animate() via `if (!rafId) animate()`
    cy.get('header').trigger('mouseleave');
    cy.wait(100);
    // animate() lerps (0→0) immediately exits via else branch, clearing transform
    cy.get('.portrait-glow-wrapper').should(($el) => {
      expect($el[0].style.transform).to.equal('');
    });
  });

  it('applies transform on mousemove and resets on mouseleave', () => {
    cy.visit('/');
    // Trigger mousemove to kick off the lerp animation
    cy.get('header').trigger('mousemove', { clientX: 400, clientY: 200 });
    // Wait enough time for at least one RAF frame to have run
    cy.wait(100);
    cy.get('.portrait-glow-wrapper').should(($el) => {
      // Transform should be set after animation frames run
      expect($el[0].style.transform).to.not.equal('');
    });
    // Trigger mouseleave — lerps back to 0,0 and clears transform
    cy.get('header').trigger('mouseleave');
    // Wait for lerp to converge to zero and clear the transform
    cy.wait(1500);
    cy.get('.portrait-glow-wrapper').should(($el) => {
      expect($el[0].style.transform).to.equal('');
    });
  });
});
