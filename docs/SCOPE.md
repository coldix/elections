# Scope

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
- [ ] Registered parties verified against the VEC register
- [ ] Current incumbents with sources
- [ ] Candidate files as announcements are verified, statuses per METHODOLOGY.md
- [x] Schema validation in CI; nothing merges that doesn't validate
- [ ] JSON + CSV export artefacts

Site (static, after data layer works):
- [ ] Party coverage grid (the shareable artefact) — seats filled per party
- [ ] Election countdown + key dates
- [ ] District pages (incumbent, declared candidates, sources)
- [ ] Recent changes feed (derived from git history)
- [ ] Methodology + editorial independence + authorisation pages
- [ ] Corrections via GitHub Issues (linked prominently)

## Explicitly out of scope (first release)

- Forecasts, swing models, MRP, seat projections, how-to-vote advice
- Comments, forums, user accounts
- Interactive maps
- Custom submission backend, admin UI, databases (D1/R2/Workers) — GitHub
  Issues/PRs + git are the submission workflow and the database
- Newsletter, payments, API keys, sponsorship tooling

## Polling (secondary product — implemented)

The product **wedge** remains machine-readable candidacies + coverage + evidence
ledger. Polling is a secondary module and is **not** required for the original
kill/success criteria on candidate coverage.

**In scope and live**

- Sourced public statewide primary-vote polls under `data/<election>/polls/`
- Transparent **primary-vote average** with uncertainty bands
  ([POLL-METHODOLOGY.md](POLL-METHODOLOGY.md), site `/polls`, exports
  `polls.json` / `poll-average.json`)
- Discovery inventory: [polls-inventory.md](polls-inventory.md)

**Still forbidden without a new decision**

- Forecast language, 2PP/seat models derived without published preference
  assumptions, or ordering candidates/parties by polling
- Treating advocacy/party/union polls as equal inputs to the average (they may
  be recorded with `eligible_for_average: false`)

Party/union/advocacy-commissioned polls are excluded from the average
(see poll methodology).

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
