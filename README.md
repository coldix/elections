# Australian Election Tracker

> **Version** `20260803.1631-aest+91ecdbf` · **Updated** 2026-08-03 16:31 AEST  
> git `main` @ [`91ecdbf`](https://github.com/coldix/elections/commit/91ecdbf) · site stamp also in footer + `/build-meta.json`

**[electiontracker.au](https://electiontracker.au)** — an open, versioned,
machine-readable record of who is standing where in Australian elections:
candidate announcements, endorsements, nominations, withdrawals and
disendorsements, each backed by a dated source. The project also publishes a
**sourced policy comparison matrix**, **party policy profiles**, and
**public statewide primary-vote polls** with a transparent weighted average
([/polls](https://electiontracker.au/polls)).

First election: **Victorian state election, 28 November 2026** (`data/vic2026/`).
The structure is jurisdiction-agnostic — future federal, state and territory
elections are added as new data directories, not rebuilds.

## What this is

- **The repository is the database.** Every district, party, member, candidate,
  poll and policy claim is a YAML file. Git history is the audit trail.
- **Every material claim carries a source** — URL, publisher, date published,
  date accessed. A record without one fails validation and cannot be published.
- **Statuses are distinct**: `announced` ≠ `endorsed` ≠ `nominated`. See
  [docs/METHODOLOGY.md](docs/METHODOLOGY.md).
- **Coverage is dual-house:** Assembly seats of 88, Council seats of 40,
  combined progress of 128. Regions (8) are shown where useful for maps/grids.
- **Policy matrix is secondary but live:** sourced positions only, no ratings
  ([docs/POLICY-METHODOLOGY.md](docs/POLICY-METHODOLOGY.md),
  [/parties/matrix](https://electiontracker.au/parties/matrix),
  [/policies](https://electiontracker.au/policies)).
- **Poll average is transparent:** inclusion rules, weights and error bars in
  [docs/POLL-METHODOLOGY.md](docs/POLL-METHODOLOGY.md). Summary of recent public
  polling, not a forecast.
- **Exports are free.** JSON and CSV at [/data](https://electiontracker.au/data),
  CC BY 4.0, no key or rate limit.

## What this is not

- Not forecasting, commentary or how-to-vote advice. The poll average does not
  predict election day, invent preference flows or rank candidates. The policy
  matrix is not a scorecard.
- Not affiliated with any party, candidate or electoral commission. The VEC is
  authoritative; where we differ, the VEC is right.
- Not complete. Coverage counts only what has been individually verified — see
  the [disclaimer](https://electiontracker.au/disclaimer).
- Not a wiki: submissions arrive as GitHub Issues or PRs and are verified by a
  maintainer before merge. Nothing publishes automatically.

## Repository layout

Short map of what lives where. **Full annotated tree:** [docs/REPO-LAYOUT.md](docs/REPO-LAYOUT.md).

```
data/<election>/              one directory per election (vic2026 first)
  election.yaml               key dates, jurisdiction, sources
  districts.yaml              lower-house seats, incumbents, region mapping
  regions.yaml                upper-house regions
  council-members.yaml        sitting upper-house members
  parties.yaml                registered parties, families, commitments
  retirements.yaml            sitting members not recontesting
  candidates/*.yaml           one file per candidacy + status history
  polls/*.yaml                statewide primary-vote polls (sourced)
  issues.yaml                 policy issue catalogue
  coalitions.yaml             optional Coalition display groupings
  policies/*.yaml             party × issue sourced claims
schema/                       JSON Schema for candidates, polls, policies, issues
scripts/lib/data.mjs          candidates, coverage, representation (site + export)
scripts/lib/polls.mjs         poll load + tracker average
scripts/lib/policies.mjs      policy matrix + exports
scripts/validate.mjs          schema, vocabulary, sources, referential integrity
scripts/export.mjs            JSON/CSV → site/public/data/
site/                         Astro static site → site/dist/
docs/                         scope, methodology, ops, deployment, decisions
```

## Running it

```bash
npm install
npm run dev              # validate + export, then serve locally
npm run build            # full production build
npm run report:coverage  # party coverage snapshot (does not publish)
npm run check:sources    # source URL health (does not publish)
```

Editorial cadence and agent rules: [docs/OPS.md](docs/OPS.md).

The build is ordered deliberately — **validate → export → build** — and fails
fast. A record without a valid source stops the build before the site is
generated, so it can never reach production.

## Documentation

Each primary doc carries a **version + AEST timestamp** at the top (same style
as this file). Bump them when you change the doc’s substance; version should
match the git short hash you edited against.

| Doc | Role |
|---|---|
| [docs/SCOPE.md](docs/SCOPE.md) | In / out of product, success criteria |
| [docs/METHODOLOGY.md](docs/METHODOLOGY.md) | Candidate statuses and evidence |
| [docs/POLICY-METHODOLOGY.md](docs/POLICY-METHODOLOGY.md) | Policy matrix rules |
| [docs/POLL-METHODOLOGY.md](docs/POLL-METHODOLOGY.md) | Poll average rules |
| [docs/OPS.md](docs/OPS.md) | Cadence, agent vs human |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Cloudflare Workers Builds, DNS |
| [docs/DECISIONS.md](docs/DECISIONS.md) | ADRs — read before proposing infra |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Product log since polls module |
| [docs/DISCOVERY.md](docs/DISCOVERY.md) | SEO / IndexNow / GSC |
| [docs/REPO-LAYOUT.md](docs/REPO-LAYOUT.md) | Full repository file tree |
| [HANDOVER.md](HANDOVER.md) | Agent context and known gaps |
| [docs/README.md](docs/README.md) | Full docs index |

## Deployment

Pushing to `main` builds and deploys automatically via Cloudflare Workers
Builds (~1 min). The site is static: an assets-only Worker with no server code,
no database and nothing running per request.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for project settings, domains and
DNS. Architecture rationale is in [docs/DECISIONS.md](docs/DECISIONS.md) — read
it before proposing infrastructure.

## Contributing a candidate or correction

Open a GitHub Issue with the **New candidacy / status change** template
(candidate name, seat, party, claimed status, public source URL + date). Or
send a PR editing the candidate file — CI validates schema and sources on every
push and pull request. Unattended bots must not merge people-data PRs
([docs/OPS.md](docs/OPS.md)).

Corrections concerning living people are prioritised above all other work.
History is never rewritten: a correction is a new commit, and the original
record, the correction and its reason all stay visible.

## Licence

- Code (`scripts/`, `schema/`, `site/`): MIT — see [LICENSE](LICENSE).
- Data (`data/`): Creative Commons Attribution 4.0 — see
  [data/LICENSE](data/LICENSE). Attribute as "electiontracker.au".

## Status

**Live** at [electiontracker.au](https://electiontracker.au). Candidate coverage
is progressive by design; policy matrix and polls are secondary modules already
shipping. Counts and gaps: [HANDOVER.md](HANDOVER.md). Boundaries:
[docs/SCOPE.md](docs/SCOPE.md).
