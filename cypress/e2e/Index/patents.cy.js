/// <reference types="cypress" />

describe('Patents Section', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays patents section with heading', () => {
    cy.get('#patents').should('exist');
    cy.get('#patents-heading').should('contain.text', 'Patents');
    cy.get('#patents').should(
      'have.attr',
      'aria-labelledby',
      'patents-heading'
    );
  });

  it('displays at least one patent', () => {
    cy.get('#patents ul li').should('have.length.at.least', 1);
  });

  it('displays US12197614B1 patent with correct details', () => {
    cy.get('#patents a[href*="patents.google.com/patent/US12197614B1"]')
      .should('exist')
      .within(() => {
        cy.get('span').first().should('contain.text', 'US12197614B1');
        cy.root().should('contain.text', '2025');
        cy.root().should(
          'contain.text',
          'Stateless system to enable data breach lookup'
        );
        cy.root().should('contain.text', 'Privacy-preserving system');
      });
  });

  it('patent link opens in new tab with secure attributes', () => {
    cy.get('#patents a[href*="patents.google.com/patent/US12197614B1"]').should(
      'have.attr',
      'target',
      '_blank'
    );
    cy.get('#patents a[href*="patents.google.com/patent/US12197614B1"]')
      .invoke('attr', 'rel')
      .should('include', 'noopener')
      .and('include', 'noreferrer');
  });

  it('patent link has valid Google Patents URL', () => {
    cy.get('#patents a[href*="US12197614B1"]').should(
      'have.attr',
      'href',
      'https://patents.google.com/patent/US12197614B1'
    );
  });
});
