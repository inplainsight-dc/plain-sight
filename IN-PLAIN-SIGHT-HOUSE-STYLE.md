# In Plain Sight — House Style

The visual identity for **In Plain Sight**, the public civic-tech hub for the District of Columbia. This is the single source of truth for the look across the hub, every tool under it (`/dc-laws`, `/citator`, …), and any fork that stands up its own `inplainsight-{jurisdiction}.org`.

The style is **warm, civic, and investigative**, and it reads like a **publication of record**. It descends from one idea — *things hiding in plain sight* — and one source — **the flag of the District of Columbia**, which gives us a red, three stars, and two bars: our color, our mark, and our signature device.

> Deliberately distinct from the DC OIG navy-and-gold house style. That work is institutional and official; this is public, open, and built in the open.

This guide is implemented in `src/styles/global.css` (the shared design system) and the components in `src/`. The two are kept in sync — edit tokens in one place, restyle everywhere.

---

## The idea, in one line

**Conceal, then reveal.** The flag's two bars become a *redaction bar* that lifts to show what was always there. The marker *flags* the fine print everyone scrolled past. The same DC red that hides a number is the red that reveals it. Keep two impulses in tension: **Redacted** (investigative, document-driven, mono case-file precision) and **Highlight** (warm, public, accessible, "we read the fine print so you don't have to").

---

## Look & feel: publication of record

The execution is what keeps this from reading as a generic template. The rules:

- **Flat, not floating.** Hairline rules and borders carry structure — **no drop shadows**. (`--ps-shadow` and `--ps-shadow-lg` are `none`.)
- **Squared, not rounded.** Small radii only (`--ps-radius: 3px`). No pills — tags, badges, and buttons are squared.
- **Ruled like a document.** A doubled rule under the masthead; thin rules between sections; an asymmetric, editorial grid rather than a centered column of equal cards.
- **Scale contrast.** Big legal-serif headlines against small mono metadata and tabular figures.
- **Red is a verb.** Used where something is exposed, marked, or acted on — never as a flat fill behind reading text.

---

## Color — from the DC flag

| Role | Name | Light | Dark | Token | Used for |
|------|------|-------|------|-------|----------|
| Signature | DC Red | `#E81B39` | `#FF4A60` | `--ps-accent` | The one accent: links, CTAs, stars, bars, marks |
| Depth | Deep Red | `#B0122B` | `#E81B39` | `--ps-accent-2` | Hover/active, kickers, datelines |
| Fill | Red (solid) | `#E81B39` | `#FF4A60` | `--ps-highlight` | Badges, solid red chips (white text) |
| Mark | Red (translucent) | `rgba(232,27,57,.20)` | `rgba(255,74,96,.22)` | `--ps-mark` | The highlight swipe behind a key phrase |
| Text | Ink | `#1A2438` | `#F3ECDD` | `--ps-ink` | Body, headings, redaction bars |
| Text · soft | Ink Soft | `#515A70` | `#B3AB9B` | `--ps-ink-soft` | Secondary text, captions |
| Background | Paper | `#FBF7F0` | `#141A26` | `--ps-paper` | Warm cream page |
| Surface | Surface | `#FFFFFF` | `#1D2433` | `--ps-surface` | Cards, panels |
| Surface · alt | Surface 2 | `#F5EEE1` | `#232C3E` | `--ps-surface-2` | Hovers, banding |
| Hairline | Line | `#E7DDC9` | `#313A52` | `--ps-line` | Borders, dividers |

DC Red is the **Pantone 1788 C** family. One accent carries the whole design; ink and cream do the other 95%. The earlier teal/coral/amber are retired.

---

## Type — three voices

| Voice | Typeface | Token | Used for |
|-------|----------|-------|----------|
| **Display** | **Newsreader** (legal-record serif) | `--ps-font-display` | Headlines, nameplate, pull quotes |
| **Body** | **Public Sans** | `--ps-font-body` | All reading text, UI, navigation, buttons |
| **Record** | **IBM Plex Mono** | `--ps-font-record` | Labels, kickers, datelines, metadata, tabular figures |

- **Body is sans** (Public Sans) — clean and accessible for a public audience.
- **Display ships in Newsreader.** **Redaction** (Mickel / MCKL, drawn from US legal typography) is a **parked upgrade**: free for personal use, commercial by request. When the site has real traffic, license it and prepend `'Redaction','Redaction 35',` to `--ps-font-display`; the stack already falls back to Newsreader, so nothing breaks. Draft email: `MCKL-redaction-license-email.md`.
- Headlines: Newsreader 600–700, tight tracking, sentence case. Mono labels: small, uppercase, tracked `0.12–0.16em`.

---

## Motifs — all from the flag

Implemented as utility classes in `global.css`:

1. **Redaction bar** (`.ps-redact`, `.ps-redact--red`) — a solid bar over text that lifts to reveal on hover/focus. The signature device; reveals default-on under `prefers-reduced-motion`. Use sparingly — one strong reveal beats five.
2. **Three stars** (`.ps-stars` + the SVG mark) — the flag's stars in DC red, drawn (not the ★ glyph). Mark, kicker, divider, or bullet. The brand mark is three stars over two bars (`Header.astro`).
3. **Two bars** (`.ps-rule2`) — twin red stripes as a masthead underline, footer rule, or section divider.
4. **Red mark** — `.ps-highlight` (translucent swipe behind a phrase) or `.ps-mark-und` (red underline) for the one fact that matters; solid red chips for tags/badges.

---

## Applying it by format

The tokens and motifs are constant; each format scales them.

**Web / HTML (hub + tools).** Shared design system in `src/styles/global.css`; never hardcode hex. Masthead header with the drawn mark + a doubled rule; theme toggle for dark mode. Hero: a Newsreader headline with **one** red-marked phrase, a mono kicker, a single red CTA. Flat cards, hairline borders, squared corners. Mono for all metadata. Respect `prefers-reduced-motion`.

**Slides.** Cream/white ground, ink text, red as the only accent. Mono kicker top-left (`★ FINDING 03`), Newsreader headline, a short red rule. Footer `IN PLAIN SIGHT · 04` in mono. Ink "statement" slides for one big red figure.

**Documents (briefs, PDFs).** Centered masthead: drawn mark, `IN PLAIN SIGHT`, two-bar rule, Newsreader title, mono meta (`PUBLIC RECORD · JUNE 2026`). Public Sans body, near-black ink. Red only on the title rule, pull figures, and one marked finding. Mono for exhibit/record numbers.

**Social / share.** Ink ground by default (pops in a feed); cream for softer pieces. A mono tag (`IN PLAIN SIGHT`), one huge Newsreader claim/number (`$4.2M unaccounted`), the two-bar mark. One fact, one red, legible at thumbnail size.

---

## Naming — every tool starts with "DC"

**The rule:** every tool in the family is named `DC <Thing>`. DC Rentals, DC Trash Tracker, DC Laws, DC Records, DC Ghost Homes, DC Renter Checklists, DC Appointments Watch. No exceptions for tools with a strong idiomatic name of their own — "Ghost Homes" becomes "DC Ghost Homes," it does not get a pass for being evocative.

**One name per tool, across all five places below.** The Index label, the page title and the h1 say the same thing. A shorter index label is not a separate decision to make per tool — if the card says `DC Trash` while the page says `DC Trash Tracker`, one of them is wrong.

**Why.** The jurisdiction is the promise. Someone landing on one tool from a search result or a shared link should know in the first two words whose fine print this is, without reading a line of body copy. It also does the fork's work for it: the prefix is the most visible seam, so a Baltimore or Philadelphia fork renames along an obvious line instead of inventing a new naming scheme.

**Where it has to be applied — all five, or the name is only half-changed:**

1. The card title in `src/data/projects/<tool>.md` (`title:` — this is what the Index renders).
2. The page `<title>` prop passed to `Base` — the browser tab and the search result.
3. The page `<h1>`, keeping the `ps-highlight` span on the distinctive word, not on "DC" (`DC Ghost <span class="ps-highlight">Homes</span>`).
4. The OG card eyebrow in `scripts/gen-og-cards.mjs` (`IN PLAIN SIGHT · DC GHOST HOMES`) — then regenerate the cards.
5. Any cross-link label on another page that names the tool in running text.

The frontmatter `description` should lead with the full name too where it names the tool at all.

---

## Punctuation & orthography

**The rule:** reader-facing text uses the curly apostrophe `’` and curly quotes `“ ”`. Em dashes
and curly quotes are *correct here* — this site's register is Personal, not the work or civic
register that bans them. Stripping them would be the error.

**Code comments keep straight apostrophes.** A `//` or `#` comment is not reader-facing. Do not
normalize them, and do not count them as findings.

**American spelling throughout**, including in generated data. UI copy is American English as the
translation baseline (ROADMAP 2.5). British forms that keep reappearing: `neighbourhood`,
`centre`, `modelled`, `licence`, `colour`, `whilst`, `programme`, `grey`, `judgement`.

**Leave these alone — normalizing them introduces an error:**

- `D.C. Code` / `D.C. Law` — the correct legal citation form. The "DC" house rule governs prose
  and tool names, not citations.
- `§§` — the correct plural of `§`, not a typo.
- Verbatim register strings quoted from a source (e.g. the MOTA seat records). Fidelity to what
  was published is the whole claim of those pages.

### ⚠ Sweeping for this: authored pages are less than half the site

**A sweep that reads `src/pages/` will pass while the site is visibly wrong.** Much of the reader
text on this site is *generated* and arrives at build time from another folder. This blind spot
has now produced three separate live defects:

| Found | Where it rendered | Real source |
|---|---|---|
| 2026-08-17 | `/ghost-homes` panels | `build_public_explorer.py` (STR node) |
| 2026-08-19 | `/rentals/move-in` — ~30 straight apostrophes | `law/move-in.json` (law brain) |
| 2026-08-19 | `/on-paper` — 2 straight apostrophes | `build_accountability_view.py` (STR node) |
| **still open** | `/almanac` — `neighbourhood`, 7 literal `--`, "out loud" | `almanac.json` (Electify node) |

**Sweep the built output, not the source.** `dist/**/*.html` with `<script>`/`<style>` stripped is
the only view that sees everything a reader sees. Then trace each hit back to its generator — a
hand edit in this repo is destroyed by the next `npm run build`.

**Two counting traps.** A raw `grep -c "'"` over a generated file counts JavaScript syntax in
inlined payloads and will overstate the problem — `/on-paper` was reported as six and is two.
And some pages build their reader text inside a `<script>`, so stripping scripts *understates* it.
Measure against the rendered page (`document.body.innerText`) when the two disagree.

**Before a blanket swap, categorise.** Apostrophes are contractions, possessives, plural
possessives *and* single quotation marks. `move-in.json` was safe to swap wholesale only because
all 37 were checked first and none was a quotation mark. Afterwards, diff the parsed structure —
not the text — to prove nothing but punctuation moved.

---

## Principles to preserve

- **Everything traces to the flag** — red, three stars, two bars.
- **One accent, used as a verb.** Red exposes, marks, acts. Ink and cream do everything else.
- **Warm bones, hard accent, flat and ruled.** Cream + Newsreader keep it human; the red bar and the document grid keep it serious.
- **Conceal, then reveal.** When there's a chance to *show* the idea, take it. The name is a promise.
- **Built in the open, made to be forked.** It reads from tokens in one place so another city can restyle by changing a few variables.

---

## What's wired (June 2026)

- `src/styles/global.css` — DC-flag tokens (light + dark), Newsreader/Public Sans/IBM Plex Mono, flat + squared primitives, motif utilities (`.ps-redact`, `.ps-rule2`, `.ps-stars`, `.ps-record`, `.ps-mark-und`).
- `src/layouts/Base.astro` — font links (Newsreader + Public Sans + IBM Plex Mono); dark-mode set-before-paint preserved.
- `src/components/Header.astro` — brand mark is the drawn three-stars-over-two-bars flag mark.
- `house-style.html` — living styleguide (open in a browser; light/dark toggle).
- **Parked:** Redaction licensing (`MCKL-redaction-license-email.md`) until real traffic.
- **Not yet converted:** page-level layout (`index.astro`) into the full masthead/index-row editorial structure — the tokens and components are ready; the page composition is the next pass.
