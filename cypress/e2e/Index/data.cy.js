/// <reference types="cypress" />

describe('Data Integrity', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('CV entries', () => {
    it('every entry has a non-empty date, title, and description', () => {
      cy.get('#cv ol li').each(($li) => {
        cy.wrap($li).find('.job-date').invoke('text').should('not.be.empty');
        cy.wrap($li).find('.job-title').invoke('text').should('not.be.empty');
        cy.wrap($li)
          .find('.job-description p')
          .should('have.length.at.least', 1);
      });
    });

    it('dates follow the expected format', () => {
      cy.get('#cv ol li .job-date').each(($date) => {
        cy.wrap($date)
          .invoke('text')
          .should('match', /^20\d{2}\s[–-]\s(Present|20\d{2})$/);
      });
    });
  });

  describe('Patents', () => {
    it('every patent has a number, year, and Google Patents link', () => {
      cy.get('#patents ul li').each(($li) => {
        cy.wrap($li).invoke('text').should('match', /US\d+/);
        cy.wrap($li)
          .invoke('text')
          .should('match', /20\d{2}/);
        cy.wrap($li)
          .find('a[href*="patents.google.com"]')
          .should('have.length.at.least', 1);
      });
    });
  });

  describe('Testimonials', () => {
    it('every testimonial has quote text', () => {
      cy.get('.testimonial-slide').each(($slide) => {
        cy.wrap($slide)
          .find('.testimonial-text')
          .invoke('text')
          .should('not.be.empty');
      });
    });

    it('every testimonial has attribution (source or company)', () => {
      cy.get('.testimonial-slide').each(($slide) => {
        cy.wrap($slide).find('.testimonial-source').should('exist');
        cy.wrap($slide)
          .find('.testimonial-source')
          .invoke('text')
          .should('not.be.empty');
      });
    });
  });
});
