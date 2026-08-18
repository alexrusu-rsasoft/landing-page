#!/usr/bin/env node
/**
 * Writes src/environments/environment.ts from environment variables.
 *
 * On Render, EXPERIENCE_API_URL / CAREERS_API_URL / OFFERS_API_URL /
 * DEVELOPER_PROFILES_API_URL / LEAD_MAGNET_API_URL are set in the dashboard
 * (see render.yaml, sync: false) so the real Apps Script URLs never live in
 * the git repo.
 *
 * Locally, these env vars are usually unset — in that case this script does
 * nothing and leaves your manually created (gitignored) environment.ts alone.
 */
const fs = require('fs');
const path = require('path');

const VARS = {
  experienceApiUrl: 'EXPERIENCE_API_URL',
  careersApiUrl: 'CAREERS_API_URL',
  offersApiUrl: 'OFFERS_API_URL',
  developerProfilesApiUrl: 'DEVELOPER_PROFILES_API_URL',
  leadMagnetApiUrl: 'LEAD_MAGNET_API_URL',
};

const outFile = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');
const present = Object.values(VARS).filter((name) => process.env[name]);

if (present.length === 0) {
  if (fs.existsSync(outFile)) {
    console.log('generate-env: no API env vars set, keeping existing environment.ts');
    process.exit(0);
  }
  console.error(
    `generate-env: environment.ts is missing and none of ${Object.values(VARS).join(', ')} are set.\n` +
      'Copy src/environments/environment.example.ts to environment.ts and fill in real values, ' +
      'or set the env vars (required on Render).',
  );
  process.exit(1);
}

const missing = Object.values(VARS).filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`generate-env: missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const lines = Object.entries(VARS)
  .map(([key, envName]) => `  ${key}: ${JSON.stringify(process.env[envName])},`)
  .join('\n');

const content = `// Generated at build time by scripts/generate-env.js from environment variables.
// Do not edit directly, and do not commit this file with real values.
export const environment = {
${lines}
};
`;

fs.writeFileSync(outFile, content);
console.log('generate-env: wrote environment.ts from env vars');
