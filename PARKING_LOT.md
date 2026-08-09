# Parking Lot — In Plain Sight (hub)

Items set aside **on purpose**. They are not active threads for the hub and must not appear in `ROADMAP.md` or session next-steps until pulled back on-board. This keeps real work from being crowded out by things that only *look* urgent.

## How the parking lot works

- **Park something** when it keeps resurfacing but isn't the hub's job right now (belongs to a tool's own folder, or is gated on something outside your control).
- **Pull it back on-board** by cutting its row out of this file into `ROADMAP.md` (or the live handoff) with a real next step, and noting the date you did it.
- **The rule:** if it's in this file, it is OFF-BOARD — I won't surface it in agendas, handoffs, or "what's next" until you move it.

---

## Currently parked

| Parked on | Item | Why parked | Where it really belongs | Ungate-when |
|-----------|------|-----------|------------------------|-------------|
| 2026-08-03 | **Rename `100 IPS Electify` bare** (naming-rule cleanup) | Folder carries a `100 ` prefix that violates `naming.json` (bands 100–900 stay bare; band 150 lives in the tag). Housekeeping, not urgent; touches Meta Minder identity machinery | Meta Minder + Electify folder | You're doing a naming-cleanup pass and can re-run `naming.py` (also fixes `600 AUIE 27 Plan`) |
| 2026-08-03 | **Card up Electify on the hub** | IPS Civic Almanac is family but has no card yet; gated on the reader being shippable | This project (`src/data/projects/`) | Electify reader is ready to show publicly |
| 2026-08-09 | **Language access — Amharic first** (all IPS tools) | The **product** can't move: the actual Amharic legal text is gated on OHR reply → vendor → quote → native-speaker review (cost unknown, weeks out), and building the full multilingual layer before that is premature. Research is done and the warm OHR contact is captured (memory `language-access-amharic-initiative`); the outreach email is **Pippa's to send** (ANC identity). | ROADMAP 2.5 → pull back here | OHR replies / a translation vendor + cost are lined up, **or** you want the bounded string-inventory spike (one surface → word count → a real quote). ⏰ **Time-box: FY26 OHR reimbursement deadline is Oct 5, 2026 — revisit well before, don't let it lapse.** |

---

## Retired (resolved — kept for the audit trail)

- **Build the Plain Sight static rights site** — _parked 2026-07-02, retired 2026-08-08._ Superseded by reality: the no-plugin static site was built directly in the hub (`/rentals/rights`, `/rentals/scam-check` — both live), reading the law brain in place. The item's premise was also false — the `plain-sight-law/` export folder it named was never persisted (records corrected in `PORTFOLIO.md` + the Meta Minder registry the same day). No separate export or project is needed; the `law/` topic files in `new rental/plain-sight-rentals/` are the source of truth. Remaining rentals work (finish the drift-proof sync, then convert `lease-review`) is real build work tracked in the handoff, not a parked idea.

---

## On-board / off-board summary

- **OFF-BOARD (do not surface):** Rename `100 IPS Electify` bare · Card up Electify · Language access (Amharic) — ⏰ time-boxed to Oct 5, 2026.
- **To pull back on-board:** cut the row from the table above, paste it into `ROADMAP.md` (or the live handoff) with a concrete next step, and note the date.

_Note: some of these ultimately live in another folder (`100 IPS Electify`) or in Meta Minder. Parking them here just keeps the hub's roadmap clean — it doesn't move the work across folders._
