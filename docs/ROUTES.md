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

## Federal (parliament number)

Canonical path and data id use the **Parliament being elected** (`49`, then
`50`, …). The word `next` is only a redirect alias to the open contest.

```text
/elections/federal/49
/elections/federal/49/representatives
/elections/federal/49/representatives/<slug>
/elections/federal/49/senate
/elections/federal/49/parties
/elections/federal/49/parties/<slug>
/elections/federal/49/data
```

| | Current | Next cycle |
|---|---|---|
| Data | `data/federal-49/` → `/data/federal-49/` | `federal-50` |
| HTML | `/elections/federal/49` | `/elections/federal/50` |

Sitting members listed under `/49` are of the **48th** Parliament. Aliases:

- `/elections/federal/next` → current open federal contest (retarget when 50 opens)
- `/elections/federal/49th` → `/elections/federal/49`
- `/elections/federal/2028` → `/elections/federal/49` (provisional year; not canonical)

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
