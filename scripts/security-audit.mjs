import { spawnSync } from 'node:child_process';

import { npmEnv } from './npm-env.mjs';

/**
 * Advisories we knowingly accept, each with an expiry date. Once `expires`
 * passes the entry stops suppressing and the audit fails again, so an
 * exception has to be renewed deliberately instead of rotting in place.
 */
const ALLOWLIST = [];

const npmExecPath = process.env.npm_execpath;
if (!npmExecPath) {
  console.error('security:audit must be run via npm run security:audit');
  process.exit(1);
}

/**
 * The registry audit endpoint intermittently stalls until npm's own retries
 * give up, which surfaces as an `error` object with blank fields. A single
 * attempt therefore fails the whole job on a transient network fault, so cap
 * each call and retry before giving up.
 */
const ATTEMPTS = 3;
const ATTEMPT_TIMEOUT_MS = 120_000;

const describeError = (error) =>
  [error?.summary, error?.detail, error?.code]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' - ') || JSON.stringify(error);

const attemptAudit = () => {
  const result = spawnSync(
    process.execPath,
    ['--use-system-ca', npmExecPath, 'audit', '--json'],
    {
      encoding: 'utf8',
      env: npmEnv(),
      timeout: ATTEMPT_TIMEOUT_MS,
      maxBuffer: 32 * 1024 * 1024,
    }
  );

  if (result.error) {
    return { error: result.error.message };
  }

  let parsed;
  try {
    parsed = JSON.parse(result.stdout);
  } catch {
    return { error: result.stdout || result.stderr || 'no audit output' };
  }

  return parsed.error
    ? { error: describeError(parsed.error) }
    : { report: parsed };
};

let report;
let lastError;
for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
  const outcome = attemptAudit();
  if (outcome.report) {
    report = outcome.report;
    break;
  }
  lastError = outcome.error;
  console.error(
    `npm audit attempt ${attempt}/${ATTEMPTS} failed: ${lastError}`
  );
}

if (!report) {
  console.error(`\nnpm audit could not be completed: ${lastError}`);
  process.exit(1);
}

const advisoryId = (url) => url?.match(/GHSA-[\w-]+/)?.[0];

const found = new Map();
for (const vuln of Object.values(report.vulnerabilities ?? {})) {
  for (const via of vuln.via) {
    if (typeof via !== 'object') continue;
    const id = advisoryId(via.url);
    if (!id) continue;
    if (!found.has(id)) {
      found.set(id, {
        id,
        severity: via.severity,
        title: via.title,
        packages: new Set(),
      });
    }
    found.get(id).packages.add(via.name);
  }
}

const today = new Date().toISOString().slice(0, 10);
const allowed = new Map(ALLOWLIST.map((entry) => [entry.id, entry]));

const blocking = [];
const accepted = [];
const expired = [];

for (const advisory of found.values()) {
  const entry = allowed.get(advisory.id);
  if (!entry) {
    blocking.push(advisory);
  } else if (entry.expires < today) {
    expired.push({ advisory, entry });
  } else {
    accepted.push({ advisory, entry });
  }
}

const describe = ({ severity, title, packages, id }) =>
  `  ${severity.padEnd(8)} ${[...packages].join(', ')}\n    ${title}\n    https://github.com/advisories/${id}`;

for (const { advisory, entry } of accepted) {
  console.log(`Accepted ${advisory.id} (expires ${entry.expires})`);
  console.log(`  ${entry.reason}`);
}

for (const id of allowed.keys()) {
  if (!found.has(id)) {
    console.log(
      `Allowlist entry ${id} no longer matches any advisory - remove it.`
    );
  }
}

for (const { advisory, entry } of expired) {
  console.error(
    `\nEXPIRED allowlist entry ${advisory.id} (expired ${entry.expires}):`
  );
  console.error(describe(advisory));
}

if (blocking.length) {
  console.error(
    `\n${blocking.length} unaccepted advisor${blocking.length === 1 ? 'y' : 'ies'}:`
  );
  for (const advisory of blocking) console.error(describe(advisory));
}

const failures = blocking.length + expired.length;
if (failures) {
  console.error(
    `\nSecurity audit failed: ${failures} advisor${failures === 1 ? 'y' : 'ies'} need attention.`
  );
  process.exit(1);
}

console.log(
  `\nSecurity audit passed (${accepted.length} accepted, 0 outstanding).`
);
