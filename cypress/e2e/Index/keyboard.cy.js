/// <reference types="cypress" />

describe('Keyboard Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Resumé nav link is focusable', () => {
    cy.get('header nav a[href="#cv"]').focus();
    cy.focused().should('have.attr', 'href', '#cv');
  });

  it('Start at :05 nav link is focusable', () => {
    cy.get('header nav a[href="//start-at-05.com/"]').focus();
    cy.focused().should('have.attr', 'href', '//start-at-05.com/');
  });

  it('email link is focusable', () => {
    cy.get('a[href*="mailto:"]').focus();
    cy.focused().invoke('attr', 'href').should('include', 'mailto:');
  });

  it('phone link is focusable', () => {
    cy.get('a[href*="tel:"]').focus();
    cy.focused().invoke('attr', 'href').should('include', 'tel:');
  });

  it('social links have aria-labels', () => {
    cy.get('a[href*="linkedin.com"]').should('have.attr', 'aria-label');
    cy.get('a[href*="github.com"]').should('have.attr', 'aria-label');
    cy.get('a[href*="openpgp.org"]').should('have.attr', 'aria-label');
  });

  it('testimonial navigation buttons are keyboard accessible', () => {
    // Next is always enabled on slide 1; click it so prev becomes enabled too
    cy.get('.testimonials-next').scrollIntoView().click();
    cy.get('.testimonials-next').focus();
    cy.focused().should('have.attr', 'aria-label', 'Next testimonial');
    cy.get('.testimonials-prev').focus();
    cy.focused().should('have.attr', 'aria-label', 'Previous testimonial');
  });

  it('main navigation has an accessible label', () => {
    cy.get('nav[aria-label="Main navigation"]').should('exist');
  });
});
