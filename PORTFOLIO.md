# In Plain Sight — Portfolio Map

_The one place that says **where every tool in the family actually lives on disk**, so you never have to hunt for them again. Last updated: 2026-08-03._

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

## The map

Paths are relative to `~/Projects/` (aka `~/Documents/Claude/Projects/`).

| Card on the hub | Real name | Folder on disk | Band / tag | Owner | Status | Live URL |
|---|---|---|---|---|---|---|
| _(the hub itself)_ | In Plain Sight DC | `plain-sight/` | 100 | personal | shipped | inplainsight-dc.org |
| **DC Rentals** | Plain Sight Rentals | `new rental/plain-sight-rentals/` | 400 | personal | live | `/rentals` |
| **DC Trash** | Trash Tracker | **inside `plain-sight/`** (`TRASH-TRACKER-PLAN.md`, `infra/`, `src/pages/trash.astro`) | 100 | personal | live | `/trash` |
| **DC Laws** | DC Laws But Better | `DCMR but Better/` | 100 personal / 600 work | **split** | building | — |
| **DC Records** | DC Inform+ | `000 DC Inform+/` (+ engine `constellation-core/`) | 000 | personal / **core** | live | `/records` |
| _(no card yet)_ | IPS Civic Almanac (Electify) | `100 IPS Electify/` | 150 | personal | not yet carded | — |

### Notes per tool

- **DC Rentals** — the shipped product is `plain-sight-rentals/` *inside* the `new rental` folder. There is also a clean, PII-free export folder `plain-sight-law/` (created 2026-07-02) intended to seed a static rights site; that build is parked (see `PARKING_LOT.md`).
- **DC Trash** — the only tool that genuinely lives inside this repo. Its plan, AWS/Lambda infra, and page are all here. `000 TrashFuture Red Team/` is a *different, unrelated* project (a podcast/red-team research folder) — don't confuse them.
- **DC Laws** — `DCMR but Better/` is **split-owned**: the work instance also reads it (one common corpus, D1/D2). Do not treat it as personal-only.
- **DC Records** — the `/records` page reads `constellation-core/` at build time. `constellation-core` is the **core** engine (Pippa-owned, one-way copies to work) — it is not an In Plain Sight product itself, it *feeds* one.
- **Electify** — In Plain Sight family, but not yet a card on the hub. Its folder still carries a `100 ` prefix, which the registry flags as a naming-rule violation to be fixed later (rename bare, band is 150). Add a card here when it's ready to show.

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
  {"display": "Electify",                "folder": "100 IPS Electify",           "owner": "personal", "status": "not-carded","band": "150"}
]
-->

_The HTML comment above is the machine-readable copy of the map. `npm run family` parses it to build the family-status snapshot. Keep it in sync with the table._

