# Australian Election Tracker

**[electiontracker.au](https://electiontracker.au)** — an open, versioned,
machine-readable record of who is standing where in Australian elections:
candidate announcements, endorsements, nominations, withdrawals and
disendorsements, each backed by a dated source. The project also collects
**public statewide primary-vote polls** and publishes a transparent weighted
average with uncertainty bands ([/polls](https://electiontracker.au/polls)).

First election: **Victorian state election, 28 November 2026** (`data/vic2026/`).
The structure is jurisdiction-agnostic — future federal, state and territory
elections are added as new data directories, not rebuilds.

## What this is

- **The repository is the database.** Every district, party, member, candidate
  and poll is a YAML file. Git history is the audit trail: every status change,
  correction and its evidence is a commit.
- **Every material claim carries a source** — URL, publisher, date published,
  date accessed. A record without one fails validation and cannot be published.
- **Statuses are distinct**: `announced` ≠ `endorsed` ≠ `nominated`. See
  [docs/METHODOLOGY.md](docs/METHODOLOGY.md).
- **Poll average is transparent**: inclusion rules, weights and error bars are
  published in [docs/POLL-METHODOLOGY.md](docs/POLL-METHODOLOGY.md). It is a
  summary of recent public polling, not a forecast.
- **Exports are free.** Every record is published as JSON and CSV at
  [/data](https://electiontracker.au/data), CC BY 4.0, no key or rate limit.

## What this is not

- Not forecasting, commentary or how-to-vote advice. The poll average does not
  predict election day, invent preference flows or rank candidates.
- Not affiliated with any party, candidate or electoral commission. The VEC is
  authoritative; where we differ, the VEC is right.
- Not complete. Coverage counts only what has been individually verified — see
  the [disclaimer](https://electiontracker.au/disclaimer).
- Not a wiki: submissions arrive as GitHub Issues or PRs and are verified by a
  maintainer before merge. Nothing publishes automatically.

## Repository layout

```
data/<election>/          one directory per election (vic2026 first)
  election.yaml           key dates, jurisdiction, sources
  districts.yaml          lower-house seats, incumbents, region mapping
  regions.yaml            upper-house regions
  council-members.yaml    sitting upper-house members
  parties.yaml            registered parties, party families, public commitments
  retirements.yaml        sitting members not recontesting
  candidates/*.yaml       one file per candidacy, with full status history
  polls/*.yaml            statewide primary-vote polls (sourced)
schema/                   JSON Schema the data must validate against
scripts/lib/data.mjs      shared loader + derived figures (site AND exports)
scripts/lib/polls.mjs     poll load + tracker average
scripts/validate.mjs      schema, vocabulary, sources, referential integrity
scripts/export.mjs        JSON/CSV export to site/public/data/
scripts/check-sources.mjs weekly URL reachability (report only)
scripts/report-coverage.mjs  party coverage snapshot (report only)
site/                     Astro static site (built to site/dist/)
docs/                     scope, methodology, ops, deployment, decisions
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

Live and publishing. The platform is complete; the candidate dataset is not.
Current counts, known gaps and the next priorities are in
[HANDOVER.md](HANDOVER.md); scope boundaries and kill criteria in
[docs/SCOPE.md](docs/SCOPE.md).
