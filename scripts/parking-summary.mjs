#!/usr/bin/env node
/**
 * Derive the OFF-BOARD summary line in PARKING_LOT.md from the parked table.
 *
 * WHY THIS EXISTS: the summary line was hand-maintained and drifted twice. It went out of
 * sync on 2026-08-26 (the Astro 5→7 XSS row was added to the table and never reached the
 * line) and the drift survived until 2026-09-06 without anyone noticing. That is the worst
 * possible place for a stale list: the table is the record, but the summary is where a
 * reader looks for the short answer, so a row can be parked, correct, and invisible at the
 * same time.
 *
 * Pippa's ruling, 2026-09-06: the summary is derived from the table and is not
 * hand-maintained. Edit the TABLE. This regenerates the line.
 *
 * RUN:  npm run parking-summary
 *       npm run parking-summary -- --check   (report drift, write nothing, exit 1)
 *
 * Deliberately NOT wired into `npm run build`. A prose file disagreeing with itself must
 * never fail a deploy of the actual site — the failure mode this guards against is a
 * reader misled, not a broken page.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(path.resolve(here, '..'), 'PARKING_LOT.md');

const CHECK = process.argv.includes('--check');
const TAG = '[parking-summary]';

const die = (msg) => { console.error(`${TAG} ${msg}`); process.exit(1); };

if (!fs.existsSync(file)) die(`PARKING_LOT.md not found at ${file}`);
const src = fs.readFileSync(file, 'utf8');

// --- Read the parked table -------------------------------------------------
// Rows run from the header separator to the blank line that closes the table.
const sep = src.indexOf('|-----------|');
if (sep === -1) die('could not find the parked table header separator');
const body = src.slice(src.indexOf('\n', sep) + 1);
const rows = body.split('\n').filter((l) => l.startsWith('|'));
if (rows.length === 0) die('the parked table has no rows');

const items = rows.map((row) => {
  // Cells, minus the empty strings either side of the leading/trailing pipes.
  const cells = row.split('|').slice(1, -1);
  const item = cells[1] ?? '';

  // The label is the row's first bold span. Inner emphasis is stripped so the
  // summary reads as a list of names rather than as marked-up prose.
  const bold = item.match(/\*\*(.+?)\*\*/);
  if (!bold) die(`a parked row has no bold item name: ${row.slice(0, 80)}…`);
  const label = bold[1].replace(/\*([^*]+)\*/g, '$1').trim();

  // A row carrying a ⏰ deadline keeps it: the whole point of a time-box is that it
  // is visible without opening the row.
  const clock = row.match(/⏰[^|]*?((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},\s+\d{4})/);
  return clock ? `${label} — ⏰ time-boxed to ${clock[1]}` : label;
});

const derived = `- **OFF-BOARD (do not surface):** ${items.join(' · ')}.`;

// --- Compare, and write or report -----------------------------------------
const lineRe = /^- \*\*OFF-BOARD \(do not surface\):\*\*.*$/m;
if (!lineRe.test(src)) die('could not find the OFF-BOARD summary line to replace');
const current = src.match(lineRe)[0];

if (current === derived) {
  console.log(`${TAG} summary matches the table (${items.length} parked).`);
  process.exit(0);
}

if (CHECK) {
  console.error(`${TAG} DRIFT: the summary line does not match the table.`);
  console.error(`${TAG}   have: ${current}`);
  console.error(`${TAG}   want: ${derived}`);
  console.error(`${TAG} Run \`npm run parking-summary\` to regenerate it.`);
  process.exit(1);
}

fs.writeFileSync(file, src.replace(lineRe, derived));
console.log(`${TAG} regenerated from the table (${items.length} parked):`);
console.log(`${TAG}   ${derived}`);
