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
