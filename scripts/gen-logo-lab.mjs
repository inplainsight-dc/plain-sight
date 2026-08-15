/**
 * gen-logo-lab.mjs — a proposal page for a forkable "In Plain Sight" logo lockup.
 *
 * NOT a committed brand asset yet — this is three directions to react to. Once a
 * direction is chosen we productionize it (outline the type to paths, drop into
 * Header.astro + the share cards + a social avatar).
 *
 * The forkable idea, restated: the WORDMARK ("In Plain Sight") is the constant;
 * the JURISDICTION MARK (the DC flag — 3 stars over 2 bars) and the LABEL ("DC")
 * are the fork seam. A Baltimore fork swaps those two things and nothing else.
 *
 * RUN: node scripts/gen-logo-lab.mjs   →   kit/logo-lab.html (self-contained)
 * Newsreader + Public Sans are embedded as base64 so the wordmark renders exactly,
 * with no third-party or external font calls.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const b64 = (p) => readFileSync(join(ROOT, 'public/fonts', p)).toString('base64');
const NEWS600 = b64('newsreader-600-normal-latin.woff2');
const NEWS400 = b64('newsreader-400-normal-latin.woff2');
const SANS600 = b64('public-sans-600-normal-latin.woff2');

// --- The jurisdiction mark: the DC flag (fork seam #1) ----------------------
// A star + two bars, in DC red. `boxed` wraps it in the bordered square (favicon
// style). Geometry lifted from public/favicon.svg so the family stays coherent.
const star = (x, y, s) =>
  `<g transform="translate(${x},${y}) scale(${s})"><polygon points="12,1 14.5,8.5 22,8.5 16,13 18,21 12,16.5 6,21 8,13 2,8.5 9.5,8.5"/></g>`;
function dcFlag({ size = 72, boxed = true, red = 'var(--red)', ink = 'var(--ink)', paper = 'var(--paper)' }) {
  const flag = `<g fill="${red}">
      ${star(3, 5, 0.34)}${star(12, 5, 0.34)}${star(21, 5, 0.34)}
      <rect x="4" y="20" width="24" height="3"/>
      <rect x="4" y="25" width="24" height="3"/>
    </g>`;
  const box = boxed
    ? `<rect width="32" height="32" rx="2" fill="${paper}"/>
       <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="1.5" fill="none" stroke="${ink}" stroke-width="1.5"/>`
    : '';
  return `<svg viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true">${box}${flag}</svg>`;
}

// --- Direction A — Institutional lockup -------------------------------------
const dirA = () => `
  <div class="lockup lockA">
    ${dcFlag({ size: 76 })}
    <div class="words">
      <div class="wm">In Plain Sight</div>
      <div class="kick">WASHINGTON,&nbsp;DC</div>
    </div>
  </div>`;

// --- Direction B — Highlighter wordmark (the "into plain sight" swipe) -------
const dirB = () => `
  <div class="lockup lockB">
    <div class="wm wm-mark">In <span class="swipe">Plain Sight</span></div>
    <span class="jchip">${dcFlag({ size: 30, boxed: false })}<b>DC</b></span>
  </div>`;

// --- Direction C — Masthead (publication-of-record) -------------------------
const dirC = () => `
  <div class="lockup lockC">
    <div class="mast-row">
      <div class="wm mast">In Plain Sight</div>
      <div class="mast-tag">${dcFlag({ size: 26, boxed: false })}<span>DC</span></div>
    </div>
    <div class="mast-bars"><i></i><i></i></div>
    <div class="mast-sub">Bringing the fine print into plain sight.</div>
  </div>`;

const panel = (label, note, inner, dark = false) => `
  <figure class="panel ${dark ? 'on-ink' : 'on-paper'}">
    <div class="stage">${inner}</div>
    <figcaption><strong>${label}</strong> — ${note}<span class="mode">${dark ? 'reverse / dark' : 'primary / light'}</span></figcaption>
  </figure>`;

const CSS = `
  @font-face{font-family:'Newsreader';font-weight:600;font-display:swap;src:url(data:font/woff2;base64,${NEWS600}) format('woff2');}
  @font-face{font-family:'Newsreader';font-weight:400;font-display:swap;src:url(data:font/woff2;base64,${NEWS400}) format('woff2');}
  @font-face{font-family:'Public Sans';font-weight:600;font-display:swap;src:url(data:font/woff2;base64,${SANS600}) format('woff2');}
  :root{--ink:#1a2438;--soft:#515a70;--red:#E81B39;--paper:#fbf7f0;--surface:#fff;--line:#e7ddc9;}
  *{box-sizing:border-box;}
  body{margin:0;background:var(--paper);color:var(--ink);
    font-family:'Public Sans',system-ui,sans-serif;line-height:1.5;}
  .wrap{max-width:900px;margin:0 auto;padding:40px 24px 80px;}
  h1{font-family:'Newsreader',Georgia,serif;font-weight:600;font-size:2.2rem;margin:0 0 .2rem;}
  .lede{color:var(--soft);font-size:1.1rem;margin:0 0 2rem;max-width:60ch;}
  .seam{background:#fff;border:1px solid var(--line);border-left:4px solid var(--red);
    padding:14px 18px;border-radius:4px;margin:0 0 2.4rem;font-size:.95rem;}
  .seam code{font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;background:#f1e9da;padding:.05rem .3rem;border-radius:3px;}
  .dir{margin:0 0 2.6rem;}
  .dir h2{font-family:'Newsreader',Georgia,serif;font-weight:600;font-size:1.35rem;margin:0 0 .1rem;}
  .dir .why{color:var(--soft);margin:.1rem 0 1rem;}
  .pair{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  @media(max-width:640px){.pair{grid-template-columns:1fr;}}
  .panel{margin:0;border:1px solid var(--line);border-radius:6px;overflow:hidden;}
  .panel .stage{display:flex;align-items:center;justify-content:center;min-height:170px;padding:28px;
    background:var(--paper);}
  .on-ink{--ink:#f3ecdd;--soft:#b3ab9b;--paper:#141a26;--line:#313a52;--red:#FF4A60;border-color:#2a3348;}
  figcaption{font-size:.82rem;color:var(--soft);padding:10px 14px;background:#fff;border-top:1px solid var(--line);
    display:flex;gap:8px;align-items:baseline;}
  .on-ink figcaption{background:#1d2433;color:#b3ab9b;border-top-color:#313a52;}
  figcaption .mode{margin-left:auto;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:.72rem;opacity:.8;}

  /* --- Wordmark shared --- */
  .wm{font-family:'Newsreader',Georgia,serif;font-weight:600;color:var(--ink);letter-spacing:-.01em;}

  /* Direction A */
  .lockA{display:flex;align-items:center;gap:18px;}
  .lockA .wm{font-size:2.5rem;line-height:1;}
  .lockA .kick{font-family:'Public Sans',sans-serif;font-weight:600;letter-spacing:.22em;
    font-size:.8rem;color:var(--red);margin-top:.45rem;}

  /* Direction B */
  .lockB{display:flex;align-items:center;gap:16px;}
  .lockB .wm{font-size:2.7rem;line-height:1;}
  /* Highlighter: a marker swipe painted across the lower half of the words —
     a gradient so it always sits behind the glyphs with no z-index games. */
  .swipe{background:linear-gradient(transparent 58%, rgba(232,27,57,.24) 58%, rgba(232,27,57,.24) 94%, transparent 94%);
    padding:0 .04em;}
  .on-ink .swipe{background:linear-gradient(transparent 58%, rgba(255,74,96,.30) 58%, rgba(255,74,96,.30) 94%, transparent 94%);}
  .jchip{display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--red);border-radius:999px;
    padding:6px 12px 6px 8px;color:var(--red);font-weight:700;font-size:1rem;letter-spacing:.04em;}

  /* Direction C */
  .lockC{width:100%;max-width:460px;}
  .mast-row{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;}
  .lockC .mast{font-size:2.5rem;line-height:.95;}
  .mast-tag{display:inline-flex;align-items:center;gap:5px;color:var(--red);font-weight:700;
    font-family:'Public Sans',sans-serif;letter-spacing:.1em;font-size:1rem;padding-bottom:.15rem;}
  .mast-bars{margin:.5rem 0 .4rem;}
  .mast-bars i{display:block;height:5px;background:var(--red);border-radius:1px;margin-top:4px;}
  .mast-sub{font-family:'Newsreader',Georgia,serif;font-style:italic;font-weight:400;color:var(--soft);font-size:1rem;}
`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Logo lab · In Plain Sight</title>
<style>${CSS}</style></head>
<body><div class="wrap">
  <h1>In Plain Sight — logo lockups</h1>
  <p class="lede">Three directions for a wide, visible mark. Same wordmark in all three;
    what changes between them is <em>how the DC flag and the jurisdiction show up</em>. Pick a
    direction (or mix), then we outline the type and wire it into the header, the share cards,
    and a social avatar.</p>
  <div class="seam"><strong>The fork seam.</strong> Everything red-and-flag is jurisdiction-specific.
    A fork changes exactly two things — the flag mark (<code>dcFlag()</code>) and the label text
    (<code>DC</code>) — and gets a matching lockup for their city. The word “In Plain Sight” never moves.</div>

  <section class="dir">
    <h2>A · Institutional</h2>
    <p class="why">Flag badge + wordmark + city kicker. Reads as official and calm — closest to the current header. Safest, most legible small.</p>
    <div class="pair">${panel('Direction A', 'flag badge lockup', dirA(), false)}${panel('Direction A', 'flag badge lockup', dirA(), true)}</div>
  </section>

  <section class="dir">
    <h2>B · Highlighter</h2>
    <p class="why">The name acts out the mission — a red marker swipe brings “Plain Sight” <em>into plain sight</em>. Most distinctive; the flag rides in a jurisdiction chip.</p>
    <div class="pair">${panel('Direction B', 'highlighter + chip', dirB(), false)}${panel('Direction B', 'highlighter + chip', dirB(), true)}</div>
  </section>

  <section class="dir">
    <h2>C · Masthead</h2>
    <p class="why">A newspaper masthead: wordmark, the flag’s two bars as a full-width rule, the mantra beneath. Leans into the “publication of record” house style.</p>
    <div class="pair">${panel('Direction C', 'masthead + bars', dirC(), false)}${panel('Direction C', 'masthead + bars', dirC(), true)}</div>
  </section>
</div></body></html>`;

mkdirSync(join(ROOT, 'kit'), { recursive: true });
writeFileSync(join(ROOT, 'kit', 'logo-lab.html'), html);
console.log('✓ gen-logo-lab: wrote kit/logo-lab.html (3 directions, light + dark)');
