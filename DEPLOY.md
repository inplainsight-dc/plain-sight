# Deploying In Plain Sight

Target stack (same as the rest of the constellation): **private S3 bucket +
CloudFront + ACM certificate + Route 53**, optionally a CloudFront Function for
clean path routing.

## One domain, many tools — no new domain per project

This is the whole reason we chose **paths** over subdomains:

- You register **one** domain: `inplainsight-dc.org`.
- The hub serves at `/`, and every tool lives at a **path** under it:
  `/dc-laws`, `/citator`, and so on.
- One S3 bucket + one CloudFront distribution + one TLS certificate covers the
  hub **and** all its tools. Adding a tool adds a folder to the build, not a new
  domain, certificate, or distribution.

So you never buy a domain per project. New project = new path = $0 of new
hosting. (Other people's **forks** register their own `inplainsight-{city}.org`
— see FORKING.md — but that's them, not you.)

## First-time setup (AWS from zero)

Follow **AWS_SETUP.md** — copy it into this folder from the "DCMR but Better"
project. Its Phase 0 covers account creation, security/MFA, an IAM user, and
installing + configuring the AWS CLI. Later phases provision the bucket,
certificate, CloudFront distribution, and Route 53 records.

Once that's done, set two environment variables (the names from your setup):

```bash
export IPS_BUCKET="your-bucket-name"
export IPS_CLOUDFRONT_ID="your-distribution-id"
```

## Every deploy after that

```bash
./deploy-aws.sh
```

That script builds the static site and syncs it to S3, then invalidates the
CloudFront cache so the new version goes live. See the script for details.

## Adding a tool at a path later

When a tool (say the citator) is ready, build its static output into a
`/citator/` folder of the same bucket (or as a route in this Astro project), add
its card in `src/data/projects/`, and redeploy. Same bucket, same distribution,
same certificate.
