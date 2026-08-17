import type { APIRoute } from 'astro';

/**
 * sitemap.xml — the list of pages we want Google (and other engines) to index.
 *
 * CURATED ON PURPOSE (not auto-globbed): this lets us ship in-development pages
 * to the live domain without inviting them into search results. Add a route here
 * only when it's ready to be *found*.
 *
 * Deliberately EXCLUDED right now:
 *   /almanac  — Civic Almanac scaffold is live-but-unlinked/in-dev (see ROADMAP 1.2);
 *               it goes in here when it passes the persona + neutrality waves and gets carded.
 *
 * Zero dependencies — just the routes we know. `changefreq`/`priority` are hints only.
 */
const ROUTES: { path: string; priority: number; changefreq: string }[] = [
  { path: '/',                     priority: 1.0, changefreq: 'weekly' },
  { path: '/rentals',              priority: 0.9, changefreq: 'monthly' },
  // The no-account front door for the four checklists below. Added 2026-08-17.
  { path: '/renter-checklists',    priority: 0.9, changefreq: 'monthly' },
  { path: '/rentals/rights',       priority: 0.9, changefreq: 'monthly' },
  { path: '/rentals/scam-check',   priority: 0.9, changefreq: 'monthly' },
  { path: '/rentals/lease-check',  priority: 0.9, changefreq: 'monthly' },
  { path: '/rentals/move-in',      priority: 0.9, changefreq: 'monthly' },
  { path: '/trash',                priority: 0.8, changefreq: 'weekly' },
  { path: '/records',              priority: 0.8, changefreq: 'monthly' },
  // Added at launch 2026-08-16. Unlike /almanac, Ghost Homes has passed its redteam/persona
  // waves and the ship gate, so it is meant to be found.
  { path: '/ghost-homes',          priority: 0.9, changefreq: 'monthly' },
];

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL('https://inplainsight-dc.org')).origin;
  // Trailing slash to match the <link rel="canonical"> Astro emits for each page,
  // so search engines see one agreed-upon URL, not two.
  const withSlash = (p: string) => (p === '/' ? p : p.endsWith('/') ? p : `${p}/`);
  const urls = ROUTES.map(
    (r) => `  <url>
    <loc>${origin}${withSlash(r.path)}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`
  ).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
