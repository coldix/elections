# Changelog — since polls

> **Updated** 2026-09-02 · hub [../README.md](../README.md)

Product and discovery work from the **polls module** (`d9861da`, 2026-07-29)
onward. For poll *method*, see [poll-methodology.md](poll-methodology.md). For
ongoing SEO/dashboard ops, see [discovery.md](discovery.md).

## 2026-09-02 — One Nation Assembly wave; DemosAU federal poll

| Area | What shipped |
|---|---|
| **One Nation** | 15 Assembly endorsements from the party candidate pages (Lindrum, Schellekens, Hawken, Baker, Wright, Campbell, Lopez, Goodman, Wilke, Cooper, Beards, Crutchfield, Rindfleish, Bryant, Geard) |
| **Victorian Socialists** | Reema Ababneh (Carrum) from the party candidate page |
| **Federal polls** | DemosAU/Capital Brief 18–20 Aug: Labor 26 / Coalition 25 / One Nation 24 / Greens 12 / Others 13. Ledger 18 → **19**. Vic still has no statewide Assembly poll after Resolve 9–15 Aug |
| **Ledger** | 318 → **334** Vic candidacy files. Guardian Essential (1–2 Sep) not encoded: Guardian printed ALP/L-NP/ONP only |

## 2026-09-02 — 2022 results on every Assembly district page

| Area | What shipped |
|---|---|
| **2022 results** | Each `/elections/vic/2026/districts/:slug` page shows the 2022 first-preference vote and two-candidate preferred finish, plus Labor–Coalition 2PP when the VEC published one. Bass is Labor 50.24% to Liberal 49.76%. Brunswick’s 2CP is Greens versus Labor |
| **Not a forecast** | No uniform swing, likely winner, pendulum or seat total. A statewide strip compares 2022 primaries with the current tracker average and says it is not applied to the seat (ADR-17). One Nation was 0.28% of the 2022 Assembly primary |
| **Data** | `data/vic2026/district-results-2022.yaml` (88 districts, VEC URLs). Exports `district-results-2022.json` / `.csv` |

## 2026-09-01 — Federal poll catch-up; What's new page

| Area | What shipped |
|---|---|
| **Vic polls** | Scanner + Wikipedia + Poll Bludger: no new statewide Assembly VI after Resolve 9–15 Aug |
| **Federal polls** | Five House VI records since the 19 Aug encode: Roy Morgan 17–23 Aug and 24–30 Aug (pollster PDFs), YouGov/News24 Pulse 18–24 Aug, Newspoll 24–28 Aug, RedBridge/Accent AFR 24–28 Aug. Ledger 13 → **18** |
| **Latest** | `/latest` lists sourced polls and Victorian candidacies from the last 21 days. Homepage hero has a **What's new** button to the right of the heading |

## 2026-09-01 — Poll pages: Vic numbers, federal date, both findable

| Area | What shipped |
|---|---|
| **Bug** | The Victorian polls page loaded `listElections()[0]`, which is `federal-49` alphabetically, so `/elections/vic/2026/polls` published the **federal** average (Labor 28.3%, as of 16 Aug) and linked to `/data/federal-49/`. It now loads `vic2026` (Labor 25.4%, as of 15 Aug) |
| **Board** | Both poll pages open on a large as-of date and five primary shares, not a compact table. Each page links to the other ledger so the two dates cannot be mistaken for one |
| **Find** | Same board on the national home (Vic beside federal), the Vic overview and the federal overview. Menu: **Vic polls** and **Federal polls** |

## 2026-08-31 — Seven sourced Vic candidacies

| Area | What shipped |
|---|---|
| **Greens** | Mitch Pope (Bellarine) from the party candidate page |
| **Victorian Socialists** | Andy Raven (Eureka) from the party candidate page |
| **One Nation** | Paul Ballinger (Eureka), Donna Buxton (Ripon), Stuart Robinson (Wendouree), Vaughan Williams (Western Victoria LC). Party pages opened before encode; ABC News 30 Aug named Ballinger, Buxton, Robinson and Williams at the Marnoo Farmers Fightback rally. Williams spelling follows the party page (ABC used "Vaughn") |
| **Independent** | Tony Briffa (Williamstown, announced) from the campaign site; tip via GitHub issue #33 |
| **Ledger** | 311 → **318** Vic candidacy files. All seven rest on a party or campaign primary |

## 2026-08-27 — House promotions on three pages

| Area | What shipped |
|---|---|
| **Placements** | One oze adnet row on `/`, `/elections/vic/2026` and `/elections/vic/2026/polls` only (1/2/3 columns by width). Candidate, district, party, policy, matrix, methodology, data and legal pages stay ad-free |
| **Disclosure** | `/privacy` and `/about` describe cookie-free house promotions labelled **Promo**. ADR-16 |

## 2026-08-23 — Home page simplified; shared card primitives

| Area | What shipped |
|---|---|
| **Home** | Seven sections to five, 6450px to 3438px. The monthly survey was linked three times (hero panel, section, header) while the issues survey — a *different* survey — appeared once in the same style. One **Have your say** section now carries both, each with its time commitment. Header keeps its single link |
| **Hero** | Survey panel and four competing buttons replaced by one primary action, one secondary, and a line of type carrying the proof |
| **Structure** | "How to use and cite" + "Check the work" (eight near-identical cards) merged into one three-card section. Countdown moved inside the Victoria section; its title is no longer a duplicate `h2` |
| **Primitives** | `.section-head`, `.card-grid` / `.card-grid-wide`, `.card-interactive`, `.link-card`, `.section-aside`, `--shadow-lift` in `global.css`. Adopted on the Victoria overview, `/elections`, federal 49, NSW 2027, the generic placeholder and three party indexes — net 44 fewer lines. Vic party cards keep their party-coloured hover |

## 2026-08-23 — Discovery scanner: five parser bugs, fixture tests, trust tiers

| Area | What shipped |
|---|---|
| **Parser fixes** | Multi-line citations broke row splitting (truncated names, shifted columns); `<br>`-separated candidates merged into one lead; One Nation names could not start on a hyphen; **column 5 read as Socialists when it is One Nation** (all 11 One Nation rows misattributed, Socialists column never read); One Nation seat terminator extracted 3 of 19. Wikipedia extraction 246 → 316, One Nation 3 → 19 |
| **Tests** | 22 fixture tests (`tests/`) over verbatim rows from the live sources, run in CI before validation. Each parser fix mutation-checked |
| **Trust tiers** | `scripts/lib/source-trust.mjs` ranks leads `primary` → `secondary` → `social` → `wikipedia-only` per ADR-14. A wiki row is rated on the citation underneath it, and the digest prints that citation instead of the Wikipedia URL. Named `<ref name=X/>` references resolved |

## 2026-08-23 — Vic Socialists wave; every record off Wikipedia

| Area | What shipped |
|---|---|
| **Vic Socialists** | 15 Assembly candidates verified against party pages — Bass, Benambra, Bendigo East, Geelong, Kew, Lara, Macedon, Mildura, Mill Park, Mordialloc, Ripon, South Barwon, South-West Coast, Wendouree, Yan Yean. Invisible to the scanner until the column-mapping fix |
| **Vic Labor** | Bridget Mullahy (Brighton), Elizabeth Nealy (Mill Park) from official party pages |
| **Source repair** | Eight records rested on Wikipedia; four cited a real publisher but linked to the Wikipedia *biography of the journalist or MP* (Farr, McKenzie, Sun, Ibuki). All re-sourced with `corrections`. Brooks and Boffa were marked "party site blocked automated fetch" — the site is client-rendered, not blocking. **Ledger now has zero records resting on Wikipedia** |
| **Correction** | Jessie Weatherly → **Weatherley** (Eltham, One Nation) per the party's own page; the mismatch was defeating ledger dedup |
| **Not encoded** | Catherine D'Arcy (Greens, Dandenong) — cited article never mentions her, and the Greens' own list of 80 has no Dandenong candidate. Recorded under Rejected leads in [leads/README.md](leads/README.md) |
| **Polls** | Nothing new in the 19–23 Aug window. Roy Morgan's 17 Aug Legislative Council projection added as a third source on the existing 5–7 Aug SMS poll |

## 2026-08-20 — Issues survey v2 (blind comparison)

| Area | What shipped |
|---|---|
| **Survey** | Rate 14 issues; blind comparison of 10 differentiated positions; pie of your picks; Vic vs Everywhere |
| **Selection** | `differentiated: true` on 10 issues. Immigration dropped (federal). Firearms, corruption, debt, forestry rated only |

## 2026-08-20 — Short blind claims on policy records

| Area | What shipped |
|---|---|
| **Policies** | `blind_claim` on each Vic 2026 policy YAML — a few words from the headline, no party name, for the issues survey |

## 2026-08-20 — Vic issues survey invitation

| Area | What shipped |
|---|---|
| **Issues survey** | Open oze survey at [survey.oze.net.au/s/vic-issues](https://survey.oze.net.au/s/vic-issues): rank the 15 matrix issues, pick whose sourced policy is closest in your view. Public opinion — not a scorecard, not in the average |
| **Tracker CTAs** | Matrix, policy pages, jurisdiction guide, key differences, and homepage |

## 2026-08-20 — Header hamburger on all widths

| Area | What shipped |
|---|---|
| **Header** | Hamburger menu is the site nav at every viewport, not only below 64rem. **Survey** is the first item in the drawer |

## 2026-08-19 — Oze monthly survey invitation

| Area | What shipped |
|---|---|
| **Vic / federal polls + home** | Invitation to the open [oze monthly survey](https://survey.oze.net.au/s/monthly-poll). Labelled not scientific and **not** in the tracker average |
| **Header / hero** | Homepage hero promo + **Take the survey**; hamburger menu includes **Survey** |

## 2026-08-19 — Poll catch-up + Allan retirement + candidate wave

| Area | What shipped |
|---|---|
| **Vic polls** | DemosAU/Premier National (6–11 Aug) and Resolve/*Age* (9–15 Aug, first after Carroll spill) under `data/vic2026/polls/` |
| **Federal polls** | Resolve/Nine (9–15 Aug) and Roy Morgan (10–16 Aug, finding 10311) under `data/federal-49/polls/` |
| **Retirement** | **Jacinta Allan** (Labor, Bendigo East) — will not recontest; [ABC](https://www.abc.net.au/news/2026-08-14/jacinta-allan-former-victorian-premier-quitting-politics/106791250) 14 Aug. Candidate file marked `withdrawn`. **David Ettershank** (Legalise Cannabis, Western Metro) added from 2 Jun announcement |
| **Vic Greens** | Party-profile endorsements: Perry (Narre Warren North), Jane (Sydenham); Nasim (Broadmeadows) from official Greens Instagram; De Silva (Berwick) announced via candidate Facebook |
| **Vic One Nation** | Nine Assembly names from News24 19 Aug list (Barnes / Essendon plus eight Wikipedia-mapped seats) |
| **Vic Liberals** | Ambry (Frankston) and Dyson (Pakenham) recorded as wiki-only / unconfirmed |

## 2026-08-14 — Vic candidates + federal poll catch-up

| Area | What shipped |
|---|---|
| **Federal polls** | Early-August VI: Newspoll (3–7 Aug), Roy Morgan (3–9 Aug), YouGov News24 Pulse (4–10 Aug) under `data/federal-49/polls/` |
| **Vic Greens** | Party-profile endorsements: Lightbody (Bulleen), Katsikis (Malvern), Schofield (Mulgrave), Hsieh (Oakleigh), Huynh (St Albans) |
| **Vic majors** | Seven Assembly names first recorded from Wikipedia, then upgraded where cited primaries exist (Labor team pages, Gazette, Liberal team URLs, social for Awad/Cottom) |
| **Hygiene** | Merged remote agent branches pruned; repo hygiene + validate green; live build meta at `0711a4f` before this docs stamp |

## 2026-08-09 — NSW 2027 sitting-members tracker

| Area | What shipped |
|---|---|
| **Data** | `data/nsw2027/` — 93 districts, 93 MLAs, 42 MLCs (21 up / 21 continuing), parties |
| **Kind** | `state-foundation` loader (`scripts/lib/state-foundation.mjs`), validate + export |
| **Site** | `/elections/nsw/2027` (districts, assembly, council, parties, open data) |
| **Sources** | Parliament of NSW official LA/LC downloads; term class with replacement inheritance |
| **Federal** | Policy thickening continued (e.g. hors de combat war-crimes definition claims) |

## 2026-08-09 — SEO + AI discovery pass

| Area | What shipped |
|---|---|
| **JSON-LD** | Richer Organization/WebSite; per-page WebPage; FAQ on home + polls; Dataset on polls |
| **AI files** | Expanded `/llms.txt` + new `/llms-full.txt`; head alternate links |
| **Crawl** | Canonical hub paths in robots + IndexNow; hreflang en-AU |
| **Copy** | Homepage / Vic / polls titles and ledes tuned for search intent |

## 2026-08-09 — Google Analytics 4

| Area | What shipped |
|---|---|
| **Measurement** | GA4 `G-CLH6BNKFEV` sitewide (`Base.astro` + `SITE.gaMeasurementId`) |
| **Privacy** | `/privacy` rewritten to disclose Analytics; `LEGAL_UPDATED` 2026-08-09 |
| **ADR** | ADR-12 supersedes “analytics deliberately never” |

## 2026-08-03 — Docs stamp + product surface (sync)

| Area | What shipped |
|---|---|
| **Docs** | Version + AEST stamp on primary docs; README and SCOPE caught up to policy product; `docs/README.md` index. |
| **main tip** | One Nation 8-region Council slate (`91ecdbf`); key differences, party profiles, issue pages, coalition view already on main from agent merges. |

## 2026-08-02 — Policy matrix wave 7 (near-complete fill)

| Area | What shipped |
|---|---|
| **Labor** | Federal migration 185k; IBAC follow-the-money powers. |
| **One Nation** | Rosebud Hospital PPP (health + infra delivery model). |
| **Coalition environment** | Liberals scrap offshore wind zones; Nationals/Coalition transmission Plan B (reported). |
| **Greens** | School equity framing (gender-social); IBAC powers call. |
| **Totals** | **66/70** cells. Empty: One Nation corruption & environment; Liberal/Nationals gender-social. |

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
| **Method** | [policy-methodology.md](policy-methodology.md) + ADR-11: no ratings, quote + source only, taxpayer/PBO/debt chips for fiscal claims. |
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
- Docs: [poll-methodology.md](poll-methodology.md#case-by-case-exceptions),
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
| Policy | [poll-methodology.md](poll-methodology.md), [polls-inventory.md](polls-inventory.md), ADR in [decisions.md](decisions.md), [scope.md](scope.md) polling section |
| Copy | about / methodology / disclaimer / data pages updated so polling is in-product, not aspirational |

**Guardrails (unchanged):** no seat forecasts; no 2PP without published preference assumptions; party/union/advocacy polls default to `eligible_for_average: false` (exceptions only with `eligibility_exception`).

Initial ledger (examples): Freshwater, RedBridge (+ Accent/AFR), Resolve Strategic, Roy Morgan.

---

## 2026-07-29 — Civic voting guide

**Commit:** `6ce63a9` — *feat: add civic voting guide for Victorian electors*

- New hub: **`/voting`** — enrolment, compulsory voting, preferential rules for Assembly and Council; always defers to VEC/AEC
- In scope as neutral civic explainers (not how-to-vote advice) — [scope.md](scope.md)
- Header / footer / homepage / disclaimer links

---

## 2026-07-29 — Social brand split

**Commit:** `e20d287` — *docs: social brand split; wire extensible project social links*

- [social.md](social.md) — Election Tracker vs oze.au vs personal channels
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
| Docs | [discovery.md](discovery.md) human dashboard checklist |

Live checks around ship: sitemap well-formed; AI crawlers not blocked by Cloudflare managed robots; OG scrape clean on homepage.

---

## 2026-07-29 — Operator / dashboard work (human)

Done outside git (dashboards). Tick against [discovery.md](discovery.md) as needed.

| Item | Status | Notes |
|---|---|---|
| GSC property | Verified earlier (`sc-domain:electiontracker.au`) | HTML meta backup in `site.mjs` |
| GSC sitemap submit | **Success** (2026-07-30) | Prefer `https://electiontracker.au/sitemap.xml` (also index) |
| GSC request indexing (hubs only) | Operator | Prefer `/`, `/voting`, `/data`, `/methodology`, `/polls`, … — not all districts |
| Bing Webmaster | Operator | Prefer import from GSC; IndexNow already automated |
| Facebook Sharing Debugger | Done (homepage) | OG tags OK; ignore `fb:app_id` warning unless a FB App is wanted for Insights |
| Project YouTube | **Live** | [youtube.com/@electiontrackerau](https://www.youtube.com/@electiontrackerau) — channel set up; listed with **Google** and **Bing** |
| Wire YouTube into site | Code | `SOCIAL.youtube` → footer, privacy, JSON-LD `sameAs` (see [social.md](social.md)) |
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

- [ops.md](ops.md) — human cadence, watch list, encode→merge→deploy loop; agents draft only
- `npm run check:sources` + weekly `.github/workflows/source-health.yml` (report only)
- `npm run report:coverage` — same coverage rules as the site
- Issue template: New candidacy / status change

## Not done in this window

- Explainer video published on the project YouTube (channel exists; content TBD)
- Mass district “Request indexing”
- Forecast / 2PP / seat models
- Personal channels in footer or `sameAs`
- Phase 2: scheduled news digests / auto draft-PRs

---

## Related

- [ops.md](ops.md) — monitor cadence, agent rules, source-health automation  
- [poll-methodology.md](poll-methodology.md)  
- [discovery.md](discovery.md)  
- [social.md](social.md)  
- [scope.md](scope.md)  
- [decisions.md](decisions.md)  
