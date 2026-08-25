#!/usr/bin/env node
/**
 * Quiet feedback check (roadmap 4.8, decision D13).
 *
 * Prints ONE line if feedback is waiting, and NOTHING AT ALL otherwise. That is the
 * whole design: Pippa's objection to 4.7 was "another cadence to remember", and a check
 * that speaks on a schedule regardless is exactly that cadence wearing a different hat.
 * Threshold-triggered, not calendar-triggered — silence means nothing needs her.
 *
 * It is also built never to be in the way:
 *   - a cached count is reused for 6 hours, so repeated sessions cost nothing
 *   - the S3 read is killed after 5 seconds
 *   - EVERY failure path is silent and exits 0. If AWS credentials are not loaded, or the
 *     endpoint has not been stood up, or the network is gone, this must not put an error
 *     in front of her at the start of unrelated work.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('feedback-out');
const CACHE = path.join(OUT, '.count-cache.json');
const TTL_MS = 6 * 60 * 60 * 1000;

const report = (n) => {
  if (n > 0) {
    console.log(`📮 ${n} piece${n === 1 ? '' : 's'} of site feedback waiting — \`npm run feedback\` to review.`);
  }
};

try {
  if (fs.existsSync(CACHE)) {
    const c = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
    if (Date.now() - c.at < TTL_MS) { report(c.count); process.exit(0); }
  }
} catch { /* a corrupt cache is not worth mentioning; fall through and re-read */ }

let count = 0;
try {
  const out = execFileSync('node', [path.resolve('scripts/feedback-review.mjs'), '--count'],
    { encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'] });
  count = parseInt(String(out).trim(), 10);
  if (!Number.isFinite(count)) process.exit(0);
} catch {
  process.exit(0);   // no creds, no endpoint, no network — say nothing
}

try {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify({ at: Date.now(), count }));
} catch { /* cache is an optimization, not a requirement */ }

report(count);
