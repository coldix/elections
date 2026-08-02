# Changelog — since polls

Product and discovery work from the **polls module** (`d9861da`, 2026-07-29)
onward. For poll *method*, see [POLL-METHODOLOGY.md](POLL-METHODOLOGY.md). For
ongoing SEO/dashboard ops, see [DISCOVERY.md](DISCOVERY.md).

## 2026-08-02 — Policy matrix wave 6 (health, climate, immigration, education)

| Area | What shipped |
|---|---|
| **Health** | Liberal/Nationals $850m West Gippsland hospital (ABC). |
| **Climate** | Federal Liberal dump Net Zero (liberal.org.au); Nationals alignment. |
| **Immigration** | Federal Coalition: migration ceiling = homes built (Guardian/Taylor). |
| **Education** | Greens reinstate $2.4bn public schools demand. |
| **Treaty** | One Nation voted against Statewide Treaty. |

## 2026-08-02 — Policy matrix wave 5 (treaty, gender, energy, immigration, PT)

| Area | What shipped |
|---|---|
| **Treaty** | Labor + Greens Aboriginal affairs (Statewide Treaty); Coalition scrap already on file. |
| **Gender/social** | Labor family-violence $100m package. |
| **Energy** | Labor renewable targets; Greens ban new coal/gas. |
| **Immigration** | Federal Greens humanitarian expansion. |
| **Transport** | Greens extend free public transport call. |
| **Environment** | Labor native forest ban (2024) characterisation. |

## 2026-08-02 — Policy matrix: One Nation federal policies + methodology

| Area | What shipped |
|---|---|
| **One Nation** | Federal policies added for immigration, housing, cost of living, energy, climate, education, crime, debt-budget, gender-social — labelled **[Federal party policy]**. |
| **Method** | POLICY-METHODOLOGY: federal positions allowed when Vic source missing, with clear labelling. |
| **Sources** | onenation.org.au (immigration, housing, education, net zero); Guardian gas equity report. |

## 2026-08-02 — Policy matrix wave 4 (education, climate, forests, treaty, integrity)

| Area | What shipped |
|---|---|
| **Education** | Labor Free Kinder/TAFE/$5.5bn; Coalition scrap payroll tax on schools. |
| **Climate** | Labor Climate Strategy $8.5bn; Greens ban new coal/gas + resilience fund. |
| **Environment** | Greens native forest loophole-closure bill. |
| **Aboriginal affairs** | Coalition scrap treaty (Hansard). |
| **Corruption** | Coalition $15bn capital-works “corruption payments” claim (Hansard). |
| **Totals** | **34/70** cells · **79** claims. Still empty: One Nation column; immigration; gender-social. |

## 2026-08-02 — Policy matrix wave 3 (crime, infrastructure)

| Area | What shipped |
|---|---|
| **Crime & justice** | Labor ($1.7b safety package, bail, PSOs); Coalition Safer Communities (3,000 police, Adult Crime Adult Time); Greens custody/bail overcrowding bill. |
| **Infrastructure & transport** | Labor $1bn+ roads blitz + X’Trapolis trains; Coalition $5bn / 1m potholes + Nationals Fair Share Guarantee. |
| **Totals** | Climbing matrix fill; One Nation still empty pending Vic sources. |

## 2026-08-02 — Policy matrix wave 2 (energy, health, debt)

| Area | What shipped |
|---|---|
| **New issues** | **Energy**, **Health & Hospitals**, **Debt & Budget** for Labor/Liberal/Nationals/Greens where sourced. |
| **Housing boost** | Greens: +$4bn public housing, stamp duty cuts (party media 9 Jul 2026). |
| **Totals** | **17** policy records · **42** claims · **17/70** matrix cells filled. |
| **Empty** | One Nation still empty; Greens energy and most health cells sparse until stronger sources. |

## 2026-08-02 — First policy matrix seed (housing + cost of living)

| Area | What shipped |
|---|---|
| **Policies** | 8 party×issue files for **Housing & Planning** and **Cost of Living** (Greens, Labor, Liberal, Nationals). |
| **Sources** | Premier budget releases, ABC/Guardian, Hansard, Greens Victoria media, Nationals media. |
| **Empty** | **One Nation** cells left empty — no qualifying Victorian state position source found in this pass. |
| **Exports** | Matrix filled_cells updates on next build via `policies.json`. |

## 2026-08-02 — Policy matrix & issues jurisdiction guide

| Area | What shipped |
|---|---|
| **Issues guide** | New **`/parties/issues`** — 14 issue areas with State / Federal / Local jurisdiction badges and plain-language roles. |
| **Policy matrix** | New **`/parties/matrix`** — five fixed columns (Greens, Labor, Liberal, Nationals, One Nation) with CSS column toggles; empty cells honest until claims are sourced. |
| **Data** | `data/vic2026/issues.yaml` + `policies/`; schemas; validate; exports `issues.json`, `policies.json`, `policies.csv`. |
| **Method** | [POLICY-METHODOLOGY.md](POLICY-METHODOLOGY.md) + ADR-11: no ratings, quote + source only, taxpayer/PBO/debt chips for fiscal claims. |
| **Open data** | Catalog on `/data` updated; methodology section for policy ledger. |

## 2026-08-01 — Labor gap progress + Maas open seat

| Area | What shipped |
|---|---|
| **Retirement** | **Gary Maas** (Labor, Narre Warren South) — will not recontest 2026; [own statement](https://www.garymaas.org.au/media-releases/statement-by-gary-maas-mp) 5 Jun 2026. |
| **Labor recontest** | **Anthony Cianflone** (Pascoe Vale) — Brunswick Voice “seeking re-election”. **Kat Theophanous** (Northcote) — Herald Sun “against Labor’s Kat Theophanous”. **Christine Couzens** (Geelong) + **Ella George** (Lara) — Geelong Times “incumbents … will also contest” / Pobjoy “challenging Labor MP Christine Couzens”. |
| **Council** | **Bev McArthur** (Liberal, Western Victoria) — Geelong Times: again top of Liberal upper-house ticket. |
| **Labor gap** | [labor-gap.md](labor-gap.md): **~38** remaining; Vic Labor Our Team alone is **not** a bulk recontest source. |

## 2026-08-01 — Slim home, open seats, build stamp, ops scan

| Area | What shipped |
|---|---|
| **Homepage** | Slimmed (~560 KB → ~36 KB HTML): compact coverage teaser, dual-metric caveat, open-contest strip; full matrix stays on `/parties`. |
| **Open seats** | New **`/open-seats`** — full retirement tables (MLA/MLC) with sources; linked from footer + home. |
| **Find my seat** | VEC boundary lookup buttons on Assembly, voting, open-seats. |
| **Build version** | Each deploy stamps `YYYYMMDD.HHmm-aest+githash` (Australia/Melbourne) via `scripts/write-build-meta.mjs`; shown in **footer** + `/build-meta.json`. |
| **Dates** | `/voting` key dates list derived from `election.yaml` (not hard-coded roll-close prose alone). |
| **Ops** | `npm run scan:leads` incremental discovery (see [leads/README.md](leads/README.md)). |
| **Labor gap** | Documented in [labor-gap.md](labor-gap.md) — sitting Labor MLAs need individual recontest sources (no bulk wiki import). |

---

## 2026-07-31 — Homepage countdown, videos, buttons, launch scrape

| Area | What shipped |
|---|---|
| **Countdown** | Live **`ddd:hh:mm:ss`** until indicative election-day polls open (28 Nov 2026, 08:00 Melbourne); unit labels under each digit; VEC caveat for hours / early voting. |
| **Homepage** | “Start here” path cards (Assembly, voting, regions, polls); poll average in hero buttons. |
| **YouTube** | Click-to-load embeds (`YouTubeLite` + `lib/videos.mjs`) on `/voting` (ballot), `/assembly` (local seat), `/regions` (8 regions); poster/iframe fill fixes; privacy disclosure. |
| **CTAs** | Global `btn-sm` / `btn-row`; video and house-switch links as buttons, not bare underlines. |
| **Data (launch scrape)** | **Tyrrell** (One Nation, Northern Victoria). **20 Greens** missing from ledger (12 Assembly + 8 Council region leads/MLCs) from [greens.org.au/vic/candidates](https://greens.org.au/vic/candidates). **Liberal Council:** Xavier Boffa (Southern Metro), Steve Brooks (Northern Victoria). **Retirements 30 Jul:** Lily D’Ambrosio (Mill Park MLA), Harriet Shing (Eastern Victoria MLC) — [ABC](https://www.abc.net.au/news/2026-07-30/victorian-mp-harriet-shing-retirement/106977588). Ledger **250** candidacies after scrape. |
| **Theme** | Site-wide light/dark toggle + Oze footer credit (earlier same window). |

Deploy: push to `main` → Cloudflare Workers Builds (~1 min).

---

## 2026-07-30 — Assembly / Council URLs, atlases, maps, SEO

Chamber indexes now use chamber names in the URL; map/history atlases sit off
the main nav. Sitemap/GSC guidance updated; GSC accepted `sitemap.xml`.

**Commits (newest first):** `5e87cab` … `0f7f91b` (also data commits for
incumbents, occupations, Council bios earlier in the day — see git log).

| Area | What shipped |
|---|---|
| **Assembly** | Primary index at **`/assembly`** (nav **Assembly**). 88 districts by region, sitting members, candidates. Map **top-right** in header (no sticky left column). |
| **Council** | Primary index at **`/council`** (nav **Council**). 8 × 5 = 40 seats, sitting MLCs, candidacies. Same header map layout. |
| **District atlas** | **`/districts`** — not in top nav. Geographic Vic map (2022 results colouring), population context (equal electors vs land area), area stats, notable seats, full A–Z with km² / formed year. |
| **Region atlas** | **`/regions`** — not in top nav. Geographic map of 8 Council regions, history (provinces → 2006 PR → 2021 redivision), land area by region. |
| **Detail URLs** | Unchanged: `/districts/<slug>`, `/regions/<slug>`. Breadcrumbs → Assembly / Council. |
| **Data** | `data/vic2026/district-stats.yaml` (area_km2, formed); maps under `site/public/images/maps/`. |
| **About** | **Maps & atlases** — two buttons only: District atlas, Region atlas. |
| **SEO** | `robots.txt` hub list; sitemap priorities (hubs 0.9, atlases 0.8); `llms.txt` + IndexNow; post-build **`/sitemap.xml`** (`scripts/finalize-sitemap.mjs`); `_headers` XML content-type. |
| **GSC** | Sitemap **Success** on `https://electiontracker.au/sitemap.xml`. Sitemap XML is not a searchable page (“not on Google” for the XML URL is expected). |

**Public surfaces**

| URL | Role |
|---|---|
| https://electiontracker.au/assembly | Lower house candidates (main nav) |
| https://electiontracker.au/council | Upper house candidates (main nav) |
| https://electiontracker.au/districts | District atlas (map, population/area, history) |
| https://electiontracker.au/regions | Region atlas (map, history) |
| https://electiontracker.au/sitemap.xml | Preferred crawl inventory |

Also earlier same day: incumbent-gap batches, Council region pages + bio fields,
occupation/background + personal links, poll charts / ledger expansion (see
commits below and prior changelog sections).

---

## 2026-07-30 — Case-by-case poll average exception

- Party / union / advocacy commissioners remain **out of the average by default**.
- New optional field `eligibility_exception`: required by CI when those
  commissioner types are marked `eligible_for_average: true`.
- First use: **RedBridge for Victorian Trades Hall** (`redbridge-2026-07-trades-hall`)
  enters the average with a written justification (credible pollster; tracks
  independent media RedBridge/Accent series). Per-record only — not a standing
  waiver.
- Docs: [POLL-METHODOLOGY.md](POLL-METHODOLOGY.md#case-by-case-exceptions),
  ADR-10, inventory, SCOPE, OPS.

## 2026-07-30 — Expand Vic 2026 poll ledger

Added verified statewide Assembly primary rows (sources re-checked):

| id | Pollster | Fieldwork end |
|---|---|---|
| `newspoll-2026-07` | Newspoll (*Australian*) | 26 Jul 2026 |
| `demosau-2026-06` | DemosAU / Premier National | 11 Jun 2026 |
| `resolve-2026-06-age` | Resolve (*Age*) | ~12 Jun 2026 |
| `roy-morgan-2026-04` | Roy Morgan | 24 Apr 2026 |
| `resolve-2026-04-age` | Resolve (*Age*) | ~18 Apr 2026 |
| `freshwater-2026-03` | Freshwater (Herald Sun) | 23 Mar 2026 |
| `redbridge-accent-2026-02-afr` | RedBridge/Accent (AFR) | 27 Feb 2026 |
| `freshwater-2026-02` | Freshwater (Herald Sun) | 23 Feb 2026 |

Inventory updated to mark ledger status. Average window now includes Newspoll as the newest media series.

## 2026-07-29 — Polls module (baseline)

**Commit:** `d9861da` — *feat: sourced poll ledger and transparent primary-vote average*

| Area | What shipped |
|---|---|
| Data | Sourced statewide primary-vote polls under `data/vic2026/polls/` (YAML) |
| Schema / CI | `schema/poll.schema.json`; validate + export in build |
| Engine | `scripts/lib/polls.mjs` — eligibility, weighting, uncertainty bands |
| Exports | `polls.json`, `poll-average.json` (via export pipeline) |
| Site | `/polls` page — average + ledger; nav links |
| Policy | [POLL-METHODOLOGY.md](POLL-METHODOLOGY.md), [polls-inventory.md](polls-inventory.md), ADR in [DECISIONS.md](DECISIONS.md), [SCOPE.md](SCOPE.md) polling section |
| Copy | about / methodology / disclaimer / data pages updated so polling is in-product, not aspirational |

**Guardrails (unchanged):** no seat forecasts; no 2PP without published preference assumptions; party/union/advocacy polls default to `eligible_for_average: false` (exceptions only with `eligibility_exception`).

Initial ledger (examples): Freshwater, RedBridge (+ Accent/AFR), Resolve Strategic, Roy Morgan.

---

## 2026-07-29 — Civic voting guide

**Commit:** `6ce63a9` — *feat: add civic voting guide for Victorian electors*

- New hub: **`/voting`** — enrolment, compulsory voting, preferential rules for Assembly and Council; always defers to VEC/AEC
- In scope as neutral civic explainers (not how-to-vote advice) — [SCOPE.md](SCOPE.md)
- Header / footer / homepage / disclaimer links

---

## 2026-07-29 — Social brand split

**Commit:** `e20d287` — *docs: social brand split; wire extensible project social links*

- [SOCIAL.md](SOCIAL.md) — Election Tracker vs oze.au vs personal channels
- `SOCIAL` + `socialLinks()` in `site/src/lib/site.mjs` → footer, privacy “Our social accounts”, JSON-LD `sameAs`
- Facebook Page wired: `facebook.com/election.tracker.au`

---

## 2026-07-29 — Discovery / SEO / AI citation

**Commits:** `956a870`, `52c296a`

| Area | What shipped |
|---|---|
| Crawl policy | `robots.txt` — allow major AI bots; licence/attribution notes |
| AI index | `/llms.txt` expanded (hubs, poll exports, coverage caveat) |
| Headers | `site/public/_headers` — asset cache, short cache + CORS for `/data/*` |
| Sitemap | `@astrojs/sitemap` → `sitemap-index.xml` + `sitemap-0.xml` (~118 URLs including `/polls`, `/voting`) |
| IndexNow | Key file, `npm run indexnow`, CI after deploy (`.github/workflows/indexnow.yml`) |
| Docs | [DISCOVERY.md](DISCOVERY.md) human dashboard checklist |

Live checks around ship: sitemap well-formed; AI crawlers not blocked by Cloudflare managed robots; OG scrape clean on homepage.

---

## 2026-07-29 — Operator / dashboard work (human)

Done outside git (dashboards). Tick against [DISCOVERY.md](DISCOVERY.md) as needed.

| Item | Status | Notes |
|---|---|---|
| GSC property | Verified earlier (`sc-domain:electiontracker.au`) | HTML meta backup in `site.mjs` |
| GSC sitemap submit | **Success** (2026-07-30) | Prefer `https://electiontracker.au/sitemap.xml` (also index) |
| GSC request indexing (hubs only) | Operator | Prefer `/`, `/voting`, `/data`, `/methodology`, `/polls`, … — not all districts |
| Bing Webmaster | Operator | Prefer import from GSC; IndexNow already automated |
| Facebook Sharing Debugger | Done (homepage) | OG tags OK; ignore `fb:app_id` warning unless a FB App is wanted for Insights |
| Project YouTube | **Live** | [youtube.com/@electiontrackerau](https://www.youtube.com/@electiontrackerau) — channel set up; listed with **Google** and **Bing** |
| Wire YouTube into site | Code | `SOCIAL.youtube` → footer, privacy, JSON-LD `sameAs` (see [SOCIAL.md](SOCIAL.md)) |
| Cloudflare AI crawl blocks | Open (verified live) | Re-check if `Disallow` for GPTBot etc. reappears |
| Light external links | Optional | FB Page post, oze portfolio; no bought links |

---

## New public surfaces (post-polls)

| URL | Role |
|---|---|
| https://electiontracker.au/assembly | Legislative Assembly candidates (main nav) |
| https://electiontracker.au/council | Legislative Council candidates (main nav) |
| https://electiontracker.au/districts | District atlas — map, area/population, history |
| https://electiontracker.au/regions | Region atlas — map, history |
| https://electiontracker.au/polls | Primary-vote average + sourced ledger |
| https://electiontracker.au/voting | Civic voting explainer |
| https://electiontracker.au/data | Open exports (includes poll JSON/CSV) |
| https://electiontracker.au/llms.txt | AI-oriented site map |
| https://electiontracker.au/sitemap.xml | Crawl inventory (preferred) |
| https://electiontracker.au/sitemap-index.xml | Crawl index (compat) |
| https://www.youtube.com/@electiontrackerau | Project long-form video home |
| https://www.facebook.com/election.tracker.au/ | Primary social distribution |

---

## 2026-07-29 — Ops runbook + source health

- [OPS.md](OPS.md) — human cadence, watch list, encode→merge→deploy loop; agents draft only
- `npm run check:sources` + weekly `.github/workflows/source-health.yml` (report only)
- `npm run report:coverage` — same coverage rules as the site
- Issue template: New candidacy / status change

## Not done in this window

- Explainer video published on the project YouTube (channel exists; content TBD)
- Mass district “Request indexing”
- Analytics / tracking (deliberately never)
- Forecast / 2PP / seat models
- Personal channels in footer or `sameAs`
- Phase 2: scheduled news digests / auto draft-PRs

---

## Related

- [OPS.md](OPS.md) — monitor cadence, agent rules, source-health automation  
- [POLL-METHODOLOGY.md](POLL-METHODOLOGY.md)  
- [DISCOVERY.md](DISCOVERY.md)  
- [SOCIAL.md](SOCIAL.md)  
- [SCOPE.md](SCOPE.md)  
- [DECISIONS.md](DECISIONS.md)  
