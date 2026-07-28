# Australian Election Tracker

**[electiontracker.au](https://electiontracker.au)** — an open, versioned,
machine-readable record of who is standing where in Australian elections:
candidate announcements, endorsements, nominations, withdrawals and
disendorsements, each backed by a dated source.

First election: **Victorian state election, 28 November 2026** (`data/vic2026/`).
The structure is jurisdiction-agnostic — future federal, state and territory
elections are added as new data directories, not rebuilds.

## What this is

- **The repository is the database.** Every district, party, member and
  candidate is a YAML file. Git history is the audit trail: every status change,
  correction and its evidence is a commit.
- **Every material claim carries a source** — URL, publisher, date published,
  date accessed. A record without one fails validation and cannot be published.
- **Statuses are distinct**: `announced` ≠ `endorsed` ≠ `nominated`. See
  [docs/METHODOLOGY.md](docs/METHODOLOGY.md).
- **Exports are free.** Every record is published as JSON and CSV at
  [/data](https://electiontracker.au/data), CC BY 4.0, no key or rate limit.

## What this is not

- Not polling, forecasting, commentary or how-to-vote advice.
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
schema/                   JSON Schema the data must validate against
scripts/lib/data.mjs      shared loader + derived figures (site AND exports)
scripts/validate.mjs      schema, vocabulary, sources, referential integrity
scripts/export.mjs        JSON/CSV export to site/public/data/
site/                     Astro static site (built to site/dist/)
docs/                     scope, methodology, deployment, architecture decisions
```

## Running it

```bash
npm install
npm run dev      # validate + export, then serve locally
npm run build    # full production build
```

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

Open a GitHub Issue with: candidate name, seat, party, claimed status, and a
**public source URL with its date**. Or send a PR editing the candidate file —
CI validates schema and sources on every push and pull request.

Corrections concerning living people are prioritised above all other work.
History is never rewritten: a correction is a new commit, and the original
record, the correction and its reason all stay visible.

## Licence

- Code (`scripts/`, `schema/`, `site/`): MIT — see [LICENSE](LICENSE).
- Data (`data/`): Creative Commons Attribution 4.0 — see
  [data/LICENSE](data/LICENSE). Attribute as "electiontracker.au".

## Status

Live and publishing. The platform is complete; the dataset is not. Current
counts, known gaps and the next priorities are in
[HANDOVER.md](HANDOVER.md); scope boundaries and kill criteria in
[docs/SCOPE.md](docs/SCOPE.md).
