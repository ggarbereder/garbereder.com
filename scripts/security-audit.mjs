import { spawnSync } from 'node:child_process';

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
  }
);

process.exit(result.status ?? 1);
