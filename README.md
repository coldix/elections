# Australian Election Tracker

> **Updated** 2026-08-19  
> Live at [electiontracker.au](https://electiontracker.au) · `main` deploys automatically

**[electiontracker.au](https://electiontracker.au)** is an open, sourced and
machine-readable Australian election tracker. The repository records candidate
announcements, endorsements, nominations, withdrawals and disendorsements with
dated public sources, then builds a static public site and open JSON/CSV exports.

The site is structured nationally:

- **National home:** [electiontracker.au](https://electiontracker.au)
- **Upcoming election calendar:** [/elections](https://electiontracker.au/elections)
- **Full candidate tracker:** [Victoria 2026](https://electiontracker.au/elections/vic/2026)
- **Sitting-member trackers (no candidates yet):**
  [NSW 2027](https://electiontracker.au/elections/nsw/2027),
  [Federal (49th Parliament)](https://electiontracker.au/elections/federal/49)
- **Outline foundations only:** ACT 2028, QLD 2028, NT 2028, WA 2029, SA 2030, Tas

Victoria is the first full candidacy ledger (`data/vic2026/`). NSW and federal
publish structure and sitting members first; candidates are added when sourced.
Other jurisdictions keep permanent outline URLs that expand in place later.

## What is live

### Victoria 2026 (full tracker)

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

88 Assembly districts, eight Council regions, progressive sourced candidates,
polls and policy matrix. Open data: `/data/vic2026/`.

### NSW 2027 (sitting members)

```text
/elections/nsw/2027
/elections/nsw/2027/districts
/elections/nsw/2027/districts/:slug
/elections/nsw/2027/assembly
/elections/nsw/2027/council
/elections/nsw/2027/parties
/elections/nsw/2027/parties/:slug
/elections/nsw/2027/data
```

Data id `nsw2027` (`kind: state-foundation`). 93 Assembly districts and
sitting MLAs/MLCs of the **58th** Parliament; Council term class (`up` /
`continuing`) for the half-Council election. **Not** a candidacy ledger.
Open data: `/data/nsw2027/`. Membership from Parliament of NSW downloads.

### Federal — 49th Parliament (sitting members + polls + policies)

```text
/elections/federal/49
/elections/federal/49/representatives
/elections/federal/49/senate
/elections/federal/49/parties
/elections/federal/49/polls
/elections/federal/49/parties/matrix
/elections/federal/49/data
```

Data id `federal-49`. Sitting members of the **48th** Parliament; House and
Senate structure; primary-vote polls and policy matrix. Aliases:
`/elections/federal/next` → `/49`. Open data: `/data/federal-49/`.

### Outline foundations only

`data/election-calendar.yaml` holds sourced dates. `data/election-placeholders.yaml`
supplies chamber structure for pages that are not yet sitting-member or
candidate trackers:

```text
/elections/tas/2027/legislative-council
/elections/nt/2028
/elections/act/2028
/elections/qld/2028
/elections/wa/2029
/elections/tas/next
/elections/sa/2030
```

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
- **Open exports.** JSON and CSV under `/data/<election-id>/` (e.g. `vic2026`,
  `nsw2027`, `federal-49`) without an API key.

Full rules: [docs/methodology.md](docs/methodology.md),
[docs/poll-methodology.md](docs/poll-methodology.md) and
[docs/policy-methodology.md](docs/policy-methodology.md).

## Repository layout

```text
data/
  election-calendar.yaml          national election calendar
  election-placeholders.yaml      outline / chamber structure facts
  vic2026/                        full Victorian ledger (candidates, polls, policies)
  nsw2027/                        NSW sitting members (state-foundation)
  federal-49/                     federal sitting members, polls, policies

schema/                            JSON Schemas
scripts/
  validate.mjs                     data and source validation
  validate-coalitions.mjs          coalition display checks
  check-repo-hygiene.mjs           orphan docs, broken links and temp-file checks
  export.mjs                       JSON/CSV generation
  rewrite-scoped-routes.mjs        Victoria route scoping and legacy-link guard
  finalize-sitemap.mjs             final sitemap processing
  lib/                             shared loaders (data, federal, state-foundation, …)

site/
  src/pages/                       national, federal, NSW and outline routes
  src/vicpages/                    reusable Victorian route templates
  src/components/                  site components
  public/_redirects                permanent redirects from old Victoria URLs

docs/                              product, methodology and operations docs
.github/                            issue templates and CI workflows
```

See [docs/repo-layout.md](docs/repo-layout.md) for the annotated map.

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
| [docs/scope.md](docs/scope.md) | Product boundaries and success criteria |
| [docs/methodology.md](docs/methodology.md) | Candidate statuses, sourcing and neutrality |
| [docs/poll-methodology.md](docs/poll-methodology.md) | Poll inclusion and weighted average |
| [docs/policy-methodology.md](docs/policy-methodology.md) | Policy comparison rules |
| [docs/ops.md](docs/ops.md) | Editorial and maintenance workflow |
| [docs/deployment.md](docs/deployment.md) | Cloudflare build and deployment |
| [docs/decisions.md](docs/decisions.md) | Architecture decisions |
| [docs/repo-layout.md](docs/repo-layout.md) | Annotated repository structure |
| [docs/people-pages-proposal.md](docs/people-pages-proposal.md) | Unapproved future `/people` concept |
| [docs/handover.md](docs/handover.md) | Current operational handover |

The hygiene checker requires every Markdown document to be reachable from this
README through the documentation index. Broken relative links and orphaned docs
fail validation.

## Candidate links and people pages

There are no `/people` pages at present. Candidate cards may link to:

1. an official candidate, campaign, parliamentary or party profile;
2. one principal public political social account; and
3. Wikipedia only when no better official profile is available.

The possible future people layer remains a proposal only. See
[docs/people-pages-proposal.md](docs/people-pages-proposal.md).

## Deployment

Pushing valid changes to `main` triggers the Cloudflare Workers build. The site
is static and assets-only: there is no runtime database or server process.
Permanent redirects preserve the former root-level Victorian URLs.

See [docs/deployment.md](docs/deployment.md) and
[docs/decisions.md](docs/decisions.md) before changing infrastructure.

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
[docs/handover.md](docs/handover.md) and [docs/scope.md](docs/scope.md).
