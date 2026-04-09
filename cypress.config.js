import codeCoverage from '@cypress/code-coverage/task';
import { defineConfig } from 'cypress';

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    setupNodeEvents(on, config) {
      codeCoverage(on, config);
      return config;
    },
  },
});
