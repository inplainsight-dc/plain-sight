/**
 * gen-og-cards.mjs — generate the social share-card images (1200×630 PNG).
 *
 * WHY: when someone drops an In Plain Sight link into a text, a Facebook tenant
 * group, Reddit, or Slack, the platform shows the og:image. Without one you get a
 * bland text blob nobody clicks. These cards turn every shared link into a small
 * poster for the tool — the cheapest distribution there is.
 *
 * HOW: pure SVG → PNG via sharp (already a dependency of Astro's image pipeline).
 * Text uses the brand's *fallback* font stack (Georgia serif / sans-serif / mono),
 * which the rasterizer has on hand, so there are NO third-party or bundled-font
 * dependencies — the cards are fully self-contained and reproducible on any fork.
 *
 * RUN: `npm run gen-og`  (also runs as part of `npm run build`).
 * OUTPUT: public/og/*.png  — referenced by src/layouts/Base.astro via the `ogImage` prop.
 *
 * ADD A CARD: append to CARDS below, give the page `ogImage="/og/<file>.png"`.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'og');

// --- House style (mirrors src/styles/global.css :root) ----------------------
const C = {
  paper: '#fbf7f0',
  ink: '#1a2438',
  inkSoft: '#515a70',
  line: '#e7ddc9',
  accent: '#E81B39',
};
const SERIF = "Georgia, 'Times New Roman', serif"; // Newsreader's declared fallback
const SANS = 'sans-serif';
const MONO = 'monospace';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * One card. `lines` is the big serif headline, pre-broken into 1–2 lines so we
 * never have to measure text. `sub` is the supporting sentence. `path` is the
 * URL path shown bottom-left (the domain is prepended).
 */
function svg({ eyebrow, lines, sub, path }) {
  const W = 1200, H = 630, X = 90;
  const headSize = lines.length > 1 ? 74 : 88;
  const headTop = lines.length > 1 ? 250 : 285;
  const headLine = headSize * 1.12;
  const headline = lines
    .map((t, i) => `<text x="${X}" y="${headTop + i * headLine}" font-family="${SERIF}" font-size="${headSize}" font-weight="700" fill="${C.ink}">${esc(t)}</text>`)
    .join('\n  ');
  const url = 'inplainsight-dc.org' + (path === '/' ? '' : esc(path));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.paper}"/>
  <rect x="0" y="0" width="${W}" height="14" fill="${C.accent}"/>
  <text x="${X}" y="128" font-family="${MONO}" font-size="26" letter-spacing="6" fill="${C.accent}">${esc(eyebrow)}</text>
  ${headline}
  <text x="${X}" y="${headTop + lines.length * headLine + 22}" font-family="${SANS}" font-size="36" fill="${C.inkSoft}">${esc(sub)}</text>
  <text x="${X}" y="504" font-family="${SANS}" font-size="24" fill="${C.inkSoft}">Free · No account · Nothing leaves your browser</text>
  <line x1="${X}" y1="528" x2="${W - X}" y2="528" stroke="${C.line}" stroke-width="2"/>
  <text x="${X}" y="582" font-family="${MONO}" font-size="30" font-weight="600" fill="${C.accent}">${url}</text>
</svg>`;
}

// --- The card set: one per live tool + the hub -----------------------------
const CARDS = {
  'default': {
    eyebrow: 'IN PLAIN SIGHT · DC',
    lines: ['Bringing the fine print', 'into plain sight.'],
    sub: 'Free civic tools that make DC government readable.',
    path: '/',
  },
  'rentals': {
    eyebrow: 'IN PLAIN SIGHT · RENTALS',
    lines: ['Renting in the DMV?', 'Know your rights.'],
    sub: 'Plain-language tenant tools for DC, Maryland & Virginia.',
    path: '/rentals',
  },
  'rentals-rights': {
    eyebrow: 'IN PLAIN SIGHT · RENTALS',
    lines: ['Your rights as', 'a renter.'],
    sub: 'DC, Maryland & Virginia — in plain language, not legalese.',
    path: '/rentals/rights',
  },
  'rentals-scam-check': {
    eyebrow: 'IN PLAIN SIGHT · RENTALS',
    lines: ['Is this rental', 'a scam?'],
    sub: 'Run the listing through the red-flag checklist before you pay.',
    path: '/rentals/scam-check',
  },
  'rentals-lease-check': {
    eyebrow: 'IN PLAIN SIGHT · RENTALS',
    lines: ['Before you sign', 'that lease.'],
    sub: 'Spot the clauses your state says a landlord can’t enforce.',
    path: '/rentals/lease-check',
  },
  'rentals-move-in': {
    eyebrow: 'IN PLAIN SIGHT · RENTALS',
    lines: ['Getting your', 'deposit back.'],
    sub: 'A move-in checklist + condition record that protects your money.',
    path: '/rentals/move-in',
  },
  'trash': {
    eyebrow: 'IN PLAIN SIGHT · DC TRASH',
    lines: ['When’s my trash', '& recycling day?'],
    sub: 'DC collection schedules and rules, made easy to check.',
    path: '/trash',
  },
  'records': {
    eyebrow: 'IN PLAIN SIGHT · DC RECORDS',
    lines: ['DC public records,', 'made searchable.'],
    sub: 'What the District keeps, how long, and how to ask for it.',
    path: '/records',
  },
};

await mkdir(OUT, { recursive: true });
let n = 0;
for (const [name, spec] of Object.entries(CARDS)) {
  const file = join(OUT, `${name}.png`);
  await sharp(Buffer.from(svg(spec))).png().toFile(file);
  n++;
}
console.log(`✓ gen-og-cards: wrote ${n} share cards → public/og/`);
