import codeCoverage from '@cypress/code-coverage/task';
import { defineConfig } from 'cypress';
import compareSnapshotPlugin from 'cypress-image-diff-js/plugin';

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    setupNodeEvents(on, config) {
      codeCoverage(on, config);
      compareSnapshotPlugin(on, config);
      return config;
    },
  },
});
