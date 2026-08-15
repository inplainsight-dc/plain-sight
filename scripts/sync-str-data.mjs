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

// filename -> destination directory
const pubFiles = ['data.json', 'clusters.geojson', 'anc.geojson', 'smd.geojson', 'app.js', 'app.css'];
const bodyFile = 'ghost-homes-body.html';
const bodyDest = path.join(repo, 'src', bodyFile);

fs.mkdirSync(pubDest, { recursive: true });

if (!fs.existsSync(src)) {
  // Research node not present (e.g. an isolated CI checkout). Fall back to the committed
  // copy already in the repo — never fail the build.
  const haveAll = pubFiles.every((f) => fs.existsSync(path.join(pubDest, f))) && fs.existsSync(bodyDest);
  if (haveAll) {
    console.log('[sync-str-data] research node not found; using committed copy');
    process.exit(0);
  }
  console.error('[sync-str-data] research node not found AND no committed copy — cannot build /ghost-homes');
  process.exit(1);
}

let n = 0;
for (const f of pubFiles) {
  const raw = fs.readFileSync(path.join(src, f));
  if (f.endsWith('.json') || f.endsWith('.geojson')) JSON.parse(raw.toString('utf8')); // validate
  fs.writeFileSync(path.join(pubDest, f), raw);
  n++;
}
fs.writeFileSync(bodyDest, fs.readFileSync(path.join(src, bodyFile)));
n++;
console.log(`[sync-str-data] synced ${n} files from research node`);
