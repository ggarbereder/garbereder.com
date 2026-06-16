const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const axeOptions = {
  runOnly: {
    type: 'tag',
    values: WCAG_AA_TAGS,
  },
};

Cypress.Commands.add('checkA11yPage', (context = null, options = {}) => {
  cy.injectAxe();
  cy.checkA11y(context, { ...axeOptions, ...options }, (violations) => {
    if (violations.length) {
      const summary = violations
        .map(
          (violation) =>
            `${violation.id} (${violation.impact}): ${violation.help}\n${violation.nodes
              .map((node) => node.html)
              .join('\n')}`
        )
        .join('\n\n');
      throw new Error(`Accessibility violations:\n${summary}`);
    }
  });
});
