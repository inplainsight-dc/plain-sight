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

IF THIS FUNCTION 500s ON THE FIRST SUBMISSION, READ THIS FIRST.
The execution role needs **s3:ListBucket on the bucket**, and it is not about listing.
Without it, S3 answers a GetObject for a MISSING key with 403 AccessDenied instead of
404 NoSuchKey — so the "the inbox does not exist yet" branch in _load_versioned never
matches, and the very first POST fails with an Internal Server Error while validation and
the honeypot both appear to work. Diagnosed live on 2026-08-25; the grant is in
infra/feedback-setup.sh, which is gitignored like every infra/*.sh, hence this note here
in the file that IS tracked.

Do NOT "fix" that by catching AccessDenied here and treating it as an empty inbox. That
turns a transient permissions problem into "the file looked empty, so I replaced the whole
thing with one item" — which is the same class of bug the _load_versioned docstring below
already warns about. The setup script also seeds an empty object so the missing-key branch
is not on the normal path at all.
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
#
# REDTEAM F1 (2026-08-25). The first version simply refused everything past this cap,
# which meant anyone could permanently switch the feedback box off for about the price of
# an afternoon — and it failed SILENTLY from the inside, so the first anyone would know is
# when a person mentioned that their message never arrived. Three changes came out of that:
#
#   1. At the cap, evict the OLDEST ALREADY-DECIDED item to make room. A decided item has
#      served its purpose; a report that has just arrived has not. An item still marked
#      "open" is NEVER evicted — a real report must not be silently dropped to make room
#      for another one.
#   2. Suppress byte-identical repeats (see _is_repeat). A crude flood repeats itself, and
#      refusing repeats costs a real person nothing, because nobody sends the same sentence
#      twice by accident.
#   3. When it genuinely cannot accept — everything in the file is undecided — record
#      `full_since` in the object so `npm run feedback-check` can SAY SO. The failure stays
#      a failure; it stops being invisible.
MAX_ITEMS = 5000

# How far back to look for an identical message. Long enough to stop a flood, short enough
# that two people legitimately reporting the same broken page months apart both get through.
DEDUPE_WINDOW = 200

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


def _is_repeat(items, message):
    """Has this exact message already arrived recently? See MAX_ITEMS note 2."""
    m = message.strip()
    return any((it.get("message") or "").strip() == m for it in items[-DEDUPE_WINDOW:])


def _make_room(items):
    """Drop the oldest DECIDED item so a new report can land. Returns True if it freed a
    slot. Items still marked "open" are untouchable: evicting one would throw away a real
    person's report to make room for another, which is the failure this whole guard exists
    to prevent."""
    for i, it in enumerate(items):
        if it.get("status") and it["status"] != "open":
            del items[i]
            return True
    return False


def _append(record, attempts=6):
    """Concurrency-safe append. Two people writing at the same moment must not
    silently erase each other, which a naive read-modify-write does.

    Returns "ok" | "repeat" | "full"."""
    for i in range(attempts):
        obj, etag = _load_versioned({"items": []})
        items = obj.setdefault("items", [])

        if _is_repeat(items, record["message"]):
            return "repeat"

        if len(items) >= MAX_ITEMS and not _make_room(items):
            # Genuinely nothing to evict: the file is full of undecided reports. Refuse,
            # but leave a mark so the local check can surface it instead of it being silent.
            if not obj.get("full_since"):
                obj["full_since"] = record["received"]
                try:
                    _put_conditional(obj, etag)
                except ClientError:
                    pass  # best effort; refusing the write is what matters
            return "full"

        items.append(record)
        obj["updated"] = record["received"][:10]
        obj.pop("full_since", None)  # it accepted something, so it is not full any more
        try:
            _put_conditional(obj, etag)
            return "ok"
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

    outcome = _append(record)
    if outcome == "full":
        return _resp(503, {"ok": False, "error": "inbox full"})
    if outcome == "repeat":
        # Answer as though it landed. Telling a flood which of its messages were dropped
        # just teaches it to vary them, and a real person who double-clicked Send should
        # not be told off for it.
        return _resp(200, {"ok": True, "id": record["id"]})

    return _resp(200, {"ok": True, "id": record["id"]})
