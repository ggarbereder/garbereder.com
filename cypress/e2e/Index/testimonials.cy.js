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
});
