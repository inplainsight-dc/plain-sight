# Accessibility audit — the four live Rentals tools (2026-08-12)

**Scope:** `/rentals/rights`, `/rentals/scam-check`, `/rentals/lease-check`, `/rentals/move-in`, audited on the dev server against WCAG 2.1 AA (semantics, contrast in both themes, keyboard, labels, mobile reflow). Method: injected DOM/contrast probes + visual confirmation. Most findings are **systemic** (shared `Base.astro` / `Header.astro` / `global.css`), so one fix clears all four (and the hub).

## The good news — this is a well-built baseline
- **One `<h1>` per page, no skipped heading levels**, proper `header`/`nav`/`main`/`footer` landmarks, `lang="en"`. Screen-reader document structure is sound.
- **Every interactive control is labeled** — 10 on scam-check, 44 on lease-check, **69 on move-in** (all the condition-inventory checkboxes + text fields), 0 unlabeled anywhere. This is the hard part and it's already right.
- **No horizontal scroll at 375px** (mobile reflow clean); no images missing `alt`; buttons/links all have accessible names.
- Three of four tools already announce dynamic results via `aria-live`.

## Findings, most impactful first

| # | Severity | Finding | Where | Fix |
|---|----------|---------|-------|-----|
| 1 | **Medium** | **Skip-link never becomes visible on focus.** `.ps-skip` is parked at `left:-9999px` with no `:focus` reveal, so a keyboard user tabbing in can't see or use the "Skip to content" bypass. Fails WCAG 2.4.1 + 2.4.7. | Systemic (`Base.astro` / `global.css`) | Add a `:focus` style that pulls it on-screen (top-left, inked chip). ~5 lines. |
| 2 | **Medium** | **Brand red as small text fails AA.** `#E81B39` on cream = **4.23:1** (needs 4.5); on dark surfaces some red text is **3.1–3.85:1**. Hits datelines, small eyebrow labels ("DC Rentals"), the skip link. It's the DC-flag red, so this is a **brand decision, not a silent fix.** | Systemic (color tokens) | For small red *text*, use a darker red (`--ps-accent-2` #B0122B clears 4.5 on cream) while keeping #E81B39 for fills/large display; confirm dark theme uses the brightened #FF4A60 for red text, not #E81B39. |
| 3 | **Medium** | **Amber "caution" color fails AA.** `#B8860B` at 13px on cream = **2.82:1**. Used in warning chips ("Know the limit · More than needed"). | Systemic | Darken the amber to ~#8A6D00 (or heavier weight + larger). |
| 4 | **Medium** | **Rights deposit-calculator has no `aria-live`.** Rights = 0 live regions while the other three tools have them, so a screen-reader user who types a rent hears nothing when the cap line updates. | `/rentals/rights` | Add `aria-live="polite"` to the computed-result element (match the pattern already used on move-in). |
| 5 | **Low–Med** | **Decorative icons announced to screen readers.** 9–12 inline SVGs per page (section markers, bullets) lack `aria-hidden`, so they add noise to the audio reading. | Systemic (`Icon.astro` + inline svgs) | Add `aria-hidden="true"` + `focusable="false"` to decorative icons. |
| 6 | **Low** | **Condition-inventory checkboxes aren't grouped.** 14 checkboxes on move-in with no `<fieldset>`/`<legend>`. Labels are present (so it passes), but grouping would give screen-reader users the "these belong together" context. | `/rentals/move-in` | Optional enhancement: wrap each room's checkboxes in `fieldset` + `legend`. |

## Not found (checked, clean)
Missing form labels · missing landmarks · missing `alt` · heading-order breaks · horizontal scroll on mobile · nameless buttons/links · missing `lang`.

## Recommended sequence
- **Apply now (safe, non-brand):** #1 skip-link, #4 rights aria-live, #5 icon `aria-hidden`. Clears three findings, touches no brand color.
- **Your call (brand color):** #2 red-text contrast, #3 amber — these change palette values; want to see before/after swatches first.
- **Later / optional:** #6 fieldset grouping.

_On-mission note: this is the same principle as the Amharic language-access lane — "In Plain Sight" only earns its name if a blind renter, a keyboard-only user, and a screen-reader user can all use these. The baseline is strong; these are finishing touches, not a rebuild._

---

## RESOLUTION — 2026-08-12 (same session)

**Status: all findings closed. 8/8 page-theme combinations (4 tools × light+dark) verified at 0 contrast failures.**

Applied:
- **#1 skip-link** — canonical off-screen→`:focus` reveal in `global.css`; 14.5:1 (AAA). _(Live `:focus` un-testable in the automated browser; verify with one Tab press on the live site.)_
- **#4 rights aria-live** — `#calcOut` now `role="status" aria-live="polite"`.
- **#5 decorative icons** — `aria-hidden` on all `.ps-stars`; 0 unlabeled SVGs remain (all 6 pages).
- **#2 red text / #3 amber** — see the token system below.

**New system — theme-aware "category color" text tokens (in `global.css`).** The root cause of every contrast fail was category colors hardcoded as single hexes that passed on cream but failed on the dark surface (or vice-versa). They're now four theme-aware tokens, each passing AA (≥4.5:1) on both cream, the alt cream surface, and the dark surface. `#E81B39` is untouched for the flag, fills, and large display.

| Token | Light | Dark | Meaning |
|-------|-------|------|---------|
| `--ps-accent-text` | `#C71430` | `#FF6072` | red small text (links, datelines, verdicts) |
| `--ps-caution` | `#856200` | `#C9982E` | amber "know the limit / caution" |
| `--ps-good` | `#2A7247` | `#4CAF6E` | green "protection / OK" |
| `--ps-info` | `#3b6ea5` | `#6B9BDB` | blue "negotiable / info" |

Additional fixes found during the both-theme verification sweep (beyond the original six): the green "protection" tag and blue "negotiable" verdict (dark-mode fails), and the `.mv-badge` pill (light text flipped dark in dark theme → fixed to white-on-`#B0122B`, theme-independent).

**Fork bonus:** any In Plain Sight fork inherits an AA-clean palette in both themes for free.

**Still open (deferred, non-blocking):** #6 (wrap move-in condition-inventory checkboxes in `<fieldset>`/`<legend>` — enhancement only). And the enhancement lane discussed with Pippa: honor `prefers-contrast: more` as the silent "tailored" layer (no visible toggle). See memory `inclusion-baseline-not-opt-in`.
