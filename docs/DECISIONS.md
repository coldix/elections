# Architecture Decisions

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

## ADR-2: Static site, not Workers + D1 + R2

**Decision.** The site is a fully static build (Astro preferred; any SSG works)
deployed to Cloudflare Pages from GitHub. No Workers, no D1, no R2, no
Turnstile in the MVP.

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
