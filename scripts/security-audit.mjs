import { spawnSync } from 'node:child_process';

import { npmEnv } from './npm-env.mjs';

const npmExecPath = process.env.npm_execpath;
if (!npmExecPath) {
  console.error('security:audit must be run via npm run security:audit');
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ['--use-system-ca', npmExecPath, 'audit'],
  {
    stdio: 'inherit',
    env: npmEnv(),
  }
);

process.exit(result.status ?? 1);
