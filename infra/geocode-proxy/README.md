# Ghost Homes — DC MAR geocode proxy

A ~40-line AWS Lambda that lets the browser use DC's authoritative address geocoder (the
Master Address Repository) without the CORS wall. **The page works without this** — it falls
back to OpenStreetMap Nominatim — but MAR gives better DC address matching and no third-party
rate limit.

---

## ✅ DEPLOYED 2026-08-16 — live and wired into the page

| Thing | Value |
|---|---|
| Lambda | `ghost-homes-geocode` · Node.js 22.x · 128 MB · 6 s timeout |
| Execution role | `ghost-homes-geocode-role` (CloudWatch logs only — least privilege) |
| **Public endpoint** | `https://0kxgfnzlzk.execute-api.us-east-1.amazonaws.com/` |
| API Gateway | HTTP API `ghost-homes-geocode-api` · id `0kxgfnzlzk` · `$default` stage |
| Throttle | 5 req/s sustained, burst 10 (the cost/abuse ceiling) |
| CORS allow-list | `https://inplainsight-dc.org`, `https://www.inplainsight-dc.org` |
| Wired in | `src/pages/ghost-homes.astro` → `window.GHOST_GEOCODER_PROXY` |

**Field check (README step 4) — PASSED.** `?q=1350+Pennsylvania+Ave+NW` returns
`lat 38.89500269 · lon -77.03135287 · "1350 PENNSYLVANIA AVENUE NW" · Ward 2 · ANC 2C · SMD 2C03`.
`cluster` comes back null, which is fine — the page derives cluster by point-in-polygon and only
uses the proxy's lat/lon + label. No `pick(...)` trimming was needed.

### Why API Gateway and not a Function URL

The runbook below originally said "Lambda Function URL." **That does not work on this account.**
A Function URL with `AuthType: NONE` returned `403 Forbidden` on every anonymous request despite a
textbook-correct resource policy (`Principal: "*"`, `lambda:InvokeFunctionUrl`, the
`FunctionUrlAuthType: NONE` condition), across two freshly created URL configs, with no
Organization or SCP in play. Requests never reached the function — no log entries — so it is
blocked at the authorization layer. This account still carries the unproven-account posture (Lambda
concurrency capped at **10**, vs the usual 1000), and public Function URLs appear to be restricted
alongside it. An HTTP API in front of the same Lambda is not subject to that restriction, keeps the
proxy fully isolated from the live CloudFront distribution, and adds a throttle — a better cost
lever than the Lambda reserved-concurrency setting, which this account's quota also refuses.

The unusable Function URL config and its public-invoke permission were both deleted, so there is no
orphaned public surface.

### Two gotchas for whoever touches this next

- **API Gateway ignores CORS headers from the Lambda.** Configuring CORS on an HTTP API means
  API Gateway strips and replaces whatever the integration returns. So the `ALLOW_ORIGIN`
  environment variable on the function is now inert — **the real control is the API's
  `--cors-configuration`.** Change the allow-list there, not in the env var.
- **The Lambda sends `Cache-Control: public, max-age=86400`.** Repeat lookups of the same address
  are served from the browser cache without a network request, which will fool you into thinking
  CORS changes have not taken effect. Test with an address you have not queried before.

### To change the CORS allow-list

```bash
aws apigatewayv2 update-api --api-id 0kxgfnzlzk \
  --cors-configuration 'AllowOrigins=https://inplainsight-dc.org,https://www.inplainsight-dc.org,AllowMethods=GET,MaxAge=86400'
```

---

## Original runbook (kept for reference / rebuilding elsewhere)

> The Function URL steps below are **superseded** by the API Gateway deployment above on this
> account. They remain valid on an account without the public-Function-URL restriction.

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
