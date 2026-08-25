# Redteam — the feedback endpoint, before it goes live

_2026-08-25. Scope: roadmap 4.6–4.8 — the public POST endpoint, the button, the review CLI.
This is the gate 4.9 names. **Nothing here has been deployed;** `feedbackEndpoint` is empty, so
the button does not render and the Lambda does not exist yet._

**How to read this:** each finding has a severity and a proposed fix. They want triage, not
silent adoption — the fixes below are proposals for Pippa's verdicts.

---

## F1 — Inbox-fill lockout · **WAS HIGH** · ✅ **fixed 2026-08-25**

`MAX_ITEMS = 5000` in the Lambda. Past that, every further POST returns 503. The intent was a
storage-cost ceiling; the effect is that **anyone can permanently switch off the feedback box for
about the price of an afternoon**, and once they have, genuine feedback is rejected by a page that
tells the sender only that "it did not send."

Worse, it is silent from the inside. Nothing tells Pippa the box has stopped accepting. She would
find out when someone mentioned it, or never.

**Fixed, and the fix grew a third part once the attack was thought through properly.** Eviction
alone does not actually stop the attack: a flood of 5,000 *undecided* items leaves nothing to evict.

1. **Evict the oldest already-DECIDED item** at the cap. A decided item has served its purpose; a
   report that has just arrived has not. An item still marked `open` is **never** evicted — dropping
   a real report to make room for another one is the exact failure this guard exists to prevent.
2. **Suppress byte-identical repeats** within a 200-item window, answering `200` either way so a
   flood learns nothing about what was dropped. Nobody sends the same sentence twice by accident,
   and a crude flood repeats itself — this is what actually blunts the attack, at no cost to a real
   person who double-clicked Send.
3. **Make a genuinely-full inbox loud.** When it truly cannot accept, the Lambda records
   `full_since` in the object, and `npm run feedback-check` leads with a 🚨 line saying nobody can
   reach her through the site. That state is deliberately **never served from the local cache** —
   it is the one condition worth re-checking every time. The failure stays a failure; it stops
   being invisible.

Verified against a stubbed S3 across seven cases, including "decided item evicted, all open ones
survived" and "`full_since` clears as soon as space exists again".

## F2 — One spammer consumes everyone's throttle · **MEDIUM**

The API Gateway throttle (2/s sustained, burst 5) is per-API, not per-caller. A flood from one
source starves genuine submissions, which see a generic failure.

**Proposed fix:** accept the risk for now and say so — per-IP throttling means WAF, which is a real
monthly cost for a free civic site, and the site deliberately does not identify callers (see F5).
Revisit only if it actually happens. The UI copy already blames the site rather than the sender,
which is the right behavior under load.

## F3 — Nothing is ever deleted · **WAS MEDIUM** · ✅ **fixed 2026-08-25**

Messages sit in S3 indefinitely. A `spam` verdict marks an item; it does not remove it. On a site
whose whole posture is that it does not keep things about people, **keeping every word anyone ever
typed, forever, is the posture quietly not being true.** Some of those words will contain an
address, a landlord's name, or a housing situation.

**Fixed, all three parts:**

- **`spam` now deletes**, rather than marking. It was never worth keeping.
- **A retention sweep runs on every `--apply`:** anything decided more than **180 days** ago is
  dropped. Items are stamped with a `decided` date when a verdict lands, which is what makes this
  measurable at all. **Anything still `open` is never touched by it** — an undecided report must
  not disappear on a timer.
- **The panel says so on the site:** *"It is kept while I act on it and deleted within 180 days —
  sooner if it turns out to be spam."* A retention rule nobody is told about is not a promise, it
  is an implementation detail.

Verified: a spam verdict removed the item, a 200-day-old decided item aged out, a 10-day-old one
survived, and the open item took its verdict and its date.

## F4 — CORS is not an access control · **LOW-MEDIUM** · accepted, worth stating

The allow-list only binds browsers. `curl` can POST directly and the honeypot will not stop anyone
who looks at the form first. The real controls are the throttle, the field caps, and the item cap.

**Proposed fix:** none. This is what a public endpoint is. Recorded so nobody later mistakes the
CORS config for a security boundary.

## F5 — There is no abuse signal at all, by design · **LOW** · a trade, not an oversight

The Lambda deliberately stores no IP, no user agent, no fingerprint. The consequence is real: five
hundred messages from one person and five hundred people are indistinguishable.

**Proposed fix:** none, and do not "fix" it later under pressure. This is the cost of the promise,
and the cheaper answer — "just log the IP for abuse control" — is how a feedback box on a
no-tracking site quietly becomes tracking. Written down here so that the next person who proposes
it can see it was a decision.

## F6 — Third-party reply addresses · **LOW** · only bites once email is turned on

The reply field is off (no MX on the domain). When it is switched on, nothing stops someone
entering an address that is not theirs, and a reply would then reach an uninvolved person along
with whatever context Pippa quotes back.

**Proposed fix:** when email is enabled, never quote the original message body in a reply, and
treat the address as a claim rather than a fact.

## F7 — Injection into the review page · **INFO** · already handled, keep it that way

The review page renders text a stranger wrote, on Pippa's machine. Every field goes through `esc()`,
and the server independently constrains `page` to `^/[A-Za-z0-9/_-]*$` so no attacker-supplied URL
can end up as a clickable link in the review UI.

**Proposed fix:** none. Note for future edits: **do not introduce `innerHTML` with feedback content
into that page.**

## F8 — Write-back race · **WAS HIGH** · found and fixed during the build

`--apply` originally did a read-modify-write with a plain `s3 cp`. Anything submitted between the
pull and the write would have been erased with no trace — a stranger's message silently thrown
away, and no way to know it had happened. The Lambda already wrote conditionally; the CLI did not.

**Fixed:** `--apply` now reads with an ETag and writes with `--if-match`, retrying up to five times
and re-applying verdicts each round. Verified against a simulated mid-review submission.

## F9 — The intake can receive claims about a named living person · **MEDIUM–HIGH** · **found after ship, 2026-08-25, by the DC Appointments Watch session**

Raised by the session working `DC Appointments Watch`, and it is a gap in this redteam rather than
in the code. F6 considered third-party *reply addresses*. **Nobody considered third-party
*allegations*.**

The feedback control is in the shared footer, so it is on **all 15 pages** — verified after a clean
rebuild, including `/appointments/seats/`, which is built but held from deploy. Once that page
ships, the site will name real, living people in board and commission seats, and the button beneath
it will accept free text from anyone. "X should not be in that seat", "Y does not live at the
address they claim", or worse, arrives in `private/feedback.json` and is read by one person.

Three distinct problems, none of which the current design addresses:

1. **The claim is unverifiable and about a third party**, who has no idea it was made and no way to
   answer it. Nothing is published, which contains the harm — but it does not remove it.
2. **Nothing tells the sender what will happen to it.** The panel copy explains data handling
   honestly; it says nothing about the difference between "this page is wrong" and "this person is
   unfit", and those need different handling.
3. **It collides with decision D3.** § 05 of the seat clock states the correction route is GitHub
   ("GitHub now, email when ready"). The footer button is a **third route the page does not
   acknowledge**, which arrived because a site-wide component shipped, not because anyone chose it
   for that page. D3 was a decision *about exactly this*.

**RESOLVED IN PART, 2026-08-25.** Pippa ruled: **option 2 — the button stays, and § 05 names both
routes.** Not the opt-out, so no page-level flag was built.

- ✅ **Done and site-wide:** the panel now carries the boundary in front of the person typing, on
  all 15 pages — *"If something here is wrong … that is a correction, and it gets fixed. A report
  about a **person** is something else, and this is not the place for it: nothing on this site is a
  finding about anybody, and I do not investigate people."* 0 contrast failures in both themes.
- ⏸ **§ 05 is held, deliberately.** That copy lives in the Appointments node's page, and that
  session declined to act on a **relayed** ruling — a peer reporting a decision is not the decision
  arriving, however accurate. It is confirming with Pippa directly and will write § 05 itself. I
  wrote the change, then reverted it in full; `seats.astro` is byte-identical to `71e2cca`. The
  right call, and the same boundary I would apply in reverse.
- 🔴 **Found while reading that page, and handed back rather than fixed:** § 01 and § 05
  **contradict each other**. § 01, after that session's honesty pass, says most rows "name a seat
  that only one person can hold … the row identifies its holder". § 05 still says "no individual can
  be derived from it" — the exact claim § 01 retracts. Their page, their gate, their fix; reported
  to them. Not live (the page 403s in production).

**Sharpened 2026-08-25 by the same session, and it matters: problem 3 is NOT prospective.** The
seat clock **as built today** carries two correction routes while its own § 05 says the route is
GitHub. It contradicts itself the moment it goes live — that is a blocking item on 1.6 now, not a
note for later. Problems 1 and 2 wait for the page to ship; problem 3 is already true in `dist/`.

**Three genuine options, and this is Pippa's decision — deliberately not built either way.** The
per-page opt-out was offered and declined *for now*, on the correct grounds that the choice is open
and none of these should arrive because a component shipped:

1. **The page opts out and keeps GitHub.** Honors D3 as written. Needs a page-level flag on the
   footer control — small, since the component already reads `site.feedbackEndpoint`.
2. **The button stays and § 05 is rewritten** to name both routes and say what each is for. Keeps
   the low-friction route for the people least likely to open a GitHub issue.
3. **The button becomes the primary route**, which is arguably what D3's "email when ready" was
   reaching for. The intake exists now and needs no mail routing on the domain.

Those are three different pages. Whichever it is, it should be chosen.

**Also, whichever way it goes:**

- **`p6-t1`, the person-naming redteam in the Appointments node, must cover the intake channel and
  not only the page.** That is the substantive change and it belongs to that project's gate.
- If the control stays on a page that names people, the panel needs a line saying what happens to a
  report **about a person** — and that it is not an investigation. **A report about a page is a bug
  report; a report about a person is something else entirely, and the sender is currently told
  nothing about which one they are filing.**

**Recorded, not acted on.** Both halves are decisions rather than code, and the second belongs to
another project's gate. Nothing about the shipped state is unsafe today: `/appointments/seats/`
returns 403 in production, so the intake exists on 14 live pages that name **no individuals**.

---

## Ship checklist for 4.9 — ✅ **all done, shipped 2026-08-25**

- [x] Ran `./infra/feedback-setup.sh`, endpoint in `site.ts`, rebuilt, deployed.
- [x] **Endpoint is write-only:** `GET` returns **405**.
- [x] Bucket blocks all four public-access vectors; default encryption AES256.
- [x] CORS allows `inplainsight-dc.org`, returns no allow-origin header for `evil.example.com`.
- [x] Real feedback posted from the live site; landed with the correct page path;
      `npm run feedback` and `feedback-check` both saw it. Deleted afterwards.
- [x] **The doorstep's happy path ran on the production origin** and works: `3114 Sherman Ave NW`
      → Ward 1 · ANC 1A · SMD 1A10, then one click to `/trash`, which arrived pre-filled and
      already looked up. First time it has ever run for real.
- [x] `/appointments/seats/` still returns **403** — that gate held through the deploy.

**One thing broke, and it is worth remembering:** the first live POST returned 500 while validation
and the honeypot both looked fine. The role had `GetObject`/`PutObject` on one key and nothing else,
which reads like textbook least privilege and is subtly wrong — **without `s3:ListBucket`, S3 answers
a GetObject for a missing key with 403 AccessDenied rather than 404 NoSuchKey**, so the "inbox does
not exist yet" branch never matched. Fixed by granting it and by seeding an empty object, *not* by
catching AccessDenied — which would have turned a permissions blip into "the file looked empty, so
replace it". The note now lives in `infra/feedback-lambda.py`, which is tracked, because
`infra/*.sh` is not.
- [x] ~~Pippa's verdicts on F1 and F3 applied before, not after.~~ **Both fixed 2026-08-25**,
      before the endpoint exists. F2, F4, F5, F6 and F7 are recorded as accepted or already
      handled; none of them blocks the gate.
