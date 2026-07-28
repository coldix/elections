# HANDOVER

For future sessions/agents. Read docs/DECISIONS.md before proposing any
infrastructure; the Workers/D1/R2 stack was already evaluated and rejected
(ADR-2). This is a data-in-git ledger with a static site on top.

## The site (added 2026-07-28)

Astro static site in `site/`, 112 pages, deployed via Cloudflare Pages.
**Read [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) before touching build config.**

- `npm run build` = validate → export → astro build, failing fast. An unsourced
  record cannot reach production; the build dies at step 1.
- Output conflict resolved: exports now go to `site/public/data/` (served at
  `/data/<election>/...`), Astro builds to `site/dist/`. Both gitignored.
- `scripts/lib/data.mjs` is the single source of derived figures — imported by
  both the exporter and the site, so JSON and page can't disagree (ADR-8). It
  finds `data/` by walking up the tree because Astro bundles it and
  `import.meta.url` is wrong once bundled.
- Pages: `/`, `/districts` + 88 district pages, `/parties` + 17 party pages,
  `/methodology`, `/about`, `/data`, `/404`.
- **Zero JavaScript bundles.** The coverage matrix is radio inputs + CSS
  sibling selectors (ADR-9). The only script is ~8 lines refreshing the
  countdown, which is already correct in the HTML without it.
- Measured: homepage 13.6 KB brotli, CSS 2.3 KB gzip, no horizontal overflow at
  375 px, contrast ≥5.45:1 in dark mode, `prefers-reduced-motion` verified to
  strip the cell animation and hover transforms.
- Palette is deliberately non-partisan: red/blue/green/orange/teal all read as
  an Australian party (teal included — the federal independents). Shell uses
  ink + sand + plum; party colours appear only inside data visualisation.
- The coverage caveat lives in `scripts/lib/data.mjs` as `COVERAGE_CAVEAT` and
  is rendered on the homepage, `/parties`, every party page, `/methodology`
  **and** inside `coverage.json`. Keep it that way — it is the honest
  qualification on every number the project publishes.

### Still to do on the site
- Recent-changes feed derived from `git log` (in SCOPE's MVP, not built).
- Council (upper house) candidate coverage is thin — only the 2 Western
  Metropolitan records exist, so region pages aren't built yet.
- Social preview image (`og:image`) not set; add a static one or generate.

## Current state (2026-07-28)

Scaffold + core data complete:
- 88 assembly districts + 8 council regions seeded (Wikipedia, 2021 boundaries)
- Key dates in `data/vic2026/election.yaml`, sourced
- All 16 parties verified against VEC register (correct legal + short names)
- All 88 districts enriched: incumbent + party (from Wikipedia MLA list; the
  4 post-2022 by-election seats — Nepean, Prahran, Werribee, Warrandyte —
  individually cross-checked, prior fetch had stale/duplicate members) and
  region mapping (all 8 LC region pages, 88/88 districts covered, no gaps)
- **119 candidate records**, each with a genuine per-candidate citation (URL
  pulled from Wikipedia's actual footnote hrefs via JS extraction, not the
  Wikipedia page itself) — Labor/Liberal/Nationals/Greens Assembly candidates
  from `Candidates_of_the_2026_Victorian_state_election`, plus One Nation's
  Nepean candidate, 3 pre-nomination withdrawals/disendorsements (Kilmartin,
  Gourisetty, Deeming), 1 impossible source date caught and corrected
  (Wikipedia's own citation had a "2016" typo — verify anything that looks
  off, the upstream isn't infallible)
- **`data/vic2026/retirements.yaml`**: 19 sitting MPs (Labor 9, Liberal 6,
  Nationals 3, Greens 1) confirmed not recontesting, each sourced
- Deliberately did NOT record ~67 incumbents as 2026 candidates: Wikipedia's
  table cites them via a single blanket footnote (ref 16) that's actually
  about an unrelated Legislative Council preselection story, not a real
  per-person confirmation. Recording them anyway would misattribute a source.
  They're presumptively recontesting (not on the retirements list) but
  unconfirmed — coverage.json's `caveat` field says this explicitly, and it's
  why Labor's coverage count reads artificially low next to Liberal/Greens.
- `npm run validate` (CI-enforced: schema, vocab, referential integrity
  including retirements.yaml) and `npm run export` (JSON/CSV/coverage)
- No site yet

## Competitive context (evaluated 2026-07-27)

Wikipedia's "Candidates of the 2026 Victorian state election" page is
near-complete and free; The Tally Room has seat guides (paywalled till near
election); ABC coverage will dominate from campaign period; VEC publishes the
official list after nominations close 13 Nov 2026. The differentiated wedge is
ONLY: machine-readable open data + party coverage dashboard + evidence ledger.
Do not expand scope beyond the wedge. Kill criteria in docs/SCOPE.md.

## Blocked on Colin (cannot be done from here)

1. **Create the Cloudflare Pages project** — settings in docs/DEPLOYMENT.md.
   Needs account access; there is no API token in this environment.
2. **Confirm the DNS zone.** The account is known to hold `ozol.net.au`, but the
   site is specified to publish at `elections.oze.net.au` — a different apex.
   If `oze.net.au` isn't in the account, decide the real hostname, then update
   `site` in `site/astro.config.mjs`, `SITE.url` in `site/src/lib/site.mjs`, and
   the `Sitemap:` line in `site/public/robots.txt`.
3. **Check the authorisation statement.** `/about#authorisation` currently reads
   "Authorised by C. Dixon, OZE, Victoria." Verify against Electoral Act 2002
   (Vic) requirements — a fuller address may be required for electoral matter.
   No address was invented here.
4. **`elections@oze.net.au`** is referenced on /about — create or redirect it.

## TODO (priority order)

1. Close the 67-incumbent gap: find an individual, dated source for each
   presumed-recontesting Labor/Liberal/Nationals/Greens incumbent (party
   candidate page, local paper, social post) rather than leaving them
   unrecorded. List is in the "did NOT record" note above — cross-reference
   districts.yaml incumbents against candidates/ to regenerate it.
2. Minor parties + independents + Legislative Council tickets: same Wikipedia
   page has Socialists/AJP/Libertarian/independent columns per Assembly seat
   and full LC ticket tables per region — not entered yet (out of this pass's
   "major parties" scope). LC ticket tables are messy multi-party grids in
   plain-text form; parse carefully or fetch region-by-region.
3. Static site: Astro on Cloudflare Pages, custom domain elections.oze.net.au.
   First page = party coverage grid from dist/vic2026/coverage.json, WITH the
   caveat text surfaced prominently, not buried. Follow the oze playbook
   header/versioning conventions if adopting Aurora styling.
4. Authorisation statement page — check Electoral Act 2002 (Vic) requirements
   for authorisation of electoral matter before launch.
5. GitHub Issue templates for candidate submissions / corrections.

## Re-running the Wikipedia extraction

The candidates page's plain-text (via get_page_text) drops citation hrefs —
only the visible "Author (date). Title. Publisher." text survives. To get
real per-candidate URLs, pull `ol.references > li` from the live DOM via
javascript_tool (position in the list = footnote number; don't trust `id`
attribute parsing, Wikipedia's id suffixes aren't reliably sequential) then
match footnote numbers against the table. Large JS eval results get written
to a tool-results file automatically — the harness message names the
concrete path so you don't need to preview: the first line is a JSON array
`[{type,text}]`, and `.[0].text` is itself a **JSON-encoded string**, not the
raw object — `json.loads()` twice (once to unescape, once to parse) before
using with `jq`/Python. Ref 16 in this dataset was a mis-cited blanket
footnote — always sanity-check what a repeated footnote number is actually
citing before trusting it as a per-record source.

## Working rules

- Sync repo before editing (house rule).
- Nothing merges without a source; run `npm run check` before commit.
- Never commit: submitter details, unverified claims about named people,
  secrets. See ADR-4.
