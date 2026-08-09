# Move-in — Persona + Redteam Wave 1 (findings)

**Date:** 2026-08-09 · **Surface under test:** the LIVE `/rentals/move-in` page (`src/pages/rentals/move-in.astro`) + its copy source of truth `move-in.json`.
**Charter / scope:** what the legal pre-ship redteam (`REDTEAM_2026-08-08_move-in-preship.md`) did NOT cover — reader comprehension and product-adversarial risk. Legal-claim accuracy is NOT re-litigated here (13/15 confirmed there; 4 fixes folded).
**Method:** combined wave, chartered as one. (a) Mechanical/adversarial checks I ran directly against the live page (network log, localStorage, progress-counter integrity, jurisdiction default). (b) Two fresh-eyes agents: a 6-persona stress test and an adversarial product redteam, both reading the live rendered surface. Live network + DOM inspected, not from memory.

## Honest headline — what HELD

The spine is sound and several sharp attacks bounced:

- **The penalty cells pass the screenshot test.** Every treble/penalty figure renders *with its gate inside the same cell* — DC "in **bad faith**… three times," MD "**without a reasonable basis**… **up to** three times… plus attorney's fees," VA "**willfully** fails… actual damages." Cropped, none reads as a guaranteed payout. This was the biggest worry and it holds.
- **The privacy claim is literally true.** Verified live: no fetch/XHR/sendBeacon/WebSocket; typed inventory data never persists to localStorage and never transmits. "Nothing you check off or type leaves your browser" holds. (One caveat below — PRIV-1.)
- **Progress-counter integrity is clean.** The bar counts only visible boxes; hidden wrong-jurisdiction boxes are never counted (13/13 for VA active, 14 in DOM).
- **Cross-surface as-is framing is consistent** — lease-check flags an "as-is, no condition report" clause and says *attach a signed move-in inventory*; this page produces exactly that and links back. No figure clashes (rights owns caps, move-in owns return windows).
- **False-completeness is half-solved already** — the progress line editorializes ("the ones left are what protect the deposit") instead of a bare "3/13."
- **The weakest-jurisdiction (DC) reframe works** — "No inspection in law — *you document it*" turns the gap into the reason the tool exists.

The problems concentrate in the **hero/meta rhetoric** (marketing voice outran the calibrated legal voice the body already uses) and in the **page having no state** (no forced jurisdiction choice, no persistence). Nothing below is a legal error.

---

## Findings (stable namespace MW#; severity-tiered)

### MW1 · [HIGH] Jurisdiction-default trap — silent DC default hides other states' law *and* their expiring deadlines
The switch defaults to DC (`i===0`, `aria-selected="true"`) with no forced choice. The active state is named only in a 0.8rem uppercase tag atop §01. A distracted MD/VA renter reads DC's deposit-return law as their own — and the mismatch is harmful, not cosmetic: DC "no move-in inspection" vs MD's real certified-mail-within-15-days right; different interest rules. **Worse:** the state-specific checklist step that carries MD's/VA's *expiring* deadline is hidden on the DC tab (`hidden={it.jur && it.jur!=='DC'}`), so the one clock they could miss is invisible unless they manually switch. Ambient cues reinforce DC ("← Back to DC Rentals," dateline). The lead says "Pick your state" but the page pre-picks one.
*Fix:* start with **no** state pre-selected (show a "Pick your state to see the law and your checklist" prompt in place of the panel), or add a body-sized persistent "Showing: Washington DC — not your state? pick above" indicator on **both** §01 and §02. Root cause shared with MW9/MW11.
*Files:* move-in.astro (switch markup ~line 84; facts panel; checklist `hidden` logic).

### MW2 · [MED-HIGH] Outcome-guarantee cluster — "defeats / beats / loses its teeth" (worst in the meta description)
The shareable search/social card (`Base description`, move-in.astro line 43) says "the record that **defeats an 'as-is' damage charge**." Reinforced in the hero (line 58 "that defeats an 'as-is' charge"), the inventory intro (move-in.json `inventory.intro`: "the artifact that protects your deposit… loses its teeth"), and a checklist why ("the record that beats an 'as-is' clause"). A signed inventory is strong *evidence* but defeats nothing on its own — a landlord can still deduct for real damage or unpaid rent; it doesn't substitute for the VA/MD statutory report. The page's own §05 ("It can't resolve a dispute") contradicts the hero, and this is the single most-shared string on the page.
*Fix:* evidence verbs, not outcome verbs. Meta/hero → "…the record that is **your strongest evidence against** an 'as-is' damage charge." Intro → "…An 'as-is' clause is **far harder to enforce** against a signed, dated condition record." Keeps the motivation, drops the guarantee.
*Files:* move-in.astro line 43 + 58; move-in.json `inventory.intro`, checklist why ("beats an 'as-is' clause"), the §03 aside (line ~230).

### MW3 · [MED-HIGH] Mobile print + no-persistence dead-end (the core deliverable can silently fail)
The whole deliverable funnels through `window.print()`. On a phone, "Save as PDF" is buried in the OS print sheet with zero guidance; typed field contents don't persist, so an interrupted mobile user can lose everything with no warning; and there's no guidance on where the saved PDF goes or to email it to themselves.
*Fix:* one line under the print button for phones ("On a phone, choose 'Save as PDF' — iPhone: tap the share icon in the print preview — and email it to yourself so you still have it in a year"), plus a "your typing isn't saved until you print or save" warning near the fields.
*Files:* move-in.astro §03 (print button ~line 185; inventory head).

### MW4 · [MED] False-completeness — never mentions the move-out forwarding address
A "protect your deposit" tool that omits the reciprocal of saving the landlord's address: giving the landlord a **written forwarding address at move-out**. Classic deposit-loss trap — the itemized statement and balance get mailed to the vacated unit, the 45-day clock is technically satisfied, and the tenant never receives it. A renter who "completed" this checklist would assume the return path is covered.
*Fix:* add to the move-out caveat (move-in.astro ~line 161) or the "Your first week" phase: "At move-out, give the landlord a **written forwarding address** — the statement and your balance must be mailed to you, and a deposit can't come back to an address they don't have."
*Files:* move-in.json checklist ("Your first week") or move-in.astro caveat.

### MW5 · [MED] Scope never fenced early — out-of-area renters read the law as theirs
Nothing above the fold states the DC/MD/VA-only boundary. A renter elsewhere lands on the DC default and reads authoritative-sounding 45-day/treble law as applying to them; the inventory is good practice anywhere, but the §01 *legal facts* are not, and the page never draws that line.
*Fix:* one sentence near the lead or switch: "These deadlines and penalties are the law in DC, Maryland, and Virginia only. The condition inventory is worth doing anywhere — the legal clocks are not."
*Files:* move-in.astro lead/switch area.

### MW6 · [MED] Unsourced superlative + absolute — "the most common way… won or lost on the day you get the keys"
Hero blurb (line 58). "The most common way renters lose money" is an unsourced empirical superlative a critic can deny (arrears, broken-lease fees, wear disputes also lose money); "won or lost on the day you get the keys" is contradicted by the page's own move-out caveat and by deposit losses from unpaid rent / the missing forwarding address (MW4).
*Fix:* one-word hedges — "**one of the most common ways**… and **much of it is** won or lost on the day you get the keys."
*Files:* move-in.astro line 58.

### MW7 · [MED] Unglossed action-gating jargon — "certified mail" above all
No glossary/gloss anywhere. Most dangerous: **"certified mail"** (MD, appears twice; a wrong guess — "just an official letter" — voids the right). Also "held in trust," "statement-savings rate," "itemized," "forfeit," "willfully," "offset." ("Three times"/bad-faith and "as-is" are already glossed well.)
*Fix:* short parenthetical plain gloss at first use for action-gating terms only — e.g. "certified mail (the tracked service at the post office that gives you a dated receipt — a plain letter or email won't count)."
*Files:* move-in.json depositReturn (MD `inspectionNote`, DC `interest`, §01 lede).

### MW8 · [MED] Completion asserts protection earned only by clicking
Checking all 13 boxes in seconds triggers "You built the record: dated photos, a signed inventory, meter readings." A user who clicked through without doing the work is congratulated for protection they don't have.
*Fix:* make conditional — "If you actually did each step, you now have: …".
*Files:* move-in.astro `<script>` completion line.

### MW9 · [MED] Google Fonts leak vs the privacy-first promise (cross-surface)
Every production page (all 6, not just move-in) loads `fonts.googleapis.com` + `fonts.gstatic.com`, so a visitor's browser calls Google at load — leaking IP + which page they're on to a third party. The literal promise ("nothing you *type* leaves your browser") holds, but for this exact wary audience (the no-plan callout says trusting an AI tool with housing details is reasonable to be careful about) third-party calls undercut the spirit. Base.astro already carries a "self-host later for privacy" TODO.
*Fix:* self-host the three fonts (Newsreader, Public Sans, IBM Plex Mono) and drop the Google links. Cross-surface — helps every page.
*Files:* `src/layouts/Base.astro` (font `<link>`s); add local font files.

### MW10 · [LOW-MED] "Email it the same day so it's timestamped" risks conflation with the VA/MD statutory steps
Sound as fallback for the tenant's *own* inventory, but it sits next to the badged state steps (VA 5-day written objection; MD 15-day certified-mail) and can read as interchangeable — a renter thinks "I emailed it, I'm covered" and blows the stricter window. A plain email also proves *when you sent your version*, not the condition.
*Fix:* fence it — "email them **your completed inventory** the same day so it's timestamped (this is your own record — it doesn't replace Virginia's report objection or Maryland's certified-mail steps above)."
*Files:* move-in.astro sign-block note (~line 222); move-in.json checklist why.

### MW11 · [LOW-MED] DC return-window cell not self-locating (cell-level instance of MW1)
The DC "When it must come back" cell carries the DC-only two-step (notice, then 30 more days) with the state named only in the panel tag. Cropped to the cell, an MD/VA renter could apply DC's extension. (The bare "45 days" is safe — all three share it; the divergent two-step is the risk.)
*Fix:* cheap per-cell anchor — lead the DC cell "**In DC:** 45 days after your tenancy ends…". Mitigates MW1 at the cell level even if the structural fix is deferred.
*Files:* move-in.json DC `returnWindow`.

### MW12 · [LOW] Sibling currency dates disagree — "August 2026" (move-in) vs "June 2026" (rights, lease-check)
move-in.json `asOf` = August 2026; rights + lease-check derive `asOf` from jurisdiction-facts.json = June 2026. A skeptic comparing sibling pages reads one as stale / the kit as unmaintained. Defensible (return-side law collected fresh, later) but the explanation is invisible.
*Fix (cleaner):* re-verify the up-front-money facts and bump jurisdiction-facts.json to August so all four surfaces read one date; *or* accept the split and be ready to explain.
*Files:* `src/data/law/jurisdiction-facts.json` (and its brain twin) `asOf`.

### MW13 · [LOW] DC strong fact stranded — bad-faith/treble backstop sits at the bottom of the inspection note
"No inspection in law" / "DC law doesn't require a move-in inspection" reads for a beat as "DC gives me nothing" before the recovery a line later.
*Fix:* lead the DC inspection note with the empowering half (own inventory + DC backs it with up-to-treble bad-faith damages).
*Files:* move-in.json DC `inspectionNote`.

---

## Prioritized punch-list (for Pippa's verdicts — nothing folded yet)

| ID | Sev | One-line | Root |
|----|-----|----------|------|
| MW1 | **High** | Silent DC default hides other states' law + expiring deadlines | no-state |
| MW2 | Med-High | "defeats an 'as-is' charge" outcome guarantee (esp. meta description) | rhetoric |
| MW3 | Med-High | Mobile print + lost typing = core deliverable can silently fail | no-state |
| MW4 | Med | No move-out forwarding-address step (deposit-loss trap) | completeness |
| MW5 | Med | Scope (DC/MD/VA-only) never fenced early | scope |
| MW6 | Med | "most common way / won or lost on day one" — superlative + absolute | rhetoric |
| MW7 | Med | Unglossed "certified mail" and other action-gating jargon | comprehension |
| MW8 | Med | Completion congratulates protection earned by clicking alone | rhetoric |
| MW9 | Med | Google-Fonts leak vs privacy promise (all 6 pages) | privacy |
| MW10 | Low-Med | "email to timestamp" conflatable with VA/MD statutory steps | comprehension |
| MW11 | Low-Med | DC return-window cell not self-locating (cell-level MW1) | no-state |
| MW12 | Low | Sibling asOf dates disagree (Aug vs June 2026) | credibility |
| MW13 | Low | DC strong fact (treble) stranded at bottom of note | rhetoric |

**Verdict key (Pippa's call per item):** TAKE (accept fix) · TWEAK (accept, her note is the spec) · MERGE · HOLD (real, not this pass) · DELIBERATE · DROP.
**Cheap-cluster note:** MW2, MW6, MW8, MW13 are all "calibrate the rhetoric to the body's honest voice" — mostly one-line copy edits in move-in.json / the astro hero. MW1+MW11 share the no-state root. MW9 is cross-surface (own lane; helps every page).

---

## Fold run-log — 2026-08-09 (all 13 TAKEN by Pippa; folded + verified live)

Verdicts: **TAKE all** (MW9 + MW12 folded first during triage; MW1 via the ZIP-lookup route Pippa chose; remaining ten TAKEN in one batch). Folded in dependency order (move-in.json → move-in.astro → Base.astro / jurisdiction-facts.json), rebuilt, regression-checked.

| ID | Verdict | What was done | Verified |
|----|---------|---------------|----------|
| MW1 | TAKE (ZIP route) | Added an on-device **ZIP → jurisdiction** resolver (ZIP3 map: DC 200/202–205 · VA 201+220–246 · MD 206–212/214–219) that auto-selects the state + a persistent "Showing [State] — not your state? Pick above" indicator. No network call. | 20009→DC, 22203/20147(NoVA)→VA, 20852→MD, 90210→out-of-area msg ✓ |
| MW2 | TAKE | Outcome verbs → evidence verbs in meta description, hero, inventory intro, checklist why ("your strongest evidence against" / "far harder to enforce"). | grep ✓ (2 hits "strongest evidence") |
| MW3 | TAKE | Mobile "Save as PDF" guidance + "what you type isn't saved until you print/save" warning under the print button. | grep ✓ |
| MW4 | TAKE | Added the move-out **forwarding-address** heads-up to the §02 caveat (deposit-loss trap). | grep ✓ |
| MW5 | TAKE | Scope fenced two ways: out-of-area ZIP says "not DC/MD/VA," + the "Showing" indicator. | ZIP 90210 msg ✓ |
| MW6 | TAKE | Hero hedged: "one of the most common ways… much of it is won or lost." | grep ✓ |
| MW7 | TAKE | Glossed "certified mail" (MD), "statement-savings rate" (DC), "held in trust" (§01 lede). | grep ✓ |
| MW8 | TAKE | Completion line made conditional: "All N steps checked. If you actually did each one…". | grep ✓ |
| MW9 | TAKE | Self-hosted Newsreader/Public Sans/IBM Plex Mono (24 woff2, latin+latin-ext, swap); removed Google links. **0 google refs in dist**, all 6 pages. | fonts.load ✓, 0 googleLinks on rights/lease-check/home ✓ |
| MW10 | TAKE | Sign-block "email to timestamp" fenced: "your own record… doesn't replace Virginia's report objection or Maryland's certified-mail steps." | grep ✓ |
| MW11 | TAKE | DC return-window cell prefixed "In DC:" (self-locating). | grep ✓ |
| MW12 | TAKE | Re-verified all up-front-money figures live (all UNCHANGED; Hare confirmed decided 2025-07-28); bumped asOf June→August 2026. Rights/lease-check/move-in now one date. | all read "August 2026" ✓ |
| MW13 | TAKE | DC inspection note now leads with agency ("Your own dated inventory is your record in DC…") instead of the "law gives you nothing" opener. | grep ✓ |

**Regression:** move-in (all edits + ZIP live), rights, lease-check, home — all render, fonts load self-hosted, 0 Google refs, dates August 2026, switches/clauses/deposit content intact. Build clean (8 pages). No page console errors (only dev HMR WebSocket noise).

**Guard test added:** none yet as automated code — the sync validator already fails the build on malformed law JSON; the ZIP resolver is pure and covered by the live case-sweep above. (Candidate follow-on: a tiny unit test of `zipToJur` if this logic grows.)

**Not re-opened:** the §03 aside ("what a landlord's lawyer least wants to see") was left as-is — it's evidence framing, not an outcome guarantee, so it survived MW2's calibration.
