/**
 * gen-contrast-swatches.mjs — before/after swatches for the two AA contrast fixes.
 *
 * Decision aid, not a committed change. Renders the current brand red + amber as
 * SMALL TEXT on cream and on dark, next to darker candidates, each labeled with its
 * exact WCAG contrast ratio and a PASS/FAIL badge (AA small text = 4.5:1). The
 * lightest candidate that clears 4.5 is marked "recommended" — the smallest change
 * that keeps the colour as close to the brand as possible.
 *
 * IMPORTANT: this only concerns small TEXT. The DC-flag red (#E81B39) stays exactly
 * as-is for the flag, solid fills, and large display type (which pass at 3:1).
 *
 * RUN: node scripts/gen-contrast-swatches.mjs  →  kit/contrast-swatches.html
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (c) => { const a = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; };
const ratio = (f, b) => { const L1 = lum(hex(f)), L2 = lum(hex(b)); const hi = Math.max(L1, L2), lo = Math.min(L1, L2); return (hi + 0.05) / (lo + 0.05); };

// Surfaces
const CREAM = '#fbf7f0';
const CREAM2 = '#f5eee1';   // alt surface where warning chips sit
const DARK = '#232c3e';     // dark surface-2
const DARKP = '#141a26';    // dark paper

// Candidate ramps (before first)
const RED_LIGHT = ['#E81B39', '#C71430', '#B0122B', '#A11229', '#96122A'];
const RED_DARK = ['#E81B39', '#FF4A60', '#FF6072']; // dark theme: before vs brightened
const AMBER_LIGHT = ['#B8860B', '#977006', '#856200', '#785900', '#6E5200'];

const AA_SMALL = 4.5, AA_LARGE = 3.0;

function swatch(fg, bg, recommend) {
  const r = ratio(fg, bg);
  const passSmall = r >= AA_SMALL, passLarge = r >= AA_LARGE;
  const badge = passSmall ? 'pass' : (passLarge ? 'large' : 'fail');
  const badgeTxt = passSmall ? 'AA ✓' : (passLarge ? 'large only' : 'fail');
  return `<figure class="sw ${recommend ? 'rec' : ''}">
    <div class="chip" style="background:${bg}">
      <span class="small" style="color:${fg}">Know the limit · $2,600 deposit</span>
      <span class="lg" style="color:${fg}">Deposit cap</span>
    </div>
    <figcaption>
      <code>${fg}</code>
      <span class="ratio">${r.toFixed(2)}:1</span>
      <span class="badge ${badge}">${badgeTxt}</span>
      ${recommend ? '<span class="reccap">recommended</span>' : ''}
    </figcaption>
  </figure>`;
}

function ramp(title, note, list, bg, brandKeeps) {
  // recommend = lightest (earliest after the "before") that passes AA small
  let recIdx = -1;
  for (let i = 1; i < list.length; i++) { if (ratio(list[i], bg) >= AA_SMALL) { recIdx = i; break; } }
  const cells = list.map((c, i) => swatch(c, bg, i === recIdx)).join('');
  return `<div class="ramp">
    <h3>${title}</h3>
    <p class="note">${note}${brandKeeps ? ` <strong>The first swatch is today's colour.</strong>` : ''}</p>
    <div class="row">${cells}</div>
  </div>`;
}

const CSS = `
  :root{--ink:#1a2438;--soft:#515a70;--line:#e7ddc9;--paper:#fbf7f0;}
  *{box-sizing:border-box;}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:'Public Sans',system-ui,sans-serif;line-height:1.5;}
  .wrap{max-width:1000px;margin:0 auto;padding:36px 22px 70px;}
  h1{font-family:Georgia,serif;font-size:2rem;margin:0 0 .2rem;}
  .lede{color:var(--soft);max-width:66ch;margin:0 0 1.4rem;}
  .principle{background:#fff;border:1px solid var(--line);border-left:4px solid #1a2438;padding:12px 16px;border-radius:4px;margin:0 0 2rem;font-size:.95rem;}
  section{margin:0 0 2.4rem;}
  section > h2{font-family:Georgia,serif;font-size:1.4rem;margin:0 0 1rem;border-bottom:2px solid var(--line);padding-bottom:.3rem;}
  .ramp{margin:0 0 1.4rem;}
  .ramp h3{font-size:1rem;margin:0 0 .2rem;}
  .note{color:var(--soft);font-size:.9rem;margin:0 0 .7rem;}
  .row{display:flex;gap:12px;flex-wrap:wrap;}
  .sw{margin:0;flex:1 1 160px;min-width:150px;border:1px solid var(--line);border-radius:6px;overflow:hidden;background:#fff;}
  .sw.rec{border-color:#1a8a4a;box-shadow:0 0 0 2px #1a8a4a;}
  .chip{padding:16px 14px;display:flex;flex-direction:column;gap:8px;min-height:92px;justify-content:center;}
  .chip .small{font-size:13px;font-weight:600;}
  .chip .lg{font-size:22px;font-weight:700;}
  figcaption{padding:8px 12px;font-size:.82rem;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
  figcaption code{font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:.8rem;}
  .ratio{color:var(--soft);font-variant-numeric:tabular-nums;}
  .badge{margin-left:auto;font-size:.72rem;font-weight:700;padding:.1rem .45rem;border-radius:999px;}
  .badge.pass{background:#d8f0e0;color:#146c37;}
  .badge.large{background:#fdeecb;color:#7a5a00;}
  .badge.fail{background:#f7d6dc;color:#a11229;}
  .reccap{width:100%;color:#1a8a4a;font-weight:700;font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;}
`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Contrast swatches · In Plain Sight</title><style>${CSS}</style></head>
<body><div class="wrap">
  <h1>Contrast fixes — before &amp; after</h1>
  <p class="lede">The two AA failures as small text, with darker candidates. Each swatch shows its exact WCAG
    ratio; <b>AA small text needs 4.5:1</b>. The green-ringed swatch is the lightest option that passes —
    i.e. the smallest change from today's brand colour.</p>
  <div class="principle">This is small <em>text</em> only. The DC-flag red <code>#E81B39</code> stays exactly as-is
    for the flag, solid fills, and big headlines — those already pass at the 3:1 large-text bar. We're only darkening
    the hue when it's set as small type on a pale background.</div>

  <section>
    <h2>1 · The accent red</h2>
    ${ramp('On cream (light theme)', 'The current red is 4.23:1 here — just under the line.', RED_LIGHT, CREAM, true)}
    ${ramp('On dark surface (dark theme)', 'In dark mode, small red text should switch to the brightened red.', RED_DARK, DARK, true)}
  </section>

  <section>
    <h2>2 · The amber “caution” colour</h2>
    ${ramp('On cream (light theme)', 'The current amber is 2.82:1 — a clear fail; it needs to go notably darker.', AMBER_LIGHT, CREAM, true)}
    ${ramp('On the warm alt surface', 'Where the warning chips actually sit (slightly darker cream).', AMBER_LIGHT, CREAM2, true)}
  </section>
</div></body></html>`;

mkdirSync(join(ROOT, 'kit'), { recursive: true });
writeFileSync(join(ROOT, 'kit', 'contrast-swatches.html'), html);

// Console summary so the picks are legible without opening the page
const pick = (list, bg) => { for (let i = 1; i < list.length; i++) if (ratio(list[i], bg) >= AA_SMALL) return `${list[i]} (${ratio(list[i], bg).toFixed(2)}:1)`; return 'none pass'; };
console.log('✓ contrast-swatches → kit/contrast-swatches.html');
console.log('  red  on cream  : before #E81B39 (' + ratio('#E81B39', CREAM).toFixed(2) + ') → ' + pick(RED_LIGHT, CREAM));
console.log('  red  on dark   : before #E81B39 (' + ratio('#E81B39', DARK).toFixed(2) + ') → ' + pick(RED_DARK, DARK));
console.log('  amber on cream : before #B8860B (' + ratio('#B8860B', CREAM).toFixed(2) + ') → ' + pick(AMBER_LIGHT, CREAM));
