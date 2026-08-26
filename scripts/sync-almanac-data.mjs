// Sync the Civic Almanac ("electify") content from its own folder into this
// repo's src/data so Astro can render it at build time — the same drift-proof
// JSON-twin pattern as sync-law-data.mjs. The Almanac's source of truth is the
// avenue / binding / instance-config records in
//   100 IPS Electify/schema/examples/
// This repo only ever holds a *generated* bundle, so the /almanac page can't
// silently drift from the content the validator guards.
//
// Two jobs, in order:
//   1. GATE — run the Almanac's own validator (schema/validate.py) over the
//      source records and FAIL THE BUILD on any error. The neutrality and
//      footprint-privacy invariants are enforced there as a failing test, not a
//      memo, so a bad edit stops the build loudly instead of shipping. This is
//      the p2-t1 acceptance criterion: "schema/validate.py runs in the build and
//      fails it on error." Needs Python + jsonschema; a project-local .venv is
//      preferred (see the setup note in README/handoff), with system python3 as a
//      fallback. If neither can run it, the build fails — the gate is never
//      silently skipped.
//   2. RESOLVE — read instance-config, and for each ENABLED avenue resolve its
//      binding + avenue record into one neutral bundle written to
//      src/data/almanac/almanac.json. The bundle is what the page imports, so the
//      .astro template names no jurisdiction: everything DC-specific arrives as
//      data (the fork seam). A disabled avenue (the ANC binding) is skipped
//      cleanly.
//
// Runs automatically before every build (see package.json "build"). Also:
//   npm run sync-almanac
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const electify = path.resolve(repo, '..', '100 IPS Electify');
const examples = path.join(electify, 'schema', 'examples');
const validator = path.join(electify, 'schema', 'validate.py');
const dest = path.join(repo, 'src', 'data', 'almanac');

function fail(msg) {
  throw new Error(`[sync-almanac] ${msg}`);
}

if (!fs.existsSync(examples)) fail(`content source not found: ${examples}`);

// --- 1. GATE: run the Almanac validator over the source records ---------------
// Prefer the project-local venv (portable, doesn't touch system python); fall
// back to a system python3. validate.py exits non-zero on any problem.
const venvPy = path.join(repo, '.venv', 'bin', 'python3');
const python = fs.existsSync(venvPy) ? venvPy : 'python3';
const run = spawnSync(python, [validator, examples], { encoding: 'utf8' });

if (run.error && run.error.code === 'ENOENT') {
  fail(
    `cannot run the content validator: no Python found.\n` +
    `  The Almanac build gate needs Python + jsonschema. One-time setup:\n` +
    `    python3 -m venv .venv && ./.venv/bin/pip install jsonschema\n` +
    `  (see the handoff). The gate must run — it is not optional.`
  );
}
const out = `${run.stdout || ''}${run.stderr || ''}`.trim();
if (run.status !== 0) {
  fail(
    `content validation FAILED — not writing the bundle.\n` +
    out.split('\n').map((l) => `    ${l}`).join('\n') +
    `\n  Fix the record(s) in 100 IPS Electify/schema/examples/ and rebuild.`
  );
}
console.log(`[sync-almanac] validator: ${out.split('\n').pop()}`);

// --- helpers: index the source records by their own id -----------------------
function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(examples, file), 'utf8'));
}
function indexById(prefix) {
  const map = {};
  for (const file of fs.readdirSync(examples)) {
    if (!file.startsWith(prefix) || !file.endsWith('.json')) continue;
    const doc = readJson(file);
    if (doc.id) map[doc.id] = doc;
  }
  return map;
}
const avenues = indexById('avenue.');
const bindings = indexById('binding.');
const opportunities = indexById('opportunity.');

// --- the per-cycle location cache --------------------------------------------
// Lives OUTSIDE schema/examples/ (the validator there rejects any filename that is
// not a schema record) and is refreshed by the Almanac's own
// scripts/fetch_vote_locations.py, per election cycle, by hand. Keyed by binding_id
// from inside the file, so nothing here has to know a place name.
function readLocationCaches() {
  const root = path.join(electify, 'content');
  const byBinding = {};
  if (!fs.existsSync(root)) return byBinding;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.startsWith('locations.') && entry.name.endsWith('.json')) {
        const doc = JSON.parse(fs.readFileSync(full, 'utf8'));
        if (doc.binding_id) byBinding[doc.binding_id] = doc;
      }
    }
  };
  walk(root);
  return byBinding;
}
const locationCaches = readLocationCaches();

// --- the confidence gate -----------------------------------------------------
// An opportunity is the record a resident acts on: a date they will show up for.
// The July fixture carried `confidence: "inferred"` precisely so it could not be
// mistaken for data, with a note saying a record like that "must never render to a
// resident without being re-sourced". That is a rule, so it is enforced here rather
// than remembered — an unverified opportunity fails the build instead of shipping.
function opportunitiesFor(binding) {
  return Object.values(opportunities)
    .filter((o) => o.binding_id === binding.id)
    .map((o) => {
      const confidence = o.provenance?.confidence ?? 'verified';
      if (confidence !== 'verified') {
        fail(
          `opportunity ${o.id} has confidence "${confidence}" and would render to a resident.\n` +
          `    Dates a person plans their day around ship only once they have been read off the\n` +
          `    authority's own published source. Re-source the record and set confidence to\n` +
          `    "verified", or move it out of schema/examples/ until it is ready.`
        );
      }
      return {
        id: o.id,
        title: o.title,
        summary: o.summary ?? '',
        window: o.window,
        sub_windows: o.sub_windows ?? [],
        actions: o.actions ?? [],
        provenance: {
          as_of: o.provenance.as_of,
          review_due: o.provenance.review_due ?? '',
          sources: o.provenance.sources ?? [],
        },
      };
    })
    .sort((a, b) =>
      String(a.window.occurs_at ?? a.window.closes_at ?? '')
        .localeCompare(String(b.window.occurs_at ?? b.window.closes_at ?? '')));
}

// --- the location groups, named by the binding -------------------------------
// The cache holds rows; the binding holds what to call them. `notes` on a source is
// maintainer prose and is deliberately NOT a fallback here: a group with no `label`
// is a content bug, and showing a paragraph of internal reasoning where a heading
// belongs is worse than showing nothing.
function locationsFor(binding) {
  const cache = locationCaches[binding.id];
  if (!cache) return null;
  const labels = Object.fromEntries((binding.sources || []).map((s) => [s.id, s.label]));
  const groups = cache.groups
    .filter((g) => {
      if (labels[g.id]) return true;
      console.warn(`[sync-almanac] source '${g.id}' on ${binding.id} has no label — group skipped`);
      return false;
    })
    .map((g) => ({ id: g.id, label: labels[g.id], locations: g.locations }));
  return groups.length ? { fetched_at: cache.fetched_at, groups } : null;
}

// --- 2. RESOLVE: config + enabled avenues -> one neutral bundle ---------------
const configFile = fs
  .readdirSync(examples)
  .find((f) => f.startsWith('instance-config.') && f.endsWith('.json'));
if (!configFile) fail('no instance-config.*.json in the content source');
const config = readJson(configFile);

const entries = [];
let skipped = 0;
for (const a of [...config.avenues].sort((x, y) => (x.order ?? 99) - (y.order ?? 99))) {
  if (!a.enabled) { skipped++; continue; } // disabled ANC binding — ignored cleanly
  const binding = bindings[a.binding_id];
  if (!binding) fail(`enabled avenue references missing binding ${a.binding_id}`);
  const avenue = avenues[binding.avenue_id];
  if (!avenue) fail(`binding ${binding.id} references missing avenue ${binding.avenue_id}`);

  entries.push({
    order: a.order ?? 99,
    featured: !!a.featured,
    kind: avenue.kind,
    title: avenue.title,
    one_liner: avenue.one_liner,
    what_it_is: avenue.what_it_is,
    why_it_matters: avenue.why_it_matters,
    delivery: binding.delivery, // native | hybrid | route_out
    local_note: binding.local_note ?? '',
    authority: binding.authority
      ? { name: binding.authority.name, url: binding.authority.url }
      : null,
    external_tools: (binding.external_tools || []).map((t) => ({
      name: t.name, operator: t.operator, url: t.url, covers: t.covers,
    })),
    steps: (avenue.steps || []).map((s) => ({ title: s.title, leaves_site: !!s.leaves_site })),
    // p2-t2: the two halves of "your election, in plain sight". Both are null for an
    // avenue that has neither, so the page renders the p2-t1 shell for those and the
    // address surface only where the content actually exists.
    opportunities: opportunitiesFor(binding),
    locations: locationsFor(binding),
  });
}

const bundle = {
  _generated: 'Built by scripts/sync-almanac-data.mjs — do not edit by hand. Source: 100 IPS Electify/schema/examples/.',
  jurisdiction: config.jurisdiction, // {id,name,short_name,timezone,bbox} — the only place a jurisdiction is named
  area_levels: (config.area_scheme?.levels || []).map((l) => ({
    level: l.level, label: l.label, explainer: l.explainer,
  })),
  // p2-t2: everything the browser needs to turn a typed address into districts,
  // and nothing it doesn't. The page holds no endpoint of its own — a fork points
  // these at its own geocoder and boundary service and the template is untouched.
  lookup: {
    geocoder: config.geocoder
      ? { kind: config.geocoder.kind, url: config.geocoder.url, retain_address: config.geocoder.retain_address }
      : null,
    // Point-in-polygon levels grouped by the service that holds them, so the client
    // can ask each service ONCE for every layer at that address (ArcGIS `identify`
    // takes a layer list) instead of one request per district level. For DC that is
    // a single round trip for ward, ANC, SMD and precinct together.
    services: Object.values(
      (config.area_scheme?.levels || [])
        .filter((l) => l.source?.kind === 'arcgis_layer' && l.source.layer_id !== undefined)
        .reduce((acc, l) => {
          (acc[l.source.url] ||= { url: l.source.url, layers: [] }).layers.push({
            level: l.level, label: l.label, layer_id: l.source.layer_id,
          });
          return acc;
        }, {})
    ),
  },
  governance: config.governance || {},
  footprint: config.footprint || {},
  avenues: entries,
};

fs.mkdirSync(dest, { recursive: true });
fs.writeFileSync(path.join(dest, 'almanac.json'), JSON.stringify(bundle, null, 2) + '\n');
console.log(
  `[sync-almanac] wrote ${entries.length} avenue(s) → src/data/almanac/almanac.json` +
  (skipped ? ` (skipped ${skipped} disabled)` : '')
);
