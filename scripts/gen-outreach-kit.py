#!/usr/bin/env python3
"""
gen-outreach-kit.py — build kit/spread-the-word.html, a print-ready flyer set.

WHY: the tools are live but invisible. This is the analog distribution channel —
something Philippa can print and pin to a community board (library, laundromat,
rec center, tenant clinic, ANC meeting) so people who never search for these
tools still find them. Each flyer has a QR to the live tool + tear-off tabs.

HOW: QR codes are generated OFFLINE with segno (pure-Python, zero deps) and
inlined as SVG, so the file is fully self-contained — no external calls, nothing
phones home. Opens and prints from anywhere. Brand fallback fonts (Georgia /
system sans / mono) so it looks right with no font files to ship.

RUN:  ./.venv/bin/python scripts/gen-outreach-kit.py
OUT:  kit/spread-the-word.html   (open in a browser → Print → one flyer per page)

Every QR points at a verified-live https://inplainsight-dc.org/... URL.
"""
import io
import os
import segno

BASE = "https://inplainsight-dc.org"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "kit", "spread-the-word.html")

INK = "#1a2438"
RED = "#E81B39"

# --- The flyers -------------------------------------------------------------
# hero: True flyers lead the deck (broadest utility / strongest hook).
TOOLS = [
    {
        "path": "/rentals/move-in", "hero": True,
        "eyebrow": "IN PLAIN SIGHT · RENTALS",
        "headline": "Getting your deposit back starts on move-in day.",
        "who": "For anyone renting in DC, Maryland, or Virginia.",
        "bullets": [
            "A room-by-room condition record — your evidence against an “as-is” damage charge.",
            "How your deposit legally has to come back, keyed to your state.",
            "A move-in checklist to fill in on your phone as you walk the unit — or print and carry.",
        ],
    },
    {
        "path": "/rentals/rights", "hero": True,
        "eyebrow": "IN PLAIN SIGHT · RENTALS",
        "headline": "Know your rights as a renter.",
        "who": "For anyone renting in DC, Maryland, or Virginia.",
        "bullets": [
            "The deposit cap and rules for your state, in plain language.",
            "What a landlord can — and can’t — legally ask you for.",
            "Calm, sourced lines to send back when something’s off.",
        ],
    },
    {
        "path": "/rentals/scam-check", "hero": False,
        "eyebrow": "IN PLAIN SIGHT · RENTALS",
        "headline": "Is this rental a scam? Check before you send money.",
        "who": "For anyone apartment-hunting in DC, Maryland, or Virginia.",
        "bullets": [
            "The red flags that give a fake listing away.",
            "The safe way to pay — and how to verify a landlord without touring.",
            "What to do if you’ve already sent money.",
        ],
    },
    {
        "path": "/rentals/lease-check", "hero": False,
        "eyebrow": "IN PLAIN SIGHT · RENTALS",
        "headline": "Read your lease before you sign it.",
        "who": "For anyone about to sign a lease in DC, Maryland, or Virginia.",
        "bullets": [
            "Which clauses are illegal and which just won’t hold up.",
            "Which terms are worth negotiating — and the exact ask to send back.",
            "Keyed to DC, Maryland, or Virginia law.",
        ],
    },
    {
        "path": "/records", "hero": False,
        "eyebrow": "IN PLAIN SIGHT · RECORDS",
        "headline": "DC public records, made searchable.",
        "who": "For residents, researchers, and reporters.",
        "bullets": [
            "How long the District must keep each kind of record.",
            "When a record can be destroyed — or sent to the Archives.",
            "Browsable, filterable, free to download. No login.",
        ],
    },
    {
        "path": "/trash", "hero": False,
        "eyebrow": "IN PLAIN SIGHT · TRASH",
        "headline": "When’s my trash & recycling day?",
        "who": "Now piloting in ANC 1E03 (Columbia Heights).",
        "bullets": [
            "Look up your collection day in seconds.",
            "See live DPW delays and holiday changes.",
            "Report a missed pickup.",
        ],
    },
]

HUB = {
    "path": "", "eyebrow": "IN PLAIN SIGHT · WASHINGTON, DC",
    "headline": "Free civic tools that make the fine print readable.",
    "who": "Built for DC residents, by a DC resident.",
    "bullets": [
        "Renting: know your rights, spot scams, read a lease, protect your deposit.",
        "DC public records — what the city keeps, and for how long.",
        "Trash & recycling day lookup. More tools always on the way.",
    ],
}


def qr_svg(url: str, scale: int = 10) -> str:
    """Inline SVG QR, brand-ink modules on white, sturdy error correction.

    segno emits `<svg width="N" height="N">` with no viewBox, which CSS can't
    scale cleanly. We rewrite that to a viewBox so a single QR string can be
    sized by CSS to any dimension (big flyer code AND tiny tear-off code)."""
    buf = io.BytesIO()
    segno.make(url, error="q").save(
        buf, kind="svg", scale=scale, border=2,
        dark=INK, light="#ffffff", xmldecl=False, svgns=True, svgclass=None, lineclass=None,
    )
    svg = buf.getvalue().decode("utf-8")
    import re
    m = re.search(r'<svg[^>]*\bwidth="(\d+(?:\.\d+)?)"[^>]*\bheight="(\d+(?:\.\d+)?)"', svg)
    if m:
        w, h = m.group(1), m.group(2)
        svg = svg.replace(
            f'width="{w}" height="{h}"',
            f'viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid meet"', 1,
        )
    return svg


def short(path: str) -> str:
    return "inplainsight-dc.org" + path


def tear_tabs(url: str, path: str, n: int = 8) -> str:
    """A row of tear-off cards, each a wallet-sized keeper: the SAME QR as the
    flyer, so someone can take a tab now and scan the tool later."""
    mini = qr_svg(url, scale=6)
    tab = (
        '<div class="tab">'
        f'<div class="tab-qr">{mini}</div>'
        '<span class="tab-brand">In Plain Sight</span>'
        f'<span class="tab-url">{short(path)}</span>'
        '</div>'
    )
    label = '<div class="tabs-cue">✂ Tear off a code to keep &mdash;</div>'
    return label + '<div class="tabs">' + "".join(tab for _ in range(n)) + "</div>"


def flyer(t: dict, hero: bool = False) -> str:
    url = BASE + t["path"]
    bullets = "".join(f"<li>{b}</li>" for b in t["bullets"])
    cls = "flyer hero" if hero else "flyer"
    return f"""
  <section class="{cls}">
    <div class="rule-top"></div>
    <div class="body">
      <div class="text">
        <p class="eyebrow">{t['eyebrow']}</p>
        <h2 class="headline">{t['headline']}</h2>
        <p class="who">{t['who']}</p>
        <ul class="bullets">{bullets}</ul>
      </div>
      <div class="scan">
        <div class="qr">{qr_svg(url)}</div>
        <p class="scan-label">Point your phone camera here</p>
        <p class="scan-url">{short(t['path'])}</p>
      </div>
    </div>
    <p class="trust">Free · No account · No app to download · Nothing you type leaves your phone</p>
    <p class="foot">A free civic tool made by a DC resident. Not a government website. Not legal advice.</p>
    {tear_tabs(url, t['path'])}
  </section>"""


CSS = """
  :root{ --ink:#1a2438; --soft:#515a70; --red:#E81B39; --line:#d9d2c4; --paper:#fbf7f0; }
  *{ box-sizing:border-box; }
  html,body{ margin:0; padding:0; color:var(--ink);
    font-family:'Public Sans', system-ui,-apple-system,'Segoe UI',sans-serif; }
  body{ background:var(--paper); }
  .cover{ max-width:760px; margin:0 auto; padding:48px 32px; }
  .cover h1{ font-family:Georgia,'Times New Roman',serif; font-size:2.4rem; margin:0 0 .3rem; }
  .cover .lede{ font-size:1.15rem; color:var(--soft); margin:.2rem 0 1.4rem; }
  .cover h3{ font-family:Georgia,serif; margin:1.6rem 0 .4rem; }
  .cover ol,.cover ul{ line-height:1.6; padding-left:1.2rem; }
  .cover code{ font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace; background:#efe7d7;
    padding:.05rem .35rem; border-radius:3px; font-size:.9em; }
  .cover .redbar{ height:8px; background:var(--red); margin-bottom:1.5rem; }

  .flyer{ background:#ffffff; width:8.5in; min-height:11in; margin:24px auto; padding:0.7in 0.75in 0.35in;
    border:1px solid var(--line); display:flex; flex-direction:column; }
  .rule-top{ height:12px; background:var(--red); margin:-0.7in -0.75in 0.5in; }
  .body{ display:flex; gap:0.5in; align-items:flex-start; flex:0 0 auto; }
  .text{ flex:1 1 auto; }
  .eyebrow{ font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace; color:var(--red);
    letter-spacing:.18em; font-size:.8rem; margin:0 0 .6rem; }
  .headline{ font-family:Georgia,'Times New Roman',serif; font-weight:700; color:var(--ink);
    font-size:2.5rem; line-height:1.08; margin:0 0 .5rem; }
  .hero .headline{ font-size:2.9rem; }
  .who{ color:var(--soft); font-size:1.05rem; margin:.2rem 0 1rem; }
  .bullets{ margin:.4rem 0 0; padding-left:1.1rem; line-height:1.5; font-size:1.12rem; }
  .bullets li{ margin:.5rem 0; }
  .scan{ flex:0 0 2.3in; text-align:center; }
  .qr{ width:2.1in; margin:0 auto; }
  .qr svg{ width:2.1in; height:2.1in; display:block; }
  .scan-label{ font-size:.9rem; color:var(--soft); margin:.4rem 0 .1rem; }
  .scan-url{ font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace; color:var(--red);
    font-weight:600; font-size:.85rem; margin:.1rem 0 0; word-break:break-all; }
  .trust{ margin-top:auto; padding-top:1rem; font-size:.95rem; color:var(--ink);
    font-weight:600; border-top:1px solid var(--line); }
  .foot{ font-size:.8rem; color:var(--soft); margin:.2rem 0 .5rem; }

  .tabs-cue{ font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace; font-size:.72rem;
    color:var(--soft); margin:.5rem 0 .15rem; }
  .tabs{ display:flex; gap:0; border-top:1px dashed var(--line); }
  .tab{ flex:1 1 0; border-right:1px dashed var(--line); padding:.35rem .18rem .3rem;
    text-align:center; display:flex; flex-direction:column; align-items:center; gap:.12rem; }
  .tab:last-child{ border-right:none; }
  .tab-qr{ width:0.82in; }
  .tab-qr svg{ width:0.82in; height:0.82in; display:block; }
  .tab-brand{ font-family:Georgia,serif; font-weight:700; font-size:.6rem; line-height:1;
    color:var(--ink); }
  .tab-url{ font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace; font-size:.5rem;
    line-height:1.15; color:var(--red); word-break:break-all; }

  @media print{
    @page{ size:letter; margin:0.4in; }
    body{ background:#fff; }
    .cover{ display:none; }
    .flyer{ margin:0; border:none; width:auto; min-height:auto; height:10.2in;
      padding:0.4in 0.5in 0.2in; page-break-after:always; }
    .rule-top{ margin:-0.4in -0.5in 0.4in; }
  }
"""


def build() -> str:
    cover = f"""
  <div class="cover">
    <div class="redbar"></div>
    <h1>Spread the word</h1>
    <p class="lede">A print-ready flyer kit for the In Plain Sight tools. Every code below
      points at a live, free tool — no account, no app, nothing leaves the reader's phone.</p>

    <h3>How to use it</h3>
    <ol>
      <li><strong>Print it.</strong> Use your browser's Print (⌘P / Ctrl-P). Each flyer prints on its own page — plain black-and-white is fine and scans just as well.</li>
      <li><strong>Post it.</strong> Community boards work best: libraries, laundromats, rec centers, coffee shops, tenant clinics, mutual-aid pantries, your building lobby, an ANC meeting.</li>
      <li><strong>Tear-off tabs.</strong> The strip along the bottom is pre-cut lines — snip up between them so people can take a tab with the address.</li>
      <li><strong>Test the code</strong> with your own phone camera before you post, so you know it lands where you expect.</li>
    </ol>

    <h3>What's inside</h3>
    <ul>
      <li>A whole-family poster (links to the hub).</li>
      <li>One flyer each: deposit/move-in, renter rights, scam check, lease check, DC records, and trash/recycling.</li>
    </ul>

    <h3>A note on honesty</h3>
    <p>These say plainly: a free civic tool, not a government site, not legal advice. Keep that line —
      it's what makes them trustworthy on a wall next to everything else.</p>
    <p class="lede" style="margin-top:1.5rem;font-size:.95rem;">Generated by <code>scripts/gen-outreach-kit.py</code> · regenerate any time the tools change.</p>
  </div>"""

    flyers = flyer(HUB, hero=True)
    for t in TOOLS:
        flyers += flyer(t, hero=t.get("hero", False))

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Spread the word · In Plain Sight outreach kit</title>
<style>{CSS}</style>
</head>
<body>
{cover}
{flyers}
</body>
</html>
"""


os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    f.write(build())
print(f"✓ gen-outreach-kit: wrote {len(TOOLS)+1} flyers → kit/spread-the-word.html")
