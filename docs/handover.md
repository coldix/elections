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

**Ledger snapshot (2026-08-23):** **311** Vic candidacy files; **18** Vic
statewide polls (newest fieldwork end **9–15 Aug** Resolve/*Age*); federal-49
**13** primary-vote polls (newest fieldwork end **10–16 Aug** Roy Morgan).
Jacinta Allan is retired (Bendigo East open).

**Every candidacy now rests on a primary, secondary or campaign source — none
on Wikipedia alone.** An audit on 2026-08-23 found eight records resting on
Wikipedia, four of which cited a real publisher but linked to the Wikipedia
*biography of the journalist or MP involved* rather than the article. All eight
were re-sourced, with `corrections` entries where the citation was wrong.
Re-run that audit by classifying each record's `source.url` with
`scripts/lib/source-trust.mjs`.

Wikipedia remains a discovery index only — prefer party pages and dated media;
wiki-only rows must note they are not officially confirmed until a primary is
verified.

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
npm test                 # fixture tests for the discovery parsers
npm run check:repo       # orphan docs, broken links, debris, calendar/page parity
npm run validate         # hygiene plus election-data validation
npm run export           # JSON and CSV exports
npm run build            # complete production build
npm run report:coverage  # report only
npm run check:sources    # report only
```

Production order (CI runs the parser tests first — they are fast and need no
network, and a discovery bug that drops a candidate is invisible in the digest):

```text
parser tests → repo hygiene → data validation → export → build metadata
→ Astro build → scoped-route rewrite/check → sitemap finalisation
```

Do not hand-edit `site/public/data/` or `site/dist/`.

## Discovery scanner

`npm run scan:leads` is report-only and never writes data. Two things changed
on 2026-08-23 and both matter for how far you can trust it.

**Five parser bugs were fixed.** All of them silently dropped or misattributed
candidates, which is the failure mode the digest cannot show you — a lead that
is never emitted looks exactly like a lead that does not exist:

- multi-line wikitext citations broke row splitting, truncating names
  (`Nathalie Moussi {{Cite web`) and shifting every later column;
- two candidates in one cell (`<br>`-separated, e.g. Ripon's three-cornered
  contest) merged into one lead under one party;
- One Nation names could not start on a hyphen (`Rikkie-Lee` matched from
  `Lee`);
- **column 5 was read as Socialists when it is One Nation**, filing all 11 One
  Nation candidates in the wiki table under the wrong party and never reading
  the Socialists column at all;
- the One Nation seat terminator almost never fired: 3 of 19 candidates
  extracted.

Wikipedia extraction went 246 → 316 and One Nation 3 → 19. Eleven fixture
tests in `tests/` guard these, using verbatim rows from the live sources, and
each fix was mutation-checked. **Do not refactor these parsers without running
`npm test`.**

**Leads are ranked by source trust** (`scripts/lib/source-trust.mjs`),
implementing the methodology hierarchy and ADR-14: `primary` → `secondary` →
`social` → `wikipedia-only`. A wiki row is rated on the citation *underneath*
it, and the digest prints that citation rather than the Wikipedia URL. See
[ops.md](ops.md#lead-scan-efficient-discovery).

The tier reflects the **publisher, not whether the cited page supports the
claim**. Catherine D'Arcy is the live proof: cited to a real outlet, in an
article that never mentions her. Rejected leads are recorded in
[leads/README.md](leads/README.md) so they are not re-triaged every scan.

## Design system

Shared UI primitives live in `site/src/styles/global.css`. Use them instead of
adding another private copy of the same CSS:

| Primitive | For |
|---|---|
| `.section-head` | eyebrow + heading + standfirst, one rhythm per section |
| `.card-grid` / `.card-grid-wide` | card grids (both self-sufficient; `-wide` is not a modifier) |
| `.card-interactive` | any card wrapped in an `<a>` — affordance only, no layout opinion |
| `.link-card` | `.card-interactive` plus heading/description/chevron, for pure destinations |
| `.section-aside` | muted trailing line for links that do not warrant a card |
| `--shadow-lift` | hover elevation, defined in all three theme blocks |

Page-scoped rules still win on specificity, which is how Vic party cards keep
their party-coloured hover border while gaining the shared lift.

Seat tiles, stat bands (`gap: 1px` over a rule background) and party chips are
**not** card grids and keep their own definitions — roughly 20 such
declarations remain, correctly. Remaining pages can migrate as they are
touched; nothing depends on it.

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

1. Continue individually sourced Victoria 2026 candidate verification
   (time-critical — nominations close **13 Nov 2026**).
2. Close remaining incumbent and Legislative Council candidate gaps without
   substituting assumptions for evidence. Sitting Coalition MPs listed as
   candidates on Wikipedia still lack a recontest source — the scanner
   suppresses 70 of them; see [incumbent-gap.md](incumbent-gap.md).
3. Keep election dates and foundation pages current as official sources change.
4. Maintain Vic/federal policy and poll ledgers (primary sources preferred).
5. Federal: thicken empty policy cells; keep APH membership current; park
   candidates until announcements warrant it.
6. NSW: optional next steps are polls and state policies; candidates later.
7. Obtain qualified legal review of the living-person and electoral-matter
   publication approach before campaigns intensify.

### Open follow-ups (2026-08-23)

- **Wikipedia is wrong in two places** and nobody has corrected it upstream:
  Catherine D'Arcy is listed for Dandenong citing an article that never
  mentions her, and Eltham's One Nation candidate is spelled `Weatherly` where
  the party spells it `Weatherley`. Both will keep resurfacing in the digest.
- **Sarah McKenzie's announcement post could not be recovered.** Her record now
  rests on the party page; the 6 March 2026 date is carried as a dated claim,
  not a sourced one.
- **Victoria overview reports 428px `scrollWidth` at 390px viewport**, from the
  sticky-header data table. Pre-existing and not visible (the table clips
  correctly inside `.table-scroll`), but unresolved.

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

**2026-08-23.** `main` is at the design flow-on merge (#30); PRs #24–#30 were
merged and their branches deleted; no open pull requests. Seven merges this
session:

| PR | What |
|---|---|
| #24 | Mullahy + Nealy candidates; Roy Morgan upper-house source |
| #25 | Three scanner name-parsing bugs |
| #26 | Fixture tests, plus two more bugs they caught |
| #27 | Source trust ranking, Wikipedia lowest |
| #28 | 15 Socialists candidates; 8 records re-sourced off Wikipedia |
| #29 | Home page simplified — one ask per survey |
| #30 | Shared card primitives adopted across tracker pages |

Polls were checked for the 19–23 Aug window and nothing new existed: the Poll
Bludger's 21 Aug Morgan write-up is the same 10–16 Aug fieldwork already
recorded, and Roy Morgan's 18 Aug upper-house release re-analyses the recorded
5–7 Aug SMS fieldwork rather than adding a poll.
