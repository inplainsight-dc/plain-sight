# Redteam — /rentals/lease-check legal claims (pre-ship gate)

**Date:** 2026-08-08 · **Scope:** the NEW lease-check surface — `src/pages/rentals/lease-check.astro` and its source of truth `new rental/plain-sight-rentals/skills/renter-setup/references/law/lease-clauses.json`. Focus: accuracy of the illegal / unenforceable / negotiable verdicts and their citations across DC / MD / VA.
**Not covered by this pass (prior art):** scam-check (`REDTEAM_2026-08-04_scam-check-preship.md`); the rights-page cards in `rights-cards.json` (redteamed in a prior session). Clauses this page *reuses* from `rights-cards.json` (deposit caps, source-of-income, VA stack) inherit that pass; this memo re-checks them only where the lease-check framing is new.
**Method:** live legal lookups (VRLTA, DC Code, HUD/FHA, MD statutes) — not from memory. Lenses: claims-vs-evidence, cross-surface contradiction, screenshot test, false-completeness.

## Honest headline — what HELD

The legal spine is sound. Verified live against statute:

- **DC / MD security-deposit caps = one month → "Illegal"** — holds (DC hard cap; MD leases on/after Oct 1 2024). ✓
- **Last month's rent stacked on a full deposit = over the cap → "Illegal"** in DC and MD — holds. ✓
- **Fee/deposit for a service or assistance animal = "Illegal"** — holds under the FHA; HUD treats pet fees/deposits/pet-rent for assistance animals as a violation (civil penalties). ✓
- **Refusing a voucher/subsidy or testing income against the *full* rent = "Illegal"** — holds; source-of-income discrimination is barred in all three (DC, MD HOME Act, VA since 2020). ✓
- **Self-help eviction / lockout = "Won't hold up"** — holds across the DMV (court process required). ✓
- **Waiver of notice-before-entry = "Won't hold up / red flag"** — holds: DC requires 48-hr notice (§8-231.06), VA 72-hr (VRLTA), so there is a right to waive. ✓ *(This corrects a mid-pass worry that DC had no entry-notice right — it does.)*
- **VA up-front stack (first + last + 2-mo deposit) = "Negotiable, legal in VA"** — holds. ✓
- **VA prepaid rent must go to escrow = "Negotiable / verify"** — holds (VRLTA §55.1-1205). ✓ (wording nit — F3)
- **DV early-termination right a lease can't waive** (ask + §03 note) — holds in **all three**: DC §42-3505.07, MD §8-5A-02, VA §55.1-1236. ✓

The screenshot test passes on every hard "Illegal" chip **except one** (F1).

---

## Findings

### F1 — HIGH · DC pet-fee clause is chipped "Illegal" for a law not yet in force (and contradicts the rights page)
**Where:** `lease-clauses.json` → `byJurisdiction.DC[2]` (the "non-refundable pet fee / breed or size restriction" clause), verdict `illegal`, label "Barred from Oct 1, 2026." Renders in the **"Illegal — don't sign it"** bucket with an **"Illegal"** chip on `lease-check.astro`.
**Problem:** DC's Pets in Housing Act / Roscoe's Law (D.C. Law 25-308) takes effect **October 1, 2026**. Today is **August 8, 2026** — it is *not yet in force*. A present-tense "Illegal" chip overclaims for the ~7 weeks until the effective date, and the underlying rule is prospective even after. Two compounding issues:
- **Screenshot test fails:** the "Illegal" chip beside "non-refundable pet fee" screenshots into "DC says non-refundable pet fees are illegal" — false today.
- **Cross-surface contradiction:** the already-redteamed rights page (`rights-cards.json`, DC pet card) deliberately used the *softer* verdict `ask` with label "Takes effect Oct 1, 2026." Two sibling pages on the identical law now disagree on how hard the claim is.
**Fix:** reclassify the DC pet-fee clause out of the hard "Illegal" bucket to `negotiable`, with timing-explicit language matching the rights page — e.g. label "Barred once Roscoe's Law starts (Oct 1, 2026)", ask that says the non-refundable pet fee and breed/size limits are barred **from October 1, 2026**, so for a lease running past that date, ask for them struck. Keeps the substance, drops the present-tense overclaim, and re-aligns the two pages. *(After Oct 1 2026 this can be revisited — but the fix should not depend on remembering to flip it; timing-explicit wording is correct in both eras.)*

### F2 — MEDIUM · The live read can read as "clean lease = safe lease"
**Where:** `lease-check.astro` — the `#lcRead` live-read block and the empty state ("Tick anything above and your read appears here.").
**Problem:** the checker only lists *known* problem clauses. A lease whose worst term isn't on the list produces an empty or all-clear read, which can feel like a completeness verdict ("nothing ticked → my lease is fine"). The §04 fine print does say the page "can't tell you your specific lease is safe," but that's four sections below the read — the moment of false reassurance isn't where the caveat sits. Scam-check learned this exact lesson and carries an explicit "**A clean read is not a guarantee**" line in-context.
**Fix:** add one short line in or directly under the live-read block — e.g. "This flags the clauses that most often go wrong; it isn't every possible term. A short read here doesn't mean the lease is clean — skim the rest and check anything unfamiliar." Mirrors the scam-check pattern.

### F3 — LOW · VA prepaid-rent escrow: "within five days" vs statute's "fifth business day"
**Where:** `lease-clauses.json` → `byJurisdiction.VA` prepaid-rent clause ask ("must be placed in escrow within five days"). *(Inherited verbatim from the redteamed `rights-cards.json` VA card — shared imprecision.)*
**Problem:** VRLTA §55.1-1205 says "by the end of the fifth **business** day following receipt." "Five days" is close but a hostile reader / landlord could quibble.
**Fix:** change to "by the end of the fifth business day." Consider mirroring the same tweak in `rights-cards.json` so the two pages stay consistent (its own tiny edit — flag, don't silently touch redteamed content).

### F4 — LOW · "Won't hold up" chip slightly overshoots the softer body language on two clauses
**Where:** `lease-clauses.json` shared `entrywaiver` and `inspections` — verdict `unenforceable` → renders chip "Won't hold up," while the group blurb and ask frame them as a "red flag about the landlord."
**Problem:** a routine-inspection or notice-waiver clause is better described as a red flag / against quiet enjoyment than flatly "won't hold up" (a lease *can* provide for inspections *with notice*). The claim isn't wrong, but the chip is a harder word than the surrounding copy.
**Fix (optional):** either leave as-is (defensible) or relabel the `unenforceable` chip text to "Red flag" on `lease-check.astro` (`verdictText.unenforceable`) so the chip matches the body's framing. Presentation-only; no JSON/law change.

---

## Punch-list (for verdicts: TAKE / TWEAK / MERGE / HOLD / DELIBERATE / DROP)

| ID | Sev | Item | Surface | Proposed fix |
|---|---|---|---|---|
| F1 | HIGH | DC pet-fee chipped "Illegal" for a not-yet-in-force law; contradicts rights page | `lease-clauses.json` DC | Move to `negotiable`, timing-explicit label + ask |
| F2 | MED | Live read can imply "clean lease = safe" | `lease-check.astro` read block | Add in-context "not every clause / a short read ≠ clean" line |
| F3 | LOW | "within five days" vs statute "fifth business day" | `lease-clauses.json` VA (+ rights-cards twin) | "fifth business day" |
| F4 | LOW | "Won't hold up" chip harder than body's "red flag" | `lease-check.astro` verdictText | Optional: chip → "Red flag" |

**None are Pippa-only** (no political/access/CF-dashboard items) — all are content/copy edits I can fold on your approval. Nothing folds until you return verdicts. No deploy until F1 is resolved (it's the one that could be screenshotted into a false legal claim).

---

## Resolution — verdicts + outcomes (2026-08-08, same session)

All four findings approved and folded in dependency order (data → surfaces), then regression-checked. No deploy performed.

| ID | Verdict | Outcome | Where folded |
|---|---|---|---|
| F1 | **TWEAK** (add a caveat, keep it flagged) | ✅ Fixed | `lease-clauses.json` DC pet-fee: kept `illegal`, added an `effective` field rendering a dashed "⏳ Not yet in force — begins Oct 1, 2026; before then a non-refundable pet fee isn't illegal in DC" caveat right under the chip. New optional `effective` field + validator guard added. Screenshot test now passes (timing travels with the card). |
| F2 | **TAKE** | ✅ Fixed | `lease-check.astro`: persistent `lc-read__caveat` line in the live-read block — "a short read doesn't mean the lease is clean." |
| F3 | **TAKE** | ✅ Fixed | `lease-clauses.json` VA escrow ask → "by the end of the fifth business day after the landlord receives it"; **mirrored** in `rights-cards.json` VA card so the two pages stay consistent. |
| F4 | **TAKE** | ✅ Fixed | `lease-check.astro`: `verdictText.unenforceable` chip "Won't hold up" → "Red flag" (matches the body's framing and the tally pill). |

**Regression (step 7):** validators still fail the build on a bad verdict, an unresolved `{ref}`, and now an empty `effective` string; brain files restore byte-identical after destructive tests; all 7 pages build clean.

**Gate status: PASSED.** F1 (the only deploy-blocker) is resolved. Remaining work before live is the ship-gate deploy decision itself, not a claims problem.
