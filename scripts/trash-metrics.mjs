// Trash Tracker — ANC accountability metrics (private, on-demand).
//
// Reads the PRIVATE report store and emits an aggregated HTML report + a
// quarterly CSV export for DPW-performance oversight (resolutions, letters,
// testimony). This is the accountability half of TRASH-TRACKER-PLAN.md Phase 3.
//
//   npm run trash-metrics                 # pull live from S3 (needs TRASH_BUCKET)
//   npm run trash-metrics -- --file x.json  # run against a local reports.json
//   npm run trash-metrics -- --quarter 2026-Q3   # filter CSV+report to a quarter
//
// PRIVACY (hard rule): raw records hold exact address + optional email; those
// NEVER leave this machine. Every output aggregates to route/block level only.
// A runtime assertion (assertNoLeak) fails the run if any exact address or
// email from the input turns up in the generated HTML/CSV. Reads only; the S3
// store is untouched.
//
// Data source: env TRASH_BUCKET (no default — the bucket name is deliberately
// kept out of this public repo; it lives in infra/*.sh which is gitignored).
// Region: env AWS_REGION (default us-east-1). S3 is read via the `aws` CLI, the
// same tool the infra deploy scripts use — no new npm dependency.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const OUT = path.join(repo, 'trash-metrics-out'); // gitignored

// ---- args ----------------------------------------------------------------
const argv = process.argv.slice(2);
const argVal = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : null;
};
const fileArg = argVal('--file');
const quarterArg = argVal('--quarter'); // e.g. 2026-Q3

// ---- load ----------------------------------------------------------------
function loadStore() {
  if (fileArg) {
    console.log(`[trash-metrics] reading local file: ${fileArg}`);
    return JSON.parse(fs.readFileSync(fileArg, 'utf8'));
  }
  const bucket = process.env.TRASH_BUCKET;
  const region = process.env.AWS_REGION || 'us-east-1';
  if (!bucket) {
    console.error(
      '[trash-metrics] TRASH_BUCKET is not set.\n' +
      '  Set it to the private data bucket, or pass --file <path> to run offline:\n' +
      '    TRASH_BUCKET=<bucket> npm run trash-metrics\n' +
      '    npm run trash-metrics -- --file ./sample.json'
    );
    process.exit(1);
  }
  console.log(`[trash-metrics] reading s3://${bucket}/private/reports.json (${region})`);
  let raw;
  try {
    raw = execFileSync(
      'aws',
      ['s3', 'cp', `s3://${bucket}/private/reports.json`, '-', '--region', region],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
    );
  } catch (e) {
    console.error('[trash-metrics] failed to read the store via the aws CLI.');
    console.error('  ' + (e.stderr?.toString().trim() || e.message));
    console.error('  Check AWS creds (e.g. `aws sts get-caller-identity`) and the bucket name.');
    process.exit(1);
  }
  return JSON.parse(raw);
}

// ---- helpers -------------------------------------------------------------
// Round a street address to its 100-block — the finest granularity we ever
// publish. Mirrors to_block() in infra/trash-report-lambda.py.
function toBlock(address) {
  const m = /^\s*(\d+)\s+(.*)/.exec(address || '');
  if (!m) return ((address || '').trim() || 'unknown location').slice(0, 120);
  const num = Math.floor(parseInt(m[1], 10) / 100) * 100;
  return `${num} block of ${m[2].trim()}`;
}
const monthOf = (date) => (date || '').slice(0, 7) || 'unknown'; // YYYY-MM
function quarterOf(date) {
  const y = (date || '').slice(0, 4);
  const mo = parseInt((date || '').slice(5, 7), 10);
  if (!y || !mo) return 'unknown';
  return `${y}-Q${Math.floor((mo - 1) / 3) + 1}`;
}
const daysBetween = (a, b) => {
  const da = Date.parse(a), db = Date.parse(b);
  if (Number.isNaN(da) || Number.isNaN(db)) return null;
  return Math.round((db - da) / 86_400_000);
};
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const csvCell = (s) => {
  const v = String(s ?? '');
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
};
const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

// ---- shape each raw record into a sanitized, block-level row -------------
// WHITELIST: only these fields ever reach an output. Exact address, email,
// notes, building, matched, deviceLoc, received — all dropped here.
function sanitize(r) {
  const address = r.matched || r.address || '';
  return {
    date: (r.date || '').slice(0, 10),
    month: monthOf(r.date),
    quarter: quarterOf(r.date),
    route: r.route || 'unrouted',
    day: r.day || '',
    block: toBlock(address),
    what: Array.isArray(r.what) ? r.what.join('; ') : (r.what || ''),
    status: r.status || 'open',
    source: r.source || 'resident', // private records predate the source field
    // resolution: only present once Phase 3.5 adds resolved_date to the record
    resolvedDate: r.resolved_date || r.resolvedDate || null,
    daysToResolve:
      (r.status === 'resolved' && (r.resolved_date || r.resolvedDate))
        ? daysBetween(r.date, r.resolved_date || r.resolvedDate)
        : null,
  };
}

// ---- privacy assertion ---------------------------------------------------
// Collect every exact address + email from the RAW input, then verify none of
// them appears in a generated output string. A hard stop if any leaks.
function collectSecrets(records) {
  const s = new Set();
  for (const r of records) {
    for (const v of [r.address, r.matched, r.email]) {
      const t = (v || '').trim();
      if (t) s.add(t);
    }
  }
  return [...s];
}
function assertNoLeak(label, text, secrets) {
  for (const secret of secrets) {
    if (secret.length >= 4 && text.includes(secret)) {
      console.error(`[trash-metrics] PRIVACY LEAK in ${label}: raw value found in output. Aborting; no files written.`);
      process.exit(2);
    }
  }
}

// ---- main ----------------------------------------------------------------
const store = loadStore();
const allRecords = Array.isArray(store?.reports) ? store.reports : [];
const secrets = collectSecrets(allRecords);

let rows = allRecords.map(sanitize);
if (quarterArg) rows = rows.filter((r) => r.quarter === quarterArg);

const runDate = new Date().toISOString().slice(0, 10);
const scope = quarterArg ? `quarter ${quarterArg}` : 'all reports';

// -- overview --
const statusCounts = {}, sourceCounts = {};
for (const r of rows) {
  statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  sourceCounts[r.source] = (sourceCounts[r.source] || 0) + 1;
}
const dates = rows.map((r) => r.date).filter(Boolean).sort();
const dateRange = dates.length ? `${dates[0]} → ${dates[dates.length - 1]}` : '—';
const routes = new Set(rows.map((r) => r.route));
const blocks = new Set(rows.map((r) => r.block));

// -- misses per route per month --
const months = [...new Set(rows.map((r) => r.month))].sort();
const byRoute = {}; // route -> {month -> count, total}
for (const r of rows) {
  const b = (byRoute[r.route] ||= { total: 0 });
  b[r.month] = (b[r.month] || 0) + 1;
  b.total += 1;
}
const routesSorted = Object.keys(byRoute).sort((a, b) => byRoute[b].total - byRoute[a].total);

// -- resident vs DPW gap (per route) --
const gap = {}; // route -> {resident, dpw}
for (const r of rows) {
  const g = (gap[r.route] ||= { resident: 0, dpw: 0, other: 0 });
  if (r.source === 'resident') g.resident += 1;
  else if (r.source === 'dpw') g.dpw += 1;
  else g.other += 1;
}

// -- time-to-resolution --
const resolveDays = rows.map((r) => r.daysToResolve).filter((d) => d != null);
const resolvedCount = rows.filter((r) => r.status === 'resolved').length;
const openRows = rows.filter((r) => r.status !== 'resolved' && r.date);
const oldestOpen = openRows.map((r) => daysBetween(r.date, runDate))
  .filter((d) => d != null).sort((a, b) => b - a)[0] ?? null;
const resolutionTracked = resolveDays.length > 0;

// -- repeat blocks (alleys) --
const byBlock = {}; // block -> {count, routes:Set, dates:[]}
for (const r of rows) {
  const b = (byBlock[r.block] ||= { count: 0, routes: new Set(), dates: [] });
  b.count += 1;
  if (r.route) b.routes.add(r.route);
  if (r.date) b.dates.push(r.date);
}
const repeats = Object.entries(byBlock)
  .filter(([, b]) => b.count >= 2)
  .map(([block, b]) => ({
    block, count: b.count,
    routes: [...b.routes].join(', ') || '—',
    span: b.dates.length ? `${b.dates.slice().sort()[0]} → ${b.dates.slice().sort().pop()}` : '—',
  }))
  .sort((a, b) => b.count - a.count);

// ---- render HTML ---------------------------------------------------------
const kv = (obj) => Object.entries(obj).map(([k, v]) => `${esc(k)}: <b>${v}</b>`).join(' &nbsp;·&nbsp; ') || '—';
const monthCols = months.map((m) => `<th>${esc(m)}</th>`).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Trash Tracker — ANC accountability metrics (${esc(scope)})</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 15px/1.5 -apple-system, system-ui, sans-serif; margin: 0; padding: 2rem 1.25rem 4rem;
         max-width: 960px; margin-inline: auto; color: #1a1a1a; }
  h1 { font-size: 1.5rem; margin: 0 0 .25rem; }
  h2 { font-size: 1.05rem; margin: 2.25rem 0 .5rem; padding-bottom: .3rem; border-bottom: 2px solid #d8452e; }
  .sub { color: #666; margin: 0 0 1.5rem; }
  .banner { background: #fff4e5; border: 1px solid #f0c98a; border-radius: 8px; padding: .6rem .9rem;
            font-size: .85rem; color: #7a4a00; margin: 1rem 0; }
  table { border-collapse: collapse; width: 100%; margin: .5rem 0 1rem; font-size: .9rem; }
  th, td { text-align: left; padding: .35rem .6rem; border-bottom: 1px solid #e4e4e4; }
  th { background: #f6f6f6; font-weight: 600; }
  td.n, th.n { text-align: right; font-variant-numeric: tabular-nums; }
  .card { display: inline-block; background: #f6f6f6; border-radius: 8px; padding: .6rem .9rem; margin: .25rem .4rem .25rem 0; }
  .card b { font-size: 1.3rem; display: block; }
  .muted { color: #888; font-style: italic; }
  footer { margin-top: 3rem; font-size: .8rem; color: #999; border-top: 1px solid #e4e4e4; padding-top: 1rem; }
  @media (prefers-color-scheme: dark) {
    body { background: #16130f; color: #e8e4dd; }
    th { background: #241f18; } th, td { border-color: #332c22; }
    .card { background: #241f18; } .sub, .muted { color: #a89; }
    .banner { background: #2a1f0e; border-color: #5a4520; color: #e0b877; }
  }
</style></head><body>
<h1>Trash Tracker — ANC accountability metrics</h1>
<p class="sub">Scope: <b>${esc(scope)}</b> &nbsp;·&nbsp; generated ${esc(runDate)} &nbsp;·&nbsp; ${rows.length} report(s)</p>

<div class="banner">🔒 Aggregated to route/block level. No exact addresses, names, or contact details appear here — those stay in the private store, ANC eyes only.</div>

<h2>Overview</h2>
<div>
  <span class="card">Total reports<b>${rows.length}</b></span>
  <span class="card">Routes<b>${routes.size}</b></span>
  <span class="card">Blocks<b>${blocks.size}</b></span>
  <span class="card">Date range<b style="font-size:1rem">${esc(dateRange)}</b></span>
</div>
<p>By status: ${kv(statusCounts)}<br>By source: ${kv(sourceCounts)}</p>

<h2>Misses per route, per month</h2>
${routesSorted.length ? `<table><thead><tr><th>Route</th>${monthCols}<th class="n">Total</th></tr></thead><tbody>
${routesSorted.map((rt) => `<tr><td>${esc(rt)}</td>${months.map((m) => `<td class="n">${byRoute[rt][m] || ''}</td>`).join('')}<td class="n"><b>${byRoute[rt].total}</b></td></tr>`).join('\n')}
</tbody></table>` : '<p class="muted">No reports in scope.</p>'}

<h2>Resident-reported vs DPW-announced (gap)</h2>
<p class="sub" style="margin-top:-.25rem">Routes where residents reported misses DPW never announced are the accountability signal. DPW records arrive once the email-parsing loop (Phase 3) is wired; until then this is resident-only.</p>
${routesSorted.length ? `<table><thead><tr><th>Route</th><th class="n">Resident</th><th class="n">DPW</th><th class="n">Gap (res − dpw)</th></tr></thead><tbody>
${routesSorted.map((rt) => { const g = gap[rt] || { resident: 0, dpw: 0 }; return `<tr><td>${esc(rt)}</td><td class="n">${g.resident}</td><td class="n">${g.dpw}</td><td class="n"><b>${g.resident - g.dpw}</b></td></tr>`; }).join('\n')}
</tbody></table>` : '<p class="muted">No reports in scope.</p>'}

<h2>Time to resolution</h2>
${resolutionTracked
    ? `<div><span class="card">Resolved<b>${resolvedCount}</b></span><span class="card">Median days to resolve<b>${median(resolveDays)}</b></span><span class="card">Longest open now<b>${oldestOpen ?? '—'}d</b></span></div>`
    : `<p class="muted">Resolution tracking not yet populated. Records carry a <code>status</code> but no <code>resolved_date</code> — add one when a report is closed out (the record-shape convergence in TRASH-TRACKER-PLAN.md Phase 3.5) and this fills in automatically. Currently ${statusCounts.open || 0} open, longest open ${oldestOpen ?? '—'} day(s).</p>`}

<h2>Repeat blocks (chronic spots)</h2>
${repeats.length ? `<table><thead><tr><th>Block</th><th class="n">Reports</th><th>Route(s)</th><th>Span</th></tr></thead><tbody>
${repeats.map((r) => `<tr><td>${esc(r.block)}</td><td class="n"><b>${r.count}</b></td><td>${esc(r.routes)}</td><td>${esc(r.span)}</td></tr>`).join('\n')}
</tbody></table>` : '<p class="muted">No block has 2+ reports in scope yet.</p>'}

<footer>In Plain Sight — Trash Tracker. Private ANC accountability view. Aggregated from the private report store; not a public surface.<br>Companion CSV: <code>trash-metrics_${esc(quarterArg || 'all')}_${esc(runDate)}.csv</code></footer>
</body></html>`;

// ---- render CSV (block-level, one row per report) ------------------------
const csvHeader = ['date', 'quarter', 'month', 'route', 'day', 'block', 'what', 'status', 'source', 'days_to_resolve'];
const csvLines = [csvHeader.join(',')];
for (const r of [...rows].sort((a, b) => (a.date < b.date ? -1 : 1))) {
  csvLines.push([
    r.date, r.quarter, r.month, r.route, r.day, r.block, r.what, r.status, r.source,
    r.daysToResolve ?? '',
  ].map(csvCell).join(','));
}
const csv = csvLines.join('\n') + '\n';

// ---- privacy gate, then write --------------------------------------------
assertNoLeak('HTML', html, secrets);
assertNoLeak('CSV', csv, secrets);

fs.mkdirSync(OUT, { recursive: true });
const tag = `${quarterArg || 'all'}_${runDate}`;
const htmlPath = path.join(OUT, `trash-metrics_${tag}.html`);
const csvPath = path.join(OUT, `trash-metrics_${tag}.csv`);
fs.writeFileSync(htmlPath, html);
fs.writeFileSync(csvPath, csv);

console.log(`[trash-metrics] ${rows.length} report(s) · ${routes.size} route(s) · ${blocks.size} block(s) · scope: ${scope}`);
console.log(`[trash-metrics] privacy gate passed (${secrets.length} raw value(s) checked; none leaked).`);
console.log(`[trash-metrics] wrote:\n  ${htmlPath}\n  ${csvPath}`);
