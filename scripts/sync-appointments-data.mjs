// Sync the seat-clock data for DC Appointments Watch (/appointments) from the
// research node into this repo's src/data so Astro can bake it into the page at
// build time.
//
// The research node is the single source of truth:
//   ../DC Appointments Watch/data/mota/seat-analysis.json
// which is itself generated (never hand-edited) by that project's
// scripts/analyze_mota_seats.py from the MOTA capture on disk. This repo only
// ever holds a *projection* of it — trimmed to what the page renders, committed
// so the site builds standalone.
//
// WHY A PROJECTION AND NOT A COPY: the analysis file carries working material
// (per-body disagreement rows, evidence arrays, `settles` fields) that belongs in
// the working view, not on a public page. Selecting here — loudly, with a schema
// check — means the page cannot quietly start rendering something that was never
// reviewed for a public audience.
//
// RUN:  npm run sync-appointments
//       npm run sync-appointments -- --check   (report drift, write nothing)
//
// Runs automatically before every build (see package.json "build").
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const node = path.resolve(repo, '..', 'DC Appointments Watch');
const srcFile = path.join(node, 'data', 'mota', 'seat-analysis.json');
const manifestFile = path.join(node, 'data', 'mota', 'mota.manifest.json');
const destDir = path.join(repo, 'src', 'data', 'appointments');
const destFile = path.join(destDir, 'seats.json');

const CHECK = process.argv.includes('--check');
const TAG = '[sync-appointments]';

// How old a capture may be before the page shows a staleness warning to readers.
// The research node's capture job runs daily, so a week of silence is a real fault,
// not a slow news day. Kept here (not in the page) so the number lives beside the
// thing that knows when the data was made.
const STALE_AFTER_DAYS = 7;

/** Fail loudly. A public page rendering half a dataset is worse than a failed build. */
function die(msg) {
  console.error(`${TAG} ${msg}`);
  process.exit(1);
}

function requireKeys(obj, keys, where) {
  for (const k of keys) {
    if (obj?.[k] === undefined || obj?.[k] === null) {
      die(`missing required key '${k}' in ${where} — the research node's schema changed; ` +
          `update this script deliberately rather than shipping a page with a hole in it`);
    }
  }
}

// ---------------------------------------------------------------------------
// No research node present (isolated checkout / CI): fall back to the committed
// projection, exactly as sync-core-data.mjs does. Never fail a build for this.
// ---------------------------------------------------------------------------
if (!fs.existsSync(srcFile)) {
  if (fs.existsSync(destFile)) {
    const have = JSON.parse(fs.readFileSync(destFile, 'utf8'));
    console.log(`${TAG} research node not found; using committed projection ` +
                `(capture ${have.captured})`);
    process.exit(0);
  }
  die('research node not found AND no committed projection in src/data/appointments — cannot build');
}

const A = JSON.parse(fs.readFileSync(srcFile, 'utf8'));

requireKeys(A, ['generated', 'inputs', 'universe', 'ending_view', 'vacnew_view',
                'vacancy_disagreement', 'holdover', 'vacancy_load', 'findings',
                'carried_cautions'], 'seat-analysis.json');
requireKeys(A.holdover, ['as_of', 'cap_days', 'cap_text', 'over_cap', 'approaching_cap',
                         'labeled_holdover_seats', 'days_past_term_points',
                         'seats_past_term_total', 'advice_and_consent_seats_past_term',
                         'advice_and_consent_past_term_by_status'], 'holdover');

// The capture date IS the measurement date for every duration on the page. If the
// analysis and the manifest disagree about which capture this is, the page would
// date its own figures wrongly — refuse.
const manifest = fs.existsSync(manifestFile)
  ? JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
  : null;
if (A.generated !== A.holdover.as_of) {
  die(`analysis 'generated' (${A.generated}) and holdover 'as_of' (${A.holdover.as_of}) ` +
      `disagree — cannot date the page's durations`);
}
if (A.inputs.mota_retrieved && A.inputs.mota_retrieved !== A.generated) {
  die(`capture date (${A.inputs.mota_retrieved}) and analysis date (${A.generated}) disagree`);
}

/** Seat rows, stripped to the fields the page shows. No individual is named in the
 *  source and none is derivable here: a row is a body, a cluster, and a seat title. */
const seat = (s) => ({
  body: s.body,
  cluster: s.cluster,
  seat: s.seat,
  status: s.status,
  route: /2 \(e\)/.test(s.appointment_type) ? 'Section 2(e)'
       : /2 \(f\)/.test(s.appointment_type) ? 'Section 2(f)'
       : s.appointment_type,
  term_end: s.term_end,
  days_past_term: s.days_past_term,
  cap_date: s.cap_date,
  days_to_cap: s.days_to_cap,
});

const body = (b) => ({
  body: b.body,
  route: b.appointment_type.startsWith('Executive') ? 'Mayor alone' : 'Council confirms',
  vacant_seats: b.vacant_seats,
  public_member_seats: b.public_member_seats,
});

const projection = {
  schema: 'ips-appointments-seats/1',
  captured: A.generated,
  stale_after_days: STALE_AFTER_DAYS,
  generated_note: A.generated_note,

  // --- Provenance the page states out loud ---------------------------------
  source: {
    holder: 'DC Mayor’s Office of Talent and Appointments (MOTA)',
    retrieved: A.inputs.mota_retrieved ?? A.generated,
    views: Object.entries(A.inputs.views ?? {}).map(([name, v]) => ({
      name,
      qid: v.qid,
      rows: v.rows,
      sha256: v.served_sha256,
    })),
    manifest_retrieved: manifest?.retrieved ?? null,
  },

  // --- The statutory clock -------------------------------------------------
  cap: {
    days: A.holdover.cap_days,
    text: A.holdover.cap_text,
    cite: 'DC Official Code § 1-523.01(c)',
    cite_url: 'https://code.dccouncil.gov/us/dc/council/code/sections/1-523.01',
  },

  // --- Headline counts, each tied to the view it came from ------------------
  totals: {
    bodies: A.universe.bodies,
    public_member_seats: A.universe.public_member_seats,
    agency_appointee_seats: A.universe.agency_appointee_seats,
    vacancies: A.universe.public_member_vacancies,
    bodies_with_a_vacancy: A.universe.bodies_with_a_vacancy,
    past_term_all: A.holdover.seats_past_term_total,
    past_term_council_confirmed: A.holdover.advice_and_consent_seats_past_term,
    labeled_holdover: A.holdover.labeled_holdover_seats.length,
    vacancy_register_rows: A.ending_view.rows,
  },

  // --- The three states the page is built around ---------------------------
  over_cap: A.holdover.over_cap.map(seat),
  approaching_cap: A.holdover.approaching_cap.map(seat),
  labeled_holdover: A.holdover.labeled_holdover_seats.map(seat),
  past_term_by_status: A.holdover.advice_and_consent_past_term_by_status,
  clock_points: A.holdover.days_past_term_points.map((p) => ({
    days: p.days,
    status: p.status,
    body: p.body,
    route: /2 \(e\)/.test(p.type) ? 'Section 2(e)' : 'Section 2(f)',
  })),

  // --- Empty seats ---------------------------------------------------------
  vacancy: {
    top_bodies: A.vacancy_load.top_bodies.map(body),
    top_bodies_shown: A.vacancy_load.top_bodies.length,
    fully_vacant_bodies: A.vacancy_load.fully_vacant_bodies.map(body),
    requires_council_action: A.vacancy_load.requires_council_action,
    mayor_alone: A.vacancy_load.mayor_alone,
  },

  // --- Where the source contradicts itself ---------------------------------
  disagreement: {
    ending: {
      report_name: A.ending_view.report_name,
      qid: A.ending_view.qid,
      rows: A.ending_view.rows,
      vacant_seats: A.ending_view.vacant_seats,
      carries_term_end_column: A.ending_view.carries_term_end_column,
    },
    vacnew: {
      report_name: A.vacnew_view.report_name,
      qid: A.vacnew_view.qid,
      rows: A.vacnew_view.rows,
      vacant_seats: A.vacnew_view.vacant_seats,
      carries_term_end_column: true,
    },
    body_level_vacancy_column: A.vacancy_disagreement.body_level_vacancy_column,
    body_level_agrees_with: A.vacancy_disagreement.body_level_agrees_with,
  },

  // --- Findings, with the counter-reading attached to each ------------------
  // The counter-reading travels with the claim. A public page that shows only the
  // claim is the version a hostile reader takes apart.
  findings: A.findings.map((f) => ({
    id: f.id,
    severity: f.severity,
    claim: f.claim,
    counter_reading: f.counter_reading,
  })),

  cautions: A.carried_cautions,
};

// Sanity checks on the projection itself — the counts the page will print.
if (projection.over_cap.length === 0 && projection.approaching_cap.length === 0
    && projection.vacancy.fully_vacant_bodies.length === 0) {
  die('projection has none of the three states populated — refusing to publish an empty page');
}
if (projection.clock_points.length !== projection.totals.past_term_council_confirmed) {
  die(`clock has ${projection.clock_points.length} points but the analysis counts ` +
      `${projection.totals.past_term_council_confirmed} Council-confirmed seats past term ` +
      `— the chart would understate the total`);
}

const out = JSON.stringify(projection, null, 2) + '\n';

// --- Staleness: say it here, and let the page say it to readers -------------
// Whole calendar days between the capture and today, both taken at UTC midnight, so a
// capture made this morning reads as 0 days old rather than a negative number.
const todayUTC = new Date();
const ageDays = Math.max(0, Math.round(
  (Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), todayUTC.getUTCDate())
    - Date.parse(`${projection.captured}T00:00:00Z`)) / 86_400_000
));
if (ageDays > STALE_AFTER_DAYS) {
  console.warn(`${TAG} WARNING: capture ${projection.captured} is ${ageDays} days old ` +
               `(threshold ${STALE_AFTER_DAYS}). The page will show a staleness notice. ` +
               `Run the capture job in the research node before deploying.`);
}

if (CHECK) {
  const existing = fs.existsSync(destFile) ? fs.readFileSync(destFile, 'utf8') : null;
  if (existing === null) {
    console.error(`${TAG} --check: no committed projection at src/data/appointments/seats.json`);
    process.exit(2);
  }
  if (existing !== out) {
    console.error(`${TAG} --check: STALE — the committed projection does not match the ` +
                  `research node. Run: npm run sync-appointments`);
    process.exit(2);
  }
  console.log(`${TAG} --check: in step with the research node (capture ${projection.captured}, ` +
              `${ageDays}d old)`);
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.writeFileSync(destFile, out);
fs.writeFileSync(
  path.join(destDir, '_SOURCE.md'),
  '# Generated projection — do not edit\n\n' +
    'Projected from the single source of truth:\n' +
    '`../DC Appointments Watch/data/mota/seat-analysis.json`, which is itself generated by\n' +
    'that project’s `scripts/analyze_mota_seats.py` from the MOTA capture on disk.\n\n' +
    'Regenerate with `npm run sync-appointments` (also runs automatically on `npm run build`).\n' +
    'Check for drift without writing: `npm run sync-appointments -- --check`.\n\n' +
    'Edit the analysis in the research node, never here. Hand-editing this file would let the\n' +
    'page disagree with the capture it cites — which is the one thing the page promises.\n'
);

console.log(`${TAG} synced capture ${projection.captured} ` +
            `(${ageDays}d old) → src/data/appointments/seats.json`);
