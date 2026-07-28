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

## Order of operations

Working from nothing, do it in this order — each step depends on the one above:

1. Add both domains to Cloudflare and repoint nameservers (§ Domains, step 0)
2. Create the Pages project from GitHub (§ Cloudflare Pages settings)
3. Attach `electiontracker.au` as a custom domain (§ Domains, step 1)
4. Add the `.com.au` redirect rule (§ Domains, step 2)
5. Add Google Workspace MX/SPF/DKIM/DMARC to both zones (§ Email)

Steps 1 and 2 are independent of each other; 3 needs both.

## Cloudflare project settings

Cloudflare now routes new projects through **Workers Builds** rather than
Pages. Either works. The repo is configured for the Workers flow, because that
is what the dashboard offers by default.

The site deploys as an **assets-only Worker** — [`wrangler.jsonc`](../wrangler.jsonc)
points at `site/dist` and has no `main` entry point, so no code runs per
request. It is static hosting on the Workers platform, not a server. See
DECISIONS.md ADR-2.

Connect to the GitHub repository `coldix/elections`, then:

| Field | Value |
|---|---|
| Project name | `elections` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Builds for non-production branches | ✅ enabled |
| Non-production branch deploy command | `npx wrangler versions upload` |
| Path | `/` (repo root — `package.json` lives there) |
| API token | *Create new token* — let Cloudflare generate it |
| API token name | leave blank, or `elections-builds` |
| Variable name | `NODE_VERSION` |
| Variable value | `22` |

`NODE_VERSION` is belt-and-braces: [`.node-version`](../.node-version) pins the
same value and is respected by both Workers Builds and Pages.

Leave *Encrypt* off — `22` is not a secret. No other variables or bindings are
needed; the build only reads files in the repository.

Non-production branch builds give every PR its own preview URL, so data changes
can be reviewed visually before merge.

### If you use the Pages flow instead

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `site/dist` |
| Root directory | *(blank)* |
| Environment variable | `NODE_VERSION` = `22` |

Pages ignores `wrangler.jsonc` for static output; the file is harmless either
way.

## Domains

| Domain | Role |
|---|---|
| `electiontracker.au` | **Canonical.** Serves the site. |
| `electiontracker.com.au` | Redirect only. 301s to the matching path on the canonical domain. |

Both sit in the dedicated Cloudflare account (`col@oze.com.au`, Super Admin).

Everything below is done at **https://dash.cloudflare.com**, signed in as
`col@oze.com.au` — except step 0b, which is at the registrar where the domains
were purchased.

### 0. Get both domains into Cloudflare first

Nothing else works until Cloudflare is authoritative for DNS. Do this once per
domain, for **both** `electiontracker.au` and `electiontracker.com.au`.

**0a. Add the zone.** Dashboard → *Add a site* → enter the domain → choose the
**Free** plan. Cloudflare scans for existing records (freshly registered
domains will have none or a parking record) and then shows you **two
nameservers**, e.g. `ada.ns.cloudflare.com` / `rex.ns.cloudflare.com`. The pair
can differ between the two domains — copy each one separately, don't assume
they match.

**0b. Repoint the nameservers at the registrar.** Log in wherever the domains
were bought, find *Nameservers* / *DNS settings* for the domain, replace the
registrar's defaults with Cloudflare's two, save. Repeat for the second domain.

**0c. Wait for activation.** Cloudflare emails you and the zone flips from
*Pending* to **Active**, usually minutes to a few hours. Both zones must be
Active before the custom domain and redirect steps will work.

> These are newly registered domains with nothing running on them, so moving
> nameservers breaks nothing. If a domain already had live email or a website,
> moving nameservers would move DNS control and could interrupt it — recreate
> those records in Cloudflare *before* switching.

### 1. Canonical domain — attach to the Worker

1. Worker → *Settings* → *Domains & Routes* → *Add* → *Custom domain*.
2. Enter `electiontracker.au`.
3. With the zone in the same account, Cloudflare creates the DNS record itself.
   Nothing needs adding by hand — the apex A/AAAA records appear automatically
   and will not show in a zone-file export taken beforehand.
4. `www` is **not** created. If you want `www.electiontracker.au` to work, add
   it the same way the `.com.au` is handled below: a proxied `AAAA` `www` →
   `100::` plus a redirect rule to the apex. Leaving it off is a legitimate
   choice — plenty of sites are apex-only — but then the hostname simply does
   not resolve.

### 2. Second domain — redirect, do NOT attach to the Worker

Adding `electiontracker.com.au` as a second custom domain would serve the whole
site twice on two hostnames. That splits search ranking between them and gives
crawlers two competing copies of the same records — the opposite of what a
citable reference site wants. Redirect it at the edge instead, so it never
serves a byte of content.

In the `electiontracker.com.au` zone:

1. **DNS** — a redirect rule only fires if a *proxied* record exists for the
   hostname, but that record must not point at a real origin.

   **First delete whatever Cloudflare imported when it scanned the zone.** A
   freshly registered domain usually arrives carrying the registrar's parking
   or forwarding records. Here that was four `A` records (apex ×2, `www` ×2)
   pointing at `5.22.145.180` / `5.22.145.155`, which reverse-resolve to
   `relay.mail-forwarder.io` (Key-Systems). That is the registrar's
   web/mail-forwarding service, not a web server — it refuses TLS, which is
   precisely the **HTTP 525** the domain returns until they are removed.

   Deleting those `A` records does not affect email. Mail is routed by `MX`
   records, and the zone has none yet.

   Then add a placeholder that can never receive traffic:
   - `AAAA` `@` → `100::` , **Proxied**
   - `AAAA` `www` → `100::` , **Proxied**

   `100::` is the IPv6 discard prefix (RFC 6666) — packets sent there go
   nowhere. The record exists only so Cloudflare's proxy answers for the
   hostname, letting the redirect fire at the edge before any origin
   connection is attempted.

2. **Rules → Redirect Rules → Create rule**
   - Name: `com.au to canonical`
   - If: *Hostname* *contains* `electiontracker.com.au`
     (covers `www.` as well)
   - Then: **Dynamic** redirect
     - Expression:
       `concat("https://electiontracker.au", http.request.uri.path)`
     - Status: **301**
     - ✅ *Preserve query string*

Dynamic (not static) is what carries the path across, so
`electiontracker.com.au/districts/ripon` lands on the matching page rather than
dumping every visitor on the homepage.

### 3. After the custom domain is live — retire the workers.dev URL

The first deploy also published the site at `elections.col-ab2.workers.dev`,
because `workers_dev` defaults to enabled. Once `electiontracker.au` serves the
site, that is a second public hostname carrying identical content — the same
duplicate-content problem the `.com.au` redirect exists to avoid.

Add to [`wrangler.jsonc`](../wrangler.jsonc):

```jsonc
"workers_dev": false
```

Leave `preview_urls` alone — per-branch preview URLs are useful for reviewing
data changes, and every page carries a canonical tag pointing at the production
domain.

Do this **after** the custom domain resolves, not before: until then the
workers.dev URL is the only way to reach the site.

### 4. Verify after setup

```bash
curl -sI https://electiontracker.com.au/districts/ripon | grep -i '^location\|HTTP/'
```

Expect `301` and `location: https://electiontracker.au/districts/ripon`.

### If the domain ever changes again

Three files, all with matching comments pointing at each other:

- `site` in [`site/astro.config.mjs`](../site/astro.config.mjs)
- `SITE.url` / `SITE.domain` in [`site/src/lib/site.mjs`](../site/src/lib/site.mjs)
  — everything user-facing (canonical tags, citation string, CC BY attribution)
  derives from here
- `Sitemap:` in [`site/public/robots.txt`](../site/public/robots.txt)

Also update `$id` in `schema/candidate.schema.json` and the attribution line in
`data/LICENSE`, which are outside the site build.

## Email

Google Workspace routes both branded addresses to the working mailbox:

| Address | Routes to |
|---|---|
| `elections@electiontracker.au` | `elections@ozol.org` |
| `elections@electiontracker.com.au` | `elections@ozol.org` |

The site publishes **`elections@electiontracker.au`** only — the routing target
is internal and should stay off the public pages. It appears on `/about#contact`
and comes from `SITE.email`.

Each domain needs its own MX records pointing at Google Workspace, plus SPF,
DKIM and DMARC. Corrections about named individuals arrive here, so the mailbox
should be monitored during the campaign period.

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
