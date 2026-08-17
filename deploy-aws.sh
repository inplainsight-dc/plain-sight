#!/usr/bin/env bash
#
# Build and deploy In Plain Sight to S3 + CloudFront.
# Prereqs: AWS CLI configured (see AWS_SETUP.md) and the bucket + distribution
# already provisioned. Set IPS_BUCKET and IPS_CLOUDFRONT_ID first.
#
set -euo pipefail

BUCKET="${IPS_BUCKET:?Set IPS_BUCKET to your S3 bucket name, e.g. export IPS_BUCKET=inplainsight-dc}"
DIST_ID="${IPS_CLOUDFRONT_ID:?Set IPS_CLOUDFRONT_ID to your CloudFront distribution id}"

echo "→ Building static site..."
npm run build

echo "→ Syncing dist/ to s3://${BUCKET} ..."
# Hashed, content-addressed assets get a long immutable cache. HTML and the
# live data JSON are excluded here so they don't inherit the year-long cache.
# ghost-homes/* is excluded for the same reason as trash-data: the filenames are
# NOT content-hashed, so a year-long immutable header would pin returning browsers
# to the old snapshot until 2027 even after a redeploy + invalidation.
aws s3 sync dist/ "s3://${BUCKET}" --delete \
  --exclude "*.html" --exclude "trash-data/*" --exclude "ghost-homes/*" \
  --cache-control "public,max-age=31536000,immutable"
# HTML: short cache so page updates show quickly.
aws s3 sync dist/ "s3://${BUCKET}" \
  --exclude "*" --include "*.html" \
  --cache-control "public,max-age=300"
# Live data (alerts/reports): must update WITHOUT a redeploy, so short cache and
# force revalidation. The one-year immutable header here caused stale DPW alerts.
aws s3 sync dist/ "s3://${BUCKET}" \
  --exclude "*" --include "trash-data/*" \
  --cache-control "public,max-age=60,must-revalidate"
# Ghost Homes bundle (data.json, geojson, app.js/css): un-hashed names on a snapshot
# cadence. A day at the edge, revalidated after, so a new snapshot reaches people.
aws s3 sync dist/ "s3://${BUCKET}" \
  --exclude "*" --include "ghost-homes/*" \
  --cache-control "public,max-age=86400,must-revalidate"

echo "→ Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id "${DIST_ID}" --paths "/*" >/dev/null

echo "✓ Deployed to https://inplainsight-dc.org"
