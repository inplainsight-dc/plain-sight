# src/data/almanac/ — generated, do not hand-edit

`almanac.json` is a **build artifact**. It is produced by
`scripts/sync-almanac-data.mjs` from the Civic Almanac content brain:

    100 IPS Electify/schema/examples/
      ├─ instance-config.dc.json   ← the fork seam: jurisdiction, districts, which avenues are on
      ├─ avenue.*.json             ← portable, jurisdiction-neutral (what an avenue *is*)
      └─ binding.dc.*.json         ← the DC-specific half (authority, delivery mode, tools it routes to)

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

_Scope note: this is the `p2-t1` scaffold. Opportunity records (dated cards)
and footprint entries are deliberately **not** synced yet — those drive
`p2-t2`/`p2-t4`/`p2-t5`. The 2026-general opportunity fixture is marked
`confidence: inferred` and must not ship as real data._
