/// <reference types="cypress" />

describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Header Section', () => {
    it('displays header content correctly', () => {
      // Portrait image
      cy.get('img#portrait')
        .should('be.visible')
        .and('have.attr', 'src')
        .and('not.be.empty');

      // Name and title
      cy.get('h1').should('contain.text', 'Welcome');
      cy.get('.text-orange-500').should('contain.text', 'Gerrit Garbereder');

      // Description
      cy.get('header p')
        .should('exist')
        .and('contain.text', 'Senior Engineering Manager');

      // Resume link
      cy.get('header nav a')
        .should('have.text', 'Resume')
        .and('have.attr', 'href', '#cv')
        .and('have.class', 'bg-orange-500');
    });
  });

  describe('Resume Section', () => {
    it('displays correct number of job entries', () => {
      cy.get('#cv ol li').should('have.length', 6);
    });

    it('validates job entry structure', () => {
      cy.get('#cv ol li').each(($li) => {
        // Check entry structure
        cy.wrap($li).find('.bullet').should('exist');
        cy.wrap($li)
          .find('.job-date')
          .invoke('text')
          .should('match', /^(20[0-9]{2}\s[–]\s(Present|20[0-9]{2}))$/); // Updated regex to handle both - and –
        cy.wrap($li).find('.job-title').invoke('text').should('not.be.empty');
        cy.wrap($li)
          .find('.job-description p')
          .should('have.length.at.least', 1);
      });
    });

    it('verifies chronological order', () => {
      const dates = [];
      cy.get('#cv ol li .job-date')
        .each(($date) => {
          dates.push($date.text().split(' -')[0]);
        })
        .then(() => {
          const sortedDates = [...dates].sort((a, b) => b - a);
          expect(dates).to.deep.equal(sortedDates);
        });
    });
  });

  describe('Contact Section', () => {
    it('displays contact information correctly', () => {
      // Email
      cy.get('a[href*="mailto:gerrit@garbereder.com"]')
        .should('be.visible')
        .and('contain.text', 'Gerrit@Garbereder.com');

      // Phone
      cy.get('a[href*="tel:+37069456497"]')
        .should('be.visible')
        .and('contain.text', '+370 6 945 6497');
    });

    it('displays social links correctly', () => {
      // LinkedIn
      cy.get('a[href*="linkedin.com"]')
        .should('be.visible')
        .and(
          'have.attr',
          'href',
          'https://www.linkedin.com/in/gerrit-garbereder-a74b6a96/'
        )
        .find('svg')
        .should('exist');

      // GitHub
      cy.get('a[href*="github.com/ggarbereder"]')
        .should('be.visible')
        .and(
          'have.attr',
          'href',
          'https://github.com/ggarbereder/garbereder.com'
        )
        .find('svg')
        .should('exist');
    });

    it('displays attribution links correctly', () => {
      // Icons8 links
      cy.get('footer div.text-xs a').should('have.length', 3);
      cy.get('a[href*="icons8.com/icon/84888/linkedin"]').should('exist');
      cy.get('a[href*="icons8.com/icon/20675/github"]').should('exist');
      cy.get('a[href="//icons8.com"]').should('exist');
    });
  });

  describe('Accessibility and SEO', () => {
    it('has proper meta tags', () => {
      cy.get('head meta[name="description"]').should('exist');
      cy.get('head meta[property="og:title"]').should('exist');
      cy.get('head meta[property="og:type"]').should('exist');
      cy.get('head meta[property="og:url"]').should('exist');
    });

    it('has proper document structure', () => {
      cy.get('html').should('have.attr', 'lang', 'en');
      cy.get('title').should('not.be.empty');
    });
  });
});
