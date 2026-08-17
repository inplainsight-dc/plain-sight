// Sync the de-identified Ghost Homes bundle from the DC Short-Term Rentals research node
// into this repo (public/ghost-homes + src/ghost-homes-body.html) so Astro serves it.
// The research node (scripts/build_public_explorer.py) is the single source of truth; this
// repo holds a *generated copy* that is committed, so the site builds standalone.
//
// Runs automatically before every build (see package.json "build"). Also:
//   npm run sync-str
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const src = path.resolve(repo, '..', 'DC Short-Term Rentals and Housing', 'outputs', 'ghost-homes-bundle');
const pubDest = path.join(repo, 'public', 'ghost-homes');

// Data files keep stable names: app.js fetches them by name, and they turn over on the
// snapshot cadence, where a revalidating day cache is the right behavior.
// The CODE assets are content-fingerprinted by the research node, so their real filenames
// come from assets.json. A code change is then a NEW url — cacheable immutably and still
// visible to returning readers immediately. ghost-homes.astro reads the same manifest.
const dataFiles = ['data.json', 'clusters.geojson', 'anc.geojson', 'smd.geojson'];
const manifestFile = 'assets.json';
const bodyFile = 'ghost-homes-body.html';
const bodyDest = path.join(repo, 'src', bodyFile);
const isHashedAsset = (f) => /^app\.[0-9a-f]{8}\.(js|css)$/.test(f);

fs.mkdirSync(pubDest, { recursive: true });

if (!fs.existsSync(src)) {
  // Research node not present (e.g. an isolated CI checkout). Fall back to the committed
  // copy already in the repo — never fail the build.
  const manifestPath = path.join(pubDest, manifestFile);
  const haveData = dataFiles.every((f) => fs.existsSync(path.join(pubDest, f)));
  const haveAssets =
    fs.existsSync(manifestPath) &&
    Object.values(JSON.parse(fs.readFileSync(manifestPath, 'utf8'))).every((f) =>
      fs.existsSync(path.join(pubDest, f)),
    );
  if (haveData && haveAssets && fs.existsSync(bodyDest)) {
    console.log('[sync-str-data] research node not found; using committed copy');
    process.exit(0);
  }
  console.error('[sync-str-data] research node not found AND no committed copy — cannot build /ghost-homes');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(path.join(src, manifestFile), 'utf8'));
const assetFiles = Object.values(manifest);

let n = 0;
for (const f of [...dataFiles, ...assetFiles, manifestFile]) {
  const raw = fs.readFileSync(path.join(src, f));
  if (f.endsWith('.json') || f.endsWith('.geojson')) JSON.parse(raw.toString('utf8')); // validate
  fs.writeFileSync(path.join(pubDest, f), raw);
  n++;
}
fs.writeFileSync(bodyDest, fs.readFileSync(path.join(src, bodyFile)));
n++;

// Wave 5 R1 — /on-paper used to carry a hand-copied partial with no sync at
// all, so after a new snapshot /ghost-homes would update while it kept serving the
// old figures behind captions that state the snapshot date. Nothing would look
// wrong. It rides this sync now because it comes from the same research node.
//
// Its payload is INLINED in the partial (unlike Ghost Homes, which fetches
// data.json), so there is nothing else to copy and no cache-skew to manage.
const lmFile = 'on-paper-body.html';
const lmSrc = path.resolve(repo, '..', 'DC Short-Term Rentals and Housing', 'outputs', lmFile);
const lmDest = path.join(repo, 'src', lmFile);
if (fs.existsSync(lmSrc)) {
  const body = fs.readFileSync(lmSrc, 'utf8');
  // The partial is useless without its inlined payload; a truncated copy would
  // render an empty panel that still looks like a page.
  if (!body.includes('const D=') || !body.includes('lm-ladderbox')) {
    console.error(`[sync-str-data] ${lmFile} is present but missing its payload or markup`);
    process.exit(1);
  }
  fs.writeFileSync(lmDest, body);
  n++;
  console.log(`[sync-str-data] synced ${lmFile} (${body.length} bytes, payload inlined)`);
} else if (fs.existsSync(lmDest)) {
  console.log(`[sync-str-data] research node has no ${lmFile}; using committed copy`);
} else {
  console.error(`[sync-str-data] no ${lmFile} in the research node or the repo — cannot build /on-paper`);
  process.exit(1);
}

// Drop superseded hashed assets, and the pre-fingerprinting app.js / app.css, so neither the
// repo nor the bucket accumulates every past build.
for (const f of fs.readdirSync(pubDest)) {
  if ((isHashedAsset(f) && !assetFiles.includes(f)) || f === 'app.js' || f === 'app.css') {
    fs.unlinkSync(path.join(pubDest, f));
    console.log(`[sync-str-data] removed superseded asset ${f}`);
  }
}
console.log(`[sync-str-data] synced ${n} files from research node (${assetFiles.join(', ')})`);
