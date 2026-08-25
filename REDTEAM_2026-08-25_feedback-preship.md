# Redteam — the feedback endpoint, before it goes live

_2026-08-25. Scope: roadmap 4.6–4.8 — the public POST endpoint, the button, the review CLI.
This is the gate 4.9 names. **Nothing here has been deployed;** `feedbackEndpoint` is empty, so
the button does not render and the Lambda does not exist yet._

**How to read this:** each finding has a severity and a proposed fix. They want triage, not
silent adoption — the fixes below are proposals for Pippa's verdicts.

---

## F1 — Inbox-fill lockout · **HIGH** · the one I would fix before shipping

`MAX_ITEMS = 5000` in the Lambda. Past that, every further POST returns 503. The intent was a
storage-cost ceiling; the effect is that **anyone can permanently switch off the feedback box for
about the price of an afternoon**, and once they have, genuine feedback is rejected by a page that
tells the sender only that "it did not send."

Worse, it is silent from the inside. Nothing tells Pippa the box has stopped accepting. She would
find out when someone mentioned it, or never.

**Proposed fix (two parts, both small):**
1. When the inbox is at the cap, **drop the oldest already-decided item** rather than refusing the
   new one. Decided items have served their purpose; a live report has not.
2. Have `feedback-check` warn at 80% of the cap, so the ceiling is visible before it is hit.

## F2 — One spammer consumes everyone's throttle · **MEDIUM**

The API Gateway throttle (2/s sustained, burst 5) is per-API, not per-caller. A flood from one
source starves genuine submissions, which see a generic failure.

**Proposed fix:** accept the risk for now and say so — per-IP throttling means WAF, which is a real
monthly cost for a free civic site, and the site deliberately does not identify callers (see F5).
Revisit only if it actually happens. The UI copy already blames the site rather than the sender,
which is the right behavior under load.

## F3 — Nothing is ever deleted · **MEDIUM**

Messages sit in S3 indefinitely. A `spam` verdict marks an item; it does not remove it. On a site
whose whole posture is that it does not keep things about people, **keeping every word anyone ever
typed, forever, is the posture quietly not being true.** Some of those words will contain an
address, a landlord's name, or a housing situation.

**Proposed fix:** make `spam` mean **delete**, not mark. Add a retention step to `--apply`: drop
anything decided more than 180 days ago, and say in the panel copy how long feedback is kept.

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
- [ ] Pippa's verdicts on F1 and F3 applied before, not after.
