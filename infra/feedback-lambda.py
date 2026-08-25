"""
In Plain Sight — site feedback endpoint.

POST -> accept one piece of feedback: validate, store privately. That is all.

DELIBERATE DIVERGENCE FROM trash-report-lambda.py, which this is otherwise modeled on:
THERE IS NO PUBLIC GET. Trash reports are published block-level because neighbors
benefit from seeing them. Feedback is private. Publishing it would invite
spam-as-vandalism, hand a stranger a megaphone on somebody else's site, and expose
the words of people who wrote in expecting one reader. Write-only, or it stops being
a feedback box and becomes a comment section nobody asked for.

WHAT IS AND IS NOT STORED
Stored:     page path, category, message, an optional email the person typed in
            on purpose, and a received timestamp.
NOT stored: IP address, user agent, referrer, any fingerprint, anything the browser
            volunteers. The site's whole posture is that it does not watch people,
            and a feedback box is the one place that could quietly become tracking.
            If you are ever tempted to log the IP "just for abuse control" — the
            throttle, the honeypot and the item cap are the abuse controls, and they
            do not cost anyone their anonymity.

Storage (private S3 bucket, env DATA_BUCKET):
  private/feedback.json  - the whole inbox. Read by `npm run feedback` from Pippa's
                           machine. Never served by this function.
"""
import json, os, re, time, uuid
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError

s3 = boto3.client("s3")
BUCKET = os.environ["DATA_BUCKET"]
KEY = "private/feedback.json"

MAX = {"message": 2000, "email": 120, "page": 120}
MIN_MESSAGE = 4

# An allow-list, not free text: an unbounded category is a free-form field with extra
# steps, and the review page groups on this.
ALLOWED_CATEGORY = {
    "wrong",        # something here is factually wrong
    "broken",       # something does not work
    "confusing",    # could not follow it
    "missing",      # a tool or a jurisdiction that should exist
    "other",
}

# Storage ceiling. A flood that gets past the throttle and the honeypot should cost a
# rejected request, not an unbounded S3 object that gets slower and dearer to read every
# time. 5,000 is far beyond any plausible real volume for this site.
MAX_ITEMS = 5000

CORS = {
    "Access-Control-Allow-Origin": os.environ.get("ALLOW_ORIGIN", "https://inplainsight-dc.org"),
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "3600",
}
# NOTE, same trap as the trash function: when CORS is configured on the API Gateway HTTP
# API, the gateway STRIPS these and injects its own. The real allow-list lives on the API
# (see feedback-setup.sh). These are kept only so direct invocation still behaves.

_CONFLICT = {"PreconditionFailed", "ConditionalRequestConflict", "OperationAborted"}


def _load_versioned(default):
    """Return (obj, etag). etag is None when the object does not exist yet.
    Only a genuinely-absent object counts as empty — any other S3 error propagates
    rather than masquerading as an empty inbox, which is what would let a transient
    read error overwrite everything already in it."""
    try:
        r = s3.get_object(Bucket=BUCKET, Key=KEY)
        return json.loads(r["Body"].read()), r["ETag"]
    except s3.exceptions.NoSuchKey:
        return default, None


def _put_conditional(obj, etag):
    kwargs = dict(Bucket=BUCKET, Key=KEY,
                  Body=json.dumps(obj, indent=1).encode(),
                  ContentType="application/json")
    if etag is None:
        kwargs["IfNoneMatch"] = "*"
    else:
        kwargs["IfMatch"] = etag
    s3.put_object(**kwargs)


def _append(record, attempts=6):
    """Concurrency-safe append. Two people writing at the same moment must not
    silently erase each other, which a naive read-modify-write does."""
    for i in range(attempts):
        obj, etag = _load_versioned({"items": []})
        items = obj.setdefault("items", [])
        if len(items) >= MAX_ITEMS:
            return False
        items.append(record)
        obj["updated"] = record["received"][:10]
        try:
            _put_conditional(obj, etag)
            return True
        except ClientError as e:
            if e.response.get("Error", {}).get("Code") in _CONFLICT:
                time.sleep(min(0.4, 0.05 * (2 ** i)))
                continue
            raise
    raise RuntimeError("conditional write to %s failed after %d attempts" % (KEY, attempts))


def _resp(code, obj=None):
    return {"statusCode": code,
            "headers": {"Content-Type": "application/json", **CORS},
            "body": "" if obj is None else json.dumps(obj)}


def handler(event, _ctx):
    method = event.get("requestContext", {}).get("http", {}).get("method", "GET")

    if method == "OPTIONS":
        return _resp(204)
    if method != "POST":
        # No read side by design — see the module docstring.
        return _resp(405, {"ok": False, "error": "method"})

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return _resp(400, {"ok": False, "error": "bad json"})

    # Honeypot: a real form leaves this empty. Answer 200 so a bot cannot tell it failed.
    if body.get("website"):
        return _resp(200, {"ok": True})

    message = str(body.get("message", ""))[:MAX["message"]].strip()
    category = str(body.get("category", "other"))
    page = str(body.get("page", ""))[:MAX["page"]].strip()
    email = str(body.get("email", ""))[:MAX["email"]].strip()

    if category not in ALLOWED_CATEGORY:
        category = "other"
    if len(message) < MIN_MESSAGE:
        return _resp(400, {"ok": False, "error": "message too short"})
    # Only ever store a path from our own site, never an arbitrary attacker-supplied URL
    # that a reviewer might later click out of the review page.
    if not re.match(r"^/[A-Za-z0-9/_-]*$", page or "/"):
        page = "/"
    # Not validation for its own sake: an unparseable address is one nobody can reply to,
    # so storing it just keeps a stranger's typo forever.
    if email and not re.match(r"^[^@\s]+@[^@\s.]+\.[^@\s]+$", email):
        email = ""

    record = {
        "id": uuid.uuid4().hex[:10],
        "received": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "page": page or "/",
        "category": category,
        "message": message,
        "email": email,
        "status": "open",
    }

    if not _append(record):
        return _resp(503, {"ok": False, "error": "inbox full"})

    return _resp(200, {"ok": True, "id": record["id"]})
