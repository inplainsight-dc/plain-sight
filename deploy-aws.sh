#!/usr/bin/env bash
#
# Build and deploy In Plain Sight to S3 + CloudFront.
# Prereqs: AWS CLI configured (see AWS_SETUP.md) and the bucket + distribution
# already provisioned. Set IPS_BUCKET and IPS_CLOUDFRONT_ID first.
#
set -euo pipefail

BUCKET="${IPS_BUCKET:?Set IPS_BUCKET to your S3 bucket name, e.g. export IPS_BUCKET=inplainsight-dc}"
DIST_ID="${IPS_CLOUDFRONT_ID:?Set IPS_CLOUDFRONT_ID to your CloudFront distribution id}"

# This script builds from the WORKING TREE, not from HEAD — `npm run build` reads whatever is
# on disk. So an uncommitted edit ships to production silently, past the ship gate, with
# nothing looking wrong at any point. That is a real risk here: more than one session works in
# this repo, so the dirty file may not even be yours.
#
# Refuse by default. Override with IPS_ALLOW_DIRTY=1 when you genuinely mean to deploy
# uncommitted work (a hotfix you have not committed yet).
if git rev-parse --git-dir >/dev/null 2>&1 && [ -n "$(git status --porcelain)" ]; then
  echo "✗ Working tree is not clean — deploy builds from disk, so this would ship the changes below:"
  git status --short | sed 's/^/    /'
  echo ""
  echo "  Commit (or stash) first, or re-run with IPS_ALLOW_DIRTY=1 to deploy them deliberately."
  [ "${IPS_ALLOW_DIRTY:-0}" = "1" ] || exit 1
  echo "  IPS_ALLOW_DIRTY=1 set — continuing with uncommitted changes."
fi

echo "→ Deploying $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown') on branch $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
echo "→ Building static site..."
npm run build

echo "→ Syncing dist/ to s3://${BUCKET} ..."
# Hashed, content-addressed assets get a long immutable cache. HTML and the
# live data JSON are excluded here so they don't inherit the year-long cache.
# ghost-homes/* is excluded for the same reason as trash-data — those data filenames are NOT
# content-hashed, so a year-long immutable header would pin returning browsers to the old
# snapshot. The exception is ghost-homes/app.<hash>.js|css, which ARE fingerprinted: a change
# there is a new filename, so it is safe to cache forever and it reaches readers immediately.
# (Filters apply in order, so the later --include re-admits the hashed assets.)
aws s3 sync dist/ "s3://${BUCKET}" --delete \
  --exclude "*.html" --exclude "trash-data/*" --exclude "ghost-homes/*" --include "ghost-homes/app.*" \
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
# Ghost Homes DATA (data.json, the geojsons, assets.json): un-hashed names on a snapshot
# cadence. A day at the edge, revalidated after, so a new snapshot reaches people. The
# fingerprinted app.* assets are excluded here — they took the immutable header above.
aws s3 sync dist/ "s3://${BUCKET}" \
  --exclude "*" --include "ghost-homes/*" --exclude "ghost-homes/app.*" \
  --cache-control "public,max-age=86400,must-revalidate"

echo "→ Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id "${DIST_ID}" --paths "/*" >/dev/null

echo "✓ Deployed to https://inplainsight-dc.org"
