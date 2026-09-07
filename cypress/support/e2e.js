import '@cypress/code-coverage/support';
import 'cypress-axe';
import compareSnapshotCommand from 'cypress-image-diff-js/command';

import './a11y';

compareSnapshotCommand();
