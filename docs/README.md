# Documentation index

> **Version** `20260803.1631-aest+91ecdbf` · **Updated** 2026-08-03 16:31 AEST  
> git `main` @ [`91ecdbf`](https://github.com/coldix/elections/commit/91ecdbf)  
> Hub: [../README.md](../README.md)

Primary docs should carry the same **Version / Updated** line at the top.
Refresh the stamp when you change substance; set version to the short git hash
you edited against (`git rev-parse --short HEAD`).

## Product map (aligned with live site)

| Area | Live URLs | Methodology / ops |
|---|---|---|
| Candidate ledger | `/`, `/assembly`, `/council`, `/districts/*`, `/parties` | [METHODOLOGY.md](METHODOLOGY.md) |
| Policy matrix | `/parties/matrix`, `/policies`, `/policies/*`, `/parties/*/policies` | [POLICY-METHODOLOGY.md](POLICY-METHODOLOGY.md) |
| Jurisdiction guide | `/parties/issues` | POLICY-METHODOLOGY |
| Key differences | `/policies/key-differences` | POLICY-METHODOLOGY |
| Polls | `/polls` | [POLL-METHODOLOGY.md](POLL-METHODOLOGY.md) |
| Open data | `/data` | export pipeline in root README |
| Ops / deploy | — | [OPS.md](OPS.md), [DEPLOYMENT.md](DEPLOYMENT.md) |

## Freshness check (2026-08-03 vs `91ecdbf`)

| Document | Status |
|---|---|
| [../README.md](../README.md) | **Refreshed** this stamp — was stale (last edit 2026-07-29; missing policy product) |
| [SCOPE.md](SCOPE.md) | **Refreshed** — MVP checklist caught up; policy + polls sections kept |
| [POLICY-METHODOLOGY.md](POLICY-METHODOLOGY.md) | Current (Aug 2026); stamp added |
| [CHANGELOG.md](CHANGELOG.md) | Current through matrix wave 7; stamp added — may lag latest agent merges |
| [../HANDOVER.md](../HANDOVER.md) | Partially stale narrative dates; stamp + page list updated |
| [OPS.md](OPS.md) | Still valid; stamp added |
| [METHODOLOGY.md](METHODOLOGY.md) | Candidate rules still valid; stamp added |
| [POLL-METHODOLOGY.md](POLL-METHODOLOGY.md) | Valid; stamp added |
| [DECISIONS.md](DECISIONS.md) | Valid ADRs; stamp added |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Valid Workers flow; stamp added |
| [DISCOVERY.md](DISCOVERY.md) | Valid SEO notes; stamp added |
| Gap notes (`*-gap.md`, policy audits) | Point-in-time working notes — not full product specs |

## All docs in this folder

- [CHANGELOG.md](CHANGELOG.md) — product log since polls module  
- [SCOPE.md](SCOPE.md) — in/out of product  
- [METHODOLOGY.md](METHODOLOGY.md) — candidacy statuses  
- [POLICY-METHODOLOGY.md](POLICY-METHODOLOGY.md) — policy matrix  
- [POLL-METHODOLOGY.md](POLL-METHODOLOGY.md) — poll average  
- [OPS.md](OPS.md) — editorial cadence  
- [DEPLOYMENT.md](DEPLOYMENT.md) — Cloudflare  
- [DECISIONS.md](DECISIONS.md) — ADRs  
- [DISCOVERY.md](DISCOVERY.md) — SEO / IndexNow  
- [SOCIAL.md](SOCIAL.md) — social / video keys  
- [polls-inventory.md](polls-inventory.md) — poll discovery inventory  
- Working notes: `labor-gap.md`, `council-gap.md`, `incumbent-gap.md`, policy audit snapshots  

Root: [../HANDOVER.md](../HANDOVER.md) for agent context.
