# HANDOVER

> **Updated** 2026-08-19 · hub [../README.md](../README.md)

Current operational context for the Australian Election Tracker. Historical
product changes belong in [changelog.md](changelog.md); this file is
kept deliberately short and current.

## Current product state

The site is live at **electiontracker.au** as a static, assets-only Cloudflare
Worker. A valid merge to `main` builds and deploys automatically
(`.github/workflows/validate.yml` → Cloudflare).

```text
/                                      national landing page
/elections                             upcoming Australian elections
/elections/vic/2026                    full Victoria 2026 candidate tracker
/elections/nsw/2027                    NSW sitting members (data: nsw2027)
/elections/federal/49                  federal sitting members + polls + policies
/elections/<jurisdiction>/<year>       outline foundations (other states/territories)
```

**Victoria** is the only full candidate tracker. **NSW** and **federal** are
sitting-member (and for federal, poll/policy) trackers without candidates.
Former root-level Victorian URLs are permanent redirects — do not restore them
as canonical links.

## Election calendar and foundations

`data/election-calendar.yaml` is the source of truth for the next federal,
state and territory elections, including date-certainty labels.

`data/election-placeholders.yaml` holds chamber structure. Paths with dedicated
page trees (`vic/2026`, `nsw/2027`, `federal/49`) are excluded from the generic
placeholder template in `site/src/pages/elections/[...path].astro`.

| Path | Data id | Depth |
|---|---|---|
| `/elections/vic/2026` | `vic2026` | Full (candidates, polls, policies) |
| `/elections/nsw/2027` | `nsw2027` | Sitting members (`state-foundation`) |
| `/elections/federal/49` | `federal-49` | Sitting members + polls + policies |
| Other calendar paths | — | Outline placeholder only |

Calendar entries and placeholder paths must remain one-to-one; CI enforces this.

## Victoria 2026 data model

`data/vic2026/` remains the source of truth for:

- 88 Legislative Assembly districts
- eight Legislative Council regions and 40 sitting MLCs
- parties, registrations and current representation
- individually sourced candidate status histories
- retirements
- public primary-vote polls
- policy issues and sourced party positions

Policy rules: [policy-methodology.md](policy-methodology.md) (ADR-11).
**Federal follow-up:** ABC/SBS public broadcasting is deliberately *not* a Vic
2026 matrix issue — see POLICY-METHODOLOGY § “Deferred for federal elections”
when creating the first federal `issues.yaml`.

Candidate coverage is intentionally progressive. A missing candidate means no
individually sourced record has been verified, not that nobody is standing.

**Ledger snapshot (2026-08-19):** about **294** Vic candidacy files; **18** Vic
statewide polls (newest fieldwork end **9–15 Aug** Resolve/*Age*); federal-49
**13** primary-vote polls (average as-of **16 Aug**, including Resolve 9–15 Aug
and Roy Morgan 10–16 Aug). Jacinta Allan is retired (Bendigo East open).
Wikipedia remains a discovery index — prefer party pages and dated media when
available; wiki-only rows must note they are not officially confirmed until a
primary is verified.

## People pages decision

There are **no `/people` pages**. Candidate cards may link to:

1. an official candidate, campaign, parliamentary or party profile;
2. one principal public political social account; and
3. Wikipedia only when no better official profile exists.

A possible permanent people layer is documented but not approved:
[people-pages-proposal.md](people-pages-proposal.md).

## Build and validation

Node 22 is used in CI.

```bash
npm run check:repo       # orphan docs, broken links, debris, calendar/page parity
npm run validate         # hygiene plus election-data validation
npm run export           # JSON and CSV exports
npm run build            # complete production build
npm run report:coverage  # report only
npm run check:sources    # report only
```

Production order:

```text
repo hygiene → data validation → export → build metadata → Astro build
→ scoped-route rewrite/check → sitemap finalisation
```

Do not hand-edit `site/public/data/` or `site/dist/`.

## Architecture constraints

Read [decisions.md](decisions.md) before proposing infrastructure.
The accepted architecture is:

- YAML and Git history as the database and audit trail
- shared loaders for site and exports
- Astro static generation
- Cloudflare assets-only deployment
- no runtime database or server process
- no unaudited automation merging named-person records

`trailingSlash: "never"` in Astro and Cloudflare’s
`html_handling: "drop-trailing-slash"` must remain aligned.

## Repository hygiene

The root [../README.md](../README.md) is the documentation graph entry point.
[README.md](README.md) indexes maintained documentation.

`npm run check:repo` fails on:

- orphaned Markdown documents
- broken relative Markdown links
- committed temporary/editor files
- a future election without a matching foundation page
- legacy root-level public URLs in the README

Delete superseded notes or link and label them clearly; do not leave unowned
files in the tree.

## NSW scaffold (nsw2027)

Active under `/elections/nsw/2027` (data id `nsw2027`). Sitting members are the
**58th** Parliament; the 2027 election forms the **59th**:

- Legislative Assembly: 93 districts + sitting MLAs
- Legislative Council: 42 members + half-Council term status (`up` / `continuing`)
- Parties index + per-party member lists
- Open data page + exports: `/data/nsw2027/`
- No candidates, polls, or policies yet (thin clone of federal sitting-members tier)

Membership from **Parliament of NSW** official downloads (LA xlsx / LC csv).
Council term class uses end-term years (secondary cross-check) with mid-term
replacement inheritance (Barrett→Taylor 2031; Overall→Farraway 2027).

## Federal scaffold (federal-49)

Active under `/elections/federal/49` (data id `federal-49` — election for the
**49th** Parliament). `/elections/federal/next` redirects here. Next cycle will
be `federal-50` / `/elections/federal/50`. Sitting members are the **48th**
Parliament:

- House: 150 divisions + sitting MPs
- Senate: composition + half-Senate term status (`up` / `continuing` / `territory`)
- Parties index + per-party member lists
- Federal primary-vote poll ledger + tracker average (`/polls`)
- Policy matrix + issues (`/parties/matrix`, `/policies`) — Liberal–Nationals combined
  view default (Vic pattern); empty cells only where no sourced claim
- Open data page + exports: `/data/federal-49/`

House membership is from the **APH contact CSV** (primary); Farrer was filled
from the **Parliamentary Handbook** when absent from that CSV. Senate
membership is from the **Parliamentary Handbook** occupancy export. Not a
candidacy ledger. Parties, polls and policy matrix are live under `/49`.

### Source quality (project goal)

Be the **most accurate** Australian election info source. Hierarchy:

1. **Primary** — commissions, parliaments, parties, candidates, Hansard  
2. **Quality secondary** — named news / research with clear provenance  
3. **Wikipedia** — fallback / discovery only; not preferred durable source  

See [methodology.md](methodology.md) and ADR-14 in
[decisions.md](decisions.md).

## Current priorities

1. Continue individually sourced Victoria 2026 candidate verification (time-critical).
2. Close remaining incumbent and Legislative Council candidate gaps without
   substituting assumptions for evidence.
3. Keep election dates and foundation pages current as official sources change.
4. Maintain Vic/federal policy and poll ledgers (primary sources preferred).
5. Federal: thicken empty policy cells; keep APH membership current; park
   candidates until announcements warrant it.
6. NSW: optional next steps are polls and state policies; candidates later.
7. Obtain qualified legal review of the living-person and electoral-matter
   publication approach before campaigns intensify.

## Documents to read first

- [README.md](README.md)
- [scope.md](scope.md)
- [methodology.md](methodology.md)
- [policy-methodology.md](policy-methodology.md)
- [ops.md](ops.md)
- [decisions.md](decisions.md)
- [deployment.md](deployment.md)
- [repo-layout.md](repo-layout.md)

## End-of-day repository state

At the start of this housekeeping pass, `main` was `17599ed`, PR #17 had been
merged, and there were no open pull requests. The housekeeping branch refreshes
README and handover documentation and adds a durable repository-hygiene build
gate before returning to `main`.
