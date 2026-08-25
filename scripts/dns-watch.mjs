#!/usr/bin/env node
/**
 * DNS watchdog — turns an intermittent resolver failure into evidence.
 *
 *   npm run dns-watch          check once; silent unless something failed
 *   npm run dns-watch -- -v    print the result either way
 *
 * WHY THIS EXISTS
 * `tailscale dns status` on this machine reports:
 *
 *     Resolvers (in preference order):
 *       (no resolvers configured, system default will be used)
 *
 * MagicDNS takes the system resolver slot (100.100.100.100) and then forwards public
 * lookups to whatever resolver the current network hands it. So public DNS here is only
 * ever as reliable as the nearest router, and when that hiccups a job dies with
 * "nodename nor servname provided" — intermittent, unattributable, and it has already
 * cost the DC Appointments Watch node five days of a daily capture.
 *
 * The real fix is one change at login.tailscale.com/admin/dns: add 1.1.1.1 and 8.8.8.8
 * as global nameservers and leave "Override local DNS" off. That is Pippa's to make.
 * This script is the instrument, not the fix: it records WHICH path failed and WHEN, so
 * the next failure is arguable rather than anecdotal.
 *
 * NOTE ON WHERE THIS LIVES: it is machine-level, not an In Plain Sight concern. It sits
 * here because this is where it was written; it arguably belongs in Agentic Environment,
 * since it matters to every project and every session on this tailnet and hanging it off
 * a civic-tools repo makes it look like an IPS thing to whoever reads the tree next.
 * Raised by the DC Appointments Watch session; Pippa's call.
 *
 * EXIT CODES — meaningful, so a long job can gate on it:
 *   0  both paths resolved, or both failed (a genuine outage, not this bug)
 *   1  the system resolver failed while 1.1.1.1 succeeded — the signature of this fault
 */
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const LOG = path.resolve('dns-watch.log');
const PROBES = ['inplainsight-dc.org', 'maps2.dcgis.dc.gov', 'api.github.com'];
const verbose = process.argv.includes('-v') || process.argv.includes('--verbose');

/** One lookup, with a hard timeout so a hanging resolver cannot hang the caller. */
async function lookup(name, server) {
  const args = server ? ['-W', '3', name, server] : ['-W', '3', name];
  try {
    const { stdout } = await run('host', args, { timeout: 6000 });
    return /has address|has IPv6/.test(stdout);
  } catch {
    return false;
  }
}

const check = async (server) => {
  const results = await Promise.all(PROBES.map((n) => lookup(n, server)));
  return { ok: results.every(Boolean), passed: results.filter(Boolean).length, of: PROBES.length };
};

const [sys, cf] = await Promise.all([check(null), check('1.1.1.1')]);

// The signature of the fault this exists to catch: the system path failing while a public
// resolver, queried directly, is perfectly happy.
const signature = !sys.ok && cf.ok;
const stamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

if (signature || (!sys.ok && !cf.ok)) {
  const line = signature
    ? `${stamp}  SYSTEM RESOLVER FAILING  system ${sys.passed}/${sys.of} · 1.1.1.1 ${cf.passed}/${cf.of}  — MagicDNS has no upstream configured; see login.tailscale.com/admin/dns\n`
    : `${stamp}  BOTH PATHS FAILED        system ${sys.passed}/${sys.of} · 1.1.1.1 ${cf.passed}/${cf.of}  — likely a real network outage, not the resolver bug\n`;
  try { fs.appendFileSync(LOG, line); } catch { /* logging must never be the thing that breaks */ }
  process.stderr.write(line);
} else if (verbose) {
  console.log(`${stamp}  ok  system ${sys.passed}/${sys.of} · 1.1.1.1 ${cf.passed}/${cf.of}`);
}

process.exit(signature ? 1 : 0);
