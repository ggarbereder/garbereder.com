/// <reference types="cypress" />

describe('Responsive Layout', () => {
  it('stacks content as column-reverse on mobile (portrait above text)', () => {
    cy.viewport(375, 812);
    cy.visit('/');
    cy.get('header .flex-col-reverse')
      .invoke('css', 'flex-direction')
      .should('equal', 'column-reverse');
    cy.get('img#portrait').should('be.visible');
    cy.get('h1').should('be.visible');
  });

  it('shows side-by-side row layout at xl breakpoint', () => {
    cy.viewport(1280, 900);
    cy.visit('/');
    cy.get('header .flex-col-reverse')
      .invoke('css', 'flex-direction')
      .should('equal', 'row');
    cy.get('img#portrait').should('be.visible');
    cy.get('h1').should('be.visible');
  });

  it('navigation links are visible on mobile', () => {
    cy.viewport(375, 812);
    cy.visit('/');
    cy.get('header nav a').first().should('be.visible');
    cy.get('header nav a').eq(1).should('be.visible');
  });

  it('navigation links are visible on desktop', () => {
    cy.viewport(1280, 900);
    cy.visit('/');
    cy.get('header nav a').first().should('be.visible');
    cy.get('header nav a').eq(1).should('be.visible');
  });

  it('content sections are visible on tablet', () => {
    cy.viewport(768, 1024);
    cy.visit('/');
    cy.get('#cv').should('exist');
    cy.get('#patents').should('exist');
  });
});
