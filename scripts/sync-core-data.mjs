// Sync the canonical DC records-retention data from constellation-core into this
// repo's src/data so Astro can import it at build time. The core is the single
// source of truth (D1: the public node displays only what a publish-step off a
// shared data core exports); this repo only ever holds a *generated copy*.
//
// Runs automatically before every build (see package.json "build"). Also:
//   npm run sync-core
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const core = path.resolve(repo, '..', 'constellation-core', 'data', 'dc-records-retention');
const dest = path.join(repo, 'src', 'data', 'dc-records-retention');
const files = ['schedules.json', 'register.json'];

fs.mkdirSync(dest, { recursive: true });

if (!fs.existsSync(core)) {
  // Core not present (e.g. an isolated CI checkout without the sibling repo).
  // Fall back to the committed copy already in src/data — never fail the build.
  const haveAll = files.every((f) => fs.existsSync(path.join(dest, f)));
  if (haveAll) {
    console.log('[sync-core-data] constellation-core not found; using committed copy in src/data');
    process.exit(0);
  }
  console.error('[sync-core-data] constellation-core not found AND no committed copy in src/data — cannot build');
  process.exit(1);
}

let n = 0;
for (const f of files) {
  const raw = fs.readFileSync(path.join(core, f));
  JSON.parse(raw.toString('utf8')); // validate before copying
  fs.writeFileSync(path.join(dest, f), raw);
  n++;
}

fs.writeFileSync(
  path.join(dest, '_SOURCE.md'),
  '# Generated copy — do not edit\n\n' +
    'Copied from the canonical source of truth:\n' +
    '`constellation-core/data/dc-records-retention/`.\n\n' +
    'Regenerate with `npm run sync-core` (also runs automatically on `npm run build`).\n' +
    'Edit the data in constellation-core, never here.\n'
);

console.log('[sync-core-data] synced ' + n + ' file(s) from constellation-core -> src/data/dc-records-retention');
