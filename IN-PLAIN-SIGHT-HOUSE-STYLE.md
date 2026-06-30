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
