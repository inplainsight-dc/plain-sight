# Scope — Astro 5 → 7 upgrade (In Plain Sight hub)

_Scoped 2026-08-09. This is a **plan**, not a change — no code was bumped. Origin: `npm audit fix` cleared 4 of 7 advisories; the remaining 3 (sharp, esbuild, one low) only resolve via `astro@7.2.0`, a breaking major bump. This file scopes that bump against what the hub actually uses._

## TL;DR

- **The jump:** Astro **5.18.2 → 7.2.0** — two majors, skipping v6 (there is no separate v6 step; you land on 7).
- **Effort:** ~**one focused session** (roughly 2–4 h), almost all of it in build-fix + visual QA, not in code changes.
- **Risk:** **Low-to-moderate**, and concentrated in exactly one place — the v7 Rust compiler's **stricter HTML validation**, which can fail the build on markup the old compiler tolerated. Everything else is N/A or trivial for this project.
- **Why it's smaller than it looks:** the hub has **zero third-party integrations**, **no `astro:assets`/`<Image>` usage**, a **trivial config** (`site` only), and its content collections are **already on the Content Layer API** — so the biggest v6 breaking change (legacy collections removed) is already handled.
- **Not a fire:** all 3 remaining vulns are **build-time tooling** (sharp/libvips image optimization the site never invokes, the esbuild bundler). Nothing is served to readers. This is planned maintenance, not an incident.

## Current state (verified 2026-08-09)

| Thing | Value |
|---|---|
| Astro (declared / installed) | `^5.13.0` / **5.18.2** |
| Target | **7.2.0** |
| Third-party integrations | **none** (no MDX, sitemap, RSS, React/Vue/Svelte, Tailwind) |
| Config (`astro.config.mjs`) | `site` only — no `base`, no adapter, no `vite` block, no `i18n` |
| Content collections | Content Layer API — `glob()` loader + Zod schema; consumed by `getCollection('projects')` sorted on `data.order`. **No** `entry.id` / `.slug` / `.render()`. |
| `astro:assets` / `<Image>` | **not used** anywhere |
| Vite / esbuild / sharp (now) | 6.4.3 / 0.27.7 / 0.34.5 |
| Node (local) | **22.12.0** |
| `engines` pin | none |
| Build command | `sync-core-data.mjs && sync-law-data.mjs && astro build` (the two sync scripts are plain Node — **Astro-version-independent**, unaffected) |
| Pages to regression-test | **8**: `/`, `/records`, `/trash`, `/rentals`, `/rentals/{rights,scam-check,lease-check,move-in}` |

## Breaking-change map (guide → does it apply to *this* project?)

### Astro v6

| Breaking change | Applies here? | Action |
|---|---|---|
| **Min Node 22.12.0** | ⚠️ **At the floor** — local is exactly 22.12.0 | Pin `engines.node >= 22.12.0` in `package.json`; confirm whatever machine runs `deploy-aws.sh` is ≥ 22.12.0 (deploy builds locally, so this is the build box) |
| Legacy content collections removed; Content Layer required | ✅ **Already done** | none — `loader: glob(...)` already present |
| `type` property removed | ✅ not used | none |
| `getEntryBySlug`/`getDataEntryById` → `getEntry`; `entry.render()` → `render(entry)`; `id` now slug-based | ✅ none used (only `getCollection` + `data.*`) | none |
| **Vite 7** (from 6) | 🟡 low risk — no custom Vite config/plugins | ships with the bump; watch build output |
| **Zod 4** (format validators renamed) | ✅ schema uses only `z.object/string/array/enum/number` — no `.email()`/`.url()` | none |
| Shiki 4 (highlighting) | 🟡 cosmetic only, if any fenced code blocks exist | eyeball; not a blocker |
| Image service defaults (crop/no-upscale/SVG) | ✅ N/A — no `astro:assets` | none |
| CJS config removed | ✅ config is `.mjs` | none |
| `Astro.glob()` removed | ✅ not used | none |
| `<ViewTransitions />` → `<ClientRouter />` | ✅ not used | none |
| i18n `redirectToDefaultLocale` default flip | ✅ no i18n | none |

### Astro v7

| Breaking change | Applies here? | Action |
|---|---|---|
| **Rust compiler now default & only — stricter HTML validation** (unclosed tags / invalid nesting now **error**) | 🔴 **The one real risk.** 8 hand-authored `.astro` pages with lots of inline HTML | **Build-test early.** Fix whatever it flags, page by page. Unknown count: could be 0, could be a handful. This is where the session's time goes. |
| **Whitespace → JSX mode** (`compressHTML` default `'jsx'`; spaces between inline elements may be dropped) | 🟡 possible subtle spacing shifts in rendered text (e.g. between inline `<a>` and adjacent words) | **Visual QA** all 8 pages, light + dark; watch inline-text spacing |
| Markdown processor → Sätteri (remark/rehype replaced) | 🟡 low — project cards are frontmatter-only, no custom md plugins | spot-check any rendered markdown |
| **Vite 8** (from 7) | 🟡 low risk — no custom Vite config | ships with the bump |
| `src/fetch.ts` now reserved | ✅ no such file | none |
| Experimental flags removed | ✅ none enabled | none |
| `@astrojs/db` removed | ✅ not used | none |
| `astro:transitions` internals removed | ✅ not used | none |

**Net:** of ~30 documented breaking changes across the two majors, this project is exposed to **two that need real work** (stricter HTML validation, whitespace) and **one house-keeping item** (Node floor / engines pin). The rest are N/A because of how small and integration-free the hub is.

## Plan (the actual procedure)

Run in **dev**, promote through the **ship gate** — do not deploy straight to prod.

1. **Branch** off `master` (e.g. `chore/astro-7`) so `master` stays deployable.
2. **Baseline:** `npm run build` on current Astro 5, keep the output as the before-picture for diffing.
3. **Upgrade** with the official tool, not `audit fix --force`:
   ```
   npx @astrojs/upgrade
   ```
   (resolves core to 7.x; there are no integrations for it to co-bump). Confirm `astro@7.2.0`, Vite 8, and that `sharp`/`esbuild` advisories clear.
4. **Pin Node:** add `"engines": { "node": ">=22.12.0" }` to `package.json`.
5. **Build:** `npm run build`. **Expect the Rust compiler to surface HTML-validity errors** — fix each (unclosed/misnested tags) at the named file:line. Re-run until green.
6. **Local preview:** `npm run preview`; walk all 8 pages.
7. **Visual QA (whitespace + regression):** all 8 pages, **light + dark**, mobile + desktop — watch inline-text spacing (the JSX-whitespace change), print output on `/rentals/move-in`, and confirm fonts still self-host (0 third-party calls). Reuse the QA sweep shape from the move-in wave.
8. **`npm audit`:** confirm **0 high** remaining (the low may persist; note it if so).
9. **Diff review + commit** on the branch; open against `master`.
10. **Ship gate → deploy:** only after QA is green, merge and `bash deploy-aws.sh` (S3 `inplainsight-dc-site-3447` + CloudFront `EEWQYLUWMC9C1`). Smoke-test the live pages.

## Test plan (what "done" means)

- `npm run build` green on Astro 7 with **no HTML-validation errors**.
- `npm audit` → **0 high**.
- All 8 pages render correctly, light + dark, mobile + desktop; no inline-spacing regressions; move-in print form intact; 0 third-party network calls (fonts still local).
- Cross-surface links intact (the 18-href check from the move-in QA).

## Rollback

No rollback button (same as every deploy here). Rollback = redeploy a prior commit. Because the work lives on a branch and `master` stays deployable throughout, the safety net is: **don't merge until QA is green**, and if prod ever misbehaves, `git checkout master` (Astro 5) and `bash deploy-aws.sh` to restore.

## Recommendation

Do it as its **own session**, on a branch, end-to-end through the ship gate — not bolted onto other work, because step 5 (HTML-validation fixes) is an unknown-size tail. It's low-stakes (build-time vulns, no reader exposure) so there's **no deadline pressure**; schedule it when there's a clean 2–4 h window. When it ships, it clears the last 2 high-severity advisories and puts the hub on a supported Astro line.
