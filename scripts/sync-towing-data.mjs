// Sync the duty table for DC Towing (/towing) from the research node into this
// repo's src/data so Astro can bake it into the page at build time.
//
// The research node is the single source of truth:
//   ../DC Towing/data/towing-duties.json
// which is itself generated (never hand-edited) by that project's
// scripts/build_duties.py directly from 16 DCMR chapter 4 in the DCMR corpus.
// Every duty there is bound to a VERBATIM ANCHOR that must still appear in the
// cited section, so if the District amends the chapter, the node's build fails
// rather than this page quietly misstating the law.
//
// WHY A PROJECTION AND NOT A COPY: the generated file carries the anchors and
// the provenance block, which are working material — the anchors in particular
// are strings chosen to be robust against typography, not sentences meant for a
// reader. Selecting here, loudly and with a schema check, means the page cannot
// start rendering a field nobody reviewed for a public audience.
//
// RUN:  npm run sync-towing
//       npm run sync-towing -- --check   (report drift, write nothing)
//
// Runs automatically before every build (see package.json "build").
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const node = path.resolve(repo, '..', 'DC Towing');
const srcFile = path.join(node, 'data', 'towing-duties.json');
const destDir = path.join(repo, 'src', 'data', 'towing');
const destFile = path.join(destDir, 'duties.json');

const CHECK = process.argv.includes('--check');
const TAG = '[sync-towing]';

// The groups the page renders, in reading order. Declared here rather than
// derived, so a new group appearing upstream is a loud failure instead of a
// silent no-show: an unrendered duty is worse than a broken build, because
// nobody sees it missing.
const GROUP_ORDER = [
  'towed-from-private-property',
  'any-tow',
  'the-truck',
  'accident-scene',
  'licensing',
];

function fail(msg, code = 1) {
  console.error(`${TAG} ${msg}`);
  process.exit(code);
}

// No research node present (isolated checkout / CI): fall back to the committed
// projection so the site still builds standalone.
if (!fs.existsSync(srcFile)) {
  if (CHECK) fail(`--check: research node not found at ${srcFile}`, 2);
  if (fs.existsSync(destFile)) {
    console.log(`${TAG} research node absent — keeping the committed projection`);
    process.exit(0);
  }
  fail(`research node not found at ${srcFile}, and no committed projection to fall back on`);
}

let src;
try {
  src = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
} catch (e) {
  fail(`could not parse ${srcFile}: ${e.message}`);
}

// ---- validate the upstream shape -------------------------------------------
if (src.schema !== 'towing-duties/1.0') {
  fail(`unexpected schema ${JSON.stringify(src.schema)} — expected "towing-duties/1.0". ` +
       `The node changed its output format; review before shipping.`);
}
if (!Array.isArray(src.duties) || src.duties.length === 0) fail('no duties[] in the node output');

// The rate schedule is the page's ONLY source for the figures the receipt checker
// computes against. It used to hold them as literals in its script, which put the
// one component that states a dollar conclusion outside the drift guard the page
// advertises (Wave 3, D-1). Refusing to project without it is the point: a node
// that stops emitting rates must break the build, not quietly fall back.
const RATES_REQUIRED = ['standard_tow', 'heavy_tow', 'storage_per_day', 'drop_fee'];
const rates = src.rate_schedule?.rates;
if (!rates || typeof rates !== 'object') {
  fail('no rate_schedule.rates in the node output — the page computes against these, ' +
       'so it will not build without them. Re-run the node build_duties.py.');
}
for (const k of RATES_REQUIRED) {
  if (typeof rates[k] !== 'number' || !(rates[k] > 0)) {
    fail(`rate_schedule.rates.${k} is ${JSON.stringify(rates[k])} — expected a positive number. ` +
         `The receipt checker would compute against it.`);
  }
}
if (!(rates.standard_tow < rates.heavy_tow)) {
  fail(`rate_schedule: standard tow ${rates.standard_tow} is not below heavy ${rates.heavy_tow} — ` +
       `the parse is wrong, and the checker would inherit it.`);
}
if (!Array.isArray(src.definitions) || src.definitions.length === 0) fail('no definitions[] in the node output');

const seenGroups = new Set(src.duties.map((d) => d.group));
const unknown = [...seenGroups].filter((g) => !GROUP_ORDER.includes(g));
if (unknown.length) {
  fail(`the node emitted group(s) this page does not render: ${unknown.join(', ')}. ` +
       `Add them to GROUP_ORDER (and to the page) rather than letting duties go unshown.`);
}
const missing = GROUP_ORDER.filter((g) => !seenGroups.has(g));
if (missing.length) fail(`expected group(s) absent upstream: ${missing.join(', ')}`);

for (const [i, d] of src.duties.entries()) {
  for (const k of ['citation', 'plain', 'group']) {
    if (typeof d[k] !== 'string' || !d[k].trim()) fail(`duties[${i}]: missing ${k}`);
  }
  if (!/^16 DCMR § \d+\.\d+$/.test(d.citation)) fail(`duties[${i}]: odd citation ${JSON.stringify(d.citation)}`);
}
for (const [i, d] of src.definitions.entries()) {
  for (const k of ['term', 'citation', 'plain']) {
    if (typeof d[k] !== 'string' || !d[k].trim()) fail(`definitions[${i}]: missing ${k}`);
  }
}

// ---- build the projection ---------------------------------------------------
// Anchors and corpus paths are deliberately dropped: working material, and a
// local filesystem path has no business on a public page.
const projection = {
  generatedFrom: 'DC Towing · scripts/build_duties.py',
  nodeGeneratedAt: src.generated_at ?? null,
  chapter: src.provenance?.chapter ?? '16 DCMR chapter 4',
  currencyVerified: src.provenance?.currency_verified ?? null,
  groupOrder: GROUP_ORDER,
  rateSchedule: { cite: src.rate_schedule.cite, rates },
  definitions: src.definitions.map((d) => ({
    term: d.term,
    citation: d.citation,
    plain: d.plain,
  })),
  duties: src.duties.map((d) => ({
    group: d.group,
    citation: d.citation,
    heading: d.section_heading ?? null,
    plain: d.plain,
    infractionClass: d.infraction_class ?? null,
    infractionClassVia: d.infraction_class_via ?? null,
  })),
};

// Sanity check the projection itself — the counts the page will print.
const classed = projection.duties.filter((d) => d.infractionClass).length;
if (classed === 0) fail('projection carries no infraction classes at all — the node parse broke');

const serialized = JSON.stringify(projection, null, 2) + '\n';

if (CHECK) {
  if (!fs.existsSync(destFile)) fail('--check: no committed projection at src/data/towing/duties.json', 2);
  if (fs.readFileSync(destFile, 'utf8') !== serialized) {
    fail('--check: STALE — the committed projection does not match the research node. ' +
         'Run `npm run sync-towing`.', 2);
  }
  console.log(`${TAG} --check: in step with the research node ` +
              `(${projection.duties.length} duties, ${classed} classed, ` +
              `${Object.keys(rates).length} rates from ${src.rate_schedule.cite})`);
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.writeFileSync(destFile, serialized);
console.log(`${TAG} wrote ${path.relative(repo, destFile)} — ` +
            `${projection.duties.length} duties (${classed} with an infraction class), ` +
            `${projection.definitions.length} definitions`);
