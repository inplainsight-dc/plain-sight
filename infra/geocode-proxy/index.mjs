// DC MAR geocode proxy — AWS Lambda (Node.js 20+, ESM). Deploy with a Function URL.
//
// Why this exists: DC's Master Address Repository (MAR) is the authoritative address ->
// Ward/ANC/SMD/cluster + lat-lon source, but it does NOT send CORS headers, so a browser
// can't call it directly. This tiny proxy calls MAR server-side and returns JSON with CORS.
//
// The Ghost Homes page uses this ONLY to turn a typed address into a lat/lon (and a nicer
// matched-address label). ANC/SMD/cluster are still derived client-side by point-in-polygon
// against the official 2023 boundaries — so a MAR field-name change can't silently break the
// district answer. If this proxy is down, the page falls back to OpenStreetMap Nominatim.
//
// GET  <function-url>?q=1350+Pennsylvania+Ave+NW  ->  { lat, lon, address, ward, anc, smd, cluster }

const MAR = "https://citizenatlas.dc.gov/newwebservices/locationverifier.asmx/findLocation2";
const ALLOW = process.env.ALLOW_ORIGIN || "*"; // set to https://inplainsight-dc.org before launch

export const handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": ALLOW,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=86400",
  };
  if (event?.requestContext?.http?.method === "OPTIONS") return { statusCode: 204, headers: cors };

  const q = (event?.queryStringParameters?.q || "").trim();
  if (!q) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "missing q" }) };

  try {
    const r = await fetch(`${MAR}?f=json&str=${encodeURIComponent(q)}`, { headers: { Accept: "application/json" } });
    const j = await r.json();
    const rows = j?.returnDataset?.Table1 || j?.Table1 || [];
    if (!rows.length) return { statusCode: 200, headers: cors, body: JSON.stringify({ match: null }) };

    const m = rows[0];
    // MAR field names vary by dataset version — map defensively. VERIFY on first deploy
    // (see README step 4) and trim these lists to the names your MAR actually returns.
    const pick = (...keys) => { for (const k of keys) if (m[k] != null && m[k] !== "") return m[k]; return null; };
    const out = {
      lat: Number(pick("LATITUDE", "Latitude", "LAT")),
      lon: Number(pick("LONGITUDE", "Longitude", "LON", "LONG")),
      address: pick("FULLADDRESS", "FULL_ADDRESS", "ADDRESS", "MARADDRESS"),
      ward: pick("WARD_2022", "WARD", "Ward"),
      anc: pick("ANC_2023", "ANC_ID", "ANC"),
      smd: pick("SMD_2023", "SMD_ID", "SMD"),
      cluster: pick("CLUSTER_2017", "NEIGHBORHOODCLUSTER", "CLUSTER"),
    };
    return { statusCode: 200, headers: cors, body: JSON.stringify(out) };
  } catch (e) {
    return { statusCode: 502, headers: cors, body: JSON.stringify({ error: "geocoder upstream failed" }) };
  }
};
