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
      cy.get('[role="img"][aria-label*="50-minute meeting"]').should('exist');
      cy.get('[role="img"][aria-label*="50-minute meeting"]')
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

    it('distinguishes calendar block lengths from meeting durations', () => {
      cy.get('main').should('contain.text', '30- or 60-minute blocks');
      cy.get('main').should('contain.text', '50-minute meeting');
      cy.get('main').should('contain.text', '25-minute meeting');
    });

    it('displays the reasons on-the-hour starts cause friction', () => {
      cy.get('main').within(() => {
        cy.get('h3')
          .first()
          .invoke('text')
          .should('match', /starting on the hour.*friction/i);
      });
      cy.get('.card .list li').should('have.length.at.least', 3);
    });
  });

  describe('Section: The fix: Start at :05', () => {
    it('displays section heading', () => {
      cy.contains('h2', 'The fix: Start at :05').should('exist');
    });

    it('mentions start at :05 and :35 for half-hour', () => {
      cy.get('main').should('contain.text', ':05');
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

    it('shows a 50-minute meeting inside a 60-minute calendar block', () => {
      cy.get('main').should(
        'contain.text',
        '60-minute calendar block, schedule a 50-minute meeting'
      );
      cy.get('.slot .time').first().should('contain.text', '10:05');
      cy.get('.slot .time').first().should('contain.text', '10:55');
    });

    it('shows 25-minute meetings in both half-hour blocks', () => {
      cy.get('main')
        .invoke('text')
        .then((content) => {
          const normalizedContent = content.replace(/\s+/g, ' ');
          expect(normalizedContent).to.include(
            '30-minute calendar block, schedule a 25-minute meeting'
          );
        });
      cy.get('.slot').should('have.length', 3);
      cy.get('.slot .time').eq(1).should('contain.text', '10:05');
      cy.get('.slot .time').eq(1).should('contain.text', '10:30');
      cy.get('.slot .time').eq(2).should('contain.text', '10:35');
      cy.get('.slot .time').eq(2).should('contain.text', '11:00');
    });

    it('labels each slot by its meeting duration and calendar block', () => {
      cy.get('.slot .label').eq(0).should('contain.text', '50-minute meeting');
      cy.get('.slot .label').eq(0).should('contain.text', '60-minute block');
      cy.get('.slot .label').eq(1).should('contain.text', '25-minute meeting');
      cy.get('.slot .label').eq(2).should('contain.text', '25-minute meeting');
    });
  });

  describe('Shareable policy', () => {
    it('presents the policy as separate rules for each calendar block', () => {
      cy.get('[aria-label="Copyable meeting policy"]').within(() => {
        cy.contains('h3', 'The team standard').should('exist');
        cy.contains('60-minute calendar block').should('exist');
        cy.contains('50-minute meeting').should('exist');
        cy.contains('Start :05').should('exist');
        cy.contains('30-minute calendar block').should('exist');
        cy.contains('25-minute meeting').should('exist');
        cy.contains('Keep the transition time between meetings clear.').should(
          'exist'
        );
      });
    });

    it('copies the policy and announces success', () => {
      let writeText;
      cy.window().then((win) => {
        writeText = cy.stub().resolves();
        Object.defineProperty(win.navigator, 'clipboard', {
          configurable: true,
          value: { writeText },
        });
      });

      cy.get('#sa05-copy-policy').click();
      cy.get('#sa05-copy-status').should(
        'have.text',
        'Policy copied to clipboard.'
      );
      cy.then(() => {
        expect(writeText).to.have.been.calledOnce;
        expect(writeText.firstCall.args[0]).to.include(
          '60-minute calendar block: 50-minute meeting, :05 to :55.'
        );
        expect(writeText.firstCall.args[0]).to.include(
          '30-minute calendar block: 25-minute meeting, :05 to :30 or :35 to :00.'
        );
      });
    });

    it('explains how to copy the text manually when clipboard access fails', () => {
      cy.window().then((win) => {
        Object.defineProperty(win.navigator, 'clipboard', {
          configurable: true,
          value: {
            writeText: cy.stub().rejects(new Error('Clipboard unavailable')),
          },
        });
      });

      cy.get('#sa05-copy-policy').click();
      cy.get('#sa05-copy-status').should(
        'have.text',
        'Could not copy automatically. Select the policy text above and copy it.'
      );
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
      cy.get('footer a[href="https://www.garbereder.com"]').should(
        'have.attr',
        'target',
        '_blank'
      );
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
