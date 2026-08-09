# HANDOVER

> **Version** `20260803.2111-aest+17599ed` · **Updated** 2026-08-03 21:11 AEST  
> edited against `main` @ [`17599ed`](https://github.com/coldix/elections/commit/17599ed) · hub [README.md](README.md)

Current operational context for the Australian Election Tracker. Historical
product changes belong in [docs/CHANGELOG.md](docs/CHANGELOG.md); this file is
kept deliberately short and current.

## Current product state

The site is live at **electiontracker.au** as a static, assets-only Cloudflare
Worker. A valid merge to `main` builds and deploys automatically.

The public structure is national:

```text
/                                      national landing page
/elections                             upcoming Australian elections
/elections/vic/2026                    active Victoria 2026 tracker
/elections/<jurisdiction>/<year|n>    foundation or active (federal uses parliament n)
```

Victoria is the only full candidate tracker at present. Its pages live under:

```text
/elections/vic/2026/assembly
/elections/vic/2026/council
/elections/vic/2026/districts/*
/elections/vic/2026/regions/*
/elections/vic/2026/parties/*
/elections/vic/2026/policies/*
/elections/vic/2026/polls
/elections/vic/2026/open-seats
/elections/vic/2026/voting
/elections/vic/2026/data
```

Former root-level Victorian URLs are permanent redirects. Do not restore them as
canonical links.

## Election calendar and future foundations

`data/election-calendar.yaml` is the source of truth for the next federal,
state and territory elections, including date-certainty labels.

`data/election-placeholders.yaml` holds the basic parliamentary structure for
future pages. Foundation pages currently exist for:

```text
/elections/nsw/2027
/elections/federal/49          # structure + 48th Parliament sitting members (data: federal-49)
/elections/tas/2027/legislative-council
/elections/nt/2028
/elections/act/2028
/elections/qld/2028
/elections/wa/2029
/elections/tas/next
/elections/sa/2030
```

Most show chambers, seat numbers, election scope and voting systems only.
Federal also publishes sitting members (not candidacies). Calendar entries and
foundation paths must remain one-to-one; CI enforces this.

## Victoria 2026 data model

`data/vic2026/` remains the source of truth for:

- 88 Legislative Assembly districts
- eight Legislative Council regions and 40 sitting MLCs
- parties, registrations and current representation
- individually sourced candidate status histories
- retirements
- public primary-vote polls
- policy issues and sourced party positions

Policy rules: [docs/POLICY-METHODOLOGY.md](docs/POLICY-METHODOLOGY.md) (ADR-11).
**Federal follow-up:** ABC/SBS public broadcasting is deliberately *not* a Vic
2026 matrix issue — see POLICY-METHODOLOGY § “Deferred for federal elections”
when creating the first federal `issues.yaml`.

Candidate coverage is intentionally progressive. A missing candidate means no
individually sourced record has been verified, not that nobody is standing.

The most recent named-person correction moved Warren Pickering’s live One Nation
candidacy to Pakenham, retained his initial Eastern Victoria endorsement in
history as withdrawn, and added his official candidate and principal political
Facebook links.

## People pages decision

There are **no `/people` pages**. Candidate cards may link to:

1. an official candidate, campaign, parliamentary or party profile;
2. one principal public political social account; and
3. Wikipedia only when no better official profile exists.

A possible permanent people layer is documented but not approved:
[docs/PEOPLE-PAGES-PROPOSAL.md](docs/PEOPLE-PAGES-PROPOSAL.md).

## Build and validation

Node 22 is used in CI.

```bash
npm run check:repo       # orphan docs, broken links, debris, calendar/page parity
npm run validate         # hygiene plus election-data validation
npm run export           # JSON and CSV exports
npm run build            # complete production build
npm run report:coverage  # report only
npm run check:sources    # report only
```

Production order:

```text
repo hygiene → data validation → export → build metadata → Astro build
→ scoped-route rewrite/check → sitemap finalisation
```

Do not hand-edit `site/public/data/` or `site/dist/`.

## Architecture constraints

Read [docs/DECISIONS.md](docs/DECISIONS.md) before proposing infrastructure.
The accepted architecture is:

- YAML and Git history as the database and audit trail
- shared loaders for site and exports
- Astro static generation
- Cloudflare assets-only deployment
- no runtime database or server process
- no unaudited automation merging named-person records

`trailingSlash: "never"` in Astro and Cloudflare’s
`html_handling: "drop-trailing-slash"` must remain aligned.

## Repository hygiene

The root [README.md](README.md) is the documentation graph entry point.
[docs/README.md](docs/README.md) indexes maintained documentation.

`npm run check:repo` fails on:

- orphaned Markdown documents
- broken relative Markdown links
- committed temporary/editor files
- a future election without a matching foundation page
- legacy root-level public URLs in the README

Delete superseded notes or link and label them clearly; do not leave unowned
files in the tree.

## Federal scaffold (federal-49)

Active under `/elections/federal/49` (data id `federal-49` — election for the
**49th** Parliament). `/elections/federal/next` redirects here. Next cycle will
be `federal-50` / `/elections/federal/50`. Sitting members are the **48th**
Parliament:

- House: 150 divisions + sitting MPs
- Senate: composition + half-Senate term status (`up` / `continuing` / `territory`)
- Parties index + per-party member lists
- Federal primary-vote poll ledger + tracker average (`/polls`)
- Open data page + exports: `/data/federal-49/`

Membership was **bootstrapped** from public Wikipedia compilations of the 48th
Parliament; prefer APH verification for named-person corrections. Not a
candidacy ledger yet. Next federal modules: parties pages, polls, policies
matrix, then progressive candidates.

## Current priorities

1. Continue individually sourced Victoria 2026 candidate verification.
2. Close remaining incumbent and Legislative Council candidate gaps without
   substituting assumptions for evidence.
3. Keep election dates and future structure pages current as official sources
   change.
4. Maintain the policy and poll ledgers under their published methodologies.
5. Obtain qualified legal review of the living-person and electoral-matter
   publication approach before the campaign intensifies.
6. Federal: APH-verify sitting members; then parties pages, polls, policy matrix.
7. Consider a recent-changes feed only within the existing static architecture.

## Documents to read first

- [docs/README.md](docs/README.md)
- [docs/SCOPE.md](docs/SCOPE.md)
- [docs/METHODOLOGY.md](docs/METHODOLOGY.md)
- [docs/POLICY-METHODOLOGY.md](docs/POLICY-METHODOLOGY.md)
- [docs/OPS.md](docs/OPS.md)
- [docs/DECISIONS.md](docs/DECISIONS.md)
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- [docs/REPO-LAYOUT.md](docs/REPO-LAYOUT.md)

## End-of-day repository state

At the start of this housekeeping pass, `main` was `17599ed`, PR #17 had been
merged, and there were no open pull requests. The housekeeping branch refreshes
README and handover documentation and adds a durable repository-hygiene build
gate before returning to `main`.
