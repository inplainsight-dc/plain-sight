# Getting the tools found — a free / low-cost outreach playbook

_The tools are live and now they're **shareable** (real preview cards on every link) and **findable** (sitemap + robots so Google can index them). This file is the other half: where the people who need them actually are, and the cheapest honest ways to reach them. Last updated: 2026-08-12._

**The one rule that keeps this trustworthy:** every tool says plainly *free civic tool, not a government site, not legal advice.* Keep that line in every post and flyer. It's what lets these sit on a wall — or in a subreddit — next to everything else without reading as a pitch.

**A note on who does what.** Everything below is outward-facing, so it's yours to send/post (some of it, like the ANC channels, only works *because* it's you). Claude can draft, size, and prep; the send is a ship-gate step. Where a blurb is ready to paste, it's written in your voice, American-English, first person.

---

## Start here (3 moves, ~an afternoon, highest return)

1. **Post the flyers in 5 physical spots you already pass.** Your building lobby, your closest laundromat, your library branch, a coffee shop board, a rec center. The kit (`kit/spread-the-word.html`) prints one flyer per page with tear-off QR tabs. Test one code with your own phone first.
2. **One ANC newsletter blurb.** You have the standing to do this cleanly (it's how the Trash pilot reached 1E03). A neighbor-to-neighbor "here are some free tools I made" note in one commissioner's newsletter is the single most credible channel you have. Blurb below.
3. **Answer one real question on r/washingtondc** where a tool genuinely fits (someone worried about a deposit, a suspicious listing) and link it as a helpful reply — not a promo post. This is how Reddit distribution actually works.

Do those three, watch what happens for a week, then reach for the rest.

---

## The channels, by audience

### 1. ANC newsletters & meetings — _your warmest channel_
- **Who's there:** your actual neighbors, already reading civic mail.
- **Why it works:** it's you, a known ANC-adjacent person, sharing something you made for the community — not an ad.
- **The ask:** a 3–4 line blurb in a commissioner's e-newsletter; a 30-second mention + a stack of flyers at a monthly meeting; the tools listed on an ANC resources page.
- **Ready to paste (newsletter):**
  > **Free tools for renters (and more), made by a neighbor.** I build small, free civic tools that make DC's fine print easier to read — no account, no app, nothing you type leaves your phone. If you're renting: know your rights, spot a listing scam, read a lease before you sign, or protect your deposit at move-in. There's also a DC public-records lookup and a trash/recycling day checker. All at **inplainsight-dc.org**. Free, and not a government site — just something I made because the rules that govern us should be readable.

### 2. Tenant & legal-aid organizations — _highest-need audience_
- **Who to approach (candidates, not existing partners):** Office of the Tenant Advocate (OTA), Legal Aid DC, Bread for the City, Latino Economic Development Center (LEDC), the Landlord-Tenant Court self-help center, ward-based tenant associations.
- **The ask:** "Would you list these as a free resource / link them from your resources page? Happy to send print flyers for your waiting room." Lead with the move-in and rights tools — that's their daily traffic.
- **Framing:** you're not asking them to endorse; you're offering a free, source-cited, no-data-collected resource that lightens their intake load. The "not legal advice" line matters most here — it's what makes it safe for a legal-aid org to point at.

### 3. Reddit — _r/washingtondc, r/nova, r/maryland, neighborhood subs_
- **The reality:** these communities punish self-promotion and reward being useful. Don't lead with a "check out my site" post.
- **How to do it right:**
  - **Comment utility first.** Find deposit / scam / lease threads (they're constant) and leave a genuinely helpful answer; link the specific tool when it directly helps. One good comment beats ten posts.
  - **One framed post, mods permitting.** A "I made some free DC renter tools, no account/no ads, would love feedback" post *can* land in r/washingtondc if it reads as a gift, not a launch. Check the sub's self-promo rule first; DM a mod if unsure.
- **Scam-check has a special home:** DC housing / "rooms for rent" Facebook groups and subs are *where the scams are posted.* A calm "here's a free 60-second scam check" reply under a sketchy listing is pure value.

### 4. Physical community boards — _the kit's home turf_
- **Best spots:** libraries, laundromats, rec centers, coffee shops, tenant clinics, mutual-aid pantries, building lobbies, university off-campus housing boards, bus shelters near you.
- **Why flyers still win:** they reach people who never search — and the tear-off QR tabs let someone take the tool with them to scan later.
- **Print tip:** plain black-and-white scans just as well; you don't need color.

### 5. Universities — _students are prime renters and prime scam targets_
- **Who:** off-campus housing offices at GW, Georgetown, Howard, AU, UDC, Catholic, Trinity.
- **The ask:** "Free renter tools for your off-campus housing resource list — rights, scam check, lease check, deposit protection. No login, nothing collected." Off-campus housing offices actively curate exactly this.

### 6. Mutual aid, Buy Nothing & Nextdoor — _hyperlocal trust_
- **Who:** ward-based DC Mutual Aid networks, Buy Nothing Facebook groups, Nextdoor.
- **How:** post as a neighbor offering a free resource. Read each group's rules first (some Buy Nothing groups are gifts-only — the flyer framing "a free thing I made" usually fits; ask a mod if unsure).

### 7. Local press & newsletters — _one tip email, potential big reach_
- **Who takes reader tips / resource round-ups:** PoPville, The DC Line, DCist, Greater Greater Washington, Washington Informer, Street Sense, ward-level newsletters.
- **The ask (short tip email):**
  > Hi — I'm a DC resident who builds free civic tools that make the city's fine print readable (renter rights, listing-scam checks, lease and deposit help, public-records lookup). No accounts, no ads, nothing collected. If it's ever useful for a reader round-up: **inplainsight-dc.org**. Happy to answer anything.
- **Highest-fit first:** PoPville and The DC Line both surface reader resources regularly.

### 8. Your own network — _don't skip the obvious_
- Your personal social, and **LinkedIn** (the site has a LinkedIn slot sitting empty in `src/config/site.ts` — filling it turns your profile into a front door). One honest post about *why* you built these travels further than you'd expect among people who know you.

---

## What we've already done to make sharing pay off (the plumbing)

So that none of the above is wasted effort:
- **Share cards** — every tool link now renders a branded preview image (the hook, the URL, the trust line) in texts, Reddit, Facebook, Slack. A pasted link is now a small poster. (`public/og/*.png`, regenerated by `npm run gen-og`.)
- **Sitemap + robots** — Google can now discover and index every public tool (`/sitemap.xml`); the in-dev Almanac is deliberately held back.
- **Canonical URLs** — no duplicate-page dilution in search.

## Measuring without surveillance
The tools honor "nothing leaves your browser," so there's no analytics and that's on purpose. Read signal the honest way: which flyer's tear-tabs run out, whether an org emails back, what people say in the threads you join. If you ever want real numbers, the privacy-preserving option is server-log counts of page hits at the CDN (no per-person tracking) — a deliberate decision to make later, not a default to turn on.

---

## Roadmap hook
This lives on the hub roadmap as **Phase 3 — Distribution & discoverability**. The plumbing (share cards, sitemap, robots) is done; the human channels above are the ongoing work, paced to your bandwidth. Nothing here is urgent-by-default — pick one channel at a time.
