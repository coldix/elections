# Documentation index

> **Version** `20260803.2111-aest+17599ed` · **Updated** 2026-08-03 21:11 AEST  
> edited against `main` @ [`17599ed`](https://github.com/coldix/elections/commit/17599ed)  
> Hub: [../README.md](../README.md)

This index is the documentation hub. Every maintained Markdown document must be
reachable from the root README through this page or another linked document.
`npm run check:repo` fails when a document is orphaned or a relative link is
broken.

## Product map

| Area | Live URLs | Rules / operations |
|---|---|---|
| National home | `/` | [SCOPE.md](SCOPE.md) |
| Upcoming elections | `/elections` | [METHODOLOGY.md](METHODOLOGY.md) |
| Victoria 2026 tracker | `/elections/vic/2026` | [METHODOLOGY.md](METHODOLOGY.md) |
| Assembly and districts | `/elections/vic/2026/assembly`, `/elections/vic/2026/districts/*` | [METHODOLOGY.md](METHODOLOGY.md) |
| Council and regions | `/elections/vic/2026/council`, `/elections/vic/2026/regions/*` | [METHODOLOGY.md](METHODOLOGY.md) |
| Parties and policies | `/elections/vic/2026/parties/*`, `/elections/vic/2026/policies/*` | [POLICY-METHODOLOGY.md](POLICY-METHODOLOGY.md) |
| Polls | `/elections/vic/2026/polls` | [POLL-METHODOLOGY.md](POLL-METHODOLOGY.md) |
| Open data | `/elections/vic/2026/data`, `/data/vic2026/*` | [../README.md](../README.md) |
| Future election foundations | `/elections/nsw/2027`, `/elections/federal/next`, etc. | [METHODOLOGY.md](METHODOLOGY.md) |
| Operations and deployment | — | [OPS.md](OPS.md), [DEPLOYMENT.md](DEPLOYMENT.md) |
| Repository structure | — | [REPO-LAYOUT.md](REPO-LAYOUT.md) |

The former root-level Victorian routes are retained only as permanent redirects.
New documentation and internal links must use the scoped paths.

## Core product documents

- [SCOPE.md](SCOPE.md) — product boundaries, MVP and kill criteria
- [METHODOLOGY.md](METHODOLOGY.md) — candidacy statuses, evidence, dates, links and neutrality
- [POLICY-METHODOLOGY.md](POLICY-METHODOLOGY.md) — policy ledger and comparison rules
- [POLL-METHODOLOGY.md](POLL-METHODOLOGY.md) — poll inclusion and weighted average
- [DECISIONS.md](DECISIONS.md) — architecture decision records
- [CHANGELOG.md](CHANGELOG.md) — product change history

## Operations and discovery

- [OPS.md](OPS.md) — maintenance cadence and human/agent responsibilities
- [DEPLOYMENT.md](DEPLOYMENT.md) — Cloudflare Workers build and DNS
- [DISCOVERY.md](DISCOVERY.md) — sitemap, search discovery and IndexNow
- [SOCIAL.md](SOCIAL.md) — social/video implementation notes
- [REPO-LAYOUT.md](REPO-LAYOUT.md) — annotated repository structure
- [polls-inventory.md](polls-inventory.md) — polling-source discovery inventory

## Proposals and specialised handovers

- [PEOPLE-PAGES-PROPOSAL.md](PEOPLE-PAGES-PROPOSAL.md) — proposal only; no `/people` routes exist
- [../HANDOVER.md](../HANDOVER.md) — current operational handover
- [../HANDOVER-COALITION-VIEW.md](../HANDOVER-COALITION-VIEW.md) — coalition policy-view implementation notes

## Point-in-time gap and audit notes

These are working records, not authoritative product rules. Their value is the
specific research state they capture; current rules remain in the methodology
documents above.

- [labor-gap.md](labor-gap.md)
- [council-gap.md](council-gap.md)
- [incumbent-gap.md](incumbent-gap.md)

Additional audit and lead notes are linked from the relevant working document.
If a note is no longer useful, delete it rather than leaving an unlinked file.
