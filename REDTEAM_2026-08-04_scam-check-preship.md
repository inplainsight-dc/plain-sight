# Redteam pass — /rentals/scam-check (pre-ship)

**Date:** 2026-08-04 · **Surface:** `src/pages/rentals/scam-check.astro` (new, committed `374f31e`, **not yet deployed**)
**Scope:** everything the 2026-08-03 rights-page redteam (legal-claims pass, closed) did NOT cover — i.e. the new scam-checker's safety/legal claims, its risk-scoring logic, false-reassurance risk, and a persona check for the sight-unseen / relocation-deadline renter it targets.
**Lenses run:** claims-vs-evidence · hostile-reader / screenshot test · false-reassurance · logic integrity · persona (remote renter) · security/gating.
**Live checks done:** wire-recall window (FTC/bank guidance), all 5 outbound links, FTC/IC3 destinations, DC/MD/VA deposit aside (consistent with the vetted rights page).

---

## Honest headline — what HELD

- **The privacy claim is literally true.** Static page, no backend, no data collected, all scoring is client-side JS on the checkboxes. "Nothing you type leaves your browser" is literally true. ✅
- **Every outbound link is live and correct** — `reportfraud.ftc.gov` (200), `ic3.gov` (200), FTC rental-listing-scams (200, browser UA), Zillow rental-scams (loads in a real browser; blocks bots only), `ota.dc.gov` (200). ✅
- **Wire-recall claim is accurate** — FTC/bank guidance confirms recall is possible only in a narrow window of hours; "call now, not tomorrow" is right. ✅
- **False-reassurance guard holds.** The empty state never says "safe" ("Tick anything above…"); the fine print states "a clean read is not a guarantee… verify and pay traceably regardless." ✅
- **Scoring logic is sound** — no contradictions, correct pluralization, no unknown→confident coercion. Conservative bias (one stop sign → "Stop") is intended and always yields safe advice. ✅
- **Disclaimers consistent** — "not legal advice" in the lead and fine print; real-help offices linked. ✅

Three findings survived. None is a P0/ship-blocker; all are content refinements.

---

## Findings

### F1 — Recovery section over-indexes on wire; ignores the irreversible methods it warns about — **MEDIUM**
The page's stop-sign list flags **Zelle, Cash App, Venmo, gift cards, and crypto** alongside wire. But §04 "If you've already paid" is wire-centric: step 1 is "Call your bank immediately… a wire can sometimes be recalled." Those P2P/gift-card/crypto methods are typically **irreversible with no bank recall path at all** — a victim of a Zelle or crypto scam who reads "your bank can recall it" gets false hope and the wrong first action (the right move is contacting the *platform*, and reporting, while accepting it's often unrecoverable).
- **File/line:** `scam-check.astro`, `recovery` array (~L66–70) + §04.
- **Fix:** broaden step 1 to "Contact your bank **or the payment app** immediately"; add a line: "Wire transfers have a narrow recall window. Zelle, Cash App, gift cards, and crypto are usually **not** recoverable — report them anyway (it builds the record and can help others)." Keeps the accurate wire-recall note as the one genuine-window case.

### F2 — "High risk" tier can brand a genuine listing "a likely scam" (screenshot / false-positive) — **MEDIUM (judgment call)**
At **3 equally-weighted warning signs and zero stop signs**, the verdict reads *"High risk — treat this as a likely scam until proven otherwise."* A real but competitive below-market listing could trip three warnings (below-market price + "others are interested" urgency + a small landlord who won't do video). The brain itself says a below-market price is *"the single most consistent"* sign — yet all six warnings are weighted equally here, so three soft ones outrank the absence of the strongest one.
- **File/line:** `scam-check.astro`, `update()` warn≥3 branch in `<script>`, verdict string "likely scam."
- **Fix (either or both):** (a) soften the verdict to *"High risk — verify before you pay anything"* — same action, drops the accusatory label; and/or (b) weight the below-market flag so the strongest verdict leans on the strongest signal. Good **DELIBERATE/TWEAK** candidate — your call on tone vs. bluntness for this audience.
- *Note:* lower blast radius than it looks — no landlord is named on the page; the read is shown only to the self-assessing user, on-device. So this is "don't let a user walk from a good deal," not public defamation.

### F3 — "bonded service" is jargon for a lay reader — **LOW**
Stop-sign s4's rationale says real screening runs "through a **bonded service**." A first-time renter may not know the term.
- **File/line:** `scam-check.astro`, `stopFlags` s4 `why` (~L20).
- **Fix:** "through a **secure screening service** (a bonded one)" or just "a secure screening service at the application stage."

---

## Punch-list (for your verdicts — TAKE / TWEAK / MERGE / HOLD / DELIBERATE / DROP)

| ID | Sev | One-line | Suggested |
|----|-----|----------|-----------|
| F1 | MED | Recovery advice is wire-only; P2P/crypto victims get false hope | TAKE |
| F2 | MED | "Likely scam" can fire on a genuine below-market listing | DELIBERATE (tone call) |
| F3 | LOW | "bonded service" jargon | TAKE |

**Nothing folded yet — awaiting your verdicts (the gate holds).** F1 + F3 are quick, uncontroversial content edits. F2 is a tone judgment I'd like your call on. None blocks a deploy, but F1 is the one I'd fix before it goes live.
