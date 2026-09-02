# Scope

> **Version** `20260803.1631-aest+91ecdbf` · **Updated** 2026-08-03 16:31 AEST  
> git `main` @ [`91ecdbf`](https://github.com/coldix/elections/commit/91ecdbf) · hub [../README.md](../README.md)

## The wedge (why this project exists)

The Victorian 2026 candidate landscape is already covered by Wikipedia
(comprehensive, human-readable), The Tally Room (seat analysis, partly
paywalled), the ABC (from campaign period) and the VEC (authoritative, but only
after nominations close on 13 November 2026). None of them publish:

1. **Machine-readable candidate data** — open JSON/CSV, versioned, re-usable.
2. **Party coverage dashboards** — "One Nation has named candidates in 61 of 88
   seats" as live, sourced, embeddable fact.
3. **An evidence ledger** — every status change dated, sourced and preserved in
   history, including corrections.

That gap is the entire product. Everything else is out of scope until the gap
is proven valuable.

## MVP (Victorian 2026)

Data layer (this repo):
- [x] 88 Legislative Assembly districts, 8 Legislative Council regions
- [x] Key dates with sources
- [x] Parties file (VEC register + unregistered groups with announced candidates)
- [x] Current incumbents (Assembly + Council sitting members)
- [x] Candidate files as announcements are verified, statuses per methodology.md
  (coverage progressive — never “finished” until nominations close)
- [x] Schema validation in CI; nothing merges that doesn't validate
- [x] JSON + CSV export artefacts (`site/public/data/`)

Site (static):
- [x] Party coverage grid (Assembly + Council) — `/assembly`, `/council`, homepage snapshot, `/parties`
- [x] Election countdown + key dates (`ddd:hh:mm:ss` to polls open + key-date list)
- [x] District pages (incumbent, declared candidates, sources)
- [ ] Recent changes feed (derived from git history) — still not built
- [x] Methodology + editorial independence + authorisation pages
- [x] Corrections via GitHub Issues (linked prominently)

Secondary products (implemented; not required for original kill criteria):
- [x] Poll average + inventory
- [x] Policy matrix, issue comparisons, party policy profiles, key differences
- [x] 2022 Assembly district results (first preferences + 2CP/2PP) on each
  district page — historical facts, not a 2026 projection (ADR-17)

## Explicitly out of scope (first release)

- Forecasts, swing models, MRP, seat projections
- How-to-vote advice (party/candidate preference recommendations or sample
  ballots favouring anyone) — a neutral civic explainer of enrolment and
  preferential *rules* is allowed at `/voting`
- Comments, forums, user accounts
- Interactive maps
- Custom submission backend, admin UI, databases (D1/R2/Workers) — GitHub
  Issues/PRs + git are the submission workflow and the database
- Newsletter, payments, API keys, sponsorship tooling

## Civic voting guide (implemented)

Plain-language page at `/voting`: eligibility and enrolment, compulsory voting,
fines process, official links, and how preferential numbering works for the
Assembly and Council. Always defers to the VEC/AEC. Not legal advice and not
preference recommendations.

## Policy matrix & issues ledger (secondary product — implemented)

The product **wedge** remains machine-readable candidacies + coverage + evidence
ledger. The policy matrix is a secondary module:

- Jurisdiction guide at `/parties/issues` (state vs federal vs local)
- Sourced comparison matrix at `/parties/matrix` (majors + One Nation; optional Coalition view)
- Issue comparison pages at `/policies` and `/policies/[slug]`
- Party policy profiles at `/parties/policies` and `/parties/[slug]/policies`
- Key differences at `/policies/key-differences`
- YAML ledger + JSON/CSV export (`issues.json`, `policies.json`, `policies.csv`, `coalitions.json`)
- Rules: [policy-methodology.md](policy-methodology.md)

**Still forbidden:** star ratings, editorial scorecards, how-to-vote advice,
and treating empty cells as a ranking.

## Polling (secondary product — implemented)

The product **wedge** remains machine-readable candidacies + coverage + evidence
ledger. Polling is a secondary module and is **not** required for the original
kill/success criteria on candidate coverage.

**In scope and live**

- Sourced public statewide primary-vote polls under `data/<election>/polls/`
- Transparent **primary-vote average** with uncertainty bands
  ([poll-methodology.md](poll-methodology.md), site `/polls`, exports
  `polls.json` / `poll-average.json`)
- Discovery inventory: [polls-inventory.md](polls-inventory.md)

**Still forbidden without a new decision**

- Forecast language, 2PP/seat models derived without published preference
  assumptions, or ordering candidates/parties by polling
- Treating advocacy/party/union polls as **equal by default** inputs to the
  average (they may be recorded with `eligible_for_average: false`, or enter
  only via a documented case-by-case exception)

Party/union/advocacy-commissioned polls are **excluded from the average by
default** (see poll methodology). Rare exceptions require
`eligibility_exception` and do not waive the rule for the next release.

## Success / kill criteria

This is a solo side project competing with established coverage. Timebox it:

- **Ship the coverage grid quickly.** The data + static site should reach
  useful state in days of effort, not months.
- **Value window is now → 13 Nov 2026** (nominations close). After the VEC
  publishes the official list, curation value collapses to maintenance.
- If by nominations day the site has no meaningful traffic, citations or reuse
  of the data, stop adding elections; archive the dataset (still useful
  historically) and move on.
- If it earns attention: next elections are added as new `data/<election>/`
  directories; only then consider alerts, API, sponsorship.

## Monetisation posture

Facts stay free (CC BY). If the project earns an audience, candidates for
revenue are: non-political sponsorship, voluntary supporter payments,
professional dataset bundles, embeddable widgets. None of these may influence
ordering, coverage or verification, and none get built pre-traction.
