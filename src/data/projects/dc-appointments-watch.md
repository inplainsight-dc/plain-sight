---
title: "DC Appointments Watch"
description: "DC Appointments Watch — which of the District’s board and commission seats have run past the end of their term, which are closing on the 180-day cap, and which have nobody in them at all."
tags: ["Boards & commissions", "MOTA", "Appointments", "Open data"]
status: "building"
order: 6
---

<!--
  Deliberately `building` with NO `url`, so the card renders as "In the works" and is not
  clickable. The page exists at /appointments/seats and has passed accessibility verification
  and a redteam pass, but the ship gate has not closed: of the redteam’s returned verdicts,
  two findings came back DELIBERATE (identifiability, and whether to read quorum rules), and
  no screen-reader pass has run — which Pippa’s ruling on D6 made a condition of THIS card
  going live, since the card is the moment a reader can find the page.

  Path note: /appointments/seats, not /appointments, by decision D1 on 2026-08-17. The seat
  view names its own grain and leaves the root free for a front door once the nominations
  pipeline view exists. The root currently 404s on purpose.

  To take it live, in the same pass: set status to "live", add `url: "/appointments/seats"`,
  add that path to src/pages/sitemap.xml.ts, and remove the Disallow line from
  public/robots.txt. All four together — a live card pointing at a page search engines are
  told to ignore is a half-shipped tool.
-->
