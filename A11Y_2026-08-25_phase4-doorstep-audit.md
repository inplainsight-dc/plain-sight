# Accessibility audit — Phase 4 (the doorstep, the banded index, `/about`)

_Run 2026-08-25, against the dev build, both themes. Scope: the two pages Phase 4 changed —
the home page (`/`) and the new `/about`. Roadmap task 4.5._

## Why this run exists

The 2026-08-17 sweep passed the hub partly **because it had no interactive controls**. Task 4.3
put the first one on it — an address box with a live results region — so that exemption ended and
the hub had to be re-verified rather than inherited.

## Result

**4 of 4 page-theme combinations at 0 contrast failures.**

| Page | Theme | Elements checked | Failures |
|---|---|---|---|
| `/` | dark | 144 | **0** |
| `/` | light | 144 | **0** |
| `/about` | dark | 29 | **0** |
| `/about` | light | 29 | **0** |

Thresholds: 4.5:1 normal text, 3:1 large (≥24px, or ≥18.66px bold).

## One real defect, found and fixed

**The doorstep's submit button was `--ps-highlight-ink` on `--ps-accent` — 4.52:1.** Nominally AA,
and not a real margin for a primary call to action set in 13px uppercase mono, where antialiasing
eats into the measured figure. Any later nudge to `--ps-accent` would have pushed it under without
anything noticing.

Fixed by adding a token trio to `global.css`, the same move that produced `--ps-accent-text-mark`
when a background appeared that the matrix did not cover:

| Token | Light | Dark |
|---|---|---|
| `--ps-accent-fill` | `#B0122B` | `#FF4A60` |
| `--ps-accent-fill-ink` | `#ffffff` | `#141a26` |
| `--ps-accent-fill-hover` | `#8E0F22` | `#FF7D8B` |

**Result: 7.08:1 light, 5.31:1 dark.** `--ps-accent` keeps its job as a fill for flags and large
display; this pair is specifically "red carrying small text". **The feedback button in 4.6 must use
these, not `--ps-accent`.**

## A measurement bug worth writing down

The first sweep reported **45 failures in light theme** — every one of them false. Two of this
site's backgrounds are declared in the modern `color(srgb r g b / a)` form (the translucent header,
and the `--ps-mark` tint behind `.ps-tag`), and the audit script only parsed `rgb()`/`rgba()`. It
read `color(srgb 0.98 0.97 0.94 / 0.9)` as near-black and reported the brand wordmark at 1.35:1
when it is actually **14.53:1**.

**The lesson for the next audit: a contrast script must parse `color(srgb …)` and composite alpha
onto the layers beneath it, or translucent surfaces produce a wall of phantom failures — and, worse,
could hide a real one in the noise.** The corrected script walks every ancestor, composites each
translucent layer onto the page background, and only then measures.

## Two thin margins — passing, pre-existing, not introduced here

Neither is a failure and neither belongs to Phase 4; both are site-wide components, recorded so the
next person does not rediscover them:

- **`.ps-tag` — 4.57:1** (light). `--ps-accent-text` on the 12% red tint. Passes by 0.07.
- **`.ps-badge` "In the works" — 4.52:1** (light). Passes by 0.02.

Both are the `--ps-accent-text-mark` family of problem: small red text on a translucent red tint.
If either is ever restyled, they should move to a token with a real margin. Left alone here because
they appear on every card on the site and changing them reaches well past this phase's scope.

## Keyboard and screen reader

- Input has a real `<label for>`; accessible name resolves to "Your address".
- **`aria-describedby` points at the privacy line**, so a screen-reader user hears what happens to
  the address *before* typing it, not after.
- Answers land in `role="status"` / `aria-live="polite"`; errors use the **same** region, so a
  failure is announced rather than silently swapped in.
- The answer region is `tabindex="-1"` and takes focus on success.
- Tab order reaches the address box directly after the header; skip link still resolves to `#main`.
- A `<noscript>` block routes to `/ghost-homes` and `/trash` for anyone without JavaScript.

## Not covered

- **No screen-reader pass has been run** — this is a code-and-contrast audit. Same gap the
  Appointments Watch seat clock carries (roadmap 1.6).
- `prefers-contrast: more` remains deferred, as on the rest of the site.
- The doorstep's happy path cannot be exercised from localhost (the geocode proxy's CORS allow-list
  is the two production origins), so the **live** answer state is verified against replayed real
  payloads here and must be confirmed on the production origin at 4.9.
