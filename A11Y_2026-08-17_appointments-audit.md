# Accessibility audit — `/appointments` (DC Appointments Watch)

**Date:** 2026-08-17 · **Surface:** `src/pages/appointments.astro` · **Standard:** WCAG 2.1 AA
**Verdict: PASS.** Zero contrast failures across **8 combinations** (320 / 375 / 768 / 1280 px ×
light / dark). Every non-text mark that carries meaning clears 3:1, lowest 3.92:1.

This is the DC Appointments Watch roadmap task **p6-t5**, and it reuses the method proven on the
rentals and hub/trash/records sweeps. Two things are new here and worth keeping: the
**informational-mark check** and the **reflow check at four widths**.

---

## Why only two theme states had to be audited, not four

`src/styles/global.css` defines its dark palette under a single `[data-theme='dark']` selector —
there is **no `prefers-color-scheme` block for color** anywhere in it. `Base.astro` stamps an
explicit `data-theme` on the root before paint, from `localStorage` or the OS preference. So the
rendered page is always exactly `data-theme="light"` or `data-theme="dark"`, and auditing those
two attribute values covers all four OS × toggle combinations. Stated here because the earlier
audits counted four states and a later reader would otherwise think this one was half done.

## Method

A scripted audit in the live dev server, not an eyeball pass:

1. Every `<details>` forced open, so collapsed content is measured.
2. For every element holding its own text: computed color, composited against the **effective**
   background (walking ancestors and compositing translucent layers, so `--ps-mark` and any
   `rgba()` surface resolves properly).
3. Threshold by rendered size and weight — 3:1 for large text (≥24px, or ≥18.66px bold), 4.5:1
   otherwise.
4. Repeated in both themes and at four viewport widths, each in its own fixed-width iframe.

### One trap worth recording

The first run reported **93 failures**, all of them false. Setting `data-theme` and measuring in
the same synchronous pass samples the page **mid-transition**: `body` has
`transition: background-color 0.25s`, but the descendants' `color` values come straight from
`var()` with no transition, so light-theme ink was being compared against a background still
animating away from dark. Every "failure" was a ~1.1:1 ratio, which is the signature of the
foreground and background belonging to different themes.

**The fix, and the rule:** inject `* { transition: none !important }` before switching themes,
then force a style flush. A theme audit that does not suppress transitions measures a frame that
never existed. Both this and the earlier "hash mismatch is not always corruption" lesson are the
same shape — check what the measurement was actually taken *of* before believing it.

### A second measurement trap, from the same-day hub-wide sweep

Recorded here because this file is where the next audit will look. **Do not estimate
characters-per-line as `width ÷ (fontSize × 0.5)`.** On this site's type that overstates by
20–25%, which is enough to flag an element that already carries a `74ch` cap as a line-length
failure. The parallel session chasing responsiveness nearly filed exactly that finding. Measure
the real `ch` by probing a span set to the element's *own* computed font, or don't measure it.

Two traps, one family: an estimate and a mid-transition sample are both measurements of something
that isn't the page.

## Results — text contrast

| Width | Light | Dark |
|---|---|---|
| 1280 | 0 failures | 0 failures |
| 768 | 0 failures | 0 failures |
| 375 | 0 failures | 0 failures |
| 320 | 0 failures | 0 failures |

No new color tokens were needed. The page uses the existing theme-aware set
(`--ps-accent-text`, `--ps-caution`, `--ps-ink-soft`, `--ps-highlight-ink`) and nothing was
hardcoded — which is the point of the August token work paying off on a page built after it.

## Results — non-text marks (WCAG 1.4.11)

The page's charts carry meaning in bars, dots, squares and a cap rule, so each was measured
against what actually surrounds it. Hollow marks were measured on their **border**, since that
is the channel doing the work.

| Mark | Light | Dark |
|---|---|---|
| Bar past the cap, vs its track | 3.92:1 | 4.26:1 |
| Bar within the cap, vs its track | 4.86:1 | 5.34:1 |
| The 180-day cap rule, vs the track | 3.92:1 | 4.26:1 |
| Dot past the cap, vs the card | 4.52:1 | 4.73:1 |
| Dot within the cap (border), vs the card | 6.89:1 | 6.81:1 |
| Empty-seat square (border), vs the card | 4.52:1 | 4.73:1 |
| Hollow state glyph (border) | 5.61:1 | 5.93:1 |
| State-tile keyline | 4.23:1 | 5.31:1 |

The bar **track** itself sits at ~1.1:1 against the card, and that is deliberate: the track is a
container, not information. The informational comparison is bar-against-track, above.

### Color is never the only channel

- **Past the cap vs within it** — red *and* a 45° hatch on the bar; solid fill *and* red on the
  dot, against hollow-with-a-border otherwise.
- **The three states** — a shape cue (filled / half / hollow blocks) beside each figure, plus a
  distinct keyline, plus the words.
- **No value is printed inside a colored fill.** This is the rule the earlier seat-view work
  arrived at the hard way: no ink cleared 4.5:1 on all three fills, so the numbers moved out.
  Here every bar's value is written beside it from the start, and the bars are `aria-hidden`.

## Structure, keyboard and semantics

| Check | Result |
|---|---|
| `h1` count / heading order | 1 · no skipped levels |
| Tables with `<caption>` | 4 / 4 |
| `<th>` with `scope` | 50 / 50 |
| Landmarks | `header`, `nav`, `main`, `footer` present |
| Skip link | present, slides in on focus (from `Base.astro`) |
| Focus ring | `:focus-visible` 3px accent outline, inherited; scroll regions get their own |
| Chart alternative | strip chart is `role="img"` with a summarizing `aria-label`, and the same numbers sit in a captioned table in a `<details>` |
| Dynamic update | the freshness line is `role="status"`; it is also rendered server-side, so it says something true with JavaScript off |
| Reduced motion | inherited from `global.css` (`* { transition: none }` under `prefers-reduced-motion`) |

## Two real defects found and fixed

**1. The body scrolled sideways at 768px and below.** Two tables — the strip chart's
`<details>` table and the provenance report table — were not inside an overflow container, so
their min-content width pushed the whole document wider than the viewport (813px at 768,
669px at 375). That is a WCAG 1.4.10 reflow failure, and it is invisible on a desktop.
**Fixed** by wrapping both in `.aw-scroll` (new `--bare` variant for use inside a card that
already draws its own edge), each a labeled, focusable region. Wide content now scrolls inside
its own box and the page body never does.

**2. Grid minimums overflowed a 320px screen by 17px.** Four grids used
`repeat(auto-fit, minmax(300–320px, 1fr))`; with the container's padding, the minimum track is
wider than a small phone's viewport. **Fixed** with `minmax(min(Npx, 100%), 1fr)` — a track can
no longer demand more than the space it has.

**It was carried to the other tool pages the same day, and the defect turned out to be systemic.**
A parallel hub-wide sweep applied the same floor pattern and found **three more reflow failures no
previous audit had caught**: `/rentals/lease-check` (+17px at 320), `/almanac` (+17px), and
`/records` (+44px — a `<select>` sizing itself to its longest option, which also needed
`min-width: 0; max-width: 100%` on its group). Five across the site. That makes it a **class** of
small-screen defect the hub had never been measured for, and it is now a standing rule: any new
grid on this site uses the `min()` floor by default.

Two implications worth keeping. Every one of the five was invisible at desktop width, which is
where pages actually get looked at — so reflow needs a *measured* narrow-viewport check, never an
eyeball. And the earlier rentals and hub/trash/records audits each reported clean while carrying
these failures, because they measured contrast and semantics and never measured document width
against the viewport. **A passing audit is only as broad as its checklist.**

## What was NOT verified here

- **No screen-reader run.** The semantics were verified structurally (roles, labels, captions,
  scopes, heading order), which is not the same as listening to it. Worth one VoiceOver pass
  before the page is linked from the hub.
- **`prefers-contrast: more`** — still the deferred above-baseline layer, hub-wide.
- **Print.** Not styled for print; nothing on the page depends on it.

_Audited in the running dev server (`npm run dev`, port 4321), not against a static snapshot.
The production build was re-run afterward and passes: 12 pages._
