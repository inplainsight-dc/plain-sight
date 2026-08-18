# Redteam + persona pass — `/appointments` (DC Appointments Watch), pre-ship

**Date:** 2026-08-17 · **Surface:** `src/pages/appointments.astro`, built in dev, not deployed
**Question asked:** can a hostile reader discredit this page, and can an error in it hurt a real
person? **Answer: yes to both, in six specific ways — five are now fixed, and there are five
decisions left that are Pippa's.**

This is the redteam-before-ship rule applied to the first DC Appointments Watch surface. It is
**not** roadmap task p6-t1: that task is about naming living people, and this page names nobody.
p6-t1 still gates any surface that does.

---

## The stakes, stated plainly

Every other In Plain Sight tool tells a reader something about their own situation — their
rights, their pickup day, their block. This page makes a **claim about the District's conduct**
against a statutory deadline. Two failure modes follow from that, and neither exists on the other
tools:

1. A wrong date, or a right date wrongly framed, lands on a **real person** who sits in a named
   seat. Nobody is named on the page, but seats are — and a seat can be resolved to a person.
2. The page's whole value is its method. A reader who finds one soft claim discards the rest,
   including the parts that are solid. **The most attackable sentence sets the credibility of the
   page**, not the best-evidenced one.

---

## Findings — fixed in this pass

### F1 · "PAST THE LEGAL CAP" delivered a legality verdict at skim level — HIGH

The lead state tile read `PAST THE LEGAL CAP` above a large red **5**. A reader who reads nothing
else leaves with "DC is breaking the law in five places." The page cannot support that: under the
alternative reading of the same data (see F2's neighbor, the stale-field caveat) the day counts
are simply wrong, and even where they are right, whether the cap was *violated* depends on facts
MOTA does not publish.

Worse, the phrase had leaked into the two most-shared strings on the site — the `<meta name="description">`
and the hub card's description. Those travel without any of the page's caveats attached.

**Fixed.** Everything now reads "the 180-day cap". The statute is cited where the claim is
actually made and qualified (§ 02, with a link to § 1-523.01(c)), not in the skim layer.

### F2 · The page promised something it cannot deliver — HIGH

The rail claimed: *"No individual is named anywhere on this page, and none can be worked out
from it."*

The first half is true. The second half is false, and a hostile reader breaks it in about thirty
seconds: the page lists **Board of Optometry — Optometrist licensed in the District — Holdover
member — 158 days past term**. That board has one such seat, and its membership is public
elsewhere. The overclaim was the vulnerability — not the seat listing, which is legitimate public
information, but the *promise* that it was anonymized when it was not.

**Fixed.** Now: no individual is named; the page does name seats; where a body has one seat of a
kind a determined reader could look up who holds it in other public records; so nothing here is a
statement about any person and should not be made into one. A limitation stated honestly cannot
be used against you. A false assurance can.

### F3 · Nothing on the page spoke to the person sitting in a listed seat — HIGH (care)

The four personas below include a board member reading their own body's row. The page had a
"not an accusation" note written in the third person, addressed to a general reader. It had
nothing addressed to *them*.

**Fixed.** New § 05 card, "If one of these is your seat": it says exactly what the row asserts
(the register lists a term end that has passed), what it does not assert (anything about their
propriety, their fitness, or their work), that a member may lawfully continue serving after a
term ends, that where an appointment or confirmation is outstanding the party that has not acted
is not them, and where the correction route is. This is the single highest-value paragraph on the
page for the project's own evidentiary rule.

### F4 · Two computed figures looked like published ones — MEDIUM

`Days past term end` and `Cap date` are **calculated here** (term end + 180 days). Presented in a
table beside MOTA's own fields, they read as MOTA's. A reader who checked MOTA and found no cap
date would reasonably conclude the page was inventing data.

**Fixed** in the table caption: the term end and the status are MOTA's; the day count and the cap
date are calculated from them here.

### F5 · "Every seat empty" invited "this body has nobody in it" — MEDIUM

The register distinguishes **public-member seats** (1,333) from **agency-designated seats** (547,
filled by whoever holds a particular job). A body with 8/8 public-member seats empty may still
have agency-designated members. The visual — eight hollow red squares under a body's name — made
the stronger claim that the words did not.

**Fixed.** § 03 now states that these are public-member seats, that agency-designated seats are
counted separately and not shown, that such a body is "not necessarily a body with nobody in the
room", and that **whether it can still lawfully act depends on its own quorum rule, which this
page does not read.** Refusing to imply the quorum finding is the right call — that is p2-t4's
work and the page should not front-run it.

### F6 · The 276 headline carried no qualifier at skim level — MEDIUM

The "nobody in the seat" tile shows **276** and § 04 explains that a second MOTA report says 17.
A skimmer took 276 as uncontested. If MOTA ever states that the other report is authoritative,
the page's headline is wrong by 16×.

**Fixed.** The tile now says the figure is the one MOTA's own body-level register gives, notes the
second report's 17, and links to § 04. The count stays 276 — two of MOTA's three sources agree on
it — but the disagreement now travels with the number instead of waiting three sections.

_Two accessibility defects were also found and fixed in the same pass (sideways page scroll at
≤768px; grid overflow at 320px) — see `A11Y_2026-08-17_appointments-audit.md`._

---

## Persona wave — four readers

**The resident whose agency just failed them.** Arrives wanting "who runs DOES". The page cannot
answer: MOTA's register holds zero agency heads. This was only disclosed in § 05, five sections
down. **Fixed** — the lead blurb now ends "**Boards and commissions only** — not agency
directors." Better to lose the reader in ten seconds than to waste five minutes of theirs.

**The journalist checking a claim before filing.** Needs the source, the date, and whether it is
safe to print. § 06 gives the four reports by ID, row counts, and capture checksums, plus the
warning that report IDs are not stable identifiers and the reports keep no history. Survives the
persona. **One gap left — see D2.**

**The Council staffer who knows the process better than the tool.** Three attacks predicted, all
three already answered on the page: *"term end is stale for half these boards"* — conceded up
front, as the caveat carrying all three headline figures, with both readings stated; *"you are
calling this a confirmation backlog"* — the page explicitly says that framing would be wrong for
most of it, and shows 149 of 279 are the Mayor's alone; *"§ 1-523.01(c) governs a person holding
over, not a seat, so your vacant seat past the cap is a category error"* — the footnote under the
table makes exactly that distinction before they can. That footnote is the page's credibility
earner and should not be cut for length.

**The board member reading their own seat.** Covered by F3.

---

## Decisions left — Pippa's, before deploy

**D1 · The URL, and it is the expensive one.** The page is at `/appointments` but covers only
board and commission seats. When the nominations pipeline arrives (p6-t3) it will want that path.
Deciding after the link has been shared means either a redirect or a broken link. Options: keep
`/appointments` as the family front door and add `/appointments/pipeline` later; or move this page
to `/appointments/boards` now and leave the root free. **Recommend deciding this before the first
share, not after.**

**D2 · A "how to cite" line.** The journalist persona wanted a copyable citation — tool name,
report ID, capture date, checksum. Every part is on the page; nothing assembles it. One small
block in § 06 would do it.

**D3 · The email correction route.** Your decision was GitHub now, email when ready. GitHub is
live on the page. The email needs mail routing verified on the domain first (`site.ts` records
why it is off). A resident who does not use GitHub currently has no route — that is the known
cost of shipping now, and it is worth reviewing before the page is promoted rather than after.

**D4 · One editorial sentence.** The strip chart says the red marks "do not fall in the row you
would expect." It is defensible — none of the five seats past the cap is labeled a holdover, and
four are labeled "Active / filled seat" — but it is a judgment in a page that otherwise states
and qualifies. Keep it, or state it flatly ("four of the five are labeled Active / filled seat").
Your voice call.

**D5 · Nobody is watching the watcher.** If the capture job stops, the page notices — after seven
days it replaces its freshness line with a visible out-of-date warning, computed from the baked
capture date. But **you** get no signal. Roadmap p4-t4 covers extending the capture job's own
staleness nudge; until it lands, a silent job failure means a page that eventually tells readers
it is stale while nobody fixes it.

---

## What holds up under attack

Worth recording, because a redteam that only lists problems misrepresents the surface:

- **The strongest section is § 04**, where the register contradicts itself. It is drawn entirely
  from the source's own published outputs, the inference (the swapped titles) is labeled as an
  inference, and the part that is not an inference — that neither title describes its report — is
  checkable by anyone in a minute.
- **The counter-reading travels with every claim**, by construction: the sync script projects
  `counter_reading` alongside `claim` for all eight findings, so a future page cannot render the
  claim without it.
- **The page cannot outrun its data.** It is generated from a schema-checked projection of the
  analysis; the sync script refuses to write if a required key is missing, if the capture and
  analysis dates disagree, or if the chart would hold fewer points than the analysis counted. A
  hand edit is not possible without breaking the generator.
- **Every duration is dated to the capture, three times over**, and the freshness line goes loud
  on its own after a week.

_No individual is named on the surface. No new data source was fetched to produce it. The page was
verified in a running dev server; the production build passes; deployment is gated on p6-t8._
