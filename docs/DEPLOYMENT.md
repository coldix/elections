# Deployment — Cloudflare Pages

The site is a static build deployed from GitHub to Cloudflare Pages. No Workers,
no D1, no R2 — see [DECISIONS.md](DECISIONS.md) ADR-2.

## Build pipeline

`npm run build` runs three steps in order, and stops at the first failure:

1. `npm run validate` — schema, controlled vocabulary, referential integrity and
   **mandatory sources**. A record without a valid source fails the build.
2. `npm run export` — writes JSON + CSV to `site/public/data/<election>/`.
3. `astro build --root site` — builds the site to `site/dist/`.

Because step 1 gates the rest, an invalid or unsourced record can never reach
production: the build fails and Cloudflare keeps serving the previous deploy.

### Output directories

| Path | What | In git? |
|---|---|---|
| `data/` | YAML source of truth | yes |
| `site/public/data/` | generated JSON + CSV, served at `/data/...` | no (gitignored) |
| `site/dist/` | built site — the Pages output directory | no (gitignored) |

The exports live inside `site/public/` so the same deploy publishes both the
human-readable site and the machine-readable data. They no longer collide with
Astro's own output.

## Cloudflare Pages settings

Create a Pages project connected to the GitHub repository `coldix/elections`.

| Setting | Value |
|---|---|
| Project name | `elections` |
| Production branch | `main` |
| Framework preset | None (or Astro — the explicit values below take precedence) |
| Build command | `npm run build` |
| Build output directory | `site/dist` |
| Root directory | *(leave blank — repo root)* |
| Environment variable | `NODE_VERSION` = `22` |

Preview deployments: enable for all non-production branches and pull requests.
Every PR then gets its own URL, so data changes can be reviewed visually before
merge.

No secrets, API tokens or environment bindings are required. The build reads
only files in the repository.

## Custom domain

Target: **`elections.oze.net.au`**

1. In the Pages project → *Custom domains* → *Set up a custom domain*.
2. Enter `elections.oze.net.au`.
3. If the `oze.net.au` zone is in the same Cloudflare account, Cloudflare
   creates the CNAME automatically. Otherwise add a CNAME record manually:
   `elections` → `<project>.pages.dev`, proxied.

Then set `site:` in [`site/astro.config.mjs`](../site/astro.config.mjs) to match
the final hostname if it ever changes — it drives canonical URLs, the sitemap
and Open Graph tags.

### ⚠ Confirm the zone before starting

The Cloudflare account is known to hold **`ozol.net.au`**. This project is
specified to publish at **`elections.oze.net.au`** — a different apex domain.
Before creating the custom domain, confirm that the `oze.net.au` zone exists in
the same Cloudflare account. If it does not, either add that zone or decide on
the final hostname, then update `site` in the Astro config, `SITE.url` in
[`site/src/lib/site.mjs`](../site/src/lib/site.mjs), and the `Sitemap:` line in
[`site/public/robots.txt`](../site/public/robots.txt).

## Recommended after first deploy

- **Caching.** Pages defaults are fine. The data files are small; if you later
  want longer edge caching, add a `_headers` file — but keep `/data/*` short
  enough that a merged correction is visible quickly.
- **Build watch paths.** Optional. If Pages builds get noisy, restrict them to
  `data/`, `site/`, `scripts/` and `package*.json`.

## Local development

```bash
npm install
npm run dev      # validates, exports, then serves at http://localhost:4321
npm run build    # full production build
npm run preview  # serve the production build locally
```
