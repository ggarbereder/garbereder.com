/// <reference types="cypress" />

describe('Opacity Observer', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should have hidden elements initially', () => {
    // Elements should start with opacity-0 animate class
    cy.get('.job').should('have.class', 'opacity-0');
    cy.get('.job').should('have.class', 'animate');
  });

  it('should add opacity-100 class when elements are scrolled into view', () => {
    // Scroll to CV section
    cy.get('#cv').scrollIntoView();

    // First job entry should become visible
    cy.get('.job').first().should('have.class', 'opacity-100');
  });

  it('should reveal all job entries when scrolling to bottom', () => {
    // Scroll to bottom of the page
    cy.scrollTo('bottom');

    // All job entries should become visible
    cy.get('.job').each(($el) => {
      cy.wrap($el).should('have.class', 'opacity-100');
    });
  });

  it('should maintain visibility after elements are revealed', () => {
    // Scroll to bottom
    cy.scrollTo('bottom');

    // Scroll back to top
    cy.scrollTo('top');

    // Elements should remain visible
    cy.get('.job').should('have.class', 'opacity-100');
  });
});
