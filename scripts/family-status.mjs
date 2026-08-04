// Family status — the "which In Plain Sight tool do I work on now?" signal.
//
// Reads the machine-readable manifest embedded in PORTFOLIO.md (single source
// of truth for where the family lives), then for each tool reports how long
// since it was last touched (newest handoff or roadmap), its owner, and its
// status — and suggests the next tool to advance (priority = the stalest tool
// you can freely work on this instance).
//
//   npm run family
//
// Nothing here writes or deploys; it only reads.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const projectsRoot = path.resolve(repo, '..');
const DAY = 86_400_000;
const now = Date.now();

// ---- read the manifest out of PORTFOLIO.md -------------------------------
const portfolio = path.join(repo, 'PORTFOLIO.md');
const md = fs.readFileSync(portfolio, 'utf8');
const m = md.match(/<!--\s*family-manifest\s*([\s\S]*?)-->/);
if (!m) {
  console.error('No <!-- family-manifest --> block found in PORTFOLIO.md. Add one, then rerun.');
  process.exit(1);
}
let family;
try {
  family = JSON.parse(m[1].trim());
} catch (e) {
  console.error('family-manifest block is not valid JSON:', e.message);
  process.exit(1);
}

// ---- helpers -------------------------------------------------------------
const isHandoff = (f) => /handoff.*\.(md|html)$/i.test(f);
const isRoadmap = (f) => /roadmap.*\.(md|html)$/i.test(f) && !/\.bak/i.test(f);

// newest matching file: scans the folder, its handoffs/ subdir, and one level
// of immediate subdirs. `filter` picks the file kind; `match` (optional) keeps
// only filenames containing that substring (used for Trash living in the hub).
function newestFile(dir, filter, match) {
  let best = null;
  const consider = (full, name) => {
    if (!filter(name)) return;
    if (match && !name.toLowerCase().includes(match.toLowerCase())) return;
    let st;
    try { st = fs.statSync(full); } catch { return; }
    if (!st.isFile()) return;
    if (!best || st.mtimeMs > best.mtimeMs) best = { path: full, name, mtimeMs: st.mtimeMs };
  };
  const scanDir = (d) => {
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) consider(path.join(d, e.name), e.name);
  };
  scanDir(dir);
  scanDir(path.join(dir, 'handoffs'));
  // one level of subdirs (e.g. new rental/plain-sight-rentals/)
  let subs;
  try { subs = fs.readdirSync(dir, { withFileTypes: true }); } catch { subs = []; }
  for (const e of subs) {
    if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') {
      scanDir(path.join(dir, e.name));
      scanDir(path.join(dir, e.name, 'handoffs'));
    }
  }
  return best;
}

function readIdentity(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, '.project-id.json'), 'utf8'));
  } catch { return null; }
}

const fmtDate = (ms) => new Date(ms).toISOString().slice(0, 10);
const ageDays = (ms) => Math.floor((now - ms) / DAY);

// ---- gather --------------------------------------------------------------
const rows = family.map((t) => {
  const dir = t.folder === '.' ? repo : path.join(projectsRoot, t.folder);
  const exists = fs.existsSync(dir);
  const id = exists ? readIdentity(dir) : null;
  const handoff = exists ? newestFile(dir, isHandoff, t.match) : null;
  const roadmap = exists ? newestFile(dir, isRoadmap, null) : null;
  const touchedMs = Math.max(handoff?.mtimeMs || 0, roadmap?.mtimeMs || 0) || null;
  const owner = id?.owner || t.owner; // disk marker is authoritative
  return {
    display: t.display,
    folder: t.folder === '.' ? '(this repo)' : t.folder,
    owner,
    status: t.status,
    band: t.band,
    engine: t.engine || null,
    exists,
    touchedMs,
    age: touchedMs ? ageDays(touchedMs) : null,
    last: handoff && (!roadmap || handoff.mtimeMs >= roadmap.mtimeMs) ? handoff : roadmap,
    freelyWorkable: owner === 'personal',
  };
});

// ---- report --------------------------------------------------------------
const sorted = [...rows].sort((a, b) => (b.age ?? -1) - (a.age ?? -1));
const pad = (s, n) => String(s ?? '').padEnd(n);

console.log('\n  IN PLAIN SIGHT — family status   ' + fmtDate(now) + '\n');
console.log('  ' + pad('Tool', 22) + pad('Owner', 10) + pad('Status', 11) + pad('Last touched', 20) + 'Latest file');
console.log('  ' + '-'.repeat(88));
for (const r of sorted) {
  if (!r.exists) {
    console.log('  ' + pad(r.display, 22) + pad(r.owner, 10) + pad(r.status, 11) + '⚠ folder not found: ' + r.folder);
    continue;
  }
  const touched = r.touchedMs ? `${fmtDate(r.touchedMs)} (${r.age}d ago)` : '—';
  const flag = r.freelyWorkable ? '' : '  ⚠ ' + r.owner;
  console.log(
    '  ' + pad(r.display + flag, 22) + pad(r.owner, 10) + pad(r.status, 11) +
    pad(touched, 20) + (r.last ? r.last.name : '—')
  );
}

// priority pick: stalest freely-workable tool that is still active work
const active = (s) => !['shipped', 'placeholder'].includes(s);
const candidates = sorted.filter((r) => r.exists && r.freelyWorkable && active(r.status) && r.age != null);
const pick = candidates[0];

console.log('\n  ▶ Suggested next (priority = stalest tool you can work on this instance):');
if (pick) {
  console.log(`      ${pick.display} — ${pick.age}d since last touched (${pick.status}).`);
  console.log(`      cd "${pick.folder === '(this repo)' ? '.' : path.join(projectsRoot, pick.folder)}"  →  open its roadmap + latest handoff.`);
} else {
  console.log('      Nothing stale among freely-workable tools. Pick by value from the roadmap.');
}

const gated = sorted.filter((r) => r.exists && !r.freelyWorkable && active(r.status));
if (gated.length) {
  console.log('\n  ⚠ Instance-gated (check the orient banner before working these):');
  for (const r of gated) {
    console.log(`      ${r.display} — owner ${r.owner}${r.engine ? `, engine ${r.engine}` : ''} (${r.age ?? '?'}d ago).`);
  }
}
console.log('');
