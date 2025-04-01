/// <reference types="cypress" />

describe(`Landingpage`, () => {
  before(() => {
    cy.visit('/')
    cy.screenshot()
  })

  beforeEach(() => {
    cy.visit('/')
  })

  it('Shows the portait', () => {
    cy.get('img').should('have.attr', 'src').should('include', 'portrait')
  })

  it('Shows the name', () => {
    cy.get('.text-orange-500').should('have.text', 'Gerrit Garbereder')
  })

  it('Shows the resume link', () => {
    const link = cy.get('a').first()
    link.should('have.text', 'Resume')
    link.should('have.attr', 'href').should('eq', '#cv')
  })

  it('Shows the resume', () => {
    cy.get('ol').find('li').should('have.length', 6)
    cy.get('ol').find('li').find('.job-date')
      .should('exist')
      .invoke('text')
      .should('match', /20[0-9]{2}\s-\sPresent|(20[0-9]{2})/)
    cy.get('ol').find('li').find('.job-title').should('exist')
    cy.get('ol').find('li').find('.job-description').should('exist')
  })

  it('Shows the email', () => {
    cy.get('a[href*="mailto:gerrit@garbereder.com"]').should('exist')
  })

  it('Shows the phonenumber', () => {
    cy.get('a[href*="tel:+37069456497"]').should('exist')
  })

  it('Shows linkedin link with icon', () => {
    cy.get('a[href*="https://www.linkedin.com/in/gerrit-garbereder-a74b6a96/"]').should('exist')
  })

  it('Shows github link with icon', () => {
    cy.get('a[href*="https://github.com/ggarbereder/garbereder.com"]').should('exist')
  })

  it('Shows icons8 link', () => {
    cy.get('a[href*="//icons8.com"]').should('exist')
  })

  it('Shows icons8 linkedin link', () => {
    cy.get('a[href*="//icons8.com/icon/84888/linkedin"]').should('exist')
  })

  it('Shows icons8 github link', () => {
    cy.get('a[href*="//icons8.com/icon/20675/github"]').should('exist')
  })

})
