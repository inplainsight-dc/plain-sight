# In Plain Sight — Roadmap

_The one place that says where the In Plain Sight **hub** is going and what's next. Source of truth for the landing site; the tool-by-tool build work is tracked in each tool's own folder. For where the tools live on disk, see `PORTFOLIO.md`. Last updated: 2026-08-12._

**Goal in one sentence:** a single warm, trustworthy front door — `inplainsight-dc.org` — that showcases a growing family of civic tools that make DC's fine print readable, each feeling like one brand.

**How to read this:** work top-to-bottom within a phase. Statuses: ✅ done · 🟡 in progress · ⛔ blocked · ⬜ not started · ⏸ parked (see `PARKING_LOT.md`). Each task says what "done" looks like.

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
| 1.5 | **Astro 5 → 7 upgrade** — clears the last 3 build-time security advisories (sharp/esbuild + 1 low) | ⬜ | — (no deadline; own session, on a branch) | `npm audit` shows 0 high; hub builds on Astro 7 and all 8 pages pass QA (light/dark, print, 0 third-party calls); shipped through the gate. Full plan: `ASTRO_UPGRADE_SCOPE.md` |

---

## Phase 2 — Brand & fork readiness _(the wider "In Plain Sight for your city" play)_

| # | Task | Status | Done looks like |
|---|------|--------|-----------------|
| 2.1 | Keep the fork convention current (`FORKING.md`, `src/config/site.ts`) | 🟡 | Someone could stand up their own city instance from the docs alone |
| 2.2 | Consistent tool-to-hub visual return (every tool links back to the family) | 🟡 | Each tool page carries the shared header/footer + back-to-hub |
| 2.3 | Publish more open-data (Layer 2) sources as tools graduate from DC Inform+ | ⬜ | DC Inform+ gap-finder promotes its next candidate into a card |
| 2.4 | Localization readiness — product copy in American English as the baseline, structured for future translation | 🟡 | Tool UI copy is American-English clean (Rentals done 2026-08-08); a plan exists for extracting user-facing strings so a locale can be added without a rewrite |
| 2.5 | **Language access — Amharic first** _(all tools; on-mission — "In Plain Sight" only lives up to the name if it reaches non-English speakers)_ | ⏸ parked 2026-08-09 → `PARKING_LOT.md` | **Parked because the product is gated on translation cost/avenue** — the Amharic legal text needs OHR reply → vendor → quote → native-speaker review before anything ships, and building the layer first is premature. Research is done and preserved (memory `language-access-amharic-initiative`, transcript in `language-access/`); the outreach email is **Pippa's to send** (ANC identity). **Ungate:** OHR replies / a vendor + cost line up, or you want the bounded string-inventory spike. ⏰ FY26 OHR reimbursement deadline **Oct 5, 2026**. |

---

## Phase 3 — Distribution & discoverability _(new 2026-08-12 — "let people find the tools")_

_The tools are built and live but were effectively invisible. This phase is about being **found** and **shared**. The technical plumbing is done; the human channels are ongoing, paced to bandwidth. Full channel playbook: `OUTREACH.md`._

| # | Task | Status | Done looks like |
|---|------|--------|-----------------|
| 3.1 | **Social share cards** — per-tool `og:image` so a pasted link renders a branded preview | ✅ done | `public/og/*.png` via `npm run gen-og` (in build); `Base.astro` emits og:image/url + `summary_large_image` |
| 3.2 | **Search discoverability** — sitemap + robots + canonical URLs | ✅ done | `/sitemap.xml` (curated; excludes in-dev `/almanac`), `robots.txt`, `<link rel=canonical>` on every page |
| 3.3 | **Printable outreach kit** — QR flyers + wallet tear-off tabs for community boards | ✅ built | `kit/spread-the-word.html` via `npm run gen-kit` (needs `.venv` + segno). Every QR → a verified-live URL |
| 3.4 | **Free-channel outreach** — ANC newsletters, tenant orgs, libraries, Reddit, universities, local press | ⬜ ongoing (Pippa's to execute) | Blurbs drafted in `OUTREACH.md`; each send is a ship-gate step. Start-here: 5 physical flyers + 1 ANC blurb + 1 helpful Reddit reply |
| 3.5 | **Privacy-preserving reach signal** (optional) | ⏸ deferred | No analytics by design; if ever wanted, CDN log page-counts (no per-person tracking) — a deliberate later decision |

---

## Cross-cutting — Accessibility (WCAG AA baseline)

| Task | Status | Notes |
|------|--------|-------|
| **AA baseline on the four rental tools** | ✅ done 2026-08-12 | 8/8 page-theme combos at 0 contrast fails. Skip-link focus, `aria-live`, decorative-icon `aria-hidden`, and **theme-aware category-color tokens** (`--ps-accent-text` / `--ps-caution` / `--ps-good` / `--ps-info`) — see `A11Y_2026-08-12_rentals-audit.md`. Now a standing account-level ship-gate rule. |
| **`prefers-contrast: more` enhancement** | ⬜ deferred | The silent "tailored-on-request" layer (no visible toggle). Baseline-for-all is done; this is the above-baseline bonus. |
| **AA sweep of hub + trash + records** | ✅ done 2026-08-17 | **6/6 page-theme combos at 0 contrast failures** — write-up in `A11Y_2026-08-17_hub-trash-records-audit.md`. The hub needed nothing (it does inherit the token system, as predicted). `/trash`: a hover/pressed color used as text, plus an unlabeled `readonly` textarea. `/records`: 314/312 failures, all one root cause — `--ps-accent-text` on `--ps-mark`, a background the August token matrix never covered — closed by a **fifth theme-aware token, `--ps-accent-text-mark`** (`#B0122B` light / `#FF7D8B` dark), one new hex. Every live page has now been swept in both themes. |

---

## Brand — logo lockup _(decision made 2026-08-12)_

- **Direction A — plain DC flag badge + wordmark** chosen (see `kit/logo-lab.html`; the highlighter and letters-in-stars ideas were tested and rejected on accessibility/legibility grounds). **Wiring pending:** header, share cards, a social avatar. The badge is a *jurisdiction-mark slot* for forks (flag-less cities swap in a fallback mark).

---

## Not on this roadmap (by design)

- **Per-tool build work** lives in each tool's own folder + handoffs — this roadmap only tracks the hub and the family front door.
- **Parked ideas** live in `PARKING_LOT.md`, off-board until pulled back here with a real next step.
