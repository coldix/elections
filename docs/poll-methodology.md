# Poll methodology (Victorian 2026)

> **Version** `20260803.1631-aest+91ecdbf` · **Updated** 2026-08-03 16:31 AEST  
> git `main` @ [`91ecdbf`](https://github.com/coldix/elections/commit/91ecdbf) · hub [../README.md](../README.md)

Rules for the statewide primary-vote poll ledger and tracker average.
This document is authoritative for inclusion and maths. It does **not**
authorise forecasts, seat models, or how-to-vote advice.

**Status.** Live (as of 2026-07-29). Public poll records live under
`data/vic2026/polls/`, are validated on every build, exported as
`polls.json` / `poll-average.json`, and shown at
[electiontracker.au/polls](https://electiontracker.au/polls). Candidate
coverage remains the product wedge; see [scope.md](scope.md).

**Companion.** [polls-inventory.md](polls-inventory.md) — discovery census.
Inventory rows may lag the ledger; the YAML files and exports are the
source of published figures.

---

## Source quality

Prefer **primary or pollster-published tables** and named media that report full
fieldwork and primaries. Wikipedia poll tables are a **second-class fallback**
for discovery only — every ledger row must still cite a primary or quality
secondary source (see [methodology.md](methodology.md) source hierarchy).

## Purpose

The tracker average is a **transparent, reproducible summary of recent public
statewide primary-vote polls** that meet the rules below — not a prediction of
election day.

Headline outputs:

- Weighted primary shares: Labor (ALP), Coalition (L-NP), One Nation (ONP),
  Greens (GRN), Others
- Uncertainty bands (see [Error bars](#error-bars))
- The list of polls in the average, each with a structured source
- As-of date = latest fieldwork **end** among included polls

Not in v1 average: preferred premier, approvals, 2PP/3PP headlines, MRP,
seat projections, invented preference flows.

District pages may show **2022 Assembly first preferences and 2CP** next to
the current statewide tracker average as labelled context. That is not a
seat model and is not part of the average (ADR-17).

### Display-only two-bloc grouping

The `/polls` page may show a **Left / Right** graphic derived from the same
primary average:

| Bloc | Composition |
|---|---|
| **Left bloc** | Labor + Greens |
| **Right bloc** | Coalition (L-NP) + One Nation |
| **Others** | Residual minor parties and independents |

**Others handling (two options shown):**

1. **Residual** — leave Others as a third slice (three-way pie).
2. **Proportional split** — allocate Others into Left and Right in proportion
   to each bloc’s share of the four-party core (ALP+GRN vs LNP+ONP). An even
   50/50 split of Others is also reported as a sensitivity check in
   `poll-average.json` (`bloc_split.other_split_even`).

This is **not** a two-party preferred result, preference flow, or forecast.
It is only a primary-vote grouping for readability.

---

## Scope

[scope.md](scope.md) includes the poll ledger and average as a secondary
module. Still forbidden without a new decision: forecasts, swing models,
MRP, seat models, commentary, and any claim that the average “will” or
“should” be the election result.

Candidate listing order must never use polling
([methodology.md](methodology.md) — ordering rule).

Implementation: `scripts/lib/polls.mjs` (load + average), validation in
`scripts/validate.mjs`, exports in `scripts/export.mjs`, UI at `/polls`.

---

## Which polls to use

### Inclusion (must pass all)

A poll enters the **eligible set** only if every row holds:

| # | Rule | Why |
|---|---|---|
| A | **Jurisdiction** is Victorian **state** voting intention (Legislative Assembly primary). Not federal VI; not “federal question asked of Victorian respondents” unless the published series is clearly state ballot intention. | Avoid mixing contests |
| B | **Population** is adult Victorian electors / enrolled voters, or an adult Victorian sample with electors clearly reported. | Match the election frame |
| C | **Fieldwork start and end** dates are published. Sorting and time-decay use **fieldwork end**, not publication date. | Reproducible recency |
| D | **Sample size** published and **n ≥ 800** for statewide primaries. Rare exception only if n ≥ 500 **and** design is clearly superior (document case-by-case); default floor is 800. | Small samples dominate averages |
| E | **Primary series** reports at least ALP, L-NP (or Lib+Nat), and Greens, with One Nation and residual Others when published. All five series must be usable after [comparability](#comparability) rules. | Comparable multi-party vector |
| F | **Public topline** with a citable source (URL, publisher, title, date published, date accessed) — same discipline as candidates. | Project DNA |
| G | **Commissioner** is a media outlet, the pollster themselves, or a neutral academic / public-interest body **without** a campaign, party, or union stake in the Victorian result — **or** a documented [case-by-case exception](#case-by-case-exceptions) with `eligibility_exception`. | Bias control |
| H | **Mode** stated: online panel, SMS, phone (CATI/mobile), or mixed. | Opaque “research” excluded |
| I | **Statewide** frame (not a single seat or single region as the only result). | Apples to apples |
| J | **One sample, one row** — no partial re-release that double-counts the same fieldwork. | Independence of observations |

### Hard exclusions (out of the average)

1. **Party, candidate, union, or advocacy-commissioned** polls — **default**.
   Large *n* does not override. See [case-by-case exceptions](#case-by-case-exceptions)
   for the only path into the average.
2. **Internal or leaked** polls without full public methodology and sample.
3. **Push polls**, fundraising surveys, or non–voting-intention questions.
4. **Sub-state only** polls (seat/region). May be a separate series later.
5. **Federal-only** Victorian cuts without a clear state VI question.
6. **Duplicate** publications of the same fieldwork (keep one canonical
   source; prefer pollster PDF or commissioning masthead).
7. Polls that **omit sample size or fieldwork dates**.
8. **Open oze / self-select surveys** (anyone-with-the-link, unweighted). The
   monthly questionnaire at [survey.oze.net.au/s/monthly-poll](https://survey.oze.net.au/s/monthly-poll)
   and the issues survey at [survey.oze.net.au/s/vic-issues](https://survey.oze.net.au/s/vic-issues)
   are linked as invitations only. They are **not** ledger rows and **must not**
   enter the average — the monthly poll’s August charts are seeded from this
   tracker’s average, so including them would be circular.

Advocacy / party / union polls are still recorded in the ledger with
`eligible_for_average: false` and an `exclusion_reason` unless a documented
exception applies.

### Case-by-case exceptions

Party / union / advocacy commissioners remain **out by default**. A single
poll may enter the average only when all of the following hold:

1. **Allowlisted pollster** with a public statewide method (not opaque
   internal research).
2. **Full public topline** meeting rules A–F and H–J (dates, *n*, five-way
   primaries, citable source).
3. **Written justification** in the YAML field `eligibility_exception`
   (non-empty). CI requires this field when
   `commissioner_type` is party / union / candidate / excluded_advocacy **and**
   `eligible_for_average: true`.
4. **Maintainer decision** recorded in the poll file and, for non-obvious
   cases, a one-line note in [polls-inventory.md](polls-inventory.md) or
   [changelog.md](changelog.md).

Exceptions are **per poll record**, not a standing waiver for the
commissioner. The next union- or party-funded release starts excluded again.
Do not invent exceptions to chase a preferred narrative; the bar is
transparent method + independent corroboration where possible.

**Current exception (Vic 2026):** `redbridge-2026-07-trades-hall` — RedBridge
for Victorian Trades Hall; large public sample; primaries track the
media-commissioned RedBridge/Accent AFR wave.

### Pollster allowlist

Quality-gated, not open to any brand. Start set for Vic 2026 statewide VI:

| Pollster | Typical commissioner | Notes |
|---|---|---|
| Resolve Strategic | *The Age* / SMH | Monthly Vic state series in 2026 |
| Newspoll | *The Australian* | Include when **state** Vic series |
| Freshwater Strategy | Herald Sun / AFR / others | Statewide VI with n and dates |
| YouGov | Various | When statewide state VI |
| Essential | Guardian / others | Rare for state; same rules |
| RedBridge / Accent | Media preferred | Party / union / advocacy **default exclude**; rare exception only with `eligibility_exception` |
| Roy Morgan | Self-published | Include if state VI + method public |
| DemosAU | Various | After first verified full metadata |
| Ipsos, Spectre, others | Case-by-case | Add via allowlist edit, not ad hoc |

**Adding a pollster.** Edit this table with one-line justification (public
track record or transparent method). Do not silently include a firm.

### Window and de-duplication

Among eligible polls, the average uses a **rolling window**, not all history:

| Rule | Value | Justification |
|---|---|---|
| Time window | Fieldwork end within **last 45 days**; if fewer than **3** eligible after de-dupe, extend to **60 days**. Never beyond **90 days** without a manual methodology note on the release. | Sparse state polling vs recency |
| One poll per pollster | Keep only the **most recent** eligible poll per pollster inside the window | Stops frequent series drowning monthly ones |
| Minimum set | Publish a numeric average only if **≥ 2 pollsters** and **≥ 2 polls** after de-dupe; otherwise “insufficient recent polling” + eligible list | No single-poll “averages” |
| Sort key | Fieldwork **end** | Publication lag can reverse true order |

---

## Comparability

Apply before weighting:

- **Undecided.** Prefer the pollster’s published decided-only / allocated
  primary series (what media usually report). If both raw and allocated
  exist, use allocated and record `undecided_handling: allocated`. Never
  invent allocation.
- **Coalition.** Store **L-NP combined**. If Lib and Nat are split, sum for
  the average series; keep the split on the raw record.
- **One Nation.** If ONP is folded into Others with no separate figure,
  **exclude the poll from the multi-party average** (prefer a complete
  five-way vector that sums to 100). Do not partial-average ONP from a
  different poll set.
- **Others.** Prefer the published residual. If missing, set
  `others = 100 − (alp + lnp + onp + grn)` using the poll’s reported
  figures before any tracker rounding.
- **Rounding.** Report averages to **one decimal place**. Adjust with the
  **largest remainder** method so the five shares sum to 100.0.

---

## Point estimate (v1 formula)

Let the de-duplicated window set be polls \(i = 1 \ldots k\).

### Effective sample size

\[
n_i^{\mathrm{eff}} = \frac{n_i}{\mathrm{deff}_i}
\]

Default **design effect \(\mathrm{deff} = 1.3\)** when the pollster does not
publish one. Online and SMS panels are not simple random samples; 1.3 is a
conservative default, not a claim of each firm’s true design effect. If a
pollster publishes deff or margin-of-error assumptions, use those instead
and record them on the poll record.

### Time weight

As-of date \(T\) = maximum fieldwork end in the set. Age in days:

\[
d_i = T - t_i^{\mathrm{end}}
\]

Half-life **21 days**:

\[
\lambda = \frac{\ln 2}{21} \approx 0.03301
\]

Justification: 14-day half-life often empties sparse state series; 30 days
is sluggish late in a campaign. 21 days is an explicit compromise.

### Combined weight and mean

\[
w_i = n_i^{\mathrm{eff}} \cdot e^{-\lambda d_i},
\qquad
\hat{p} = \frac{\sum_{i=1}^{k} w_i p_i}{\sum_{i=1}^{k} w_i}
\]

Compute \(\hat{p}\) separately for ALP, L-NP, ONP, GRN, Others, then apply
largest-remainder so shares sum to 100.0.

### Explicitly not in v1

- **No house-effect correction.** Vic 2026 has few state polls per firm and
  a disrupted party system (One Nation surge). Federal or 2022 house effects
  would mislead. Revisit only after multi-election state track record or a
  published transparent house-effect study.
- **No subjective pollster grades** beyond allowlist + deff. No silent
  down-weighting of a firm without a documented rule change.

---

## Error bars

Do **not** attach a single classic MoE for \(n = \sum n_i\) to the average
(that understates uncertainty when pollsters disagree).

Use percentage points on the 0–100 primary scale. For each party share:

### A. Sampling component (within)

Using each poll’s own share \(p_i\) (as a proportion 0–1 for the formula,
then convert SE back to percentage points ×100 for display):

\[
\widehat{\mathrm{Var}}_{\mathrm{samp}}(\hat{p})
  = \frac{
      \sum_{i=1}^{k} w_i^{2} \cdot \dfrac{p_i (1 - p_i)}{n_i^{\mathrm{eff}}}
    }{
      \bigl(\sum_{i=1}^{k} w_i\bigr)^{2}
    }
\]

(Here \(p_i\) is a proportion; multiply variance by \(100^{2}\) if working
entirely in percentage points.)

### B. Between-poll component

If \(k \ge 3\), compute the **weighted sample variance** of the \(p_i\)
values (percentage points), with weights \(w_i\):

\[
\bar{p}_w = \hat{p},
\quad
s^{2}_w
  = \frac{
      \sum_{i} w_i (p_i - \bar{p}_w)^{2}
    }{
      \sum_{i} w_i
    }
  \cdot
  \frac{k}{k - 1}
\]

Floor so agreement among few pollsters cannot look infinitely precise:

\[
\widehat{\mathrm{Var}}_{\mathrm{between}}
  = \max\bigl(s^{2}_w,\; \sigma^{2}_{\min}\bigr),
\quad
\sigma_{\min} = 1.0\ \text{percentage point}
\]

(\(\sigma^{2}_{\min} = 1.0\) when \(p\) is in percentage points.)

If \(k = 2\), set \(\widehat{\mathrm{Var}}_{\mathrm{between}} = \sigma^{2}_{\min}\)
(no stable empirical dispersion; use the floor only).

### Combined interval

\[
\mathrm{SE}
  = \sqrt{
      \widehat{\mathrm{Var}}_{\mathrm{samp}}
      + \widehat{\mathrm{Var}}_{\mathrm{between}}
    },
\qquad
\hat{p} \pm 1.96 \cdot \mathrm{SE}
\]

Clip displayed bounds to \([0, 100]\) if needed; do not re-normalise the
point estimate after clipping bands.

### Required plain-language caveat

> Bands reflect sampling uncertainty and disagreement among recent polls,
> not a forecast of election day. They do not model preference flows,
> turnout, or late swings.

### What we will not claim

- That the average predicts the result
- That intervals are full Bayesian credible intervals without a fuller model
- That excluding advocacy polls removes all bias
- 2PP or seat counts derived from primaries without published preference data

---

## Worked example (illustrative)

Three eligible polls after de-dupe; as-of \(T\) = 12 Jul 2026;
\(\mathrm{deff} = 1.3\); \(\lambda = \ln 2 / 21\). Numbers are rounded for
display; a future unit test should match to 0.1 pp on point estimates.

| Poll | End | \(n\) | \(n^{\mathrm{eff}}\) | \(d\) | decay | \(w\) | ALP | LNP | ONP | GRN | OTH |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Resolve | 12 Jul | 1000 | 769.23 | 0 | 1.0000 | 769.23 | 27 | 27 | 22 | 12 | 12 |
| RedBridge (media) | 28 Jun | 5516 | 4243.08 | 14 | 0.6300 | 2673.14 | 26 | 26 | 27 | 13 | 8 |
| Freshwater | 8 Jun | 1034 | 795.38 | 34 | 0.3261 | 259.37 | 23 | 27 | 25 | 14 | 11 |

\(W = 3701.74\).

Point estimates (one decimal before largest-remainder):

| Party | \(\hat{p}\) |
|---|---:|
| ALP | 26.0 |
| LNP | 26.3 |
| ONP | 25.8 |
| GRN | 12.9 |
| OTH | 9.0 |
| *sum* | *100.0* |

ALP interval sketch: sampling variance from \(p_i \in \{0.27, 0.26, 0.23\}\)
and the weights above yields \(\mathrm{SE}_{\mathrm{samp}} \approx 0.60\) pp;
between-poll \(s^{2}_w \approx 1.26\) (above the 1.0 floor);
combined \(\mathrm{SE} \approx 1.27\) pp → roughly **26.0 ± 2.5** at 95%
(illustrative; recompute exactly in code).

The worked table above is the **pre-exception** illustration (media/self only).
With the documented Trades Hall RedBridge exception, the live average also
includes that record (distinct `pollster: redbridge` key; not de-duplicated
against `redbridge-accent`). Recompute via `scripts/lib/polls.mjs` / the
`/polls` page — do not treat this section as the live number.

---

## Data shape

Path: `data/vic2026/polls/<id>.yaml`. Source object matches candidates.
Draft JSON Schema: `schema/poll.schema.json`. Runtime checks:
`scripts/validate.mjs`.

```yaml
id: resolve-2026-07-age
pollster: resolve
commissioner: the-age
commissioner_type: media
fieldwork_start: 2026-07-08
fieldwork_end: 2026-07-12
sample_size: 1000
design_effect: null
mode: online
population: victorian-electors
question_notes: "State voting intention"
primaries:
  alp: 27
  lnp: 27
  onp: 22
  grn: 12
  others: 12
undecided_handling: allocated
eligible_for_average: true
exclusion_reason: null
eligibility_exception: null   # required string only for party/union/advocacy exceptions
sources:
  - url: https://example.com/article
    publisher: The Age
    title: "Example title"
    published: 2026-07-13
    accessed: 2026-07-29
```

---

## Update process

1. New public statewide poll appears.
2. Verify against primary source (not Wikipedia alone).
3. Add or update YAML; set eligibility from this document.
4. `npm run validate` / `npm run build`.
5. Average is recomputed at export time — never hand-edit
   `poll-average.json` as source of truth.

Corrections: new commit; do not silently rewrite a wrong topline.

---

## Related documents

- [scope.md](scope.md) — product boundary
- [methodology.md](methodology.md) — candidate statuses and neutrality
- [decisions.md](decisions.md) — ADR-10 poll average principles
- [polls-inventory.md](polls-inventory.md) — discovery census
