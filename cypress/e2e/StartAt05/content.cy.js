/// <reference types="cypress" />

describe('Start at :05 — Content', () => {
  beforeEach(() => {
    cy.visit('/start-at-05/');
  });

  describe('Skip link', () => {
    it('has a skip to main content link', () => {
      cy.get('a[href="#main-content"]')
        .should('exist')
        .and('contain.text', 'Skip to main content');
    });
  });

  describe('Header / Hero', () => {
    it('displays main headline with :05', () => {
      cy.get('header h1').should('contain.text', 'Start at');
      cy.get('header h1').should('contain.text', ':05');
    });

    it('displays hero tagline', () => {
      cy.get('header .lead').should(
        'contain.text',
        'Start meetings five minutes after the hour'
      );
      cy.get('header .lead').should('contain.text', 'Fewer late arrivals');
      cy.get('header .lead').should('contain.text', 'calmer transitions');
      cy.get('header .lead').should('contain.text', 'built-in breaks');
    });

    it('has timeline with correct aria-label', () => {
      cy.get('[role="img"][aria-label*="Timeline"]').should('exist');
      cy.get('[role="img"][aria-label*="Timeline"]')
        .invoke('attr', 'aria-label')
        .should('include', '10:00')
        .and('include', '10:05')
        .and('include', '10:55')
        .and('include', '11:00');
    });

    it('displays timeline labels 10:00, 10:05 Start, 10:55 End, 11:00', () => {
      cy.get('.start-at-05').within(() => {
        cy.contains('10:00').should('exist');
        cy.contains('10:05 Start').should('exist');
        cy.contains('10:55 End').should('exist');
        cy.contains('11:00').should('exist');
      });
    });
  });

  describe('Section: Why not "on the hour"?', () => {
    it('displays section heading', () => {
      cy.get('main').within(() => {
        cy.get('h2')
          .first()
          .invoke('text')
          .should('match', /Why not .*on the hour/);
      });
    });

    it('mentions 30 and 60 minutes and 50‑minute slots', () => {
      cy.get('main').should('contain.text', '30');
      cy.get('main').should('contain.text', '60 minutes');
      cy.get('main').invoke('text').should('match', /50.*minute/);
    });

    it('displays Problems with 50‑minute blocks card', () => {
      cy.get('main').within(() => {
        cy.get('h3').first().invoke('text').should('match', /Problems.*50.*minute.*blocks/);
      });
      cy.get('.card .list li').should('have.length.at.least', 3);
    });
  });

  describe('Section: The fix: Start at :05', () => {
    it('displays section heading', () => {
      cy.contains('h2', 'The fix: Start at :05').should('exist');
    });

    it('mentions start at :05 and :35 for half-hour', () => {
      cy.get('main').should('contain.text', 'start at :05');
      cy.get('main').should('contain.text', ':35');
    });

    it('displays Why it works card with list', () => {
      cy.get('main').within(() => {
        cy.get('h3').contains('Why it works').should('exist');
      });
      cy.get('.card.highlight .list li').should('have.length.at.least', 4);
    });
  });

  describe('Section: Examples', () => {
    it('displays Examples heading', () => {
      cy.get('main').within(() => {
        cy.get('h3').contains('Examples').should('exist');
      });
    });

    it('shows 60‑minute example: start at :05, end at :55', () => {
      cy.get('main').invoke('text').should('match', /60.*minute/);
      cy.get('main').should('contain.text', ':55');
      cy.get('.slot .time').first().should('contain.text', '10:05');
      cy.get('.slot .time').first().should('contain.text', '10:55');
    });

    it('shows 30‑minute examples with :05 and :35', () => {
      cy.get('main').invoke('text').should('match', /30.*minute/);
      cy.get('.slot').should('have.length.at.least', 2);
    });

    it('displays Full hour and half-hour slot labels', () => {
      cy.get('.slot .label').first().should('contain.text', 'Full hour');
      cy.get('.slot .label').should('contain.text', 'First half');
      cy.get('.slot .label').should('contain.text', 'Second half');
    });
  });

  describe('Section: Summary', () => {
    it('displays Summary heading', () => {
      cy.get('main').within(() => {
        cy.get('h2').contains('Summary').should('exist');
      });
    });

    it('mentions Start at :05 and :35', () => {
      cy.get('main').should('contain.text', 'Start at :05');
      cy.get('main').should('contain.text', ':35');
    });

    it('lists summary bullets', () => {
      cy.get('main').should('contain.text', 'Reduce lateness');
      cy.get('main').should('contain.text', 'mental scheduling');
      cy.get('main').should('contain.text', 'Make room transitions easier');
      cy.get('main').should(
        'contain.text',
        'Build in short but meaningful breaks between sessions'
      );
    });
  });

  describe('Footer', () => {
    it('has footer with role contentinfo', () => {
      cy.get('footer[role="contentinfo"]').should('exist');
    });

    it('displays tagline and author link', () => {
      cy.get('footer').should('contain.text', 'Start at');
      cy.get('footer').should('contain.text', ':05');
      cy.get('footer').should('contain.text', 'Smarter meeting times');
      cy.get('footer a[href="https://www.garbereder.com"]')
        .should('exist')
        .and('contain.text', 'Gerrit Garbereder');
    });

    it('footer link has target _blank and rel noopener noreferrer', () => {
      cy.get('footer a[href="https://www.garbereder.com"]')
        .should('have.attr', 'target', '_blank');
      cy.get('footer a[href="https://www.garbereder.com"]')
        .invoke('attr', 'rel')
        .should('include', 'noopener')
        .and('include', 'noreferrer');
    });
  });

  describe('Meta and document', () => {
    it('has meta description', () => {
      cy.get('head meta[name="description"]').should('exist');
      cy.get('head meta[name="description"]')
        .invoke('attr', 'content')
        .should('include', 'Start meetings');
    });

    it('has og:title and og:url', () => {
      cy.get('head meta[property="og:title"]').should('exist');
      cy.get('head meta[property="og:url"]').should('exist');
    });

    it('has html lang en', () => {
      cy.get('html').should('have.attr', 'lang', 'en');
    });

    it('article has accessible label', () => {
      cy.get('article[aria-label="Start at :05 meeting policy"]').should(
        'exist'
      );
    });
  });
});
