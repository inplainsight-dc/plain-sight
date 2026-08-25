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

// The cap the Lambda enforces. Kept in step with MAX_ITEMS in infra/feedback-lambda.py.
const MAX_ITEMS = 5000;
const WARN_AT = 0.8;

const report = (st) => {
  // REDTEAM F1: a full inbox used to be invisible from this side — the endpoint would
  // refuse real submissions and nothing would ever say so. It is now the loudest thing
  // this script can print, because it means someone tried to reach her and could not.
  if (st.full) {
    console.log(`🚨 The feedback inbox is FULL and is turning real submissions away (since ${st.fullSince || 'recently'}).`);
    console.log(`   Run \`npm run feedback\` and clear it — until then, nobody can reach you through the site.`);
    return;
  }
  if (st.total >= MAX_ITEMS * WARN_AT) {
    console.log(`⚠️  Feedback inbox at ${st.total}/${MAX_ITEMS} — clear some before it starts refusing people.`);
  }
  if (st.waiting > 0) {
    console.log(`📮 ${st.waiting} piece${st.waiting === 1 ? '' : 's'} of site feedback waiting — \`npm run feedback\` to review.`);
  }
};

try {
  if (fs.existsSync(CACHE)) {
    const c = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
    // A full inbox is never served from cache: it is the one state worth re-checking,
    // because it means people are being turned away right now.
    if (Date.now() - c.at < TTL_MS && c.status && !c.status.full) { report(c.status); process.exit(0); }
  }
} catch { /* a corrupt cache is not worth mentioning; fall through and re-read */ }

let status;
try {
  const out = execFileSync('node', [path.resolve('scripts/feedback-review.mjs'), '--status'],
    { encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'] });
  status = JSON.parse(String(out).trim());
  if (!status || typeof status.waiting !== 'number') process.exit(0);
} catch {
  process.exit(0);   // no creds, no endpoint, no network — say nothing
}

try {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify({ at: Date.now(), status }));
} catch { /* cache is an optimization, not a requirement */ }

report(status);
