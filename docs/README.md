# Documentation index

> **Updated** 2026-08-19 · Hub: [../README.md](../README.md)

This index is the documentation hub. Every maintained Markdown document must be
reachable from the root README through this page or another linked document.
`npm run check:repo` fails when a document is orphaned or a relative link is
broken.

## Product map

| Area | Live URLs | Rules / operations |
|---|---|---|
| National home | `/` | [scope.md](scope.md) |
| What's new | `/latest` | [changelog.md](changelog.md), [poll-methodology.md](poll-methodology.md) |
| Upcoming elections | `/elections` | [methodology.md](methodology.md) |
| Victoria 2026 (full) | `/elections/vic/2026` | [methodology.md](methodology.md) |
| Assembly and districts | `/elections/vic/2026/assembly`, `/elections/vic/2026/districts/*` | [methodology.md](methodology.md), ADR-17 |
| Council and regions | `/elections/vic/2026/council`, `/elections/vic/2026/regions/*` | [methodology.md](methodology.md) |
| Parties and policies | `/elections/vic/2026/parties/*`, `/elections/vic/2026/policies/*` | [policy-methodology.md](policy-methodology.md) |
| Polls (Vic) | `/elections/vic/2026/polls` | [poll-methodology.md](poll-methodology.md) |
| NSW 2027 (sitting members) | `/elections/nsw/2027`, `/data/nsw2027/*` | [routes.md](routes.md), [handover.md](handover.md) |
| Federal 49 (sitting + polls + policies) | `/elections/federal/49`, `/data/federal-49/*` | [routes.md](routes.md), ADR-13 |
| Outline foundations | ACT/QLD/NT/WA/SA/Tas calendar paths | [methodology.md](methodology.md) |
| Open data | `/data/<election-id>/` | [../README.md](../README.md) |
| Operations and deployment | — | [ops.md](ops.md), [deployment.md](deployment.md) |
| Repository structure | — | [repo-layout.md](repo-layout.md) |

The former root-level Victorian routes are retained only as permanent redirects.
New documentation and internal links must use the scoped paths.

## Core product documents

- [scope.md](scope.md) — product boundaries, MVP and kill criteria
- [methodology.md](methodology.md) — candidacy statuses, evidence, dates, links and neutrality
- [policy-methodology.md](policy-methodology.md) — policy ledger and comparison rules
- [poll-methodology.md](poll-methodology.md) — poll inclusion and weighted average
- [decisions.md](decisions.md) — architecture decision records
- [changelog.md](changelog.md) — product change history

## Operations and discovery

- [ops.md](ops.md) — maintenance cadence and human/agent responsibilities
- [deployment.md](deployment.md) — Cloudflare Workers build and DNS
- [routes.md](routes.md) — canonical national/election route architecture and redirects
- [discovery.md](discovery.md) — sitemap, search discovery and IndexNow
- [social.md](social.md) — social/video implementation notes
- [repo-layout.md](repo-layout.md) — annotated repository structure
- [polls-inventory.md](polls-inventory.md) — polling-source discovery inventory

## Proposals and specialised handovers

- [people-pages-proposal.md](people-pages-proposal.md) — proposal only; no `/people` routes exist
- [handover.md](handover.md) — current operational handover
- [handover-coalition-view.md](handover-coalition-view.md) — coalition policy-view implementation notes

## Point-in-time gap, audit and change notes

These are historical working records, not authoritative product rules. Their
value is the specific research or implementation state they capture; current
rules remain in the methodology documents above.

- [labor-gap.md](labor-gap.md)
- [council-gap.md](council-gap.md)
- [incumbent-gap.md](incumbent-gap.md)
- [labor-policy-audit-2026-08-02.md](labor-policy-audit-2026-08-02.md)
- [greens-policy-audit-2026-08-02.md](greens-policy-audit-2026-08-02.md)
- [changelog-liberal-nationals-firearms.md](changelog-liberal-nationals-firearms.md)

Additional lead notes are linked from the relevant working document. If a note
is no longer useful, delete it rather than leaving an unlinked file.
