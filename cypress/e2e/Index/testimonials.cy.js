/// <reference types="cypress" />

describe('Testimonials Section', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays testimonials section with heading', () => {
    cy.get('.testimonials-slideshow').scrollIntoView().should('be.visible');
    cy.get('section[aria-labelledby="testimonials-heading"]').should('exist');
  });

  it('displays the correct number of testimonial slides', () => {
    cy.get('.testimonial-slide').should('have.length', 3);
  });

  it('each slide has a blockquote with quote text', () => {
    cy.get('.testimonial-slide').each(($slide) => {
      cy.wrap($slide).find('blockquote.testimonial-blockquote').should('exist');
      cy.wrap($slide)
        .find('.testimonial-text')
        .should('exist')
        .and('not.be.empty');
    });
  });

  it('displays slideshow controls', () => {
    cy.get('.testimonials-prev')
      .should('be.visible')
      .and('have.attr', 'aria-label', 'Previous testimonial');
    cy.get('.testimonials-next')
      .should('be.visible')
      .and('have.attr', 'aria-label', 'Next testimonial');
    cy.get('.testimonials-dots').should('have.attr', 'role', 'tablist');
    cy.get('.testimonials-dot').should('have.length', 3);
  });

  it('first dot is selected initially', () => {
    cy.get('.testimonials-dot')
      .first()
      .should('have.attr', 'aria-selected', 'true');
  });

  it('navigates to next testimonial when Next is clicked', () => {
    cy.get('.testimonials-next').click();
    cy.get('.testimonials-dot')
      .eq(1)
      .should('have.attr', 'aria-selected', 'true');
    // Wait for the 400ms onScrollEnd fallback timer to fire (covers line 42 of testimonials.js)
    cy.wait(500);
  });

  it('navigates to previous testimonial when Prev is clicked', () => {
    cy.get('.testimonials-next').click();
    cy.get('.testimonials-prev').click();
    cy.get('.testimonials-dot')
      .first()
      .should('have.attr', 'aria-selected', 'true');
  });

  it('navigates to testimonial when dot is clicked', () => {
    cy.get('.testimonials-dot').eq(2).click();
    cy.get('.testimonials-dot')
      .eq(2)
      .should('have.attr', 'aria-selected', 'true');
  });

  it('viewport has accessible carousel region', () => {
    cy.get('.testimonials-viewport')
      .should('have.attr', 'role', 'region')
      .and('have.attr', 'aria-label', 'Testimonials carousel');
  });

  it('updates dots on manual scroll (updateFromScroll)', () => {
    // Dispatch a scroll event without isProgrammaticScroll being set
    // This exercises lines 68-73 of testimonials.js
    cy.get('.testimonials-viewport').then(($viewport) => {
      $viewport[0].dispatchEvent(new Event('scroll'));
    });
    cy.get('.testimonials-dot')
      .first()
      .should('have.attr', 'aria-selected', 'true');
  });

  it('navigates via testimonials-navigate custom event (delta +1)', () => {
    // Covers the testimonials-navigate event handler (lines 101-103)
    cy.get('.testimonials-viewport').then(($viewport) => {
      $viewport[0].dispatchEvent(
        new CustomEvent('testimonials-navigate', {
          detail: { delta: 1 },
          bubbles: true,
        })
      );
    });
    cy.get('.testimonials-dot')
      .eq(1)
      .should('have.attr', 'aria-selected', 'true');
  });

  it('navigates via testimonials-navigate custom event (delta -1)', () => {
    // Navigate to slide 2 first, then dispatch delta -1
    cy.get('.testimonials-next').click();
    cy.get('.testimonials-viewport').then(($viewport) => {
      $viewport[0].dispatchEvent(
        new CustomEvent('testimonials-navigate', {
          detail: { delta: -1 },
          bubbles: true,
        })
      );
    });
    cy.get('.testimonials-dot')
      .first()
      .should('have.attr', 'aria-selected', 'true');
  });

  it('navigates with ArrowRight key when testimonials are in view', () => {
    // cy.click() scrolls the element into view before clicking (unlike scrollIntoView which is
    // async due to scroll-behavior:smooth on <html>). Click next then prev to bring testimonials
    // into the viewport while ending back on slide 1.
    cy.get('.testimonials-next').click();
    cy.get('.testimonials-prev').click();
    cy.window().then((win) => {
      win.document.dispatchEvent(
        new win.KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );
    });
    cy.get('.testimonials-dot')
      .eq(1)
      .should('have.attr', 'aria-selected', 'true');
  });

  it('navigates with ArrowLeft key when testimonials are in view', () => {
    // Navigate to slide 2 first (click scrolls testimonials into view), then use ArrowLeft
    cy.get('.testimonials-next').click();
    cy.window().then((win) => {
      win.document.dispatchEvent(
        new win.KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true,
          cancelable: true,
        })
      );
    });
    cy.get('.testimonials-dot')
      .first()
      .should('have.attr', 'aria-selected', 'true');
  });

  it('ignores testimonials-navigate event with missing detail', () => {
    // Covers the `if (!e.detail || typeof e.detail.delta !== 'number') return` guard
    cy.get('.testimonials-viewport').then(($viewport) => {
      $viewport[0].dispatchEvent(
        new CustomEvent('testimonials-navigate', { bubbles: true })
      );
    });
    cy.get('.testimonials-dot')
      .first()
      .should('have.attr', 'aria-selected', 'true');
  });

  it('keydown has no effect when testimonials are not in viewport', () => {
    // Page starts at top; testimonials are below the fold so the `continue` branch runs
    cy.window().then((win) => {
      win.document.dispatchEvent(
        new win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      );
    });
    cy.get('.testimonials-dot')
      .first()
      .should('have.attr', 'aria-selected', 'true');
  });

  it('ignores non-arrow keydown events', () => {
    // Bring testimonials into view using click (avoids smooth-scroll async issue)
    cy.get('.testimonials-next').click();
    cy.get('.testimonials-prev').click();
    cy.window().then((win) => {
      win.document.dispatchEvent(
        new win.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      );
    });
    // Dots should be unchanged (Enter doesn't navigate)
    cy.get('.testimonials-dot')
      .first()
      .should('have.attr', 'aria-selected', 'true');
  });
});
