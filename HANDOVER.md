# HANDOVER

For future sessions/agents. Read docs/DECISIONS.md before proposing any
infrastructure; the Workers/D1/R2 stack was already evaluated and rejected
(ADR-2). This is a data-in-git ledger with a static site on top.

## Operations / keeping data current (2026-07-29)

**[docs/OPS.md](docs/OPS.md)** — scan cadence, watch list, candidacy procedure,
agent vs human rules. Site updates when valid YAML hits `main`; no separate
“site update” cron.

- Manual verification required before merge (especially statuses about named people).
- `npm run report:coverage` / `npm run check:sources` — report only, never publish.
- Weekly GitHub Action `source-health` (Monday UTC + manual).
- Issue template: **New candidacy / status change**.

## Discovery / SEO / AI (updated 2026-07-29)

See **[docs/DISCOVERY.md](docs/DISCOVERY.md)** for the full checklist.

**In code:** JSON-LD, sitemap (~118 URLs), open `/llms.txt` (includes `/voting`,
`/polls`, poll JSON), `robots.txt` allows major AI bots, og:image, GSC DNS verify.

**Verified live (2026-07-29):** open `robots.txt` (no CF AI Disallow inject);
GPTBot/ClaudeBot get 200; `/llms.txt` includes voting + polls.

**Automated:** IndexNow key + GH Action after main push; `_headers` for cache;
sitemap lastmod/priority.

**Still human (GSC / Bing / social):**

1. GSC → Sitemaps → submit `https://electiontracker.au/sitemap-index.xml`
2. GSC → Request indexing only for priority hubs (DISCOVERY.md)
3. Bing Webmaster → import from GSC (IndexNow helps after that)
4. Facebook Sharing Debugger once on the homepage

## The site (added 2026-07-28)

**Live** at https://electiontracker.au since 2026-07-28. Astro static site in `site/`, 112 pages, deployed as an
assets-only Worker via Workers Builds — a push to `main` builds and deploys
itself.

URL shape is no-trailing-slash, enforced in two places that must stay in step:
`trailingSlash: "never"` (astro.config.mjs) and `"html_handling":
"drop-trailing-slash"` (wrangler.jsonc). The first deploy had them disagreeing
— Cloudflare 307'd `/districts/ripon` to `/districts/ripon/` while the
canonical tag claimed the unslashed form, so canonicals pointed at URLs that
redirected. Fixed; if you change one, change the other.
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

### Legal pages (added 2026-07-29)

`/privacy`, `/terms`, `/disclaimer`, linked from a new footer column. Written to
describe what the site *actually* does, not boilerplate: the "no cookies, no
analytics, no tracking" claims were verified against live response headers
(`curl -sI` — no `Set-Cookie` at all, even with a browser UA). Cloudflare's
Network Error Logging headers ARE present, so privacy.astro discloses them
rather than claiming nothing leaves the browser.

`LEGAL_UPDATED` in `site/src/lib/site.mjs` drives the "last reviewed" date on
all three — bump it whenever they change materially.

**Not legally reviewed.** These are careful, accurate and honest, but written by
an agent, not a lawyer. Before the campaign gets busy, have someone qualified
look at them — particularly the defamation exposure around `withdrawn` and
`disendorsed` statuses about named individuals, which is the single largest
legal risk this project carries.

### Still to do on the site
- Recent-changes feed derived from `git log` (in SCOPE's MVP, not built).
- Council **candidate** coverage is thin — only the 2 Western Metropolitan
  records exist. (Sitting MLCs are now fully recorded; candidates are not.)
  Per-region pages would be worth building once candidates exist.
- ~~Social preview~~ done: `og:image` 1200x630 generated from the brand banner
  (padded, not cropped, so the logo and badges survive), plus favicon /
  apple-touch icons from the round logo. Brand assets live in `images/`;
  web-ready copies in `site/public/images/`.
- Brand palette (navy/teal/gold) does not match the site shell (ink/sand/plum).
  Deliberately left alone — worth a decision, not an accident. Note teal was
  originally avoided because of the federal "teal independents" association.

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

## Data expansion (2026-07-29)

**203 candidate records**, up from 119. Extracted the Socialists and "Other"
columns of the Wikipedia candidates table, which the first pass never touched:
53 Victorian Socialists, 10 Animal Justice, 8 independents, 6 The West Party,
6 Socialist Alliance, 1 Libertarian.

Two of those are **not on the VEC register** — Socialist Alliance (seeking
registration) and The West Party (application received 11 June 2026). Both were
verified before recording rather than assumed. `parties.yaml` now carries
`registered: true|false|null` on every entry plus a `registration` block with
status, consequence and source for the unregistered two. This matters
editorially: a party still unregistered when nominations close has **no party
name printed beside its candidates** — they appear ungrouped. Surfaced on the
homepage table (an "unregistered" flag), the parties index and each party page.

`registered: null` on `independent` — it is a grouping, not a party, so
registration does not apply. Don't "fix" it to false.

Coverage now: Victorian Socialists 53/88, Greens 51/88, Liberal 35/88,
Labor 25/88, AJP 10/88, independents 8/88, West 6/88, Socialist Alliance 6/88,
Nationals 4/88, One Nation 1/88, Libertarian 1/88.

### Still not extracted
- Legislative Council ticket tables (per region, all parties) — messy
  multi-party grids in the Wikipedia plain text; fetch region-by-region.
- The ~67 incumbents still lack individual sources (unchanged, still the
  single biggest gap — it is why Labor reads 25/88).

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
- ~~Cloudflare project + custom domain~~ — deployed as an assets-only Worker
  via Workers Builds; `electiontracker.au` resolves and serves. A push to
  `main` now builds and deploys on its own (~1 min).
- ~~workers.dev duplicate hostname~~ — `workers_dev: false` set once the
  custom domain was confirmed working. `preview_urls: true` set explicitly to
  keep per-branch previews; these live on the workers.dev subdomain, so if
  previews stop appearing on the next branch push, that is the cause — flip
  `workers_dev` back if previews matter more.
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

1. **Close the incumbent gap** (~46 seats as of 2026-07-30): almost all
   remaining are **Labor** Assembly MLAs. Liberal and Nationals gaps closed
   in review batches (Fresh Start Tour + other named sources). Do **not** use
   Wikipedia blanket footnotes. Live list:
   [docs/incumbent-gap.md](docs/incumbent-gap.md).
2. **Legislative Council tickets** — region-by-region (party sources). Gap
   list: [docs/council-gap.md](docs/council-gap.md). Region pages live at
   `/regions` and `/regions/<slug>` (sitting MLCs + recorded candidacies).
3. ~~Static site~~ — live at electiontracker.au (Workers Builds).
4. ~~Authorisation / legal pages~~ — `/about` authorisation + privacy/terms/
   disclaimer (not lawyer-reviewed; do that before campaign heat).
5. ~~Issue templates~~ — New candidacy / status change template in place.
6. **Recent-changes feed** from `git log` over `data/` (still in SCOPE MVP).
7. **Discovery operator checklist** — GSC sitemap + hub indexing, Bing import
   (see [docs/DISCOVERY.md](docs/DISCOVERY.md)); GitHub repo homepage set to
   electiontracker.au; empty Wiki **disabled** (product is not a wiki).

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
