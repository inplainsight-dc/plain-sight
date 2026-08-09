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
const files = ['jurisdiction-facts.json', 'rights-cards.json', 'lease-clauses.json', 'move-in.json'];

fs.mkdirSync(dest, { recursive: true });

// Validate the shapes we depend on, so a malformed edit fails the build loudly
// rather than shipping a broken calculator or empty rights cards. Dispatched by
// filename so each synced file is checked against the shape its page consumes.
const validators = {
  'jurisdiction-facts.json': validateFacts,
  'rights-cards.json': validateCards,
  'lease-clauses.json': validateClauses,
  'move-in.json': validateMoveIn,
};
function validate(name, obj) {
  const fn = validators[name];
  if (!fn) throw new Error(name + ': no validator registered');
  fn(name, obj);
}

function validateFacts(name, obj) {
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

// The §02 rights cards + §03 help + §04 sources. A card is either an inline card
// (ask/verdict/label/say/src) or a reference {ref} into shared. Every verdict must
// be one the page can style, and every {ref} must resolve — a typo'd ref would
// otherwise render a blank card silently.
const VERDICTS = new Set(['no', 'ask']);
function validateCard(where, c, shared) {
  if (!c || typeof c !== 'object') throw new Error(where + ': card is not an object');
  if (c.ref !== undefined) {
    if (!shared[c.ref]) throw new Error(where + ': ref "' + c.ref + '" not found in shared');
    return;
  }
  for (const k of ['ask', 'label', 'say', 'src']) {
    if (typeof c[k] !== 'string' || !c[k]) throw new Error(where + ': missing ' + k);
  }
  if (!VERDICTS.has(c.verdict)) throw new Error(where + ': verdict must be one of ' + [...VERDICTS].join('/'));
  if (!('href' in c)) throw new Error(where + ': missing href (use null for none)');
}
function validateCards(name, obj) {
  if (!obj || typeof obj !== 'object') throw new Error(name + ': not an object');
  if (!obj.shared || typeof obj.shared !== 'object') throw new Error(name + ': missing shared{}');
  for (const [key, c] of Object.entries(obj.shared)) validateCard(name + '.shared.' + key, c, obj.shared);
  if (!obj.byJurisdiction || typeof obj.byJurisdiction !== 'object') throw new Error(name + ': missing byJurisdiction{}');
  for (const [code, list] of Object.entries(obj.byJurisdiction)) {
    if (!Array.isArray(list) || list.length === 0) throw new Error(name + '.byJurisdiction.' + code + ': must be a non-empty array');
    list.forEach((c, i) => validateCard(name + '.byJurisdiction.' + code + '[' + i + ']', c, obj.shared));
  }
  for (const listName of ['help', 'sources']) {
    if (!Array.isArray(obj[listName]) || obj[listName].length === 0) throw new Error(name + ': missing ' + listName + '[]');
  }
}

// The /rentals/lease-check clauses. Same shared/{ref} shape as the rights cards,
// but a clause carries clause/verdict/label/ask/src/href, and the verdict is one
// of the three lease-review buckets (illegal / unenforceable / negotiable). A bad
// verdict or an unresolved {ref} would render a mis-bucketed or blank card, so
// both fail the build here rather than shipping silently.
const CLAUSE_VERDICTS = new Set(['illegal', 'unenforceable', 'negotiable']);
function validateClause(where, c, shared) {
  if (!c || typeof c !== 'object') throw new Error(where + ': clause is not an object');
  if (c.ref !== undefined) {
    if (!shared[c.ref]) throw new Error(where + ': ref "' + c.ref + '" not found in shared');
    return;
  }
  for (const k of ['clause', 'label', 'ask', 'src']) {
    if (typeof c[k] !== 'string' || !c[k]) throw new Error(where + ': missing ' + k);
  }
  if (!CLAUSE_VERDICTS.has(c.verdict)) throw new Error(where + ': verdict must be one of ' + [...CLAUSE_VERDICTS].join('/'));
  if (!('href' in c)) throw new Error(where + ': missing href (use null for none)');
  // Optional: a not-yet-in-force caveat rendered on the card (e.g. a law with a
  // future effective date). If present it must be real text, not an empty string.
  if ('effective' in c && (typeof c.effective !== 'string' || !c.effective)) {
    throw new Error(where + ': effective must be a non-empty string when present');
  }
}
function validateClauses(name, obj) {
  if (!obj || typeof obj !== 'object') throw new Error(name + ': not an object');
  if (!obj.shared || typeof obj.shared !== 'object') throw new Error(name + ': missing shared{}');
  for (const [key, c] of Object.entries(obj.shared)) validateClause(name + '.shared.' + key, c, obj.shared);
  if (!obj.byJurisdiction || typeof obj.byJurisdiction !== 'object') throw new Error(name + ': missing byJurisdiction{}');
  for (const [code, list] of Object.entries(obj.byJurisdiction)) {
    if (!Array.isArray(list) || list.length === 0) throw new Error(name + '.byJurisdiction.' + code + ': must be a non-empty array');
    list.forEach((c, i) => validateClause(name + '.byJurisdiction.' + code + '[' + i + ']', c, obj.shared));
  }
  for (const listName of ['help', 'sources']) {
    if (!Array.isArray(obj[listName]) || obj[listName].length === 0) throw new Error(name + ': missing ' + listName + '[]');
  }
}

// The /rentals/move-in deposit-protection surface. Unlike the shared/{ref} files
// above, this one is a flat per-jurisdiction facts panel (returnWindow / itemized
// / interest / inspection / penalty + cites) plus a universal checklist and the
// printable condition inventory. A missing return-window or an unstyleable
// inspection value would render a blank or mis-tagged panel, so both fail here
// rather than shipping silently. Legal claims verified against primary statute —
// see each jurisdiction's cites[]; keep them in step with the law brain.
const INSPECTION_KINDS = new Set(['no-statutory', 'on-request', 'strong']);
function validateMoveIn(name, obj) {
  if (!obj || typeof obj !== 'object') throw new Error(name + ': not an object');
  if (!obj.asOf) throw new Error(name + ': missing asOf');
  if (!Array.isArray(obj.order) || obj.order.length === 0) throw new Error(name + ': missing order[]');
  if (!obj.depositReturn || typeof obj.depositReturn !== 'object') throw new Error(name + ': missing depositReturn{}');
  for (const code of obj.order) {
    const d = obj.depositReturn[code];
    if (!d) throw new Error(name + ': order lists ' + code + ' but depositReturn.' + code + ' is missing');
    for (const k of ['name', 'returnWindow', 'itemized', 'interest', 'inspectionNote', 'penalty']) {
      if (typeof d[k] !== 'string' || !d[k]) throw new Error(name + '.' + code + ': missing ' + k);
    }
    if (!INSPECTION_KINDS.has(d.inspection)) throw new Error(name + '.' + code + ': inspection must be one of ' + [...INSPECTION_KINDS].join('/'));
    if (!Array.isArray(d.cites) || d.cites.length === 0) throw new Error(name + '.' + code + ': missing cites[]');
    d.cites.forEach((c, i) => {
      if (!Array.isArray(c) || typeof c[0] !== 'string' || typeof c[1] !== 'string') throw new Error(name + '.' + code + '.cites[' + i + ']: must be [label, href]');
    });
  }
  // Checklist: non-empty phases, each with non-empty items carrying item/why;
  // an optional `jur` must name a real jurisdiction so it can't hide forever.
  if (!Array.isArray(obj.checklist) || obj.checklist.length === 0) throw new Error(name + ': missing checklist[]');
  obj.checklist.forEach((ph, pi) => {
    if (typeof ph.phase !== 'string' || !ph.phase) throw new Error(name + '.checklist[' + pi + ']: missing phase');
    if (!Array.isArray(ph.items) || ph.items.length === 0) throw new Error(name + '.checklist[' + pi + ']: missing items[]');
    ph.items.forEach((it, ii) => {
      const where = name + '.checklist[' + pi + '].items[' + ii + ']';
      for (const k of ['item', 'why']) {
        if (typeof it[k] !== 'string' || !it[k]) throw new Error(where + ': missing ' + k);
      }
      if ('jur' in it && !obj.order.includes(it.jur)) throw new Error(where + ': jur "' + it.jur + '" not in order[]');
    });
  });
  // Printable inventory: intro + a room list, each room with items.
  if (!obj.inventory || typeof obj.inventory !== 'object') throw new Error(name + ': missing inventory{}');
  if (typeof obj.inventory.intro !== 'string' || !obj.inventory.intro) throw new Error(name + ': missing inventory.intro');
  if (!Array.isArray(obj.inventory.rooms) || obj.inventory.rooms.length === 0) throw new Error(name + ': missing inventory.rooms[]');
  obj.inventory.rooms.forEach((r, ri) => {
    if (typeof r.name !== 'string' || !r.name) throw new Error(name + '.inventory.rooms[' + ri + ']: missing name');
    if (!Array.isArray(r.items) || r.items.length === 0) throw new Error(name + '.inventory.rooms[' + ri + ']: missing items[]');
  });
  for (const listName of ['help', 'sources']) {
    if (!Array.isArray(obj[listName]) || obj[listName].length === 0) throw new Error(name + ': missing ' + listName + '[]');
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
    'Synced from the canonical source of truth in the shared law brain\n' +
    '(`new rental/plain-sight-rentals/skills/renter-setup/references/law/`):\n\n' +
    '- `jurisdiction-facts.json` — up-front-money figures (twin of the table in `jurisdiction-deposits.md`); feeds the §01 deposit calculator.\n' +
    '- `rights-cards.json` — the §02 “when a landlord asks for X” cards + §03 help + §04 sources (twin of `landlord-tactics.md` and the jurisdiction topic files).\n' +
    '- `lease-clauses.json` — the /rentals/lease-check illegal / unenforceable / negotiable clause reads + asks (twin of the `lease-review` skill + `landlord-tactics.md`).\n' +
    '- `move-in.json` — the /rentals/move-in deposit-return facts + move-in checklist + printable condition inventory (deposit-return law twin of `jurisdiction-deposits.md`).\n\n' +
    'Regenerate with `npm run sync-law` (also runs automatically on `npm run build`).\n' +
    'Edit the content in the law brain, never here — this copy is overwritten on every build.\n'
);

console.log('[sync-law-data] synced ' + n + ' file(s) from the law brain -> src/data/law');
