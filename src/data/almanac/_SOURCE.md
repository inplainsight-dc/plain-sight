# src/data/almanac/ — generated, do not hand-edit

`almanac.json` is a **build artifact**. It is produced by
`scripts/sync-almanac-data.mjs` from the Civic Almanac content brain:

    100 IPS Electify/schema/examples/
      ├─ instance-config.dc.json   ← the fork seam: jurisdiction, geocoder, districts, which avenues are on
      ├─ avenue.*.json             ← portable, jurisdiction-neutral (what an avenue *is*)
      ├─ binding.dc.*.json         ← the DC-specific half (authority, delivery mode, tools it routes to)
      └─ opportunity.dc.*.json     ← a dated instance of an avenue: the election, and the deadlines inside it

    100 IPS Electify/content/<jurisdiction>/
      └─ locations.*.json          ← the PER-CYCLE CACHE (voting places + their hours)

The cache sits outside `schema/examples/` on purpose: `validate.py` rejects any
filename there that is not a schema record, and this is a fetched artifact rather
than an authored one. It is refreshed by hand, per election cycle, with
`python3 scripts/fetch_vote_locations.py` in the Electify folder, and committed —
so the build stays reproducible and offline, and a bad upstream edit shows up in a
diff instead of silently reaching a reader.

The sync does two things, in order:

1. **Gates the build.** It runs the Almanac's own validator
   (`100 IPS Electify/schema/validate.py`) over the source records and
   **fails the build** on any error — schema violations, the neutrality
   invariant (no "who to support" keys), the footprint-privacy invariant.
   Needs Python + `jsonschema`; a project-local `.venv` is preferred
   (`python3 -m venv .venv && ./.venv/bin/pip install jsonschema`), with
   system `python3` as a fallback.
2. **Resolves** the enabled avenues into this single neutral bundle, which
   `src/pages/almanac/index.astro` imports. The page names no jurisdiction —
   every place-specific string arrives here as data. A disabled avenue (the
   ANC binding, `enabled: false`) is skipped cleanly.

**To change what the /almanac page says,** edit the source records in
`100 IPS Electify/schema/examples/` and rebuild — never edit `almanac.json`.

**Two build gates, not one.** As well as running `validate.py`, the sync now
**refuses to bundle an opportunity whose `provenance.confidence` is not
`verified`** and fails the build with the record's id. Opportunities are the dates
a person plans their day around, and the July fixture carried
`confidence: "inferred"` with a note saying a record like that "must never render
to a resident without being re-sourced" — so that sentence is now a failing test
rather than a memo. The 2026-general record was re-sourced from DCBOE's published
calendar on 2026-08-26 and is `verified`; two dates in the fixture were wrong.

_Scope note: `p2-t1` (the four-avenue shell) and `p2-t2` (address → districts,
dates, and voting places) are built. Footprint entries are still deliberately
**not** synced — those drive `p2-t5`._
