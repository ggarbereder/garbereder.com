/// <reference types="cypress" />

describe('Accessibility (WCAG 2.x AA)', () => {
  it('homepage passes automated checks', () => {
    cy.visit('/');
    cy.get('#main-content').should('exist');
    cy.checkA11yPage();
  });

  it('start-at-05 page passes automated checks', () => {
    cy.visit('/start-at-05/');
    cy.get('#main-content').should('exist');
    cy.checkA11yPage();
  });

  it('accessibility statement page passes automated checks', () => {
    cy.visit('/accessibility/');
    cy.get('#main-content').should('exist');
    cy.checkA11yPage();
  });

  it('homepage has a skip to main content link', () => {
    cy.visit('/');
    cy.get('a[href="#main-content"]')
      .should('exist')
      .and('contain.text', 'Skip to main content');
  });

  it('experience section has an accessible heading label', () => {
    cy.visit('/');
    cy.get('section#cv[aria-labelledby="cv-heading"]').should('exist');
    cy.get('#cv-heading').should('contain.text', 'Experience');
  });
});
