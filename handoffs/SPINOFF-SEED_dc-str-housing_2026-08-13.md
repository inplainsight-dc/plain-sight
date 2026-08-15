# Spin-off seed — DC Short-Term Rentals and Housing Stock

**Date:** 13 August 2026
**Slug:** `dc-str-housing`
**Bundle:** was `_spinoffs/dc-str-housing/` — lifted at standup to the sibling folder `DC Short-Term Rentals and Housing/` (bundle now `DC Short-Term Rentals and Housing/SPINOFF-PACKAGE_dc-str-housing_2026-08-13.md`).
**Status:** ✅ **stood up 2026-08-14** — personal, band 100, Level 0. Child: `~/Projects/DC Short-Term Rentals and Housing/`. This stub stays behind as the breadcrumb.

## What spun off

An analysis of how much of the District's housing stock is held out of the residential market as short-term rental inventory: which listings are whole dwellings rather than spare rooms, which are operating as full-time businesses, where they sit, and how many fall in mid-range or affordable neighborhoods.

## Why it got big enough to leave

The first pass answered the question once, from one snapshot, for one day. Every part that makes the answer durable is separate work with its own cadence: matching listings to the licenses actually issued, capturing successive snapshots before the upstream replaces them, obtaining the agency's enforcement record, and building a surface a resident can use. It has its own recipients — residents, ANC commissioners, Council staff, reporters — and its own ship gate. That is a project, not a lane.

The finding that settled it: 2,986 whole dwellings operating as full-time short-term rentals, of which 2,090 display a *hosted* license that requires the host to be present, and only 74 display the unhosted license that whole-unit letting actually requires.

## Where it goes

New sibling project, personal/dev owned, feeding In Plain Sight as a public explorer surface. Scope decided as DC-now with an architecture that takes a second city later.

## Stood up — 9 of 9 (2026-08-14)

Decisions confirmed by Pippa: personal owner, **band 100** (In Plain Sight family — the bundle draft's 600 was a work band absent from the personal env), snapshot **holding = copy**, **no sequence move**.

Registration points, all verified against disk:
1. `_OWNERSHIP.md` personal row (count 20 → 21) · 2. `_setup-markers.sh` PERSONAL array · 3. `.owner` + generated sentinel (no `.level` — Level 0) · 4. `naming.json` row + `.project-id.json` via `naming.py generate`/`stamp` (tag `100 DC Short-Term Rentals and Housing`) · 5. `plain-sight/PORTFOLIO.md` family map (table + manifest) · 6. `base-data.json` (holding=copy for the listings snapshot) · 7. `refresh_personal_freshness.py` counts it · 8. `META_MINDER_registry.json` row + `PROJECT_NAME_MAP.json` entry · 9. git — no per-folder repo (family norm for young personal nodes; first commit deferred to Pippa's OK).

Work-side constructs (`portfolio.json`, `snapshot_status.json`, `_exchange` relay to work) are N/A — this is a purely personal In Plain Sight node, per the `100 IPS ANC` precedent. `meta_check` clean for `dc-str-housing`.

**First real work item:** roadmap **p1** — stand up the quarterly Inside Airbnb capture cadence (time-sensitive; a missed quarter is unrecoverable), then **p2** the DLCP license-record match.
