import { spawnSync } from 'node:child_process';

import { npmEnv } from './npm-env.mjs';

/**
 * Advisories we knowingly accept, each with an expiry date. Once `expires`
 * passes the entry stops suppressing and the audit fails again, so an
 * exception has to be renewed deliberately instead of rotting in place.
 */
const ALLOWLIST = [
  // ── brace-expansion ──────────────────────────────────────────────────────
  {
    id: 'GHSA-mh99-v99m-4gvg',
    expires: '2026-08-15',
    reason:
      'brace-expansion OOM (CVE-2026-14257). Reaches us only via minimatch@3 in the ' +
      'eslint toolchain; no patched 1.x is published yet. Brace patterns come ' +
      'from our own lint config, never untrusted input, and none of it ships to the site.',
  },
  {
    id: 'GHSA-3jxr-9vmj-r5cp',
    expires: '2026-08-15',
    reason:
      'brace-expansion exponential-time DoS via consecutive non-expanding {} groups. ' +
      'Reaches us only via minimatch in the eslint toolchain; no patched 1.x/5.x yet. ' +
      'Brace patterns come from our own lint config, never untrusted input, not shipped.',
  },
  // ── axios ─────────────────────────────────────────────────────────────────
  // All axios advisories: axios is a dev-only dependency (Cypress testing) and
  // is not present in the built site output. A dedicated dependabot PR bumps it.
  {
    id: 'GHSA-42h9-826w-cgv3',
    expires: '2026-08-15',
    reason:
      'axios excessive recursion in formDataToJSON. Dev-only (Cypress). Not shipped.',
  },
  {
    id: 'GHSA-7q8q-rj6j-mhjq',
    expires: '2026-08-15',
    reason:
      'axios nested option objects consume polluted prototype values. Dev-only. Not shipped.',
  },
  {
    id: 'GHSA-f4gw-2p7v-4548',
    expires: '2026-08-15',
    reason:
      'axios NO_PROXY bypass for 0.0.0.0. Dev-only (Cypress). Not shipped.',
  },
  {
    id: 'GHSA-gcfj-64vw-6mp9',
    expires: '2026-08-15',
    reason:
      'axios Node HTTP adapter inherits proxy. Dev-only (Cypress). Not shipped.',
  },
  {
    id: 'GHSA-hcpx-6fm6-wx23',
    expires: '2026-08-15',
    reason:
      'axios form serializer maxDepth bypass. Dev-only (Cypress). Not shipped.',
  },
  {
    id: 'GHSA-jqh4-m9w3-8hp9',
    expires: '2026-08-15',
    reason:
      'axios Fetch adapter ReadableStream uploads bypass maxBodyLength. Dev-only. Not shipped.',
  },
  {
    id: 'GHSA-mmx7-hfxf-jppx',
    expires: '2026-08-15',
    reason:
      'axios prototype pollution gadgets alter request. Dev-only (Cypress). Not shipped.',
  },
  {
    id: 'GHSA-mwf2-3pr3-8698',
    expires: '2026-08-15',
    reason:
      'axios HTTP/2 streamed uploads bypass maxBodyLength. Dev-only (Cypress). Not shipped.',
  },
  {
    id: 'GHSA-pmv8-rq9r-6j72',
    expires: '2026-08-15',
    reason:
      'axios deep formToJSON recursion DoS. Dev-only (Cypress). Not shipped.',
  },
  {
    id: 'GHSA-xj6q-8x83-jv6g',
    expires: '2026-08-15',
    reason:
      'axios prototype pollution auth subfields inject Basic auth. Dev-only. Not shipped.',
  },
  // ── fast-uri ──────────────────────────────────────────────────────────────
  // fast-uri is an indirect dependency; a dedicated dependabot PR upgrades it.
  {
    id: 'GHSA-4c8g-83qw-93j6',
    expires: '2026-08-15',
    reason:
      'fast-uri host confusion via failed IDN canonicalization. Build-time only. ' +
      'Pending upgrade via dependabot PR.',
  },
  {
    id: 'GHSA-v2hh-gcrm-f6hx',
    expires: '2026-08-15',
    reason:
      'fast-uri host confusion via literal backslash. Build-time only. ' +
      'Pending upgrade via dependabot PR.',
  },
  // ── js-yaml ──────────────────────────────────────────────────────────────
  {
    id: 'GHSA-52cp-r559-cp3m',
    expires: '2026-08-15',
    reason:
      'js-yaml YAML merge-key chains quadratic CPU. Used by eslint/build toolchain only; ' +
      'YAML input comes from our own config files, never untrusted input. Not shipped.',
  },
  // ── systeminformation ────────────────────────────────────────────────────
  {
    id: 'GHSA-5xpp-75jx-m839',
    expires: '2026-08-15',
    reason:
      'systeminformation OS command injection in networkInterfaces(). Dev-only dependency ' +
      'used for local dev tooling. Not shipped. Pending upgrade via dependabot PR.',
  },
  // ── immutable ────────────────────────────────────────────────────────────
  {
    id: 'GHSA-v56q-mh7h-f735',
    expires: '2026-08-15',
    reason:
      'Immutable.js List 32-bit trie overflow DoS. Indirect build-time dependency. ' +
      'Not shipped to site. Pending upgrade via dependabot PR.',
  },
  {
    id: 'GHSA-xvcm-6775-5m9r',
    expires: '2026-08-15',
    reason:
      'Immutable.js hash-collision algorithmic complexity DoS. Indirect build-time ' +
      'dependency. Not shipped to site. Pending upgrade via dependabot PR.',
  },
];

const npmExecPath = process.env.npm_execpath;
if (!npmExecPath) {
  console.error('security:audit must be run via npm run security:audit');
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ['--use-system-ca', npmExecPath, 'audit', '--json'],
  {
    encoding: 'utf8',
    env: npmEnv(),
  }
);

if (result.error) {
  console.error('npm audit failed to run:', result.error.message);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  console.error('Could not parse npm audit output:');
  console.error(result.stdout || result.stderr);
  process.exit(1);
}

if (report.error) {
  console.error(
    'npm audit reported an error:',
    report.error.summary ?? report.error
  );
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
