#!/usr/bin/env node
/**
 * In Plain Sight — feedback review (roadmap 4.7, decision D13).
 *
 *   npm run feedback                    pull the inbox and build the review page
 *   npm run feedback -- --apply <file>  write the verdicts back, so decided items
 *                                       never resurface
 *   npm run feedback -- --count         just the number waiting
 *   npm run feedback -- --status        JSON: waiting, total, and whether the endpoint
 *                                       has had to refuse a real submission (used by 4.8)
 *
 * WHY THIS IS A LOCAL SCRIPT AND NOT A HOSTED ADMIN PANEL
 * A hosted panel needs auth, which means a credential to store, rotate and worry about,
 * guarding a list of suggestions, on a site whose entire selling point is that it has no
 * accounts. This runs on Pippa's machine with credentials she already has, and produces
 * the same review page the parking lot and the redteam findings already use. The exported
 * verdicts file is the audit record and the ONLY thing authorized to move anything into
 * ROADMAP.md or PARKING_LOT.md.
 *
 * WHERE THE WORDS GO
 * Nowhere but this machine. feedback-out/ is gitignored, and so are the review page and
 * the verdicts file, because this repo is public and people write real details into a
 * feedback box on a civic site. The verdicts change the roadmap; the words behind them
 * stay local.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BUCKET = process.env.FEEDBACK_BUCKET || 'inplainsight-feedback-3447';
const KEY = 'private/feedback.json';
const OUT = path.resolve('feedback-out');
const PROFILE = process.env.AWS_PROFILE || 'inplainsight';

/**
 * REDTEAM F3 (2026-08-25). Nothing used to be deleted, ever. A "spam" verdict marked an
 * item and left it there, and decided items accumulated indefinitely. On a site whose whole
 * posture is that it does not keep things about people, holding every word anyone ever
 * typed — an address, a landlord's name, a housing situation — forever, is that posture
 * quietly not being true. So:
 *   - spam is DELETED outright, not marked. It was never worth keeping.
 *   - anything decided more than RETENTION_DAYS ago is dropped on the next --apply.
 *   - the panel on the site says how long feedback is kept, because a retention rule
 *     nobody is told about is not a promise, it is just an implementation detail.
 * Items still marked "open" are never touched by any of this — an undecided report is
 * exactly the thing that must not disappear on a timer.
 */
const RETENTION_DAYS = 180;

const VERDICTS = [
  ['quick-fix', 'Quick fix',  'Small and safe — do it in this session'],
  ['roadmap',   'Roadmap',    'Real work, needs a task'],
  ['reply',     'Reply',      'Needs an answer to the person'],
  ['resolved',  'Resolved',   'Already true, or fixed since'],
  ['spam',      'Spam',       'Not a real report'],
];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Read the inbox. With {withEtag} also returns the S3 ETag, which is what makes a
 *  safe write-back possible — see applyVerdicts. */
function pull(opts = {}) {
  try {
    if (opts.withEtag) {
      fs.mkdirSync(OUT, { recursive: true });
      const tmp = path.join(OUT, '.pull.json');
      const meta = JSON.parse(execFileSync('aws',
        ['s3api', 'get-object', '--bucket', BUCKET, '--key', KEY, tmp, '--profile', PROFILE],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
      const body = JSON.parse(fs.readFileSync(tmp, 'utf8'));
      fs.unlinkSync(tmp);
      return { body, etag: meta.ETag };
    }
    return JSON.parse(execFileSync('aws',
      ['s3', 'cp', `s3://${BUCKET}/${KEY}`, '-', '--profile', PROFILE],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
  } catch (e) {
    const err = String(e.stderr || e.message);
    // An empty inbox is the normal state, not a failure — say so and exit quietly.
    if (/NoSuchKey|Not Found|does not exist/i.test(err)) {
      return opts.withEtag ? { body: { items: [] }, etag: null } : { items: [] };
    }
    console.error('\n✗ Could not read the inbox from S3.\n  ' + err.trim().split('\n').slice(-2).join('\n  '));
    console.error(`\n  Check: AWS_PROFILE=${PROFILE} is set up, and the bucket ${BUCKET} exists.`);
    console.error('  If the endpoint has not been stood up yet, run ./infra/feedback-setup.sh first.\n');
    process.exit(1);
  }
}

/** Every id that already has a verdict, across every past export. */
function alreadyDecided() {
  if (!fs.existsSync(OUT)) return new Map();
  const seen = new Map();
  for (const f of fs.readdirSync(OUT).filter((f) => f.startsWith('APPROVED_feedback-verdicts_')).sort()) {
    try {
      for (const v of JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')).verdicts || []) {
        seen.set(v.id, { verdict: v.verdict, when: f.slice(-15, -5) });
      }
    } catch { /* a half-written export should not stop the review */ }
  }
  return seen;
}

function suggest(item) {
  // A preselection, never a decision. It is here so the common case is one click, and
  // every card can still be moved anywhere.
  if (item.category === 'wrong' || item.category === 'broken') return 'roadmap';
  if (item.email) return 'reply';
  if (item.category === 'confusing') return 'roadmap';
  return 'quick-fix';
}

function page(items, decided, stamp) {
  const cards = items.map((it, i) => `
  <article class="card" data-id="${esc(it.id)}">
    <header>
      <span class="rec">#${String(i + 1).padStart(2, '0')}</span>
      <span class="cat cat--${esc(it.category)}">${esc(it.category)}</span>
      <span class="rec">${esc(it.page)}</span>
      <span class="rec when">${esc((it.received || '').replace('T', ' ').replace('+00:00', ' UTC'))}</span>
    </header>
    <p class="msg">${esc(it.message)}</p>
    ${it.email ? `<p class="rec email">Wants a reply · ${esc(it.email)}</p>`
               : `<p class="rec anon">Anonymous — no reply address</p>`}
    <div class="verdicts">
      ${VERDICTS.map(([v, label, hint]) => `
      <label class="v v--${v}">
        <input type="radio" name="v-${esc(it.id)}" value="${v}"${suggest(it) === v ? ' checked' : ''}>
        <span class="v-label">${label}</span><span class="v-hint">${hint}</span>
      </label>`).join('')}
    </div>
    <label class="notes-l">Notes <textarea rows="2" data-notes="${esc(it.id)}"
      placeholder="What you decided, and why — this is the bit you will want in three weeks."></textarea></label>
  </article>`).join('\n');

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Feedback review — ${stamp}</title>
<style>
  :root { --ink:#1a2438; --soft:#515a70; --paper:#fbf7f0; --surf:#fff; --line:#e7ddc9; --accent:#B0122B; }
  @media (prefers-color-scheme: dark) {
    :root { --ink:#f3ecdd; --soft:#b3ab9b; --paper:#141a26; --surf:#1d2433; --line:#313a52; --accent:#FF7D8B; }
  }
  * { box-sizing:border-box }
  body { margin:0; padding:2rem 1.2rem 6rem; background:var(--paper); color:var(--ink);
         font:16px/1.6 system-ui,-apple-system,'Segoe UI',sans-serif; }
  .wrap { max-width:60rem; margin:0 auto }
  h1 { font-family:Georgia,serif; font-size:2rem; margin:0 0 .3rem }
  .rec { font-family:ui-monospace,Menlo,monospace; font-size:.76rem; letter-spacing:.06em;
         text-transform:uppercase; color:var(--soft) }
  .lede { color:var(--soft); margin:0 0 1.6rem; max-width:62ch }
  .card { background:var(--surf); border:1px solid var(--line); border-left:4px solid var(--accent);
          border-radius:3px; padding:1rem 1.1rem; margin-bottom:1rem }
  .card.done { opacity:.55 }
  .card header { display:flex; gap:.9rem; flex-wrap:wrap; align-items:baseline; margin-bottom:.6rem }
  .cat { font-family:ui-monospace,Menlo,monospace; font-size:.74rem; text-transform:uppercase;
         letter-spacing:.06em; padding:.1rem .45rem; border:1px solid currentColor; border-radius:2px; color:var(--accent) }
  .when { margin-left:auto }
  .msg { white-space:pre-wrap; margin:0 0 .6rem; font-size:1.05rem }
  .email, .anon { margin:0 0 .8rem }
  .verdicts { display:flex; gap:.5rem; flex-wrap:wrap; margin-bottom:.7rem }
  .v { display:flex; flex-direction:column; gap:.1rem; padding:.45rem .7rem; border:1.5px solid var(--line);
       border-radius:3px; cursor:pointer; flex:1 1 9rem }
  .v:has(input:checked) { border-color:var(--accent); background:color-mix(in srgb, var(--accent) 8%, transparent) }
  .v input { margin-right:.35rem }
  .v-label { font-weight:600; font-size:.95rem }
  .v-hint { color:var(--soft); font-size:.8rem }
  .notes-l { display:block; font-size:.85rem; color:var(--soft) }
  textarea { width:100%; margin-top:.25rem; padding:.5rem; font:inherit; color:var(--ink);
             background:var(--paper); border:1px solid var(--line); border-radius:3px; resize:vertical }
  .bar { position:fixed; left:0; right:0; bottom:0; padding:.9rem 1.2rem; background:var(--surf);
         border-top:1px solid var(--line); display:flex; gap:1rem; align-items:center; justify-content:center }
  button { padding:.65rem 1.5rem; font:inherit; font-weight:600; color:#fff; background:var(--accent);
           border:0; border-radius:3px; cursor:pointer }
  .empty { padding:3rem 0; text-align:center; color:var(--soft) }
  :focus-visible { outline:3px solid var(--accent); outline-offset:2px }
</style></head><body><div class="wrap">
<h1>Feedback review</h1>
<p class="rec">${stamp} · ${items.length} waiting · ${decided.size} already decided in earlier passes</p>
<p class="lede">One card per piece of feedback. A verdict is preselected so the common case is one
click — change any of them. <strong>Export writes the verdicts file, and that file is the only thing
authorized to move anything into the roadmap or the parking lot.</strong></p>
${items.length ? cards : '<p class="empty">Nothing waiting. Nothing to do.</p>'}
</div>
${items.length ? `<div class="bar"><span class="rec" id="tally"></span><button id="export">Export verdicts</button></div>` : ''}
<script>
  const tally = document.getElementById('tally');
  const count = () => { if (!tally) return;
    const n = document.querySelectorAll('.card').length;
    tally.textContent = n + ' item' + (n === 1 ? '' : 's');
  };
  count();
  document.getElementById('export')?.addEventListener('click', () => {
    const verdicts = [...document.querySelectorAll('.card')].map(c => {
      const id = c.dataset.id;
      return { id,
        verdict: c.querySelector('input[name="v-' + id + '"]:checked')?.value || null,
        notes: (c.querySelector('[data-notes="' + id + '"]')?.value || '').trim() };
    });
    const blob = new Blob([JSON.stringify({ reviewed: ${JSON.stringify(stamp)}, verdicts }, null, 2)],
                          { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'APPROVED_feedback-verdicts_' + ${JSON.stringify(stamp)} + '.json';
    a.click();
  });
</script></body></html>`;
}

// ---- entry ------------------------------------------------------------------
const args = process.argv.slice(2);
const applyIdx = args.indexOf('--apply');

if (args.includes('--count') || args.includes('--status')) {
  const inbox = pull();
  const decided = alreadyDecided();
  const all = inbox.items || [];
  const waiting = all.filter((i) => i.status === 'open' && !decided.has(i.id)).length;
  if (args.includes('--status')) {
    // JSON, for feedback-check. `full` is set by the Lambda when it had to refuse a real
    // submission — the whole point of F1 was that this must never be silent.
    console.log(JSON.stringify({ waiting, total: all.length, full: !!inbox.full_since,
                                 fullSince: inbox.full_since || null }));
  } else {
    console.log(waiting);
  }
  process.exit(0);
}

if (applyIdx > -1) {
  const file = args[applyIdx + 1];
  if (!file || !fs.existsSync(file)) { console.error('✗ Pass the exported verdicts file: --apply <path>'); process.exit(1); }
  const { verdicts } = JSON.parse(fs.readFileSync(file, 'utf8'));
  const byId = new Map(verdicts.filter((v) => v.verdict).map((v) => [v.id, v]));

  // CONDITIONAL WRITE, and it matters. A plain `s3 cp` back would be a read-modify-write
  // with no lock: anything submitted between the pull and the write is silently erased,
  // and nobody would ever know a stranger's message had been thrown away. The Lambda
  // already writes conditionally; this has to as well, or the two disagree about whether
  // the file is safe to clobber. Re-read, re-apply, and put only if the ETag still matches.
  let touched = 0, deletedSpam = 0, expired = 0;
  let wrote = false;
  for (let attempt = 0; attempt < 5 && !wrote; attempt++) {
    const { body: inbox, etag } = pull({ withEtag: true });
    touched = 0; deletedSpam = 0; expired = 0;
    const today = new Date().toISOString().slice(0, 10);
    const kept = [];
    for (const item of inbox.items || []) {
      const v = byId.get(item.id);
      if (v) {
        touched++;
        if (v.verdict === 'spam') { deletedSpam++; continue; }   // gone, not flagged
        item.status = v.verdict;
        item.decided = today;
        if (v.notes) item.notes = v.notes;
      }
      // Retention sweep. Only ever touches items that already have a verdict — an
      // undecided report never ages out.
      if (item.decided && item.status !== 'open') {
        const age = (Date.parse(today) - Date.parse(item.decided)) / 86400000;
        if (age > RETENTION_DAYS) { expired++; continue; }
      }
      kept.push(item);
    }
    inbox.items = kept;
    fs.mkdirSync(OUT, { recursive: true });
    const tmp = path.join(OUT, '.writeback.json');
    fs.writeFileSync(tmp, JSON.stringify(inbox, null, 1));
    const args = ['s3api', 'put-object', '--bucket', BUCKET, '--key', KEY,
                  '--body', tmp, '--content-type', 'application/json', '--profile', PROFILE];
    if (etag) args.push('--if-match', etag.replace(/"/g, ''));
    else args.push('--if-none-match', '*');
    try {
      execFileSync('aws', args, { stdio: ['ignore', 'ignore', 'pipe'] });
      wrote = true;
    } catch (e) {
      const err = String(e.stderr || e.message);
      if (/PreconditionFailed|ConditionalRequestConflict|At least one of the pre-conditions/i.test(err)) {
        console.log('  (something arrived while you were reviewing — re-reading and retrying)');
        continue;
      }
      console.error('✗ Write-back failed:\n  ' + err.trim().split('\n').slice(-2).join('\n  '));
      process.exit(1);
    } finally {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    }
  }
  if (!wrote) { console.error('✗ Could not write back after 5 attempts — nothing was changed.'); process.exit(1); }
  fs.copyFileSync(file, path.join(OUT, path.basename(file)));
  console.log(`✓ ${touched} item(s) marked. They will not come back in the next review.`);
  if (deletedSpam) console.log(`  ${deletedSpam} marked spam — deleted outright, not kept.`);
  if (expired) console.log(`  ${expired} decided more than ${RETENTION_DAYS} days ago — aged out and deleted.`);
  process.exit(0);
}

const inbox = pull();
const decided = alreadyDecided();
const waiting = (inbox.items || []).filter((i) => i.status === 'open' && !decided.has(i.id));

if (!waiting.length) {
  console.log(`Nothing waiting. (${(inbox.items || []).length} in the inbox, all decided.)`);
  process.exit(0);
}

const stamp = new Date().toISOString().slice(0, 10);
fs.mkdirSync(OUT, { recursive: true });
const file = path.join(OUT, `review_${stamp}.html`);
fs.writeFileSync(file, page(waiting, decided, stamp));
console.log(`\n${waiting.length} piece(s) of feedback waiting.\n\n  open ${file}\n`);
console.log(`  Then: npm run feedback -- --apply feedback-out/APPROVED_feedback-verdicts_${stamp}.json\n`);
