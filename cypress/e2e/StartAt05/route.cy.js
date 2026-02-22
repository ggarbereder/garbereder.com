/// <reference types="cypress" />

describe('Start at :05 — Routes', () => {
  it('serves the page at /start-at-05/ with status 200', () => {
    cy.visit('/start-at-05/', { failOnStatusCode: true });
    cy.url().should('include', '/start-at-05');
  });

  it('has correct document title', () => {
    cy.visit('/start-at-05/');
    cy.title().should(
      'include',
      'Start at :05'
    );
    cy.title().should('include', 'Smarter meeting times');
  });

  it('has canonical URL set to start-at-05', () => {
    cy.visit('/start-at-05/');
    cy.get('link[rel="canonical"]').should('exist');
    cy.get('link[rel="canonical"]')
      .invoke('attr', 'href')
      .should('include', 'start-at-05');
  });

  it('has main content landmark with id for skip link target', () => {
    cy.visit('/start-at-05/');
    cy.get('main#main-content').should('exist');
  });
});
