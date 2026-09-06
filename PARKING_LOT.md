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
| 2026-09-06 | **No upstream schema-drift detection** — the hub verifies that its projections match the research node they cite, but nothing verifies that DC's own exports still have the shape the sync scripts assume | Real, not urgent, for a structural reason: this is a static build, so a layer id that disappears fails loudly at build time and never reaches a reader. **The quiet failure is a renamed or re-typed field** — it passes the build and ships wrong data to a resident under a page that promises provenance. Parked rather than roadmapped because the fix is a `--check` mode per upstream source, which is a focused session, not a hotfix | `scripts/sync-almanac-data.mjs` (queries ArcGIS layers by layer id) and `infra/geocode-proxy/` (MAR `findLocation2`) — in the shape `npm run sync-appointments -- --check` already proves out for the inward axis | You do an almanac or geocode session — **or immediately, if any tool starts reading a DC feed on a schedule rather than at build**, since then a shape change reaches readers with no build in between |
| 2026-08-26 | **Astro 5→7 upgrade also clears a *runtime* XSS advisory** | Astro 5.18.2 carries a high advisory — XSS in `define:vars` via incomplete `</script>` sanitization — and the hub uses `define:vars` in **five** places (`Feedback`, `Doorstep`, `records`, `rentals/rights`, `appointments/seats`). **Parked, not urgent, for a structural reason:** the hub is a fully static build (no adapter, no `output: server`, no `prerender = false`), so there is no request-derived data anywhere — every `define:vars` payload is repo data baked in at build, and the exploit needs attacker-controlled input. Parked rather than roadmapped because the fix *is* the already-scoped two-major bump, a focused session with visual QA, not a hotfix. **It also corrects that doc's old "all remaining vulns are build-time tooling" line, which is no longer true.** | `ASTRO_UPGRADE_SCOPE.md` — a reason to do it, not a new task | You run the Astro 5→7 session — **or immediately, if the site ever adopts SSR/an adapter, or a reader-supplied or third-party value starts being baked into a `define:vars` payload** |
| 2026-08-03 | **Rename `100 IPS Electify` bare** (naming-rule cleanup) | Folder carries a `100 ` prefix that violates `naming.json` (bands 100–900 stay bare; band 150 lives in the tag). Housekeeping, not urgent; touches Meta Minder identity machinery | Meta Minder + Electify folder | You're doing a naming-cleanup pass and can re-run `naming.py` (also fixes `600 AUIE 27 Plan`) |
| 2026-08-03 | **Card up Electify on the hub** — _half-landed 2026-08-19_ | ~~no card yet~~ An **In the works** card now exists (`civic-almanac.md`, unclickable by design). What is still parked is the **live** card, gated on the reader being shippable — `/almanac` is a scaffold that says so itself, and it also carries four generated-copy defects that must be fixed in the Electify node first (see the card's comment) | This project (`src/data/projects/`) for the card; **`100 IPS Electify/`** for the copy defects and the address lookup | Electify reader is ready to show publicly — then `live` + `url` + sitemap together |
| 2026-08-09 | **Language access — Amharic first** (all IPS tools) | The **product** can't move: the actual Amharic legal text is gated on OHR reply → vendor → quote → native-speaker review (cost unknown, weeks out), and building the full multilingual layer before that is premature. Research is done and the warm OHR contact is captured (memory `language-access-amharic-initiative`); the outreach email is **Pippa's to send** (ANC identity). | ROADMAP 2.5 → pull back here | OHR replies / a translation vendor + cost are lined up, **or** you want the bounded string-inventory spike (one surface → word count → a real quote). ⏰ **Time-box: FY26 OHR reimbursement deadline is Oct 5, 2026 — revisit well before, don't let it lapse.** |

---

## Retired (resolved — kept for the audit trail)

- **Build the Plain Sight static rights site** — _parked 2026-07-02, retired 2026-08-08._ Superseded by reality: the no-plugin static site was built directly in the hub (`/rentals/rights`, `/rentals/scam-check` — both live), reading the law brain in place. The item's premise was also false — the `plain-sight-law/` export folder it named was never persisted (records corrected in `PORTFOLIO.md` + the Meta Minder registry the same day). No separate export or project is needed; the `law/` topic files in `new rental/plain-sight-rentals/` are the source of truth. Remaining rentals work (finish the drift-proof sync, then convert `lease-review`) is real build work tracked in the handoff, not a parked idea.

---

## On-board / off-board summary

- **OFF-BOARD (do not surface):** No upstream schema-drift detection · Astro 5→7 upgrade also clears a runtime XSS advisory · Rename `100 IPS Electify` bare · Card up Electify on the hub · Language access — Amharic first — ⏰ time-boxed to Oct 5, 2026.
- **To pull back on-board:** cut the row from the table above, paste it into `ROADMAP.md` (or the live handoff) with a concrete next step, and note the date.

_The OFF-BOARD line above is **generated from the table** — edit the table, then run `npm run parking-summary` (or `-- --check` to report drift without writing). It was hand-maintained until 2026-09-06 and drifted twice; the 2026-08-26 Astro row was parked, correct, and invisible in the summary for eleven days. Pippa's ruling: derive it, don't retype it._

_Note: some of these ultimately live in another folder (`100 IPS Electify`) or in Meta Minder. Parking them here just keeps the hub's roadmap clean — it doesn't move the work across folders._
