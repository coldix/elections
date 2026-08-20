# Victorian 2026 polls — discovery inventory

**Purpose.** A working census of known *public* statewide Legislative
Assembly voting-intention polls, used to apply
[poll-methodology.md](poll-methodology.md) inclusion rules.

**Status.** Discovery + ledger cross-check (updated 2026-08-19). Newest
public statewide Assembly VI ends **9–15 Aug** (Resolve/*The Age*); DemosAU
6–11 Aug is also on the ledger. Federal primary-vote rows live under
`data/federal-49/polls/` (not this Vic inventory). Before any
`data/vic2026/polls/` entry, re-check the primary source for fieldwork dates,
sample size, commissioner, and exact primaries.

**Column notes.**

- Primaries ordered **ALP | LNP | GRN | ONP | OTH** (percentage points).
- **Eligible** = judgment for the *average* under current rules (media/self
  commissioner, n≥800, statewide state VI, full five-way usable, or a
  documented exception).
- **Ledger** = filename under `data/vic2026/polls/` when present.
- Wikipedia is a **discovery index**, not authority.

Discovery index:
[Opinion polling for the 2026 Victorian state election](https://en.wikipedia.org/wiki/Opinion_polling_for_the_2026_Victorian_state_election).

---

## 2026 statewide Assembly primaries (selected)

| Fieldwork (approx.) | Pollster | Commissioner | n | ALP | LNP | GRN | ONP | OTH | Eligible? | Ledger / notes |
|---|---|---|---:|---:|---:|---:|---:|---:|---|---|
| 9–15 Aug 2026 | Resolve Strategic | *The Age* (media) | 1000 | 25 | 27 | 12 | 23 | 13 | **Y** | `resolve-2026-08-age` (first after Carroll spill; OTH residual) |
| 6–11 Aug 2026 | DemosAU | Premier National (media/public) | 1007 | 23 | 32 | 13 | 22 | 10 | **Y** | `demosau-2026-08` (effective n 559) |
| 5–7 Aug 2026 | Roy Morgan | Self | 2084 | 26 | 26 | 12.5 | 23.5 | 12 | **Y** | `roy-morgan-2026-08` (OTH = 4 other parties + 8 ind) |
| 31 Jul–3 Aug 2026 | Freshwater Strategy | Herald Sun (media) | 1020 | 25 | 30 | 14 | 22 | 9 | **Y** | `freshwater-2026-08` |
| 28 Jul–1 Aug 2026 | RedBridge/Accent | *AFR* (media) | 1014 | 23 | 30 | 14 | 22 | 11 | **Y** | `redbridge-accent-2026-08-afr` (post-Carroll spill) |
| 23–26 Jul 2026 | Newspoll | *The Australian* (media) | 1035 | 28 | 31 | 13 | 19 | 9 | **Y** | `newspoll-2026-07` |
| 1–14 Jul 2026 | RedBridge | Victorian Trades Hall (union) | 6500 | 26 | 26 | 12 | 27 | 9 | **Y (exception)** | `redbridge-2026-07-trades-hall` |
| 8–12 Jul 2026 | Resolve Strategic | *The Age* (media) | 1000 | 27 | 27 | 12 | 22 | 12 | **Y** | `resolve-2026-07-age` |
| 17–28 Jun 2026 | RedBridge/Accent | *AFR* (media) | 5516 | 26 | 26 | 13 | 27 | 8 | **Y** | `redbridge-accent-2026-06-afr` |
| ~May–12 Jun 2026 | Resolve Strategic | *The Age* (media) | 1100 | 26 | 26 | 12 | 24 | 12 | **Y** | `resolve-2026-06-age` (superseded in window by Jul Resolve) |
| 7–11 Jun 2026 | DemosAU | Premier National (media/public) | 1056 | 21 | 30 | 15 | 23 | 11 | **Y** | `demosau-2026-06` |
| 5–8 Jun 2026 | Freshwater Strategy | Herald Sun (media) | 1034 | 23 | 27 | 14 | 25 | 11 | **Y** | `freshwater-2026-06` (OTH 11 from Poll Bludger/ledger; inventory residual corrected) |
| 22–24 Apr 2026 | Roy Morgan | Self | 1707 | 25.5 | 24 | 13.5 | 24.5 | 12.5 | **Y** | `roy-morgan-2026-04` |
| ~Mar–Apr 2026 | Resolve Strategic | *The Age* (media) | 1047 | 27 | 29 | 10 | 21 | 13 | **Y** | `resolve-2026-04-age` |
| 19–23 Mar 2026 | Freshwater Strategy | Herald Sun (media) | 1062 | 27.1 | 29.6 | 13.8 | 20.4 | 9.1 | **Y** | `freshwater-2026-03` (table decimals) |
| 18–27 Feb 2026 | RedBridge/Accent | AFR (media) | 2165 | 25 | 28 | 13 | 24 | 10 | **Y** | `redbridge-accent-2026-02-afr` |
| 19–23 Feb 2026 | Freshwater Strategy | Herald Sun (media) | 1030 | 27.6 | 26.8 | 13.1 | 22.6 | 9.9 | **Y** | `freshwater-2026-02` (table decimals) |
| 13–16 Feb 2026 | Roy Morgan | Self | 2462 | 25.5 | 21.5 | 13.5 | 26.5 | 13 | **Y** | `roy-morgan-2026-02` |
| ~Feb 2026 | Resolve Strategic | *The Age* (media) | 1100 | 28 | 30 | 12 | — | — | **?** | Confirm ONP series before YAML |
| ~Feb 2026 | DemosAU | Media (confirm) | 1274 | 23 | 29 | 15 | 21 | 12 | **Y** (provisional) | PDF primaries in June release compare table; not yet separate YAML |

OTH sometimes derived as residual in secondary tables; always recompute from
the primary release.

---

## Explicit non-average examples

| Poll | Why excluded from average |
|---|---|
| Seat-only or by-election-only polls (e.g. Nepean local samples) | Not statewide Assembly frame (rule I). |
| JWS Research for Australian Energy Producers (Jun–Jul 2026, “28 marginal seats”) | Sub-state / advocacy commissioner (not statewide frame + hard exclusion 1). |
| Federal Newspoll / Resolve with Victorian cross-breaks only | Not state voting intention (rule A) unless a separate state question is published. |
| Leaked internal party research | No full public methodology (hard exclusion 2). |
| Other party / union / advocacy releases (default) | Hard exclusion 1 unless a new per-record `eligibility_exception`. |
| Oze monthly open survey ([survey.oze.net.au/s/monthly-poll](https://survey.oze.net.au/s/monthly-poll)) | Open, unweighted, anyone-with-the-link. Linked from polls pages and home as an invitation only — **not** a ledger row. August pies are seeded from the Election Tracker average (circular if averaged). |
| Oze Vic issues survey ([survey.oze.net.au/s/vic-issues](https://survey.oze.net.au/s/vic-issues)) | Open issue ranking + closest-policy picks. Public opinion, not a matrix scorecard, **not** a ledger row. |

## Documented average exceptions

| Poll | Why allowed despite commissioner |
|---|---|
| RedBridge ~14 Jul 2026 for Victorian Trades Hall (n≈6500) | Union commissioner disclosed; allowlisted pollster; public five-way; tracks media RedBridge/Accent AFR. **Per-record only** — next Trades Hall/party poll starts excluded. |

---

## Window illustration (as of 2026-08-19)

Under **45-day** fieldwork-end window ending with Resolve (15 Aug 2026):

- Resolve mid Aug — keep (newest Resolve; supersedes Jul)
- DemosAU early Aug — keep (newest DemosAU; supersedes Jun)
- Roy Morgan early Aug — keep (newest Roy Morgan)
- Freshwater late Jul/early Aug — keep (newest Freshwater)
- RedBridge/Accent AFR late Jul — keep (newest `redbridge-accent`)
- Newspoll late Jul — keep (only Newspoll)
- Trades Hall RedBridge — keep via exception (`pollster: redbridge`, distinct key)
- Older DemosAU / Freshwater / Roy Morgan / Resolve — history only (de-dupe or outside window)

Recompute with `scripts/lib/polls.mjs` / `/polls` after each ledger change.

---

## How to extend this inventory

1. Watch primary outlets: *The Age* (Resolve), *The Australian* (Newspoll),
   Herald Sun / AFR (Freshwater, RedBridge media), Roy Morgan findings,
   DemosAU PDFs, Poll Bludger.
2. Add a row with provisional primaries and **Eligible?** + reason.
3. Do not create `data/` YAML until primary source fields match
   [poll-methodology.md](poll-methodology.md).

---

## Caveat

Provisional **Y** does not commit the project to publish those numbers.
Eligibility can flip when commissioner, mode, or incomplete party splits
are verified. Advocacy polls stay listed here so readers can see what was
considered and rejected.
