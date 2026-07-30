# Changelog — since polls

Product and discovery work from the **polls module** (`d9861da`, 2026-07-29)
onward. For poll *method*, see [POLL-METHODOLOGY.md](POLL-METHODOLOGY.md). For
ongoing SEO/dashboard ops, see [DISCOVERY.md](DISCOVERY.md).

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
| GSC sitemap submit | In progress / operator | `https://electiontracker.au/sitemap-index.xml` is live and valid |
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
| https://electiontracker.au/polls | Primary-vote average + sourced ledger |
| https://electiontracker.au/voting | Civic voting explainer |
| https://electiontracker.au/data | Open exports (includes poll JSON/CSV) |
| https://electiontracker.au/llms.txt | AI-oriented site map |
| https://electiontracker.au/sitemap-index.xml | Crawl index |
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
