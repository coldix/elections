# Repository layout

> **Updated** 2026-08-14 · hub [../README.md](../README.md)

Annotated map of the Australian Election Tracker repository. `data/` is the
source of truth, `scripts/` validate and export it, and `site/` renders the
static public product.

## Top level

```text
elections/
├── README.md                    project hub
├── LICENSE                      MIT licence for code
├── package.json                 scripts and dependencies
├── package-lock.json
├── wrangler.jsonc               Cloudflare assets-only Worker
├── data/                        sourced election records
├── schema/                      JSON Schemas
├── scripts/                     validation, export and build utilities
├── site/                        Astro static site
├── docs/                        product and operations documentation
│   ├── README.md                documentation index
│   ├── handover.md              current operational handover
│   ├── handover-coalition-view.md
│   └── …                        methodology, ops, discovery, …
├── images/                      source brand assets
└── .github/                     issue templates and workflows
```

Generated or local-only directories such as `node_modules/`, `site/dist/`,
`site/public/data/`, `.wrangler/` and `.cache/` are not source of truth.

## `data/`

```text
data/
├── LICENSE                       CC BY 4.0 for data
├── election-calendar.yaml        next Australian elections and date certainty
├── election-placeholders.yaml    chamber structure for outline + dedicated pages
├── vic2026/                      full Victorian ledger (candidates, polls, policies)
├── nsw2027/                      NSW sitting members (kind: state-foundation)
│   ├── election.yaml
│   ├── districts.yaml            93 Assembly districts
│   ├── assembly-members.yaml
│   ├── council-members.yaml      42 MLCs + term_status
│   └── parties.yaml
└── federal-49/                   federal sitting members, polls, policies
    ├── election.yaml
    ├── divisions.yaml
    ├── house-members.yaml
    ├── senate-members.yaml
    ├── senate-contests.yaml
    ├── parties.yaml
    ├── issues.yaml / coalitions.yaml / policies/
    └── polls/
```

`election-calendar.yaml` owns dates and permanent planned paths.
`election-placeholders.yaml` adds chambers, seats, election scope and voting
systems without duplicating calendar facts.

Loaders: Vic-shaped → `scripts/lib/data.mjs`; federal → `federal.mjs`;
state sitting-member starts → `state-foundation.mjs` (`kind: state-foundation`).

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
├── check-repo-hygiene.mjs       orphan docs, broken links and debris checks
├── validate.mjs                 data, sources and referential integrity
├── validate-coalitions.mjs      coalition grouping checks
├── export.mjs                   JSON/CSV → site/public/data/
├── write-build-meta.mjs         build fingerprint
├── rewrite-scoped-routes.mjs    scopes Victoria pages and rejects legacy links
├── finalize-sitemap.mjs         final sitemap processing
├── check-sources.mjs            source URL health report
├── report-coverage.mjs          coverage snapshot
├── scan-leads.mjs               candidate lead scanner
├── indexnow.mjs                 post-deploy IndexNow ping
└── lib/
    ├── data.mjs                 election loader and derived figures
    ├── polls.mjs                poll loader and average
    ├── policies.mjs             policy matrix and exports
    ├── ledger-index.mjs
    └── scan-fetch.mjs
```

Production order:

```text
repo hygiene → data validation → export → build metadata → Astro build
→ scoped-route rewrite/check → sitemap finalisation
```

## `site/`

```text
site/
├── astro.config.mjs
├── public/
│   ├── _redirects               301 redirects from old Victorian routes
│   ├── images/
│   ├── data/                    generated exports, gitignored
│   ├── build-meta.json
│   ├── robots.txt
│   └── llms.txt
└── src/
    ├── layouts/Base.astro
    ├── styles/global.css
    ├── components/
    ├── lib/
    │   ├── site.mjs
    │   ├── electionCalendar.mjs
    │   ├── electionPlaceholders.mjs
    │   ├── policyProfiles.mjs
    │   └── policyDifferences.mjs
    ├── pages/                   national and permanent public routes
    └── vicpages/                reusable Victoria 2026 route templates
```

### National and future-election routes

| Source | Public URL |
|---|---|
| `site/src/pages/index.astro` | `/` |
| `site/src/pages/elections/index.astro` | `/elections` |
| `site/src/pages/elections/[...path].astro` | all future-election foundation paths |
| `site/src/pages/methodology.astro` | `/methodology` |
| legal/about pages | `/privacy`, `/terms`, `/disclaimer`, `/about` |

The catch-all future route is driven only by validated entries in
`data/election-placeholders.yaml` and joins them to the calendar by
`planned_path`.

### Victoria 2026 routes

The source templates live under `site/src/vicpages/`. The build publishes them
beneath `/elections/vic/2026`:

```text
/elections/vic/2026
/elections/vic/2026/assembly
/elections/vic/2026/council
/elections/vic/2026/districts/*
/elections/vic/2026/regions/*
/elections/vic/2026/parties/*
/elections/vic/2026/policies/*
/elections/vic/2026/polls
/elections/vic/2026/open-seats
/elections/vic/2026/voting
/elections/vic/2026/data
```

`scripts/rewrite-scoped-routes.mjs` performs the scoped build transformation and
fails when a generated Victorian page retains a legacy internal link. The old
root-level addresses are preserved by `site/public/_redirects` only.

## `docs/`

```text
docs/
├── README.md                    documentation index
├── repo-layout.md               this file
├── scope.md
├── methodology.md
├── policy-methodology.md
├── poll-methodology.md
├── ops.md
├── deployment.md
├── decisions.md
├── changelog.md
├── discovery.md
├── social.md
├── people-pages-proposal.md     unapproved future concept
├── polls-inventory.md
├── leads/                       working lead notes
└── *-gap.md / audit notes       point-in-time research records
```

The documentation graph is checked from the root README. Any Markdown file that
cannot be reached through a link is treated as orphaned and fails
`npm run check:repo`.

## `.github/`

```text
.github/
├── ISSUE_TEMPLATE/
└── workflows/
    ├── validate.yml             validate, export and build on push/PR
    ├── indexnow.yml             IndexNow after main updates
    └── source-health.yml        scheduled source URL checks
```

## Generated artefacts

| Path | Produced by | Public role |
|---|---|---|
| `site/public/data/**` | `npm run export` | `/data/**` |
| `site/public/build-meta.json` | `write-build-meta.mjs` | `/build-meta.json` |
| `site/dist/**` | `npm run build` | Cloudflare asset root |

Do not hand-edit exports or `site/dist`. Change YAML or source templates and
rebuild.

## Related

- [../README.md](../README.md)
- [README.md](README.md)
- [deployment.md](deployment.md)
- [decisions.md](decisions.md)
- [ops.md](ops.md)
