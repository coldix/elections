# Public route architecture

Updated: 2 September 2026

Australian Election Tracker uses election-scoped canonical HTML paths so the
same site can cover every Australian federal, state and territory election.

What the header and footer show, and the full public tree, is in
[nav-tree.md](nav-tree.md).

## National routes

- `/` — national homepage
- `/latest` — recent sourced polls and Victorian candidacies
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

## NSW 2027 (state-foundation)

Sitting members only — data id `nsw2027`, `kind: state-foundation`.

```text
/elections/nsw/2027
/elections/nsw/2027/districts
/elections/nsw/2027/districts/<slug>
/elections/nsw/2027/assembly
/elections/nsw/2027/council
/elections/nsw/2027/parties
/elections/nsw/2027/parties/<slug>
/elections/nsw/2027/data
```

| | Value |
|---|---|
| Data | `data/nsw2027/` → `/data/nsw2027/` |
| Sitting parliament | 58th (members listed) |
| Election forms | 59th Parliament |
| Candidates / polls / policies | Not yet |

Loader: `scripts/lib/state-foundation.mjs`. Dedicated pages; not the generic
placeholder template.

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
/elections/federal/49/polls
/elections/federal/49/parties/matrix
/elections/federal/49/policies
/elections/federal/49/policies/<slug>
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

Machine-readable exports remain stable under `/data/<election-id>/`:

- `/data/vic2026/` — full Vic ledger
- `/data/nsw2027/` — NSW districts, assembly/council members, parties, summary
- `/data/federal-49/` — federal divisions, members, polls, policies

They are already election-scoped and are not redirected.
