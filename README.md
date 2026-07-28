# elections — Australian Election Candidate Ledger

An open, versioned, machine-readable record of who is standing where in Australian
elections: candidate announcements, endorsements, nominations, withdrawals and
disendorsements, each backed by a dated source.

First election: **Victorian state election, 28 November 2026** (`data/vic2026/`).
The structure is jurisdiction-agnostic — future federal, state and territory
elections are added as new data directories, not rebuilds.

Production site: https://electiontracker.au (static, built from this repo).
`electiontracker.com.au` 301-redirects to it.

## What this is

- **The repository is the database.** Every district, party and candidate is a
  YAML file. Git history is the audit trail: every status change, correction and
  its evidence is a commit.
- **Every material claim carries a source** (URL, publisher, date published,
  date accessed). Unverified claims do not merge.
- **Statuses are distinct**: `announced` ≠ `endorsed` ≠ `nominated`. See
  [docs/METHODOLOGY.md](docs/METHODOLOGY.md) for definitions and evidence rules.
- **Exports are free.** `scripts/export.mjs` emits JSON and CSV of all public
  data. No lock-in, no paywall on facts.

## What this is not

- Not polling, forecasting, commentary or how-to-vote advice.
- Not affiliated with any party, candidate or electoral commission.
- Not a wiki: submissions arrive as GitHub Issues or PRs and are verified by a
  maintainer before merge. Nothing publishes automatically.

## Repository layout

```
data/<election>/          one directory per election (vic2026 first)
  election.yaml           key dates, jurisdiction, sources
  districts.yaml          lower-house seats
  regions.yaml            upper-house regions
  parties.yaml            registered parties and party families
  retirements.yaml        sitting members not recontesting
  candidates/*.yaml       one file per candidacy, with status history
schema/                   JSON Schemas the data must validate against
scripts/lib/data.mjs      shared loader + derived figures (site AND exports)
scripts/validate.mjs      schema + referential-integrity checks (CI-enforced)
scripts/export.mjs        JSON/CSV export to site/public/data/
site/                     Astro static site (built to site/dist/)
docs/                     scope, methodology, deployment, architecture decisions
```

## Running it

```bash
npm install
npm run dev      # validate + export, then serve locally
npm run build    # validate -> export -> build; fails fast on invalid data
```

The build is ordered deliberately: data is validated before it is exported, and
exported before the site is built. A record without a valid source fails step
one, so it can never reach production. See
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Contributing a candidate or correction

Open a GitHub Issue with: candidate name, seat, party, claimed status, and a
**public source URL with its date**. Or send a PR editing the candidate file —
CI validates schema and sources. See [docs/METHODOLOGY.md](docs/METHODOLOGY.md).

## Licence

- Code (`scripts/`, `schema/`, site): MIT — see [LICENSE](LICENSE).
- Data (`data/`): Creative Commons Attribution 4.0 (CC BY 4.0) — see
  [data/LICENSE](data/LICENSE). Attribute as "electiontracker.au".

## Status

Pre-launch scaffold. Seat list seeded; incumbents, parties and candidates being
verified and entered. See [docs/SCOPE.md](docs/SCOPE.md) for the MVP definition
and [HANDOVER.md](HANDOVER.md) for current state and next steps.
