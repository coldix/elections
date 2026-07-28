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
- Council **candidate** coverage is thin — only the 2 Western Metropolitan
  records exist. (Sitting MLCs are now fully recorded; candidates are not.)
  Per-region pages would be worth building once candidates exist.
- Social preview image (`og:image`) not set; add a static one or generate.

## Current parliament (added 2026-07-28)

`data/vic2026/council-members.yaml` records all 40 sitting MLCs by region —
who holds each seat **today**, not the 2022 result. Mid-term changes captured:
Richard Welch replaced Matthew Bach (Feb 2024); Anasina Gray-Barberio replaced
Samantha Ratnam (Nov 2024); Adem Somyurek left the DLP (Mar 2024) and sits as
an independent, so the DLP holds no seat despite winning one in 2022; David
Limbrick's party was renamed Liberal Democrats → Libertarian (2023); Moira
Deeming was expelled and readmitted to the Liberal party room, and is a sitting
Liberal MLC even though she was disendorsed as a 2026 candidate.

`representationFor()` in `scripts/lib/data.mjs` derives per-party seat counts
(Assembly from `districts.yaml` incumbents, Council from the new file).
Validator enforces exactly 5 members per region — a miscount fails the build.

**Party listings are now ordered by current parliamentary representation**
(both houses, largest first, then alphabetically) instead of alphabetically.
`docs/METHODOLOGY.md` and `/methodology#ordering` were updated in the same
change so the published rule matches what the site actually does — if you
change the ordering again, change both.

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

1. **Create the Cloudflare project** — settings in docs/DEPLOYMENT.md.
   Dashboard-only: connecting a project to a GitHub repo (so pushes
   auto-deploy) is not exposed by the API or by `wrangler`. Do it once; after
   that every push deploys itself.
   Cloudflare now defaults new projects to **Workers Builds**, not Pages, so
   the repo carries `wrangler.jsonc` — an **assets-only** Worker (no `main`,
   no bindings, nothing runs per request). `npx wrangler deploy` fails without
   it. Verified with `npx wrangler deploy --dry-run`: 245 files, no bindings.

2. **Add the redirect for `electiontracker.com.au`** — DNS placeholder plus a
   dynamic Redirect Rule, both spelled out in docs/DEPLOYMENT.md. Do *not*
   attach it to Pages as a second custom domain; that would serve the site
   twice and split its search ranking.
3. **MX / SPF / DKIM / DMARC** on both domains for the Google Workspace routing.

Resolved 2026-07-28:
- ~~DNS zone~~ — superseded. The site now publishes at **electiontracker.au**
  (canonical), with **electiontracker.com.au** redirecting to it. Both in the
  dedicated Cloudflare account. A zone ID isn't needed: the Pages custom-domain
  flow creates the DNS record itself when the zone is in the same account.
- ~~Authorisation statement~~ — now reads "Authorised by Colin Dixon, 2 Fern
  Court, Mallacoota VIC 3892", with the PO Box shown as the postal address.
  Street address used because electoral-matter authorisations generally
  require one rather than a post office box; worth a final check against
  current VEC guidance before launch.
- ~~contact address~~ — now `elections@electiontracker.au`, routed via Google
  Workspace to `elections@ozol.org`. Only the branded address is published.

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
3. Static site: Astro on Cloudflare Pages, custom domain electiontracker.au.
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
