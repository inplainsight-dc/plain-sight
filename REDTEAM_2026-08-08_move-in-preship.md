# Redteam — /rentals/move-in legal claims (pre-ship gate)

**Date:** 2026-08-08 · **Scope:** the NEW move-in surface — `src/pages/rentals/move-in.astro` and its source of truth `new rental/plain-sight-rentals/skills/renter-setup/references/law/move-in.json` (prose twin: the "Getting the deposit back" table in `jurisdiction-deposits.md`). Focus: accuracy of the deposit-**return** law — return windows, itemized-deduction rules, interest, move-in/move-out inspection rights, and wrongful-withholding penalties across DC / MD / VA.
**Not covered by this pass (prior art):** the deposit-*cap*/up-front side (rights page + `jurisdiction-facts.json`, redteamed in prior sessions); lease-check (`REDTEAM_2026-08-08_lease-check-preship.md`); scam-check (`REDTEAM_2026-08-04...`). The move-in checklist procedure and the printable condition inventory carry no hard legal verdict and were reviewed for framing only.
**Method:** three independent adversarial fact-checkers (one per jurisdiction), each instructed to *refute* the exact published claim against the live primary statute — DCMR §§ 308–311 / D.C. Code § 42-3502.17 (code.dccouncil.gov, dcrules.elaws.us); Md. Real Property §§ 8-203 / 8-203.1 (mgaleg.maryland.gov); Va. Code §§ 55.1-1226 / 55.1-1214 (law.lis.virginia.gov). Not from memory. Lenses: claims-vs-statute, overstatement, misleading-by-omission, screenshot test.

## Honest headline — what HELD

**13 of 15 core claims CONFIRMED against live statute on the first adversarial pass.** The refuters could not break the spine:

- **DC** — 45-day return-or-notice → 30-day itemized statement (14 DCMR § 309.1/.2); itemized + no wear-and-tear (§ 309.2, D.C. Code § 42-3502.17(c)); interest if tenancy ≥12 mo at the *statement-savings rate* not a stale fixed 5% (§ 311); bad-faith treble damages, not automatic (§ 309.5). ✓✓✓✓
- **MD** — 45-day return (§ 8-203(e)(1)); itemized list by **first-class mail** or **forfeit** the right to withhold for damages (§ 8-203(g)); interest $50+/6-mo, greater of 1-yr Treasury or 1.5%, **monthly** (not the pre-2015 6-month interval), simple (§ 8-203(e)(1)); move-in on certified request within 15 days (§ 8-203.1) + move-out certified notice ≥15 days, forfeiture on non-compliance (§ 8-203(f)); up-to-3× + fees, "without a reasonable basis" (§ 8-203(e)(4)). ✓✓✓✓✓
- **VA** — 45 days from the later of termination or vacate (§ 55.1-1226(A)); no interest — confirmed absent from the *live* statute, not just relying on the repeal date (§ 55.1-1226); **5-day move-in condition report, deemed correct unless you object in writing within 5 days** (§ 55.1-1214(A)); move-out right-to-be-present notice + 72-hour window (§ 55.1-1226(G)); willful-failure remedy = return + actual damages + reasonable attorney's fees, offset by rent, no fixed multiplier (§ 55.1-1226(A)). ✓✓✓✓

The three "traps" a from-memory author would have failed all passed clean: DC's rate is the **statement-savings rate** (not the old 5%), MD interest accrues **monthly** (not the pre-2015 6-month interval), VA has **no** interest requirement (a stale lease form still promises one).

The screenshot test passes on every facts panel.

---

## Findings — folded before ship

### F1 · DC facts panel understated the move-out protection (misleading by omission) — FIXED
**Claim (was):** "DC law doesn't give you a move-in inspection or a right to be present at move-out."
**Statute:** literally true — DC has no move-in condition-report requirement and no tenant right to *attend* a move-out inspection. **But** 14 DCMR § 310 gives a real, omitted protection: if the landlord *chooses* to inspect (within 3 days before/after termination), they must give the tenant **≥10 days' written notice of the inspection's date and time** (§ 310.3–.4). The old wording left a renter thinking they get nothing at move-out.
**Fix:** rephrased the DC `inspectionNote` to keep "no required inspection / no formal right to attend" but add the § 310 10-day-notice right ("so you can arrange to be there"), and added "move-out inspection notice" to the DC citation label. Prose twin (`jurisdiction-deposits.md` move-out row) reconciled to match.
**Guard note (important):** mainstream DC landlord/tenant blogs (leaserunner, keyrenter, et al.) *wrongly* assert DC tenants have a "right to be present" at move-out. That is **not** in the DCMR — § 310 is a landlord option with a notice duty, not a right to attend. The page is correct to avoid the "right to be present" phrasing. **Do not let a future edit "correct" toward the blogs.**

### F2 · VA in-tenancy-deduction line dropped the last-30-days exception (misleading by omission) — FIXED
**Claim (was):** "…they must tell you in writing within 30 days — so charges shouldn't appear for the first time on the final statement."
**Statute:** § 55.1-1226(E) requires the in-tenancy 30-day notice **except** for deductions determined in the **last 30 days before termination**, which legitimately *can* appear for the first time on the 45-day statement. The reassurance overstated the protection.
**Fix:** rephrased VA `itemized` to state the rule (30 days *of deciding on it*) and carry the exception explicitly.

### F3 · MD "minus only damages" undersold lawful withholding (tightening) — FIXED
**Claim (was):** "…minus only damages they can back up."
**Statute:** § 8-203(f) lets the deposit also be applied to **unpaid rent** and breach damages, not just physical damage. Same nuance means the forfeiture in the itemized line is forfeiture *for damages* — unpaid rent is separate.
**Fix:** MD `returnWindow` → "minus any unpaid rent or damages they can back up"; MD `itemized` forfeiture line notes "(though unpaid rent is separate)."

### F4 · MD interest date precision (tightening) — FIXED
**Claim (was):** Treasury rate "set each January."
**Statute:** § 8-203(e)(1) says "as of the **first business day of each year**." Substantively January, but the exact phrasing is cleaner and unambiguous.
**Fix:** MD `interest` → "as of the first business day of the year."

---

## Optional / not taken (recorded, low value)
- **VA move-in report variants:** § 55.1-1214(B) also permits a *tenant-prepared* or *jointly signed* report. The page states the default (landlord prepares within 5 days), which is correct; adding the variants would lengthen the panel for little renter benefit. Left as-is.
- **DC wear-and-tear cite:** could point specifically at D.C. Code § 42-3502.17(c) (primary statute with a built-in definition) rather than the general § 42-3502.17 + DCMR. The current cites already include § 42-3502.17; not worth the extra line.

## Verdict
**Clear to ship** once Pippa runs the ship gate (deploy = a ship-gate event). All four folded fixes rebuilt clean; the sync validator passes; the corrected text is live in `dist/rentals/move-in/index.html`. Every legal claim on the surface is now backed by the live primary statute cited on the page, with the two omission-risks closed.
