# Ghost Homes — DC MAR geocode proxy

A ~40-line AWS Lambda that lets the browser use DC's authoritative address geocoder (the
Master Address Repository) without the CORS wall. **The page works without this** — it falls
back to OpenStreetMap Nominatim — but MAR gives better DC address matching and no third-party
rate limit. Deploying it is the last "do it well" step before launch.

> **I (Claude) could not deploy or fully verify this from the build environment** — every DC
> geocoder host failed on TLS/socket here, and deploying touches your AWS account (ship gate).
> So this is ready-to-deploy code + a runbook. Step 4 is a required one-time field check.

## Why a proxy (and why districts still come from PIP)

MAR sends no `Access-Control-Allow-Origin`, so a static page can't call it. This proxy calls it
server-side and adds CORS. It returns only a **lat/lon + matched-address label**; the page still
computes **ANC/SMD/cluster by point-in-polygon** against the official 2023 boundaries it already
ships — so a MAR schema change can't silently corrupt the district answer.

## Deploy (AWS Console, ~10 min)

1. **Lambda → Create function** → Author from scratch · Node.js 20.x (or newer) · name `ghost-homes-geocode`.
2. Paste `index.mjs` into the editor (rename the handler file to `index.mjs`, or set the handler to `index.handler`). Deploy.
3. **Configuration → Function URL → Create** · Auth type **NONE** · CORS: allow `GET`. Copy the URL.
   - **Configuration → Environment variables**: set `ALLOW_ORIGIN` = `https://inplainsight-dc.org` (your production origin) before launch. Leave `*` only while testing.
4. **VERIFY THE FIELDS (required once).** From a terminal:
   ```
   curl "https://<function-url>/?q=1350+Pennsylvania+Ave+NW"
   ```
   Confirm the JSON has non-null `lat`, `lon`, `anc`, `smd`, `ward`. If any are null, curl MAR
   directly to see its real field names and trim the `pick(...)` lists in `index.mjs`:
   ```
   curl "https://citizenatlas.dc.gov/newwebservices/locationverifier.asmx/findLocation2?f=json&str=1350+Pennsylvania+Ave+NW" | python3 -m json.tool | grep -iE "lat|lon|ward|anc|smd|cluster|address"
   ```

## Wire it into the page

In `src/pages/ghost-homes.astro`, uncomment the geocoder config script and set the URL:
```html
<script is:inline>window.GHOST_GEOCODER_PROXY = "https://<function-url>/";</script>
```
It must run **before** `/ghost-homes/app.js`. No rebuild of the data bundle is needed. With it
set, the page uses MAR for the point; unset (or on any error), it uses Nominatim. Districts are
PIP either way.

## Notes

- **Cost/abuse:** a public Function URL that only proxies MAR reads. If you want a ceiling, put it
  behind the existing CloudFront (path `/api/geocode`) instead of a bare Function URL — same-origin,
  and you get CloudFront caching + WAF. That's the tidier production shape; the Function URL is the
  fast path to get it working.
- **Ship gate:** restrict `ALLOW_ORIGIN`, confirm step 4, and load-check before launch.
