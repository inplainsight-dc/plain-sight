---
title: "Civic Almanac"
description: "Civic Almanac — four ways to be heard where you live: the election coming at you, the comment window on a rule being written, the budget hearing, the thing on your block worth a record number. Each one is public, each one has a deadline, and each one is buried somewhere different."
tags: ["Elections", "Participation", "Deadlines", "Open data"]
status: "building"
order: 9
---

<!--
  Deliberately `building` with NO `url`, so the card renders as "In the works" and is not
  clickable. The page exists at /almanac and is reachable by anyone who types the URL, but it
  is a scaffold: it names the four avenues without resolving any of them. Its own dateline
  reads "A TOOL IN THE INDEX · IN DEVELOPMENT", and the body says "Coming in v1", "not yet
  wired", and "the address lookup itself is the next build task (p2-t2)". A clickable card is
  a promise the page cannot yet keep.

  To take it live: the address lookup (p2-t2 in the Electify node) has to resolve a real
  address to the layers listed in § 03. Then set status "live", add `url: "/almanac"`, and add
  the path to src/pages/sitemap.xml.ts — together, as with any card here.

  Copy defects to fix FIRST, and fix them in the Electify node, never here — /almanac renders
  from src/data/almanac/almanac.json, which sync-almanac-data.mjs overwrites on every build:
    - "neighbourhood" — British spelling. NOT caught by the 2026-08-17 orthography sweep,
      which only read authored pages; this is generated content.
    - seven literal "--" where an em dash belongs
    - "worth saying out loud" — filler phrase named by the voice-register skill
    - three straight apostrophes/quotes ("DC's 311", 'great weight')

  Naming: the card says "Civic Almanac", not "DC Civic Almanac". The DC-prefix question is
  OPEN, not overlooked — Civic Almanac is a platform with per-city instances rather than a DC
  tool, so the rule may genuinely not apply. Ruling deferred by Pippa on 2026-08-19. The page
  h1 reads "Civic Almanac in plain sight." and this card agrees with it; keep them in step.
-->
