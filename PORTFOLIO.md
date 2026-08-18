# In Plain Sight — Portfolio Map

_The one place that says **where every tool in the family actually lives on disk**, so you never have to hunt for them again. Last updated: 2026-08-17._

## Why this file exists

In Cowork the family all shared a `100 …` name, so they clustered together in the
folder list. During the migration into `Projects/`, a naming rule was adopted
(`Meta Minder/naming.json` → `folder_prefix_rule`): **band prefixes stay OFF folder
names for bands 100–900** — the band now lives in the *tag / identity metadata*
(`.project-id.json`), not the folder name. Folders were also left **path-stable**
(Rule 7 — renaming breaks references). Net effect: the family stopped clustering
alphabetically and got hard to find. This map replaces the lost `100…` prefix.

**The family is a _theme_ grouping, not a folder-location grouping. Nothing below
lives inside this repo except the hub and Trash Tracker — and that's on purpose**
(see "Why they're not all nested here" at the bottom).

## Before scoping a new tool — read the landscape map first

**DC already has a lot of good civic tooling, and the map of it lives in another project's folder.** `100 IPS Electify/STRATEGY/HOME_RULE_STUDY_2026-07-23.md` is a teardown of [home-rule.org](https://home-rule.org/) — a curated "directory by neighbors" of 26 independent DC civic tools — with the full catalog and the disclaimer and curation patterns worth borrowing.

**The rule that follows:** if a proposed IPS tool is shaped like *"here is a public dataset, made explorable,"* **check the catalog before scoping.** Start with [home-rule.org](https://home-rule.org/) and [districtjosh.com](https://districtjosh.com), which between them cover a lot of DC's open data well. In Plain Sight's own ground is the layer above the data — what a rule *means for you* and *what to do next* — and that's where the rentals cluster sits.

**⚠ The study is dated 2026-07-23 and its one-line entries have aged.** Refresh before relying on any single row; the catalog's *shape* still holds.

_Detail on what's already built, and the per-tool checks run against it, stays in the study and the session handoffs rather than here._

---

## The map

Paths are relative to `~/Projects/` (aka `~/Documents/Claude/Projects/`).

| Card on the hub | Real name | Folder on disk | Band / tag | Owner | Status | Live URL |
|---|---|---|---|---|---|---|
| _(the hub itself)_ | In Plain Sight DC | `plain-sight/` | 100 | personal | shipped | inplainsight-dc.org |
| **DC Rentals** | Plain Sight Rentals | `new rental/plain-sight-rentals/` | 400 | personal | live | `/rentals` |
| **DC Trash** | Trash Tracker | **inside `plain-sight/`** (`TRASH-TRACKER-PLAN.md`, `infra/`, `src/pages/trash.astro`) | 100 | personal | live | `/trash` |
| **DC Laws** | DC Laws But Better | `DCMR but Better/` | 100 personal / 600 work | **split** | building | — |
| **DC Records** | DC Inform+ | `000 DC Inform+/` (+ engine `constellation-core/`) | 000 | personal / **core** | live | `/records` |
| **DC Ghost Homes** | (surface of DC Short-Term Rentals and Housing) | page + assets **inside `plain-sight/`**; data node in `DC Short-Term Rentals and Housing/` | 100 | personal | live | `/ghost-homes` |
| _(no card yet)_ | IPS Civic Almanac (Electify) | `100 IPS Electify/` | 150 | personal | not yet carded | — |
| _(no card yet)_ | DC Short-Term Rentals and Housing | `DC Short-Term Rentals and Housing/` | 100 | personal | research node (building) | — |
| _(no card yet)_ | DC Appointments Watch | `DC Appointments Watch/` | 100 | personal | research node (building) | — |
| **DC Appointments Watch** _(card built, not live)_ | (seat-clock surface of DC Appointments Watch) | page **inside `plain-sight/`** (`src/pages/appointments.astro`); data node in `DC Appointments Watch/` | 100 | personal | built + verified in dev, **deploy gated** | `/appointments` (dev only) |

### Notes per tool

- **DC Rentals** — the shipped product is `plain-sight-rentals/` *inside* the `new rental` folder (the Cowork/Claude plugin). The **no-plugin static site** was built directly in this hub reading the law brain in place — **four surfaces are live: `/rentals/rights`, `/rentals/scam-check`, `/rentals/lease-check`, and `/rentals/move-in`** (the deposit-protection surface — per-state deposit-return facts + a jurisdiction-aware checklist + a printable condition inventory + an on-device ZIP→state lookup; shipped 2026-08-09 through the full gate: a live-statute redteam **and** a persona + adversarial wave). All four generate their legal content at build time from the shared law brain via `scripts/sync-law-data.mjs` (the JSON-twin drift-proof pattern), so a page can't silently drift from the law. UI copy is American English (baseline for translation — see ROADMAP 2.5, language access / Amharic first). Fonts are self-hosted (no third-party calls, honoring the no-account/no-AI/nothing-leaves-your-browser promise at the network layer). Next: language access (Amharic first) across all tools. (A 2026-07-02 plan to first export a clean `plain-sight-law/` folder was superseded and its records corrected 2026-08-08; that folder was never persisted and is not needed — the `law/` topic files in `plain-sight-rentals/` are the single source of truth.)
- **DC Trash** — the only tool that genuinely lives inside this repo. Its plan, AWS/Lambda infra, and page are all here. `000 TrashFuture Red Team/` is a *different, unrelated* project (a podcast/red-team research folder) — don't confuse them.
- **DC Laws** — `DCMR but Better/` is **split-owned**: the work instance also reads it (one common corpus, D1/D2). Do not treat it as personal-only.
- **DC Records** — the `/records` page reads `constellation-core/` at build time. `constellation-core` is the **core** engine (Pippa-owned, one-way copies to work) — it is not an In Plain Sight product itself, it *feeds* one.
- **Electify** — In Plain Sight family, but not yet a card on the hub. Its folder still carries a `100 ` prefix, which the registry flags as a naming-rule violation to be fixed later (rename bare, band is 150). Add a card here when it's ready to show.
- **DC Short-Term Rentals and Housing** — the research node behind a future explorer card. Measures how much DC housing stock is held out of the residential market as short-term rental inventory. Built entirely on public data (Level 0). Stood up 2026-08-14 from an In Plain Sight spin-off. **Its explorer shipped as the `DC Ghost Homes` card (`/ghost-homes`) on 2026-08-16**, ahead of the original Phase-6 plan and through its own gate (`REDTEAM_2026-08-16_ghost-homes-wave2-shipgate.md`), so the node now has *two* rows in this table: the research folder here and the surface in the hub. **Note for anyone reading the map to answer "who writes to `plain-sight`":** because the surface lives in the hub while the node lives in its own folder, sessions rooted in `DC Short-Term Rentals and Housing/` legitimately commit to the `plain-sight` repo — `cwd` does not predict which repo a session writes to, and neither `npm run family` nor the orient banner will flag it. Check `git log` before committing here. Time-sensitive: the Inside Airbnb snapshot upstream replaces each capture, so the quarterly capture cadence (roadmap p1) is the first priority.
- **DC Appointments Watch** — the research node behind a future card: who actually runs each DC agency, board and commission, who is acting or interim, and where each nominee sits in the Council confirmation pipeline. Built to be standing before the January 2027 administration change, and built to fork (executive-nominates / legislature-confirms is near-universal). Level 0 throughout — D.C. Official Code § 1-523.01, MOTA, Mayor's Orders, and Open States for recent Council records. **Correction, 2026-08-17:** this row previously described DC Council LIMS as "an open, unauthenticated JSON API" holding 6,328 confirmation resolutions back to 1989. It is unreachable — `lims.dccouncil.gov/robots.txt` is `User-agent: * / Disallow: /` with no permitted side, so that route is stopped by decision. Open States covers Council Periods 22–26 only (2017 on) and needs an API key; the earlier periods are a documented backlog with a permission-ask and a FOIA route (`docs/BACKLOG-PLAN.md` in the node). Stood up 2026-08-17 from an In Plain Sight spin-off. **Its first surface — the seat clock — was built in this hub at `/appointments` on 2026-08-17** and is live-but-unlinked in dev only: WCAG AA verified (`A11Y_2026-08-17_appointments-audit.md`) and redteamed (`REDTEAM_2026-08-17_appointments-preship.md`), with deployment gated on the node's roadmap p6-t8. Like Ghost Homes, the node now has *two* rows in this table. It covers **board and commission seats only** and names no individual — which is why it could ship ahead of the person-naming redteam. **Two boundaries travel with it:** the agency taxonomy is read *by reference* from `constellation-core/data/agency-resolution/` (core-owned) with an overlay authored in-project — `oversight-hub` is **work-owned** and is never read from a personal build; and because this tool names real, living people, the person-naming redteam (roadmap p6-t1) runs *before* any surface is designed, not after.

## Why they're not all nested inside this repo

Physically moving these folders under `plain-sight/` was considered and rejected:

1. **Rule 7 (path-stability).** Live references point at the current paths — `records.astro` builds from `constellation-core`, plus `naming.json`, `_OWNERSHIP.md`, `_exchange/` relays, and deploy scripts. Moving breaks them silently.
2. **The wall.** `DCMR but Better` is **split** (work touches it) and `constellation-core` is **core**. Neither can live inside a personal-only folder without breaking the ownership-marker system.
3. **Nested git repos.** This is a git repo that deploys `dist/`; nesting other repos inside creates embedded-repo problems and risks sweeping their contents into the deploy.
4. **The orient / marker system classifies top-level folders.** Nesting hides them from the very system meant to keep them oriented.

So the family stays scattered on disk, and **this file is the index** that makes them findable. When a member moves, is renamed, or a new tool joins the family, update the table above **and the manifest below** (the manifest is what `npm run family` reads).

---

<!-- family-manifest
[
  {"display": "In Plain Sight DC (hub)", "folder": ".",                          "owner": "personal", "status": "shipped",  "band": "100"},
  {"display": "DC Rentals",              "folder": "new rental",                 "owner": "personal", "status": "live",     "band": "400"},
  {"display": "DC Trash",                "folder": ".",         "match": "trash", "owner": "personal", "status": "live",     "band": "100"},
  {"display": "DC Laws",                 "folder": "DCMR but Better",            "owner": "split",    "status": "building", "band": "100/600"},
  {"display": "DC Records",              "folder": "000 DC Inform+",             "owner": "personal", "status": "live",     "band": "000", "engine": "constellation-core (core)"},
  {"display": "Electify",                "folder": "100 IPS Electify",           "owner": "personal", "status": "not-carded","band": "150"},
  {"display": "STR & Housing",           "folder": "DC Short-Term Rentals and Housing", "owner": "personal", "status": "building", "band": "100"},
  {"display": "DC Ghost Homes",          "folder": ".",   "match": "ghost-homes",        "owner": "personal", "status": "live",     "band": "100"},
  {"display": "Appointments Watch",      "folder": "DC Appointments Watch",      "owner": "personal", "status": "building", "band": "100"}
]
-->

_The HTML comment above is the machine-readable copy of the map. `npm run family` parses it to build the family-status snapshot. Keep it in sync with the table._

