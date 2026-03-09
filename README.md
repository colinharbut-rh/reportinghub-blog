# Reporting Hub Blog

Static blog hosted on Cloudflare Pages. Migrated from Webflow.

## Structure

```
/blog/                        → Blog index (card grid)
/blog/[slug]/                 → Individual post pages
/assets/css/                  → Shared styles
/worker.js                    → Cloudflare Worker (routes /blog/* from main domain)
/wrangler.toml                → Worker deploy config
```

## Deploy

Push to `main` → GitHub Actions → Cloudflare Pages (automatic).

## Images

All images hosted on Cloudflare R2 at `images.thereportinghub.com`.

## Routing

A Cloudflare Worker intercepts `/blog/*` on `thereportinghub.com` and proxies
to this Pages deployment. All other paths pass through to Webflow unchanged.

## Adding a post

1. Create `blog/[slug]/index.html`
2. Commit and push to `main`
3. Live in ~30 seconds
