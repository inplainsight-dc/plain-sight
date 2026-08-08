// Sync the canonical DMV tenant-law figures from the shared law brain into this
// repo's src/data so Astro can import them at build time. The law brain is the
// single source of truth (jurisdiction-facts.json — the machine-readable twin of
// the table in jurisdiction-deposits.md); this repo only ever holds a *generated
// copy*, so the /rentals/rights deposit figures can't silently drift from the law.
//
// Runs automatically before every build (see package.json "build"). Also:
//   npm run sync-law
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const brain = path.resolve(
  repo, '..',
  'new rental', 'plain-sight-rentals', 'skills', 'renter-setup', 'references', 'law'
);
const dest = path.join(repo, 'src', 'data', 'law');
const files = ['jurisdiction-facts.json'];

fs.mkdirSync(dest, { recursive: true });

// Validate the shape we depend on, so a malformed edit fails the build loudly
// rather than shipping a broken deposit calculator.
function validate(name, obj) {
  if (!obj || typeof obj !== 'object') throw new Error(name + ': not an object');
  if (!obj.asOf) throw new Error(name + ': missing asOf');
  if (!Array.isArray(obj.order) || obj.order.length === 0) throw new Error(name + ': missing order[]');
  if (!obj.jurisdictions || typeof obj.jurisdictions !== 'object') throw new Error(name + ': missing jurisdictions');
  for (const code of obj.order) {
    const j = obj.jurisdictions[code];
    if (!j) throw new Error(name + ': order lists ' + code + ' but jurisdictions.' + code + ' is missing');
    if (typeof j.name !== 'string') throw new Error(name + '.' + code + ': missing name');
    if (typeof j.depositCapMonths !== 'number') throw new Error(name + '.' + code + ': depositCapMonths must be a number');
    if (typeof j.lastMonthOnTop !== 'boolean') throw new Error(name + '.' + code + ': lastMonthOnTop must be a boolean');
    if (typeof j.depositLine !== 'string') throw new Error(name + '.' + code + ': missing depositLine');
  }
}

if (!fs.existsSync(brain)) {
  // Law brain not present (e.g. an isolated checkout without the sibling folder).
  // Fall back to the committed copy already in src/data — never fail the build.
  const haveAll = files.every((f) => fs.existsSync(path.join(dest, f)));
  if (haveAll) {
    console.log('[sync-law-data] law brain not found; using committed copy in src/data/law');
    process.exit(0);
  }
  console.error('[sync-law-data] law brain not found AND no committed copy in src/data/law — cannot build');
  process.exit(1);
}

let n = 0;
for (const f of files) {
  const src = path.join(brain, f);
  const raw = fs.readFileSync(src);
  const parsed = JSON.parse(raw.toString('utf8')); // throws on malformed JSON
  validate(f, parsed);
  fs.writeFileSync(path.join(dest, f), raw);
  n++;
}

fs.writeFileSync(
  path.join(dest, '_SOURCE.md'),
  '# Generated copy — do not edit\n\n' +
    'Synced from the canonical source of truth in the shared law brain:\n' +
    '`new rental/plain-sight-rentals/skills/renter-setup/references/law/jurisdiction-facts.json`\n' +
    '(the machine-readable twin of the table in `jurisdiction-deposits.md`).\n\n' +
    'Regenerate with `npm run sync-law` (also runs automatically on `npm run build`).\n' +
    'Edit the figures in the law brain, never here — this copy is overwritten on every build.\n'
);

console.log('[sync-law-data] synced ' + n + ' file(s) from the law brain -> src/data/law');
