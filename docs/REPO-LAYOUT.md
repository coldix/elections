# Repository layout

> **Version** `20260803.1638-aest+193f8a9` · **Updated** 2026-08-03 16:38 AEST  
> git `main` @ [`193f8a9`](https://github.com/coldix/elections/commit/193f8a9) · hub [../README.md](../README.md)

Annotated map of this monorepo. Not a dump of every file (hundreds of candidate
and policy YAMLs). For the one-screen summary, see [README → Repository layout](../README.md#repository-layout).

**Convention:** `data/` is the source of truth; `site/` only renders it;
`scripts/` validate and export; `schema/` is the contract.

## Top level

```text
elections/
├── README.md                 Project hub (start here)
├── HANDOVER.md               Agent / session context
├── HANDOVER-COALITION-VIEW.md  Notes for Coalition matrix view
├── LICENSE                   MIT (code)
├── package.json              npm scripts: validate, export, build, dev
├── package-lock.json
├── .node-version             Node 22
├── .gitignore
├── wrangler.jsonc            Cloudflare assets-only Worker → site/dist
│
├── data/                     YAML ledger (git = database)
├── schema/                   JSON Schema for YAML records
├── scripts/                  Validate, export, ops utilities
├── site/                     Astro static site
├── docs/                     Product + ops documentation
├── images/                   Brand assets (source); also under site/public
└── .github/                  Issue templates + CI workflows
```

Omitted from trees below (generated / local only): `node_modules/`,
`site/dist/`, `site/public/data/` (export artefacts), `.wrangler/`, `.cache/`.

## `data/` — election epochs

```text
data/
├── LICENSE                   CC BY 4.0 for data/
└── vic2026/                  Victorian state election 2026
    ├── election.yaml         Key dates, jurisdiction
    ├── districts.yaml        88 Assembly seats + incumbents
    ├── regions.yaml          8 Council regions
    ├── council-members.yaml  Sitting MLCs (40)
    ├── district-stats.yaml   Area / population (atlas)
    ├── parties.yaml          Parties + independents grouping
    ├── retirements.yaml      Confirmed not recontesting
    ├── watch-sources.yaml    Lead-scan watch list
    ├── issues.yaml           Policy issue catalogue
    ├── coalitions.yaml       Optional Coalition display groups
    ├── candidates/           One YAML per candidacy (*--*.yaml)
    ├── policies/             One YAML per party × issue claim
    └── polls/                Statewide primary-vote poll records
```

Future elections: add `data/<election-id>/` with the same shape — do not fork the
site (see ADR-3 in [DECISIONS.md](DECISIONS.md)).

## `schema/`

```text
schema/
├── candidate.schema.json
├── poll.schema.json
├── issue.schema.json
└── policy.schema.json
```

## `scripts/`

```text
scripts/
├── validate.mjs              Full data validation (CI + build gate)
├── validate-coalitions.mjs   Coalition grouping checks
├── export.mjs                JSON/CSV → site/public/data/
├── write-build-meta.mjs      AEST build stamp → build-meta.json
├── finalize-sitemap.mjs      Sitemap post-process
├── check-sources.mjs         URL health report (does not publish)
├── report-coverage.mjs       Party coverage snapshot
├── scan-leads.mjs            Candidate lead scanner
├── indexnow.mjs              IndexNow ping after deploy
├── indexnow.key              Public key file for IndexNow
└── lib/
    ├── data.mjs              Load election, coverage, representation
    ├── polls.mjs             Polls + average
    ├── policies.mjs          Policy matrix + exports
    ├── ledger-index.mjs
    └── scan-fetch.mjs
```

Build order: **validate → export → write-build-meta → astro build → finalize-sitemap**.

## `site/` — Astro app

```text
site/
├── astro.config.mjs
├── public/                   Static files copied into dist as-is
│   ├── images/               Logos, maps, OG image, video thumbs
│   ├── data/                 Generated exports (gitignored; from npm run export)
│   ├── build-meta.json       Deploy fingerprint
│   ├── robots.txt
│   ├── llms.txt
│   └── …
└── src/
    ├── layouts/Base.astro
    ├── styles/global.css
    ├── generated/build-meta.json   Imported by Footer
    ├── lib/
    │   ├── site.mjs          SITE constants, party colours, dates
    │   ├── videos.mjs
    │   ├── policyProfiles.mjs
    │   └── policyDifferences.mjs
    ├── components/           Coverage matrices, policy matrix, maps, charts…
    └── pages/                File-based routes (see below)
```

### Routes (`site/src/pages/`)

| File | URL |
|---|---|
| `index.astro` | `/` |
| `assembly/index.astro` | `/assembly` |
| `council/index.astro` | `/council` |
| `districts/index.astro` | `/districts` |
| `districts/[slug].astro` | `/districts/:slug` |
| `regions/index.astro` | `/regions` |
| `regions/[slug].astro` | `/regions/:slug` |
| `parties/index.astro` | `/parties` |
| `parties/[slug].astro` | `/parties/:slug` |
| `parties/policies.astro` | `/parties/policies` |
| `parties/[slug]/policies.astro` | `/parties/:slug/policies` |
| `parties/matrix.astro` | `/parties/matrix` |
| `parties/issues.astro` | `/parties/issues` |
| `policies/index.astro` | `/policies` |
| `policies/[slug].astro` | `/policies/:slug` |
| `policies/key-differences.astro` | `/policies/key-differences` |
| `polls.astro` | `/polls` |
| `open-seats.astro` | `/open-seats` |
| `voting.astro` | `/voting` |
| `data.astro` | `/data` |
| `methodology.astro` | `/methodology` |
| `about.astro` | `/about` |
| `privacy.astro` / `terms.astro` / `disclaimer.astro` | legal |
| `404.astro` | custom 404 |

### Notable components

```text
site/src/components/
├── CoverageMatrix.astro          Assembly 88-cell party grid
├── CouncilCoverageMatrix.astro   Council 8-region party grid
├── PolicyMatrix.astro / PolicyMatrixView.astro / PolicyCell.astro
├── CoalitionPolicyCell.astro
├── Countdown.astro
├── VicRegionMap.astro / VicGeoMap.astro
├── PollCharts.astro
├── Header.astro / Footer.astro
└── …
```

## `docs/`

```text
docs/
├── README.md                 Docs index + freshness
├── REPO-LAYOUT.md            This file
├── SCOPE.md
├── METHODOLOGY.md            Candidates
├── POLICY-METHODOLOGY.md
├── POLL-METHODOLOGY.md
├── OPS.md
├── DEPLOYMENT.md
├── DECISIONS.md              ADRs
├── CHANGELOG.md
├── DISCOVERY.md
├── SOCIAL.md
├── polls-inventory.md
├── leads/                    Lead-scan notes
└── *-gap.md / policy audits  Working notes (point-in-time)
```

## `.github/`

```text
.github/
├── ISSUE_TEMPLATE/candidacy.yml
└── workflows/
    ├── validate.yml          validate + export + build on push/PR
    ├── indexnow.yml          IndexNow after main deploy
    └── source-health.yml     Weekly source URL check
```

## Generated artefacts (not source of truth)

| Path | Produced by | Served as |
|---|---|---|
| `site/public/data/**` | `npm run export` | `/data/**` |
| `site/public/build-meta.json` | `write-build-meta.mjs` | `/build-meta.json` |
| `site/dist/**` | `astro build` | Cloudflare assets root |

Do not hand-edit export JSON/CSV; change YAML under `data/` and rebuild.

## Related

- [README.md](../README.md) — short layout + how to run  
- [DEPLOYMENT.md](DEPLOYMENT.md) — Cloudflare / domains  
- [DECISIONS.md](DECISIONS.md) — why git-as-DB and static hosting  
- [OPS.md](OPS.md) — editorial cadence  
