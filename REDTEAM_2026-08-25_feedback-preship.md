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

---

## Ship checklist for 4.9

- [ ] Run `./infra/feedback-setup.sh`, put the endpoint in `site.ts`, rebuild.
- [ ] **Confirm the endpoint is write-only:** `GET` must return **405**, not 200.
- [ ] Confirm the S3 bucket blocks all public access and has default encryption on.
- [ ] Confirm CORS rejects an origin that is not the two production ones.
- [ ] Post one real piece of feedback from the live site; confirm it lands and that
      `npm run feedback` shows it.
- [ ] **Confirm the doorstep's happy path on the production origin** — it cannot be exercised from
      localhost, so this is the first time it runs for real (carried over from 4.3).
- [x] ~~Pippa's verdicts on F1 and F3 applied before, not after.~~ **Both fixed 2026-08-25**,
      before the endpoint exists. F2, F4, F5, F6 and F7 are recorded as accepted or already
      handled; none of them blocks the gate.
