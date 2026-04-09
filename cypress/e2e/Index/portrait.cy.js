/// <reference types="cypress" />

describe('Portrait Image', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('has correct alt text', () => {
    cy.get('img#portrait').should(
      'have.attr',
      'alt',
      'Portrait of Gerrit Garbereder'
    );
  });

  it('uses eager loading and high fetch priority for LCP', () => {
    cy.get('img#portrait')
      .should('have.attr', 'loading', 'eager')
      .and('have.attr', 'fetchpriority', 'high');
  });

  it('has a srcset for responsive image delivery', () => {
    cy.get('img#portrait')
      .invoke('attr', 'srcset')
      .should('not.be.empty')
      .and('include', '1x')
      .and('include', '2x');
  });

  it('is visible on page load', () => {
    cy.get('img#portrait').should('be.visible');
  });
});
