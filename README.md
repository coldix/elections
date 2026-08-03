# Australian Election Tracker

> **Version** `20260803.2111-aest+17599ed` · **Updated** 2026-08-03 21:11 AEST  
> edited against `main` @ [`17599ed`](https://github.com/coldix/elections/commit/17599ed)

**[electiontracker.au](https://electiontracker.au)** is an open, sourced and
machine-readable Australian election tracker. The repository records candidate
announcements, endorsements, nominations, withdrawals and disendorsements with
dated public sources, then builds a static public site and open JSON/CSV exports.

The site is now structured nationally:

- **National home:** [electiontracker.au](https://electiontracker.au)
- **Upcoming election calendar:** [electiontracker.au/elections](https://electiontracker.au/elections)
- **Active tracker:** [Victoria 2026](https://electiontracker.au/elections/vic/2026)
- **Future election foundations:** permanent outline pages such as
  [NSW 2027](https://electiontracker.au/elections/nsw/2027),
  [Federal next](https://electiontracker.au/elections/federal/next) and
  [ACT 2028](https://electiontracker.au/elections/act/2028)

Victoria remains the first full election dataset under `data/vic2026/`. Future
elections use the same repository and route conventions rather than separate
sites or duplicated code.

## What is live

### Victoria 2026

The full tracker lives below `/elections/vic/2026`:

```text
/elections/vic/2026
/elections/vic/2026/assembly
/elections/vic/2026/council
/elections/vic/2026/districts/:slug
/elections/vic/2026/regions/:slug
/elections/vic/2026/parties/:slug
/elections/vic/2026/polls
/elections/vic/2026/policies
/elections/vic/2026/data
```

The Victorian ledger covers 88 Legislative Assembly districts and eight
Legislative Council regions electing five members each. Candidate coverage is
progressive and includes only individually sourced records.

### Future elections

`data/election-calendar.yaml` holds sourced election dates, lawful windows and
date-certainty labels. `data/election-placeholders.yaml` supplies the basic
parliamentary structure for future election pages: chambers, seat numbers,
election scope and voting systems.

Foundation pages currently exist for:

```text
/elections/nsw/2027
/elections/federal/next
/elections/tas/2027/legislative-council
/elections/nt/2028
/elections/act/2028
/elections/qld/2028
/elections/wa/2029
/elections/tas/next
/elections/sa/2030
```

These are clearly labelled outlines, not active candidate trackers. Their
permanent URLs can expand in place when tracking begins.

## Core principles

- **Git is the database.** YAML is the source of truth and Git history is the
  audit trail.
- **Every material status needs evidence.** Missing or invalid sources fail CI.
- **Statuses are distinct.** `announced`, `endorsed`, `nominated`, `withdrawn`,
  `disendorsed`, `elected` and `defeated` are not interchangeable.
- **No forecasting or how-to-vote advice.** Polls summarise recent public
  primary-vote polling; policy pages publish sourced positions without ratings.
- **Neutral structure.** The same fields, ordering rules and display treatment
  apply to every party and independent.
- **Open exports.** JSON and CSV remain available under `/data/vic2026/` without
  an API key.

Full rules: [docs/METHODOLOGY.md](docs/METHODOLOGY.md),
[docs/POLL-METHODOLOGY.md](docs/POLL-METHODOLOGY.md) and
[docs/POLICY-METHODOLOGY.md](docs/POLICY-METHODOLOGY.md).

## Repository layout

```text
data/
  election-calendar.yaml          national election calendar
  election-placeholders.yaml      future-election structure facts
  vic2026/                         active Victorian election ledger
    candidates/*.yaml
    polls/*.yaml
    policies/*.yaml
    election.yaml
    districts.yaml
    regions.yaml
    council-members.yaml
    parties.yaml
    retirements.yaml
    issues.yaml

schema/                            JSON Schemas
scripts/
  validate.mjs                     data and source validation
  validate-coalitions.mjs          coalition display checks
  check-repo-hygiene.mjs           orphan docs, broken links and temp-file checks
  export.mjs                       JSON/CSV generation
  rewrite-scoped-routes.mjs        Victoria route scoping and legacy-link guard
  finalize-sitemap.mjs             final sitemap processing
  lib/                             shared loaders and derived calculations

site/
  src/pages/                       national and future-election routes
  src/vicpages/                    reusable Victorian route templates
  src/components/                  site components
  public/_redirects                permanent redirects from old Victoria URLs

docs/                              product, methodology and operations docs
.github/                            issue templates and CI workflows
```

See [docs/REPO-LAYOUT.md](docs/REPO-LAYOUT.md) for the annotated map.

## Running locally

Node 22 is used in CI.

```bash
npm install
npm run check:repo       # orphan docs, broken local links and repository debris
npm run validate         # repository hygiene + election-data validation
npm run export           # rebuild JSON and CSV exports
npm run dev              # validate/export, then run Astro locally
npm run build            # complete production build
npm run report:coverage  # coverage report only; does not publish
npm run check:sources    # source URL health report only
```

The production sequence is:

```text
repository hygiene → data validation → export → build metadata → Astro build
→ scoped-route check → sitemap finalisation
```

A failure at any stage prevents publication.

## Documentation

Start with [docs/README.md](docs/README.md). Key documents:

| Document | Purpose |
|---|---|
| [docs/SCOPE.md](docs/SCOPE.md) | Product boundaries and success criteria |
| [docs/METHODOLOGY.md](docs/METHODOLOGY.md) | Candidate statuses, sourcing and neutrality |
| [docs/POLL-METHODOLOGY.md](docs/POLL-METHODOLOGY.md) | Poll inclusion and weighted average |
| [docs/POLICY-METHODOLOGY.md](docs/POLICY-METHODOLOGY.md) | Policy comparison rules |
| [docs/OPS.md](docs/OPS.md) | Editorial and maintenance workflow |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Cloudflare build and deployment |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architecture decisions |
| [docs/REPO-LAYOUT.md](docs/REPO-LAYOUT.md) | Annotated repository structure |
| [docs/PEOPLE-PAGES-PROPOSAL.md](docs/PEOPLE-PAGES-PROPOSAL.md) | Unapproved future `/people` concept |
| [HANDOVER.md](HANDOVER.md) | Current operational handover |

The hygiene checker requires every Markdown document to be reachable from this
README through the documentation index. Broken relative links and orphaned docs
fail validation.

## Candidate links and people pages

There are no `/people` pages at present. Candidate cards may link to:

1. an official candidate, campaign, parliamentary or party profile;
2. one principal public political social account; and
3. Wikipedia only when no better official profile is available.

The possible future people layer remains a proposal only. See
[docs/PEOPLE-PAGES-PROPOSAL.md](docs/PEOPLE-PAGES-PROPOSAL.md).

## Deployment

Pushing valid changes to `main` triggers the Cloudflare Workers build. The site
is static and assets-only: there is no runtime database or server process.
Permanent redirects preserve the former root-level Victorian URLs.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and
[docs/DECISIONS.md](docs/DECISIONS.md) before changing infrastructure.

## Contributing and corrections

Open a GitHub Issue using the candidacy/status template or submit a pull request.
Named-person changes require public evidence and human review. Corrections are
new commits; history is not rewritten.

## Licence

- Code (`scripts/`, `schema/`, `site/`): MIT, see [LICENSE](LICENSE).
- Data (`data/`): CC BY 4.0, see [data/LICENSE](data/LICENSE).

## Current status

The national shell, upcoming-election calendar, future-election foundation
pages and the full Victoria 2026 tracker are live. There are no open pull
requests at this housekeeping checkpoint. Current gaps and next actions are in
[HANDOVER.md](HANDOVER.md) and [docs/SCOPE.md](docs/SCOPE.md).
