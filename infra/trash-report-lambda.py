"""
Trash Tracker report endpoint.
GET  -> public, block-level reports JSON (what the page's neighbor-alert reads)
POST -> accept a report: validate, geocode to route, store full record
        privately, publish sanitized block-level record.

Storage (private S3 bucket, set via env DATA_BUCKET):
  private/reports.json  - full records incl. exact address + optional email (ANC eyes only)
  public/reports.json   - block-level only: date, route, day, block, what, status

No names, exact addresses, or contact details ever leave the private file.
"""
import json, os, re, time, uuid, urllib.parse, urllib.request
from datetime import datetime, timezone, timedelta

import boto3
from botocore.exceptions import ClientError

s3 = boto3.client("s3")
BUCKET = os.environ["DATA_BUCKET"]
GIS = "https://maps2.dcgis.dc.gov/dcgis/rest/services"
MAR = GIS + "/DCGIS_APPS/DCGIS_MAR/GeocodeServer/findAddressCandidates"
ROUTE = GIS + "/DCGIS_DATA/Public_Service_WebMercator/MapServer/28/query"

MAX = {"address": 120, "notes": 600, "email": 120}
ALLOWED_WHAT = {"Trash", "Recycling", "Food waste", "Yard waste"}

# CORS note: the API Gateway HTTP API in front of this Lambda MANAGES CORS —
# when a CORS config is set on the API, the gateway strips any Access-Control-*
# headers the Lambda returns and injects its own (see infra/trash-fix-cors.sh).
# So on the deployed path these headers are effectively redundant; they are kept
# only so the function also works if invoked directly (e.g. via a function URL).
# The part that actually matters for the browser is the OPTIONS -> 204 handler in
# handler(), which gives the preflight a 2xx response for the gateway to decorate.
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "3600",
}


# Read-only load for the GET path. Only a genuinely-absent object counts as
# "empty"; any other S3 error propagates rather than masquerading as an empty
# store (masking it here is what could turn a transient read error into data loss
# on the write path — see _update below).
def _load(key, default):
    try:
        return json.loads(s3.get_object(Bucket=BUCKET, Key=key)["Body"].read())
    except s3.exceptions.NoSuchKey:
        return default


def _load_versioned(key, default):
    """Return (obj, etag). etag is None when the object does not exist yet."""
    try:
        r = s3.get_object(Bucket=BUCKET, Key=key)
        return json.loads(r["Body"].read()), r["ETag"]
    except s3.exceptions.NoSuchKey:
        return default, None


def _put_conditional(key, obj, etag):
    """Write only if the object is unchanged since we read it (optimistic lock).
    etag=None means 'create only if still absent'. Requires a boto3/botocore new
    enough to support conditional PutObject (IfMatch added late 2024); Lambda
    runtimes from 2025 on carry it. Raises ClientError(PreconditionFailed) when
    another writer got there first."""
    kwargs = dict(Bucket=BUCKET, Key=key,
                  Body=json.dumps(obj, indent=1).encode(),
                  ContentType="application/json")
    if etag is None:
        kwargs["IfNoneMatch"] = "*"
    else:
        kwargs["IfMatch"] = etag
    s3.put_object(**kwargs)


# Codes S3 returns when our conditional write lost the race — safe to reload+retry.
_CONFLICT = {"PreconditionFailed", "ConditionalRequestConflict", "OperationAborted"}


def _update(key, default, mutate, attempts=6):
    """Concurrency-safe read-modify-write. `mutate(obj)` edits obj in place.
    Retries the whole cycle on a lost optimistic-lock race so two simultaneous
    reports can't clobber each other. Raises if it can't win within `attempts`."""
    for i in range(attempts):
        obj, etag = _load_versioned(key, default)
        mutate(obj)
        try:
            _put_conditional(key, obj, etag)
            return obj
        except ClientError as e:
            if e.response.get("Error", {}).get("Code") in _CONFLICT:
                time.sleep(min(0.4, 0.05 * (2 ** i)))  # brief backoff, then reload
                continue
            raise
    raise RuntimeError("conditional write to %s failed after %d attempts" % (key, attempts))


def _fetch_json(url):
    with urllib.request.urlopen(url, timeout=8) as r:
        return json.loads(r.read())


def geocode_route(address):
    """address -> (matched_label, route_id, day) or (None, None, None)"""
    q = urllib.parse.quote(address)
    g = _fetch_json(f"{MAR}?f=json&maxLocations=1&outSR=102100&SingleLine={q}")
    cands = g.get("candidates") or []
    if not cands or cands[0]["score"] < 70:
        return None, None, None
    loc = cands[0]["location"]
    r = _fetch_json(
        f"{ROUTE}?f=json&geometryType=esriGeometryPoint&inSR=102100"
        f"&geometry={loc['x']},{loc['y']}&outFields=ROUTE_ID,DAY_&returnGeometry=false")
    feats = r.get("features") or []
    rid = feats[0]["attributes"]["ROUTE_ID"] if feats else None
    day = feats[0]["attributes"]["DAY_"] if feats else None
    return cands[0]["address"], rid, day


def to_block(address):
    """'3114 SHERMAN AVENUE NW' -> '3100 block of SHERMAN AVENUE NW'"""
    m = re.match(r"\s*(\d+)\s+(.*)", address or "")
    if not m:
        return (address or "")[:MAX["address"]]
    num = int(m.group(1)) // 100 * 100
    return f"{num} block of {m.group(2)}"


def handler(event, _ctx):
    method = event.get("requestContext", {}).get("http", {}).get("method", "GET")

    # CORS preflight: the browser sends OPTIONS before any application/json POST.
    # The API Gateway $default route forward it here, so we answer it ourselves.
    if method == "OPTIONS":
        return _resp(204)

    if method == "GET":
        pub = _load("public/reports.json", {"updated": None, "reports": []})
        # only serve the last 30 days publicly
        cutoff = (datetime.now(timezone.utc) - timedelta(days=30)).date().isoformat()
        pub["reports"] = [r for r in pub["reports"] if r.get("date", "") >= cutoff]
        return _resp(200, pub)

    if method != "POST":
        return _resp(405, {"ok": False, "error": "method"})

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return _resp(400, {"ok": False, "error": "bad json"})

    # honeypot: real form leaves this empty
    if body.get("website"):
        return _resp(200, {"ok": True})

    address = str(body.get("address", ""))[:MAX["address"]].strip()
    what = [w for w in body.get("what", []) if w in ALLOWED_WHAT] or ["Trash"]
    date = str(body.get("date", ""))[:10]
    building = str(body.get("building", ""))[:40]
    notes = str(body.get("notes", ""))[:MAX["notes"]]
    wants_reply = bool(body.get("wantsReply"))
    email = str(body.get("email", ""))[:MAX["email"]].strip()
    device_loc = body.get("deviceLoc") or None

    if not address or not date:
        return _resp(400, {"ok": False, "error": "address and date required"})
    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return _resp(400, {"ok": False, "error": "bad date"})

    matched, route, day = None, None, None
    try:
        matched, route, day = geocode_route(address)
    except Exception:
        pass  # store anyway; geocoding is best-effort

    rid = uuid.uuid4().hex[:10]
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")

    private_record = {
        "id": rid, "received": now, "date": date, "address": address,
        "matched": matched, "route": route, "day": day, "what": what,
        "building": building, "notes": notes, "wantsReply": wants_reply,
        "email": email if wants_reply else "", "deviceLoc": device_loc,
        "status": "open",
    }
    _update("private/reports.json", {"reports": []},
            lambda o: o.setdefault("reports", []).append(private_record))

    public_record = {
        "id": rid, "date": date, "route": route, "day": day,
        "block": to_block(matched or address), "what": what,
        "status": "open", "source": "resident",
    }

    def _add_public(o):
        o.setdefault("reports", []).append(public_record)
        o["updated"] = now[:10]

    _update("public/reports.json", {"updated": None, "reports": []}, _add_public)

    return _resp(200, {"ok": True, "id": rid, "route": route, "day": day})


def _resp(code, obj=None):
    return {"statusCode": code,
            "headers": {"Content-Type": "application/json", **CORS},
            "body": "" if obj is None else json.dumps(obj)}
