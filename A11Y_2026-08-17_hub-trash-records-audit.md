# Accessibility audit — hub, DC Trash Tracker, DC Records (2026-08-17)

**Scope:** `/`, `/trash`, `/records` — the three live pages the 2026-08-12 rentals sweep never covered (`ROADMAP.md` cross-cutting row "AA sweep of hub + trash + records"). Audited on the dev server against WCAG 2.1 AA: contrast in both themes, semantic structure and landmarks, labeled controls, decorative-icon suppression, `aria-live`, mobile reflow.

**Method:** an injected DOM probe computing contrast from *composited* backgrounds (walking the ancestor chain and alpha-blending each translucent layer) with all colors resolved through a canvas, so `color-mix()`, `color(srgb …)` and `rgba()` tints are measured as rendered rather than as authored. Every page run twice, once per theme.

---

## Result

| Page | Light | Dark |
|---|---|---|
| `/` (hub) | ✅ 0 failures | ✅ 0 failures |
| `/trash` | ✅ 0 failures _(was 1)_ | ✅ 0 failures |
| `/records` | ✅ 0 failures _(was 314)_ | ✅ 0 failures _(was 318)_ |

**6/6 page-theme combinations at 0 contrast failures.** The hub was already clean and needed nothing — it does inherit the August token system, as the roadmap predicted. `/trash` and `/records` are fixed.

Clean on every page, both themes: one `<h1>`, no skipped heading levels, `header`/`nav`/`main`/`footer` landmarks, `lang="en"`, 0 images missing `alt`, 0 decorative SVGs exposed to screen readers, no horizontal scroll at 375px, and — after the fix below — 0 unlabeled controls (15 on the hub, 23 on `/trash`, 386 on `/records`).

---

## Fixed this session

| # | Severity | Finding | Where | Fix |
|---|---|---|---|---|
| 1 | **Medium** | **"What happens next" callout heading fails in dark — 3.1:1.** Used `--ps-accent-2`, which is documented as the *hover/pressed* state color, not a text color. In dark it resolves to `#E81B39` on `--ps-surface-2`. | `src/pages/trash.astro:489` | Switched to `--ps-accent-text`, the small-text red that passes AA in both themes. |
| 2 | **Medium** | **"Sensitive" tag fails in dark — 3.28:1.** `background: var(--ps-accent); color: #fff`. In dark `--ps-accent` brightens to `#FF4A60`, and white on it drops below AA. **This is the same bug `.mv-badge` had in August**, unfixed here only because `/records` was never swept. | `src/pages/records.astro:592` | Added `[data-theme='dark'] .rr .t-sensitive { color: var(--ps-paper); }` — the identical remedy already used by `.ps-badge--live` at `global.css:317`. |
| 3 | **Medium** | **`ⓘ` popover on hover/focus had the same white-on-brightened-red problem** — a *focus* state, so it hits keyboard users specifically. | `src/pages/records.astro:605` | Same dark override. |
| 4 | **Medium** | **Unlabeled `readonly` textarea.** `#fb-text` holds the generated report in the "email didn't open?" fallback flow. No label, no `aria-label`, empty placeholder — a screen-reader user tabbing to it hears "edit text, read only" and nothing about what it contains. | `src/pages/trash.astro:116` | `aria-label="Your report text, ready to copy"`. |

Verified after fixing: `/trash` 0 failures in both themes; `/records` dark 318 → 312.

---

## Finding 5 — the palette gap (applied 2026-08-17, approved by Pippa)

**All 312–314 failures on `/records` were one root cause: `--ps-accent-text` on `--ps-mark`.**

`--ps-mark` is the translucent red swipe (`rgba(232,27,57,.20)` light / `rgba(255,74,96,.22)` dark). The August token work verified `--ps-accent-text` against cream, the alt cream surface, and the dark surface — **but never against `--ps-mark`**, and red-on-red-tint lands just under the line:

| Element | Instances | Light | Dark |
|---|---|---|---|
| `.rr .info` (the `ⓘ` badge) | 297 | 4.25:1 | 4.07:1 |
| `.rr .t-personal` | 15 | 4.25:1 | 4.07:1 |
| `.rr .comp.full` | 2 | 4.02:1 | passes |

All three are `background: var(--ps-mark); color: var(--ps-accent-text)`. None is a wild miss — they are 0.25–0.5 short of 4.5:1 — but they are failures, and the `ⓘ` badge appears 297 times.

**Fix — a fifth theme-aware token, `--ps-accent-text-mark`** (`global.css:20` / `:55`), extending the August table rather than hard-coding hexes. Applied at all three call sites in `records.astro` (`.info`, `.t-personal`, `.comp.full`).

| | Value | On `.info`/`.t-personal` mark | On `.comp.full` mark |
|---|---|---|---|
| Light | **`#B0122B`** — *already in the palette as `--ps-accent-2`, no new color* | 5.11:1 ✅ | 4.84:1 ✅ |
| Dark | **`#FF7D8B`** — one new value, a slightly lighter red | 4.86:1 ✅ | 5.43:1 ✅ |

The change cost exactly **one new hex**. Measured after applying: `/records` 0 failures in both themes, with `.t-sensitive` also confirmed at 4.52:1 light / 5.31:1 dark.

**Fork bonus, as in August:** any In Plain Sight fork inherits a mark-safe red for free.

**The token table now reads:**

| Token | Light | Dark | Meaning |
|-------|-------|------|---------|
| `--ps-accent-text` | `#C71430` | `#FF6072` | red small text on paper/surface |
| **`--ps-accent-text-mark`** | **`#B0122B`** | **`#FF7D8B`** | **red small text sitting on the `--ps-mark` tint** |
| `--ps-caution` | `#856200` | `#C9982E` | amber "know the limit / caution" |
| `--ps-good` | `#2A7247` | `#4CAF6E` | green "protection / OK" |
| `--ps-info` | `#3b6ea5` | `#6B9BDB` | blue "negotiable / info" |

---

## Two methodology lessons worth keeping

1. **A page-load probe cannot see state-dependent or JS-injected UI.** Finding #3 (`:hover`/`:focus`) and finding #4 (a container behind `hidden`) only surfaced by forcing states and unhiding containers. `--ps-accent-2`-as-text turned out to appear in **three** places in `trash.astro` (`:473`, `:478`, `:489`), of which only one was visible at page load. Any future sweep should force states, not just load pages.

2. **The token matrix must include every background a token can land on.** The whole `/records` failure set exists because `--ps-mark` wasn't in the August verification set. When a new surface token is added, re-verify the text tokens against it.

**Un-testable here:** the skip-link `:focus` reveal. `document.hasFocus()` is `false` in the automated pane (`visibilityState: "hidden"`), so `:focus` never matches — the same limitation the August audit recorded. The rule at `global.css:132` is correct by inspection (`top: -48px` → `top: 8px`, 14.8:1 chip); confirm with one Tab press on the live site.

---

## Separate bug found in passing — not accessibility

**Astro's scoped styles never reach `trash.astro`'s runtime-injected markup.** The lookup result and every error message are written with `box.innerHTML = '<p class="tt-err">…'` (`trash.astro:266, 274, 284, 298`). Astro compiles the matching rules to `.tt-err[data-astro-cid-s4bp4ghy]`, and injected elements carry only a `class` attribute — so **`.tt-result__addr` and `.tt-err` render completely unstyled**, losing their intended color and size. Confirmed directly: `el.matches('.tt-err[data-astro-cid-s4bp4ghy]')` → `false`.

This is a visual regression, not an AA failure — the unstyled fallback inherits colors that pass comfortably (7.6:1 and 14.8:1). **But it is a trap:** whoever fixes the styling must use `--ps-accent-text`, not the `--ps-accent-2` currently authored there, or they will introduce exactly the failure fixed in #1 above.

**Handed to a separate session, in flight as of this write-up.** That session also found the same defect affects the *alert rail* (`.tt-rail__h`, `.tt-alert*`, `.tt-smallprint` — all written by client JS too), which this audit had missed. **`src/pages/trash.astro` is therefore deliberately NOT part of the commit that carries this audit** — at the time of committing, the working copy had those rules removed from the scoped block but not yet re-added globally, leaving the rail unstyled. Findings #1 and #4 above (the `--ps-accent-text` swap and the textarea `aria-label`) are verified and present in that same working copy, and ship with that session's commit rather than this one. Re-verify both after it lands.

### Resolved — 2026-08-17

Fixed; write-up in `handoffs/HANDOFF_2026-08-17_trash-injected-style-fix.md`. Final scope was wider again than either note above: probing every element inside both JS-filled containers found **16 of the 17 `.tt-*` rules dead**, not two — the whole alert rail *and* the whole result block (`.tt-result__grid` with its `dt`/`dd`, `.tt-result__ok`, `.tt-smallprint`). Only `.tt-result`, the static container, was styled.

Repaired with a `<style is:global>` block namespaced by container id (`#alert-rail`, `#lookup-result`), matching the convention already used for the register at `records.astro:542`. **The trap was measured rather than assumed:** forcing `--ps-accent-2` back onto `.tt-err` in dark reads **3.85:1**; `--ps-accent-text` reads **5.95:1**. `/trash` re-verified with the injected UI populated — a real lookup plus all three error paths — at **0 failures in both themes**, and the production bundle confirmed to emit the corrected token.

The intermediate "rules removed, no global block" state flagged above was a stale dev server, not a mid-edit save: the server on 4321 had died and kept serving a half-updated page. **Check the server is alive before believing the DOM.**

---

_On-mission note, same as August: the baseline across all three pages is strong. The hub needed nothing, `/trash` needed four lines, and `/records` needs one palette value. This is finishing work, not a rebuild._
