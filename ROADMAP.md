# In Plain Sight — Roadmap

_The one place that says where the In Plain Sight **hub** is going and what's next. Source of truth for the landing site; the tool-by-tool build work is tracked in each tool's own folder. For where the tools live on disk, see `PORTFOLIO.md`. Last updated: 2026-08-25._

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
| 1.2 | **Card Electify** — add a card for IPS Civic Almanac once it's ready to show | 🟡 carded as *In the works*, 2026-08-19 | Electify reader shippable — the address lookup (p2-t2) has to resolve a real address | `src/data/projects/civic-almanac.md` exists and shows on the hub at 09, deliberately **unclickable** (`building`, no `url`) because `/almanac` is still a scaffold that says so itself. **To finish:** land the address lookup, fix the four generated-copy defects named in the card comment (`neighbourhood`, seven literal `--`, "out loud", three straight apostrophes — all fixed in the **Electify node**, never here), then set `live` + `url` + sitemap entry together |
| 1.3 | **Fill the two placeholder cards** (`on-the-workbench`, `your-idea-here`) or confirm they stay as intentional invites | ⬜ | — | Either replaced with a real tool, or kept by decision |
| 1.4 | **Naming-rule cleanup** — rename `100 IPS Electify` bare (band 150 lives in the tag), per registry note | ⬜ | coordinate with Meta Minder | Folder is bare; `naming.py` re-run; tag unchanged |
| 1.5 | **Astro 5 → 7 upgrade** — clears the last 3 build-time security advisories (sharp/esbuild + 1 low) | ⬜ | — (no deadline; own session, on a branch) | `npm audit` shows 0 high; hub builds on Astro 7 and all 8 pages pass QA (light/dark, print, 0 third-party calls); shipped through the gate. Full plan: `ASTRO_UPGRADE_SCOPE.md` |
| 1.6 | **DC Appointments Watch → live** — the seat clock is built, WCAG AA verified and redteamed. **Path is `/appointments/seats`, not `/appointments`** (decision D1); the root 404s on purpose | 🟡 built, committed, **excluded from deploy** | Pippa's go + her verdicts on the redteam punch-list (D1–D5 in `REDTEAM_2026-08-17_appointments-preship.md`); a screen-reader pass has not run, and F2/F5 came back DELIBERATE | **FIVE** changes made **together**, not four: card set to `live` with `url: /appointments/seats`, sitemap entry added, the `Disallow` line removed from `robots.txt`, **the `appointments/*` and `og/appointments.png` excludes removed from `deploy-aws.sh`**, then deploy. The deploy exclude was added 2026-08-19 and is the only one of these that is a real control — the other three are signposting a determined reader walks past. Tracked as p6-t8 in the node's own roadmap |
| 1.7 | **Card DC Short-Term Rental Rules** — the page shipped 2026-08-17 and sat unlinked from the hub for two days while listed in the sitemap, so search engines could find it and a reader on the home page could not | ✅ done 2026-08-19 | — | Live card at 05, directly under DC Ghost Homes as its sibling. Deployed and verified against the live site |
| 1.8 | **Orthography in generated content** — the 2026-08-17 site-wide sweep read authored pages only, so every build-time-generated data file was invisible to it. Three live defects came from that one blind spot | 🟡 3 of 4 closed 2026-08-19 | `/almanac` is the last one and is **not fixable in this repo** — but it is no longer blocked: the Electify node was placed under version control on 2026-08-19 (`4f17401`), so the twelve-file edit now has a way back | ✅ `/ghost-homes` (3 runtime strings), ✅ `/rentals/move-in` (~30, the biggest), ✅ `/on-paper` (2). ⬜ **`/almanac`** — `neighbourhood`, seven literal `--`, "out loud", 1 straight apostrophe, all from `src/data/almanac/almanac.json` → fix in **`100 IPS Electify/`**. **Two more found 2026-08-25, same trip, same place:** (a) *decision D10* — the page claims "**Nothing about you leaves your browser** — your address is resolved and discarded", but the address lookup goes through the geocode proxy; the "discarded" half may be true while the headline overclaims, so **verify what the lookup actually does and reword to match** before this card can go live; (b) a **broken internal link, `/corrections`**, which resolves to nothing in `dist/` — build the page or drop the link. Neither is a live defect today (the card is `building`, the route is out of the sitemap), and both are blockers on 1.2. Method and traps now recorded in `IN-PLAIN-SIGHT-HOUSE-STYLE.md` → *Punctuation & orthography*: **sweep `dist/`, never `src/pages/`** |

---

## Phase 2 — Brand & fork readiness _(the wider "In Plain Sight for your city" play)_

| # | Task | Status | Done looks like |
|---|------|--------|-----------------|
| 2.1 | Keep the fork convention current (`FORKING.md`, `src/config/site.ts`) | 🟡 | Someone could stand up their own city instance from the docs alone |
| 2.2 | Consistent tool-to-hub visual return (every tool links back to the family) | 🟡 | Each tool page carries the shared header/footer + back-to-hub |
| 2.3 | Publish more open-data (Layer 2) sources as tools graduate from DC Inform+ | ⬜ | DC Inform+ gap-finder promotes its next candidate into a card |
| 2.4 | Localization readiness — product copy in American English as the baseline, structured for future translation | 🟡 | Tool UI copy is American-English clean (Rentals done 2026-08-08); a plan exists for extracting user-facing strings so a locale can be added without a rewrite |
| 2.5 | **Language access — Amharic first** _(all tools; on-mission — "In Plain Sight" only lives up to the name if it reaches non-English speakers)_ | ⏸ parked 2026-08-09 → `PARKING_LOT.md` | **Parked because the product is gated on translation cost/avenue** — the Amharic legal text needs OHR reply → vendor → quote → native-speaker review before anything ships, and building the layer first is premature. Research is done and preserved (memory `language-access-amharic-initiative`, transcript in `language-access/`); the outreach email is **Pippa's to send** (ANC identity). **Ungate:** OHR replies / a vendor + cost line up, or you want the bounded string-inventory spike. **Sequencing ruled 2026-08-25 (D8): the string inventory runs AFTER the Phase 4 copy diet (4.1/4.2), not before.** This is parked on cost, translation cost scales with word count, and 4.1 rewrites the card copy and 4.2 moves 3 paragraphs of About off the front door — so doing it in this order makes the quote materially smaller for the same product. ⏰ FY26 OHR reimbursement deadline **Oct 5, 2026**. |

---

## Phase 3 — Distribution & discoverability _(new 2026-08-12 — "let people find the tools")_

_The tools are built and live but were effectively invisible. This phase is about being **found** and **shared**. The technical plumbing is done; the human channels are ongoing, paced to bandwidth. Full channel playbook: `OUTREACH.md`._

| # | Task | Status | Done looks like |
|---|------|--------|-----------------|
| 3.1 | **Social share cards** — per-tool `og:image` so a pasted link renders a branded preview | ✅ done | `public/og/*.png` via `npm run gen-og` (in build); `Base.astro` emits og:image/url + `summary_large_image` |
| 3.2 | **Search discoverability** — sitemap + robots + canonical URLs | ✅ done | `/sitemap.xml` (curated; excludes in-dev `/almanac`), `robots.txt`, `<link rel=canonical>` on every page |
| 3.3 | **Printable outreach kit** — QR flyers + wallet tear-off tabs for community boards | ✅ built | `kit/spread-the-word.html` via `npm run gen-kit` (needs `.venv` + segno). Every QR → a verified-live URL |
| 3.4 | **Free-channel outreach** — ANC newsletters, tenant orgs, libraries, Reddit, universities, local press | ⏸ **held behind Phase 4** (decision D7, 2026-08-25) | Blurbs drafted in `OUTREACH.md`; each send is a ship-gate step. Start-here: 5 physical flyers + 1 ANC blurb + 1 helpful Reddit reply. **Deliberately held, not stalled:** outreach amplifies whatever conversion rate the front door has, and an ANC newsletter slot or a first impression from a neighbor is non-renewable — spending it at the pre-Phase-4 rate wastes it. Unblocks when 4.3/4.4 ship. Also re-check the geocode proxy throttle first (Phase 4 open questions) |
| 3.5 | **Privacy-preserving reach signal** (optional) | ⏸ deferred | No analytics by design; if ever wanted, CDN log page-counts (no per-person tracking) — a deliberate later decision |

---

## Phase 4 — The doorstep _(new 2026-08-25 — "let a stranger use something in 15 seconds")_

_Phase 3 made the tools findable. This phase makes them **usable on arrival**. The diagnosis that
opened it, measured against the live site rather than guessed: the deep tool pages are fine —
`/trash` puts an input 83 words in, `/ghost-homes` 99, `/rentals/rights` 89 — but **every route to
them is prose**. The home page is 885 words with zero interactive elements; `/rentals` is 1,027 and
its call to action needs a paid Claude plan; `/short-term-rental-rules` is 1,056. On mobile it is
1.75 screens before the first tool card, and mobile is exactly who the QR flyers (3.3) deliver._

**The measure of done for this phase, and it is structural, not promotional:** a stranger arriving
cold reaches a moment of personal usefulness — "that's my block", "that's my trash day" — in **one
click and fifteen seconds**. There are no analytics by design (3.5), so this is audited the way it
was diagnosed: clicks-to-first-input, words-before-first-control, screens-to-first-card.

**The pattern already exists in this repo.** Ghost Homes and Trash solved it; the fix is to
propagate their shape to the front door, not to invent anything. Decisions D1–D14 were walked and
ruled on 2026-08-25.

| # | Task | Status | Blocked by | Done looks like |
|---|------|--------|-----------|-----------------|
| 4.1 | **Copy diet + index re-rank** (D2, D3, D4, D6) — three tiers ("use one now" / "worth reading" / "in the works"), card descriptions rewritten as the question the reader arrived with, and `DC Rentals` demoted from 01 so the site stops leading with the one artifact that needs a paid Claude plan | ✅ done 2026-08-25 | — | `src/data/projects/*.md` re-ordered and rewritten; the free checklists sit above the plugin; every live card's description is a question a stranger would recognize as theirs. No infra change. **Measured:** the index now bands 5 / 1 / 5, `DC Rentals` sits at 05 under the free checklists at 02, and its description says up front that it needs a paid plan |
| 4.2 | **About split** (D5) — one line on the home page, full context on a standalone `/about` | ✅ done 2026-08-25 | — | `/about` exists and **leads with why the tools exist, then who built them** — credentials as the answer to "why trust this", not as an introduction. The home page keeps one line + a link. **Measured on the home page: screens-to-first-card 1.75 → 1.13 on a 375×812 phone, 1.78 → 1.07 at 1280×800; 885 → 780 words.** Contrast verified in both themes (band label 5.51 light / 5.95 dark, band note 6.46 / 7.64 — all above 4.5:1). Fixed in passing: the header's `About` and `Projects` links were bare `#about` / `#projects` anchors, so on every page except the home page they were **dead** — now `/about` and `/#projects`. ⚠ Do not overcorrect: "I work in government oversight and read this material professionally" is the reason a stranger should believe the numbers, and burying it is the failure mode of this task, not its goal |
| 4.3 | **The doorstep** (D1) — one address box on the home page. Type an address, the page becomes yours: ward, ANC, SMD, ghost homes on your block, trash day | ✅ done 2026-08-25 | — | An address on the home page routes to a real answer in one interaction. **Architecture decision: the doorstep is a router, not an analyst — it does NOT do point-in-polygon.** `dist/ghost-homes/` ships 1.9 MB of geojson (`smd.geojson` alone is 1.0 MB) against a 29 KB home page; importing that logic would take the front door to ~2 MB on the phone-at-a-community-board audience this phase exists for. The existing geocode proxy already returns ward/ANC/SMD from MAR directly (field-verified: `Ward 2 · ANC 2C · SMD 2C03`). Ghost Homes keeps client-side PIP **unchanged** — that guarantee is right for a page making claims about specific properties; the front door only needs to know where to send you, and a MAR field change there fails as "we couldn't place your address", not as a wrong ANC. Neighborhood is dropped from v1 (`cluster` comes back null and `clusters.geojson` is another 162 KB); Ghost Homes gives that detail after the click. **Correction, made while building it:** this row previously said Trash covers ANC 1E03 only, so most addresses would return "not here yet". Wrong — `/trash`'s **pickup-day lookup is citywide**, querying DPW's own route layer from the browser. Only *reporting a missed collection* is pilot-limited, because that reaches one commissioner (SMD 1E03, not ANC 1E03). So the doorstep hands every DC address **two** working answers, and the coverage note applies to the reporting half alone |
| 4.4 | **Visual interest without motion** (D9) — the home page reads like a homework assignment because it is eleven identical rows in one column at one weight | ✅ done 2026-08-25 | 4.3 (ships with it) | **The visual interest is the data, not decoration** — a display-size pull-stat, a static DC ward map that is also the thing you click, a featured card against smaller ones, and the AA-verified category tokens (`--ps-accent-text` / `--ps-caution` / `--ps-good` / `--ps-info`) coloring the tool families so the index scans as a chart. No animation: it would fight the AA baseline and buy nothing. The newspaper-of-record look is an asset and is not being touched. **Shipped:** a display-size figure — **2,986 whole homes across DC running as full-time short-term rentals, out of 6,992 listings** — read **at build time** from `public/ghost-homes/data.json`, the same bundle the tool serves, so a fresh capture updates the front page and the two can never quietly disagree. Cross-checked four ways in that bundle (`head.core`, `ops.total_core`, the flagged rows of `pts`, the sum of per-cluster stats) — all 2,986. Provenance travels with it: Airbnb-only, a floor not a total, snapshot 24 June 2026, linked to the tool. It sits **below** the input so it costs no fold, and is replaced once the reader has a real answer about their own block. Plus a featured entry (DC Ghost Homes renders larger) and a band tone down the left of each group. **Deliberate change from the plan:** the color codes the **bands**, not the tool families — two overlapping taxonomies would fight each other, and `--ps-caution` / `--ps-good` already mean something inside the rentals tools, so coloring a family amber would read as a warning about it. |
| 4.5 | **AA re-verify the hub** — 4.3 puts the first interactive control on the home page | ✅ done 2026-08-25 | 4.3, 4.4 | Labeled input, visible focus ring, `aria-live` on the results region, skip link still lands. Both themes, 0 contrast failures. The hub passed the 2026-08-17 sweep partly *because* it had no controls; that exemption ends here. Non-negotiable per the account-level ship-gate rule. **Result: 4/4 page-theme combinations at 0 contrast failures** (`/` 144 elements, `/about` 29, each in both themes) — write-up in `A11Y_2026-08-25_phase4-doorstep-audit.md`. One real defect found and fixed (the submit button at 4.52:1 → the `--ps-accent-fill` trio, 7.08 light / 5.31 dark). Keyboard and SR structure verified: labeled input, `aria-describedby` pointing at the privacy line so the disclosure is heard **before** typing, answers and errors sharing one `role=status` region, focus moved to the answer, `<noscript>` route to both tools. ⚠ **A screen-reader pass has still not been run** — same outstanding gap as 1.6. |
| 4.6 | **Feedback button + endpoint** (D11, D12) | ✅ done 2026-08-25 | — (independent of 4.1–4.5) | Footer button — **not** a floating overlay, which fights both the aesthetic and the focus baseline. Panel carries: auto-filled page path, a category enum, a capped message, and an **optional** email labeled "only if you want an answer". Above submit, the line that keeps the site's trust posture honest: *"This is the one form on the site that sends something to me. It goes to a private file only I read. Everything else you type on In Plain Sight stays in your browser."* Backend `infra/feedback-lambda.py`, cloned from `trash-report-lambda.py`'s shape (honeypot, field caps, enum allowlist, optimistic-locked S3 writes) behind an API Gateway HTTP API — **not** a Function URL, which 403s on this account. **One deliberate divergence from the trash Lambda: no public GET.** Trash reports publish block-level because neighbors benefit; feedback is private, or it becomes a spam-as-vandalism surface that exposes people's words. Write-only into `private/feedback.json` in the existing bucket. No IP, no user-agent, no fingerprint stored. **Built 2026-08-25, deliberately switched OFF:** `site.feedbackEndpoint` is empty, so `Footer.astro` does not render the component at all. **The guard has to live in the footer, not in the component** — Astro emits a component's `is:inline` script and `is:global` style wherever they sit in its template, whatever the markup around them is conditional on, so a conditional inside `Feedback.astro` still shipped a dead script to all fifteen pages. Verified: 0 references across 15 pages while off. The reply field configures itself from `site.links.email` — empty (no MX on the domain), so the panel currently says plainly that feedback is one-way rather than offering a reply nobody can honor. Fill that field in later and the field appears by itself. Uses the `--ps-accent-fill` tokens from 4.5. Contrast: 0 failures both themes. |
| 4.7 | **Admin: local CLI, not a hosted panel** (D13) | ✅ done 2026-08-25 | 4.6 | `npm run feedback` pulls the private file with the `inplainsight` profile, reconciles against the last `FEEDBACK_REVIEW_<date>.md`, and emits the review page — one card per item, preselected verdict (QUICK-FIX / ROADMAP / REPLY / RESOLVED / SPAM), notes, Export → dated `APPROVED_feedback-verdicts.json`, **the only thing authorized to touch this roadmap or `PARKING_LOT.md`**. Same contract as parking-review-loop. A hosted panel was considered and rejected: it needs auth, which means a credential to store and maintain, on a site whose whole selling point is that it has no accounts. **Built and exercised end-to-end 2026-08-25** against a stubbed AWS CLI: pull → review page → export verdicts → `--apply` → statuses written back → decided items do not resurface. **A real bug was found and fixed in the process:** `--apply` originally did a read-modify-write with a plain `s3 cp`, so anything submitted between the pull and the write would have been erased with no trace — the Lambda wrote conditionally and the CLI did not. It now reads with an ETag and writes with `--if-match`, retrying and re-applying up to five times; verified against a simulated mid-review submission. `feedback-out/`, the review pages and the verdict files are all **gitignored — this repo is public and those files hold what strangers typed into a civic site**. |
| 4.8 | **Surfacing without a new ritual** (D13) | 🟡 script done, hook is Pippa's to accept | 4.7 | **Threshold-triggered, not calendar-triggered** — silent when the inbox is empty, so there is no weekly obligation that is usually a no-op. The count rides the session-start orientation that already happens in this repo ("3 pieces of feedback waiting") rather than becoming a cadence to remember. Honors the margin guard: absorb the toil, don't add a system. **Built 2026-08-25:** `npm run feedback-check` prints one line if anything is waiting and **nothing at all** otherwise. Cached for 6 hours, S3 read killed at 5 seconds, and every failure path is silent and exits 0 — no credentials, no endpoint, no network must never put an error in front of her at the start of unrelated work. All three verified. ⬜ **Still to do, and deliberately not done for her:** wiring it into a SessionStart hook writes standing config, and global rule 8 says config needs an author. The command is ready; the hook is hers to accept. |
| 4.9 | **Ship gate** — the endpoint accepts public text | ⬜ | 4.5, 4.6 | Redteam pass before it is live: spam flood (throttle + honeypot + caps), storage-cost blowup, someone pasting PII into the box (cannot be prevented — warn at the point of typing and never publish), and promise-consistency with the site-wide "nothing you type leaves your browser". Private-only storage defuses abusive content, since none of it ever renders. Then AA re-verify, then deploy. **Redteam done 2026-08-25 — `REDTEAM_2026-08-25_feedback-preship.md`.** Eight findings; F8 (a write-back race that would have silently erased submissions) was fixed during the build. **F1 and F3 were fixed 2026-08-25, before the endpoint exists** — F1 by evicting only already-decided items, suppressing byte-identical repeats (which is what actually blunts a flood, since eviction alone cannot help when every item is undecided), and recording `full_since` so a full inbox is the loudest thing `feedback-check` says instead of being invisible; F3 by deleting spam outright, sweeping anything decided more than 180 days ago, and saying the retention period in the panel on the site. F2/F4/F5/F6/F7 are recorded as accepted or already handled and none blocks the gate. The file carries a ship checklist, including confirming a GET returns 405 and confirming the doorstep on the production origin |

### What 4.3 actually shipped, and what it measured

`src/components/Doorstep.astro`, above the index. One call to the geocode proxy, then routing —
no point-in-polygon, no geojson, so the home page stays light.

**The hand-off is sessionStorage, never the URL.** A home address has no business in a query
string, browser history, or a server log, so the address is stashed, read once by the destination
page, and cleared. `/trash` picks it up and runs its lookup on arrival; `/ghost-homes` does too,
but **defensively** — its `#addr` / `#addrGo` controls are built at runtime by `app.js`, a
fingerprinted artifact from the *DC Short-Term Rentals and Housing* node, so that hand-off polls
for ~3s and then gives up silently. The failure mode is a reader typing their address twice, never
a broken page. **If that node renames those ids, nothing here will notice** — the coupling is
documented in the page, and this is the line to check first if the hand-off ever stops working.

| Measured on the home page | Before Phase 4 | Now |
|---|---|---|
| Screens to first *usable control*, 375×812 | ∞ (there wasn't one) | **0.93 — fully above the fold** |
| Screens to first usable control, 1280×800 | ∞ | 0.99 (top edge visible) |
| Screens to first card, 375×812 | 1.75 | 1.52 |

Verified end-to-end against real proxy payloads: a normal address, an in-pilot address, and a
no-match. `/trash` returned "Tuesday/Friday, recycling Tuesday, DPW route 102_2" from one click;
`/ghost-homes` returned "about 11 whole homes, 27% of listings in your single-member district" and
independently agreed with the proxy on ANC 1A · SMD 1A10 · Ward 1.

**A11y (part of 4.5, done here rather than deferred):** labeled input, `role="status"` +
`aria-live="polite"` on the answer, focus moved to the answer on success, a `<noscript>` route to
both tools, and errors announced in the same live region. Contrast passes in both themes.
**One real fix came out of it:** the submit button was white on `--ps-accent`, which is **4.52:1** —
nominally AA and far too thin a margin for a primary action in small uppercase mono. Added
`--ps-accent-fill` / `-ink` / `-hover` to `global.css` (7.08:1 light, 5.31:1 dark), the same move
that produced `--ps-accent-text-mark`. **The feedback button in 4.6 should use these tokens too.**

### Open questions this phase has to answer

- **The doorstep cannot be tested from localhost.** The geocode proxy's CORS allow-list is the two
  production origins, so `astro dev` only ever exercises the error path — which is itself worth
  knowing, since that path is now verified to be graceful. The happy path was proven by replaying
  real captured proxy payloads plus a `curl` against the live endpoint. **Confirm it live on the
  production origin as a 4.9 gate step**, and don't loosen the allow-list to make dev easier.
- **`site.blurb` is the biggest remaining block above the address box** (six lines on a phone) and is
  the one piece of copy the diet has not touched, because it is brand positioning rather than card
  copy. Trimming its second sentence would put the box fully above the fold on a 1280×800 laptop as
  well. **Resolved 2026-08-25: Pippa said trim it.** The second sentence — a list of subject areas the index below shows better with live cards — is gone. With it out, **the whole form, input and button, now sits above the fold on a 375×812 phone.**
- **The masthead rail sits above the doorstep on a phone.** It was compacted from 147px to 55px
  (the "A public record of the District" flourish is hidden below 640px, the byline and GitHub link
  go inline) rather than reordered below the doorstep, because reordering means restructuring the
  lead grid and moving the byline under the tool. If the box should be even higher, that is the
  next lever.

- **⚠ There is no working email on the domain.** `site.ts` has `email: ''` with a comment: the domain has no MX records, so `hello@inplainsight-dc.org` bounces, and it was removed 2026-08-03 so the site would not advertise a dead address. **4.6 offers an optional email "if you want an answer" — and there is currently nothing to answer *from*.** Either stand up mail routing on the domain first, or drop the reply affordance and say plainly that feedback is one-way. Replying from a personal address exposes it and is not an option. Decide before 4.6 ships, not after.
- **The geocode proxy's ceiling was sized for Ghost Homes traffic**, not for the home page. It throttles at 5 req/s sustained / burst 10, behind a Lambda concurrency cap of **10** on this account's unproven-account posture. Moving it to the highest-traffic page on the site and *then* running outreach is how that ceiling gets found the hard way. Raise it deliberately before 3.4.

### Principle adopted 2026-08-25 (D6)

**Rules pages are audience-neutral; rights pages stay advocacy-framed.** `/short-term-rental-rules`
answers "do I need a hosted or unhosted license?" for a would-be host as readily as for a neighbor —
that costs the mission nothing and buys reach and credibility in rooms the rentals tools cannot
enter. The rentals cluster keeps "the process favors owners; this evens it up", because that content
*is* about a power imbalance and neutering it would make it useless. Same site, two registers, each
honest about which one it is in.

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
