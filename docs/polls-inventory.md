# Victorian 2026 polls — discovery inventory

**Purpose.** A working census of known *public* statewide Legislative
Assembly voting-intention polls, used to apply
[POLL-METHODOLOGY.md](POLL-METHODOLOGY.md) inclusion rules.

**Status.** Discovery only (compiled 2026-07-29). Figures are taken from
secondary compilations (chiefly Wikipedia’s opinion-polling page and Poll
Bludger / media reports) and are **not** verified ledger records. Before any
`data/vic2026/polls/` entry, re-check the primary source for fieldwork dates,
sample size, commissioner, and exact primaries.

**Column notes.**

- Primaries ordered **ALP | LNP | GRN | ONP | OTH** (percentage points).
- **Eligible** = provisional judgment for the *average* under current rules
  (media/self commissioner, n≥800, statewide state VI, full five-way usable).
- Wikipedia is a **discovery index**, not authority.

Discovery index:
[Opinion polling for the 2026 Victorian state election](https://en.wikipedia.org/wiki/Opinion_polling_for_the_2026_Victorian_state_election).

---

## 2026 statewide Assembly primaries (selected)

| Fieldwork (approx.) | Pollster | Commissioner | n | ALP | LNP | GRN | ONP | OTH | Eligible? | Notes |
|---|---|---|---:|---:|---:|---:|---:|---:|---|---|
| ~23–26 Jul 2026 | Newspoll | *The Australian* (media) | 1035 | 28 | 31 | 13 | 19 | 9 | **Y** (provisional) | Re-verify dates & series |
| ~14 Jul 2026 | RedBridge | Victorian Trades Hall (union/advocacy) | ~6500 | 26 | 26 | 12 | 27 | 8 | **N** | Advocacy commissioner — hard exclude from average |
| ~8–12 Jul 2026 | Resolve Strategic | *The Age* (media) | ~1000 | 27 | 27 | 12 | 22 | 12 | **Y** (provisional) | Monthly Age Vic series |
| 17–28 Jun 2026 | RedBridge/Accent | *Australian Financial Review* (media) | 5516 | 26 | 26 | 13 | 27 | 8 | **Y** (provisional) | Media-commissioned; distinct from Trades Hall poll |
| ~15 Jun 2026 | Resolve Strategic | *The Age* (media) | ~1000 | 26 | 26 | 12 | 24 | 12 | **Y** (provisional) | Superseded by later Resolve inside window |
| 7–11 Jun 2026 | DemosAU | Public / media (confirm) | 1056 | 21 | 30 | 15 | 23 | 11 | **Y** (provisional) | Confirm commissioner on primary source |
| 5–8 Jun 2026 | Freshwater Strategy | Herald Sun / media (confirm) | 1034 | 23 | 27 | 14 | 25 | 9 | **Y** (provisional) | Confirm outlet |
| 22–24 Apr 2026 | Roy Morgan | Self | 1707 | 25.5 | 24 | 13.5 | 24.5 | 12.5 | **Y** (provisional) | Self-published SMS/other; OTH may need reconcile |
| ~Apr 2026 | Resolve Strategic | *The Age* (media) | 1047 | 27 | 29 | 10 | 21 | 13 | **Y** (provisional) | Exact ONP/OTH: re-verify |
| ~Mar 2026 | Freshwater Strategy | Media (confirm) | 1062 | 27 | 30 | 14 | — | — | **?** | Confirm full ONP split before eligibility |
| 18–27 Feb 2026 | RedBridge/Accent | AFR (media) | 2165 | 25 | 28 | 13 | 24 | 10 | **Y** (provisional) | ONP first reported in this AFR series wave |
| 19–23 Feb 2026 | Freshwater Strategy | Herald Sun (media) | 1030 | 28 | 27 | 13 | 23 | 9 | **Y** (provisional) | |
| 13–16 Feb 2026 | Roy Morgan | Self | 2462 | 25.5 | 21.5 | 13.5 | 26.5 | 13 | **Y** (provisional) | Primary source: [Roy Morgan finding 10133](https://www.roymorgan.com/findings/10133-victorian-state-voting-intention-february-2026) |
| ~Feb 2026 | Resolve Strategic | *The Age* (media) | 1100 | 28 | 30 | 12 | — | — | **?** | Confirm ONP series |
| ~Feb 2026 | DemosAU | Media (confirm) | 1274 | 23 | 29 | 15 | — | — | **?** | Confirm ONP series |

OTH sometimes derived as residual in secondary tables; always recompute from
the primary release.

---

## Explicit non-average examples

| Poll | Why excluded from average |
|---|---|
| RedBridge ~14 Jul 2026 for Victorian Trades Hall (n≈6500) | **Union / advocacy commissioner** — rule G / hard exclusion 1. Large n does not override. |
| Seat-only or by-election-only polls (e.g. Nepean local samples) | Not statewide Assembly frame (rule I). |
| Federal Newspoll / Resolve with Victorian cross-breaks only | Not state voting intention (rule A) unless a separate state question is published. |
| Leaked internal party research | No full public methodology (hard exclusion 2). |

---

## Window illustration (as of 2026-07-29)

Under **45-day** fieldwork-end window ending 29 Jul 2026 (approx. from
14 Jun 2026), provisional candidates for de-dupe include:

- Newspoll ~late Jul — keep (only Newspoll in window)
- Resolve ~mid Jul — keep (newest Resolve)
- RedBridge/Accent AFR Jun — keep (media)
- Freshwater early Jun — may fall just outside 45 days → include only if
  window extended to 60 days for minimum set
- Trades Hall RedBridge — **never** in average

After **one poll per pollster**, a numeric average would need ≥2 remaining
eligible pollsters. Recompute with verified dates at implementation time.

---

## How to extend this inventory

1. Watch primary outlets: *The Age* (Resolve), *The Australian* (Newspoll),
   Herald Sun / AFR (Freshwater, RedBridge media), Roy Morgan findings,
   Poll Bludger.
2. Add a row with provisional primaries and **Eligible?** + reason.
3. Do not create `data/` YAML until primary source fields match
   [POLL-METHODOLOGY.md](POLL-METHODOLOGY.md).

---

## Caveat

Provisional **Y** does not commit the project to publish those numbers.
Eligibility can flip when commissioner, mode, or incomplete party splits
are verified. Advocacy polls stay listed here so readers can see what was
considered and rejected.
