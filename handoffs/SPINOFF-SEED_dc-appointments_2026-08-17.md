# Spin-off seed — DC Appointments Watch

**Date:** 17 August 2026
**Slug:** `dc-appointments`
**Bundle:** staged and stood up in the same session — never sat in `_spinoffs/`. Now `DC Appointments Watch/SPINOFF-PACKAGE_dc-appointments_2026-08-17.md`.
**Status:** ✅ **stood up 2026-08-17** — personal, band 100, Level 0. Child: `~/Projects/DC Appointments Watch/`. This stub stays behind as the breadcrumb.

## What spun off

A watch on who actually runs DC agencies, boards and commissions: who is acting or interim, who has been nominated, where each nominee sits in the Council confirmation pipeline, and how long they have been in place without confirmation.

## Why it got big enough to leave

The occasion is the January 2027 administration change, but a watch with no baseline is a snapshot with opinions attached — the pipeline has to exist beforehand so January 2027 can be compared to something. And every part of it is separate work with its own cadence: a taxonomy axis that does not exist yet, a law brain over § 1-523.01 and a dozen exception statutes, a 37-year LIMS harvest, an incumbency layer that may not be sourceable at all, and a public surface whose redteam is unlike anything else in the family — this is the first tool that names real, living people. It also has the family's strongest fork-ability story, which wants its own README. That is a project, not a lane.

The finding that settled it: **6,328 confirmation resolutions sitting in an open, unauthenticated LIMS API going back to 1989** — and, in Council Period 26, **more nominations Deemed Approved (156) than Approved (146)**. More passed by the Council running out the clock than by the Council voting.

## Where it goes

New sibling project, personal-owned, band 100, feeding In Plain Sight as a future public surface. DC now, architecture built to take a second jurisdiction.

## Stood up — 9 of 9 (2026-08-17)

Decisions confirmed by Pippa: name **DC Appointments Watch**, personal owner, band 100, Level 0, taxonomy **holding = reference + authored overlay**, LIMS **holding = tracked copy** (upstream-unreachable-at-runtime — LIMS exposes current status only, so transition history is unrecoverable if not captured).

Registration points, all verified against disk:
1. `_OWNERSHIP.md` personal row (count 22 → **23**) · 2. `_setup-markers.sh` PERSONAL array (`_markers_lint.py` OK) · 3. `.owner` + **generated** `_OWNED-BY-PERSONAL.md` sentinel — no `.level` (correct for Level 0) · 4. `Meta Minder/naming.json` row (band 100) + `.project-id.json` via `naming.py generate`/`stamp`, tag `100 DC Appointments Watch`, `has_web=false` · 5. `plain-sight/PORTFOLIO.md` family map — table row, notes entry and machine-readable manifest (`npm run family` parses; 8 entries) · 6. `base-data.json` at project root, six datasets · 7. `refresh_personal_freshness.py` — row counted, `lastTouched` 2026-08-17, `personalFreshness` stamped · 8. `META_MINDER_registry.json` row (68 → 69) + `PROJECT_NAME_MAP.json` entry (67 → 68, category 100, instance personal); `meta_check` clean for `dc-appointments` · 9. **git — no per-folder repo** (family norm for young personal nodes, same call as `dc-str-housing`); written decision, init deferred to Pippa's OK.

Work-side constructs (`portfolio.json`, `snapshot_status.json`, `_exchange` relay to work) are **N/A** — purely personal In Plain Sight node, per the `100 IPS ANC` and `dc-str-housing` precedents.

**Two boundaries travel with this one:**
- `oversight-hub` is **work-owned**; its `taxonomy.json` is never read from a personal build. The agency taxonomy comes from the `constellation-core` slice by reference.
- The tool names **real, living people**, so the person-naming redteam (roadmap p6-t1) runs *before* any surface is designed, not after.

**First real work item:** roadmap **p2-t1** — extract § 1-523.01 verbatim (the scoping pass used a summarizer). Cheapest high-value unknown alongside it: **p4-t1**, whether MOTA's method-of-appointment Quickbase view is reachable.
