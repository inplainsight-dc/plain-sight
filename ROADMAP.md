# In Plain Sight — Roadmap

_The one place that says where the In Plain Sight **hub** is going and what's next. Source of truth for the landing site; the tool-by-tool build work is tracked in each tool's own folder. For where the tools live on disk, see `PORTFOLIO.md`. Last updated: 2026-08-08._

**Goal in one sentence:** a single warm, trustworthy front door — `inplainsight-dc.org` — that showcases a growing family of civic tools that make DC's fine print readable, each feeling like one brand.

**How to read this:** work top-to-bottom within a phase. Statuses: ✅ done · 🟡 in progress · ⛔ blocked · ⬜ not started. Each task says what "done" looks like.

---

## Phase 0 — Hub foundations _(✅ shipped)_

| # | Task | Status | Done looks like |
|---|------|--------|-----------------|
| 0.1 | Astro hub + card system (`src/data/projects/*.md`) | ✅ | Add a card = one markdown file; grid updates on build |
| 0.2 | House style shared across hub + tools (`src/styles/global.css`) | ✅ | Cream + ink, amber accent, Fraunces + Public Sans |
| 0.3 | Deploy pipeline (S3 + CloudFront, `deploy-aws.sh`) | ✅ | `npm run build` → deploy → live at inplainsight-dc.org |
| 0.4 | First tools live: Rentals, Trash, Records | ✅ | `/rentals`, `/trash`, `/records` reachable from the grid |
| 0.5 | Portfolio map so the family is findable | ✅ | `PORTFOLIO.md` — done 2026-08-03 |

---

## Phase 1 — Current queue

| # | Task | Status | Blocked by | Done looks like |
|---|------|--------|-----------|-----------------|
| 1.1 | **DC Laws → live** — flip the `dc-laws` card from `building` to `live` | ⛔ | `DCMR but Better` re-crawl (1,526 error-page sections) | Card is clickable; a real reader page exists |
| 1.2 | **Card Electify** — add a card for IPS Civic Almanac once it's ready to show | ⬜ | Electify reader shippable | New file in `src/data/projects/`; grid shows it |
| 1.3 | **Fill the two placeholder cards** (`on-the-workbench`, `your-idea-here`) or confirm they stay as intentional invites | ⬜ | — | Either replaced with a real tool, or kept by decision |
| 1.4 | **Naming-rule cleanup** — rename `100 IPS Electify` bare (band 150 lives in the tag), per registry note | ⬜ | coordinate with Meta Minder | Folder is bare; `naming.py` re-run; tag unchanged |

---

## Phase 2 — Brand & fork readiness _(the wider "In Plain Sight for your city" play)_

| # | Task | Status | Done looks like |
|---|------|--------|-----------------|
| 2.1 | Keep the fork convention current (`FORKING.md`, `src/config/site.ts`) | 🟡 | Someone could stand up their own city instance from the docs alone |
| 2.2 | Consistent tool-to-hub visual return (every tool links back to the family) | 🟡 | Each tool page carries the shared header/footer + back-to-hub |
| 2.3 | Publish more open-data (Layer 2) sources as tools graduate from DC Inform+ | ⬜ | DC Inform+ gap-finder promotes its next candidate into a card |
| 2.4 | Localization readiness — product copy in American English as the baseline, structured for future translation | ⬜ | Tool UI copy is American-English clean (Rentals done 2026-08-08); a plan exists for extracting user-facing strings so a locale can be added without a rewrite |

---

## Not on this roadmap (by design)

- **Per-tool build work** lives in each tool's own folder + handoffs — this roadmap only tracks the hub and the family front door.
- **Parked ideas** live in `PARKING_LOT.md`, off-board until pulled back here with a real next step.
