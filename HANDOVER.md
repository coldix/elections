# HANDOVER

For future sessions/agents. Read docs/DECISIONS.md before proposing any
infrastructure; the Workers/D1/R2 stack was already evaluated and rejected
(ADR-2). This is a data-in-git ledger with a static site on top.

## Current state (2026-07-27)

Scaffold + core data complete:
- 88 assembly districts + 8 council regions seeded (Wikipedia, 2021 boundaries)
- Key dates in `data/vic2026/election.yaml`, sourced
- All 16 parties verified against VEC register (correct legal + short names)
- All 88 districts enriched: incumbent + party (from Wikipedia MLA list; the
  4 post-2022 by-election seats — Nepean, Prahran, Werribee, Warrandyte —
  individually cross-checked, prior fetch had stale/duplicate members) and
  region mapping (all 8 LC region pages, 88/88 districts covered, no gaps)
- Candidate schema + `_EXAMPLE.yaml` template; zero real candidates entered
- `npm run validate` (CI-enforced, now also checks incumbent_party/region
  reference integrity) and `npm run export` (JSON/CSV/coverage)
- No site yet

## Competitive context (evaluated 2026-07-27)

Wikipedia's "Candidates of the 2026 Victorian state election" page is
near-complete and free; The Tally Room has seat guides (paywalled till near
election); ABC coverage will dominate from campaign period; VEC publishes the
official list after nominations close 13 Nov 2026. The differentiated wedge is
ONLY: machine-readable open data + party coverage dashboard + evidence ledger.
Do not expand scope beyond the wedge. Kill criteria in docs/SCOPE.md.

## TODO (priority order)

1. Enter candidates from public announcements (Wikipedia's candidates page is
   a lead generator; always cite the underlying primary/news source, not
   Wikipedia). One Nation's own site lists candidates — cite it directly.
2. Static site: Astro on Cloudflare Pages, custom domain elections.oze.net.au.
   First page = party coverage grid from dist/vic2026/coverage.json. Follow the
   oze playbook header/versioning conventions if adopting Aurora styling.
3. Authorisation statement page — check Electoral Act 2002 (Vic) requirements
   for authorisation of electoral matter before launch.
4. GitHub Issue templates for candidate submissions / corrections.
5. Legislative Council candidates need a `contest` = region slug, not district
   — schema already supports this (`chamber: council`), just enter them.

## Working rules

- Sync repo before editing (house rule).
- Nothing merges without a source; run `npm run check` before commit.
- Never commit: submitter details, unverified claims about named people,
  secrets. See ADR-4.
