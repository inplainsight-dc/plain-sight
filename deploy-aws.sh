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
# HTML: short cache so updates show quickly. Hashed assets get a long cache.
aws s3 sync dist/ "s3://${BUCKET}" --delete \
  --exclude "*.html" \
  --cache-control "public,max-age=31536000,immutable"
aws s3 sync dist/ "s3://${BUCKET}" --delete \
  --exclude "*" --include "*.html" \
  --cache-control "public,max-age=300"

echo "→ Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id "${DIST_ID}" --paths "/*" >/dev/null

echo "✓ Deployed to https://inplainsight-dc.org"
