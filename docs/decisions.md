# Architecture Decisions

> **Version** `20260803.1631-aest+91ecdbf` · **Updated** 2026-08-03 16:31 AEST  
> git `main` @ [`91ecdbf`](https://github.com/coldix/elections/commit/91ecdbf) · hub [../README.md](../README.md)

Short ADR log. Future agents: read this before proposing infrastructure.

## ADR-1: Data lives in git as YAML, not in a database

**Decision.** Every district, region, party and candidacy is a YAML file in
`data/`. Git history is the correction/audit trail. JSON Schema + CI validate
every change. Exports (JSON/CSV) are build artefacts.

**Why.** The dataset is tiny (hundreds of records per election) and
change-tracked by requirement. A database adds hosting cost, backup burden,
migration risk and provider lock-in for zero benefit at this scale. Git gives
versioning, review workflow, public transparency and portability for free.

**Consequences.** Editorial workflow = PRs. Submissions = GitHub Issues.
"Recent changes" derives from git log. If the dataset ever outgrows flat files
(unlikely below tens of thousands of records), export to SQLite from the same
YAML — the schema is the contract, not the storage.

## ADR-2: Static site, no server runtime and no database

**Decision.** The site is a fully static build (Astro preferred; any SSG works)
deployed to Cloudflare from GitHub. No D1, no R2, no KV, no Turnstile, and no
request-time code of any kind.

**Amended 2026-07-28.** Cloudflare now steers new projects into the *Workers*
flow rather than Pages, so the project deploys as an **assets-only Worker**:
`wrangler.jsonc` declares an `assets.directory` and deliberately has **no
`main` entry point**, so there is no Worker script and nothing executes per
request. Cloudflare serves the built files from its edge exactly as Pages did.
The substance of this ADR is unchanged — "no Workers" meant no server-side
compute and no managed database, and that still holds. If a future dashboard
offers Pages and you prefer it, either is fine; do not add a `main` script or a
binding without a new ADR.

**Why.** The originally proposed stack (Next.js + Workers + D1 + R2 +
Turnstile) was evaluated and rejected as ~10× over-built. Every page is
derivable at build time from the YAML. Static = $0 hosting, effectively
infinite spike capacity (election night is a CDN problem, not a compute
problem), perfect SEO, no attack surface, no ops. Turnstile exists to protect
forms; there are no forms — GitHub Issues take submissions.

**Consequences.** Publishing a data change = merge to main = rebuild (~1 min).
That latency is acceptable; this is a ledger, not a live feed. If genuinely
dynamic features are ever justified (alerts, API keys), add a single Worker
then — the static core doesn't change.

## ADR-3: Jurisdiction-agnostic layout from day one

**Decision.** All election-specific data sits under `data/<election-id>/`
(e.g. `vic2026`). Schemas are shared. Nothing in schema or site assumes
Victoria.

**Why.** Mission requires federal/state/territory support without rebuilds.
Directory-per-election achieves that with zero framework cost.

## ADR-4: Public repo, strict privacy boundary

**Decision.** Public: code, schemas, methodology, verified data, this log.
Never committed: credentials, unpublished/unverified submissions, submitter
identities and contact details, private editorial notes, draft allegations.

**Why.** Trust requires open data and methods; defamation and privacy risk
requires that unverified claims about named individuals never appear in the
repo — not even in branches or issues written by the maintainer. Verification
happens before anything is written down publicly.

## ADR-5: Dual licence — MIT code, CC BY 4.0 data

**Why.** Maximises reuse (the point of the wedge) while requiring attribution,
which is also the growth mechanism.

## ADR-6: Sources are structured, mandatory fields

**Decision.** A status without a source fails CI. Source = URL + publisher +
title + date published + date accessed. Archive links (Wayback) encouraged.

**Why.** "Every material claim should have a source and date" is the founding
principle; enforcement must be mechanical, not aspirational.

## ADR-7: Astro, with the exports published inside the site

**Decision.** The site is Astro (`site/`), fully static, no adapter. Generated
JSON/CSV go to `site/public/data/`, so they are served from the same deploy at
`/data/<election>/...`. Astro's own output is `site/dist/`, which is the
Cloudflare Pages output directory.

**Why.** The previous export target (`dist/`) collided with the site build.
Putting exports inside `public/` means the human-readable and machine-readable
halves of the project ship together and cannot drift apart — a data change
rebuilds both or neither. Astro was already the ADR-2 preference: zero client
JS by default, which suits a document-shaped site.

**Consequences.** `site/public/data/` is generated and gitignored; never edit it
by hand. `npm run build` = validate → export → build, in that order, failing
fast, so an unsourced record cannot reach production.

## ADR-8: One shared data module for site and exports

**Decision.** `scripts/lib/data.mjs` loads and derives everything (coverage,
summary counts, the coverage caveat). Both `scripts/export.mjs` and the Astro
pages import it.

**Why.** The published figures must be identical in the JSON and on the page. A
second implementation of "how many seats does a party cover" is a guarantee of
eventual disagreement between the two.

**Consequences.** The module resolves `data/` by walking up the tree, because
Astro bundles it and `import.meta.url` is then wrong. Derived values are never
written back into the YAML.

## ADR-9: The coverage matrix uses no JavaScript

**Decision.** The flagship component — the 88-district coverage matrix — is
radio inputs plus CSS sibling selectors. Party switching, keyboard navigation
and focus handling all come from native form controls. The only script on the
site is a few lines that refresh the countdown, and the countdown is already
correct without it.

**Why.** The requirement was a component that works on mobile, stays
lightweight, degrades without JS and respects reduced motion. A CSS-only
switcher satisfies all four by construction rather than by testing. Every cell
is also a real link with an accessible name stating district, party and status,
so meaning never depends on colour (WCAG 1.4.1) and the content is indexable and
citable by machines — which is the point of the project.

**Consequences.** Only parties with at least one Assembly candidate get a
rendered panel; the full table below the matrix covers every party. If the panel
count grows large, reconsider — but do not reach for a framework first.

**Note (2026-08-09).** Sitewide Google Analytics (ADR-12) is separate from the
matrix: product measurement, not UI logic. The matrix remains CSS-only.

## ADR-10: Poll average (sourced ledger + transparent maths)

**Decision.** The project publishes a **sourced primary-vote poll ledger** plus
a transparent **weighted average with error bars**, not a forecast. Rules live
in [poll-methodology.md](poll-methodology.md). Implementation:
`data/**/polls/`, `scripts/lib/polls.mjs`, `/polls`, exports `polls.json` and
`poll-average.json`.

**Why.** State polling is sparse, One Nation makes classic ALP–Coalition 2PP a
poor headline metric, and advocacy-commissioned polls (even large-n) are not
exchangeable with media/self-funded public series. Fixed inclusion and maths
prevent ad hoc “which polls count” decisions under campaign pressure.

**Rules locked for v1**

- Average **primary vote only** (ALP, L-NP, ONP, GRN, Others).
- **Default exclude** party / union / advocacy commissioners from the average.
- **Case-by-case exception** only: allowlisted pollster, full public metadata,
  non-empty `eligibility_exception` on the YAML, and CI-enforced. Exceptions
  are per record, not a standing waiver for the commissioner
  (see [poll-methodology.md](poll-methodology.md#case-by-case-exceptions)).
- Window + one-poll-per-pollster + inverse-effective-n × exponential time decay
  (21-day half-life); default design effect 1.3; no house effects; no
  subjective pollster grades.
- Error bars combine sampling variance and between-poll dispersion (with a
  minimum floor), not a fake MoE on pooled n.

**Consequences.** New polls are YAML PRs with sources. Forecasting, MRP and
seat models remain out of scope (scope.md). Candidate ordering never uses
polls (methodology.md).

## ADR-11: Policy matrix & issues ledger (secondary product)

**Decision.** Ship a **jurisdiction guide** (`/parties/issues`) and a
**sourced policy comparison matrix** (`/parties/matrix`) as a secondary product
alongside the candidate ledger. Data lives in YAML (`issues.yaml` +
`policies/*.yaml`), validated in CI, exported as JSON/CSV. Claims are quotes
with mandatory sources. **No subjective ratings, stars, or scorecards.**

**v1 matrix columns** are fixed: Greens, Labor, Liberal, Nationals, One Nation
(user-toggleable). Issues taxonomy is data-driven and editable without code.

**Why.** Voters and journalists need non-partisan comparison and clarity about
state vs federal responsibility. That fits the evidence-ledger culture of the
project, but it is not the original wedge (candidate coverage). Treating it as
secondary keeps the kill criteria on the candidate product intact.

**Consequences.** Empty cells are expected early in the campaign. Expanding
parties, scoring systems, or candidate-level policy requires a new decision.
Fiscal chips (taxpayer cost, PBO costed vs uncosted, debt) are labels on
sourced claims — not independent costings by this project. Issue taxonomies are
per-election: some Commonwealth-only topics (e.g. ABC/SBS public broadcasting)
are deferred from Vic 2026 and listed for federal setup in
[policy-methodology.md](policy-methodology.md#deferred-for-federal-elections-not-vic-2026).
Full rules: [policy-methodology.md](policy-methodology.md).

## ADR-14: Primary sources preferred; Wikipedia is fallback only (2026-08-09)

**Decision.** Product goal is to be the best **accurate** public source of
Australian election information. **Original sources first** (commissions,
parliaments, parties, candidates, Hansard, legislation). Wikipedia and similar
wikis are a **second-class fallback**: useful for discovery and temporary
bootstrap, not the preferred durable source for named-person membership or
candidacy.

**Why.** Accuracy and citability require provenance. Wiki pages lag, edit-war,
and are not authoritative for living persons in an electoral ledger.

**Consequences.** Methodology hierarchy is in [methodology.md](methodology.md).
Federal sitting members bootstrapped from Wikipedia must be re-verified against
Parliament of Australia / AEC. Policy and poll claims prefer primary or named
quality secondary sources. Do not ship wiki-only as “verified” without a path
to replace.

## ADR-15: State-foundation ledgers (sitting members without candidates) (2026-08-09)

**Decision.** Thin state starts (first: NSW 2027) use `kind: state-foundation`
with a dedicated loader (`scripts/lib/state-foundation.mjs`), not the Vic-shaped
`loadElection` tree (which requires candidates/regions) and not federal House/Senate
file names.

| Layer | Pattern | NSW example |
|---|---|---|
| Data id | `<jurisdiction><year>` | `nsw2027` |
| Path | `/elections/<jurisdiction>/<year>` | `/elections/nsw/2027` |
| Files | `districts`, `assembly-members`, `council-members`, `parties` | as named |

Sitting members ≠ candidates. Optional polls/policies can be added later under
the same id when sources exist.

**Why.** Reuse federal’s go-live-as-built pattern without forcing empty candidacy
trees or misusing federal chamber vocabulary for state houses.

**Consequences.** Validate/export branch on `kind`; dedicated site pages; keep
generic placeholder template for outline-only calendar paths.

## ADR-13: Federal identity — parliament number (2026-08-09)

**Decision.** Federal contests are identified by the **Parliament they elect**:

| Layer | Pattern | Example (current) |
|---|---|---|
| Data id | `federal-<n>` | `federal-49` |
| Public path | `/elections/federal/<n>` | `/elections/federal/49` |
| Next cycle | `federal-50`, `/elections/federal/50` | later |

Sitting members under that tree are of the **previous** parliament (48th while
building for the 49th). Page titles may still say “Next Australian federal
election” for humans; the path and data id do not use the word `next`.

**Aliases (not separate content):** `/elections/federal/next`, `/49th`, and a
provisional year (`/2028`) redirect to the current open contest. When
`federal-50` opens, retarget `/next` to `/50` and leave `/49` as the permanent
archive of that contest.

**Why.** Years are wrong for a legal window (late 2027–mid 2028). Parliament
ordinal is stable, archives cleanly, and scales (`49` → `50` → …). Bare `next`
as the only path would thrash every cycle and break deep links.

**Consequences.** Do not use `2027` as the path. Prefer APH over Wikipedia for
named-person membership once bootstrapped. Sitting member ≠ candidacy (same
methodology as Vic Council).

## ADR-12: Google Analytics 4 for product measurement (2026-08-09)

**Decision.** Load **Google Analytics 4** sitewide (`gtag.js`, Measurement ID in
`SITE.gaMeasurementId` in `site/src/lib/site.mjs`) so the maintainer can see
which pages and datasets people use. Disclose it on `/privacy`. No third-party
ad pixels, no session recording. House promotions are a separate decision
(ADR-16).

**Why.** Earlier product notes said “analytics deliberately never” for a
privacy-minimal static site. That is superseded: growth as a go-to national
election resource needs basic traffic measurement. Candidate *data* remains
public-source only; visitor measurement is a separate concern and is disclosed.

**Consequences.** `/privacy` must stay accurate whenever the tag or purposes
change. Empty `gaMeasurementId` disables the tag. Do not add third-party ad
networks or cross-site marketing pixels without a new ADR.

## ADR-16: House promotions on three high-level pages (2026-08-27)

**Decision.** Carry one responsive oze adnet row — three 300×250 slots, one on
mobile, two on tablet, three on wide screens — on `/`, `/elections/vic/2026`
and `/elections/vic/2026/polls` only. Candidate, district, party, policy,
matrix, methodology, data, privacy and legal pages stay ad-free. Election
Tracker’s own house campaign is excluded at the ad server so it never promotes
this site to people already on it. Units are labelled **Promo**. The tag sets
no cookies and builds no profile. Disclose on `/privacy` and `/about`.

**Why.** ADR-12 forbade adding an ad network without a new ADR. This is a
cookie-free house network for independent oze projects, not third-party
behavioural advertising. Three high-level pages keep ads away from records that
need maximum neutrality and source clarity.

**Consequences.** Do not add slots to candidate, district, party, policy,
matrix, methodology, data or legal pages. Do not add third-party ad pixels.
Privacy and about copy must stay accurate if placements change.
