// @ts-check
import { defineConfig } from 'astro/config';

// Plain Sight hub — static build, deployed to S3 + CloudFront (see DEPLOY.md).
// When the domain is confirmed, update `site` here AND src/config/site.ts.
export default defineConfig({
  site: 'https://inplainsight-dc.org', // TODO: confirm registrable, then keep in sync with src/config/site.ts
  // Projects live at paths under this one domain (e.g. /dc-laws), so no `base` needed.
});
