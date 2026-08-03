# Public route architecture

Updated: 3 August 2026

Australian Election Tracker uses election-scoped canonical HTML paths so the
same site can cover every Australian federal, state and territory election.

## National routes

- `/` — national homepage
- `/elections` — upcoming election calendar
- `/methodology`, `/about` and legal pages — site-wide material
- `/people/<slug>` — permanent person pages when introduced

## Election routes

The canonical pattern is:

```text
/elections/<jurisdiction>/<year>
/elections/<jurisdiction>/<year>/districts/<slug>
/elections/<jurisdiction>/<year>/regions/<slug>
/elections/<jurisdiction>/<year>/parties/<slug>
```

Victoria 2026 is published beneath `/elections/vic/2026`. Its Astro source
views live under `site/src/vicpages/`; thin route wrappers under
`site/src/pages/elections/vic/2026/` expose the canonical URLs.

## Legacy redirects

The former short Victorian paths such as `/assembly`, `/districts/ripon` and
`/parties/one-nation` permanently redirect to their scoped equivalents. Rules
are versioned in `site/public/_redirects` and applied by Cloudflare before
static assets are served.

## Build-time link rewrite

The preserved Victorian view templates predate the scoped namespace. After the
Astro build, `scripts/rewrite-scoped-routes.mjs` rewrites their internal links
and absolute structured-data URLs, then fails the build if a legacy internal
HTML link remains. The header also rewrites links in local development.

## Data URLs

Machine-readable exports remain stable under `/data/<election-id>/`, including
`/data/vic2026/`. They are already election-scoped and are not redirected.
