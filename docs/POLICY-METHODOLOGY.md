# Policy matrix & issues ledger methodology

Rules for recording party policy positions and the jurisdiction guide on
[electiontracker.au](https://electiontracker.au). Enforced in data validation
where mechanical checks are possible.

This is a **secondary product**. The primary wedge remains the candidate
coverage ledger (see [SCOPE.md](SCOPE.md)).

## What this is

- A **jurisdiction guide** (`/parties/issues`) explaining State vs Federal vs
  Local responsibility for each issue area.
- A **comparison matrix** (`/parties/matrix`) of **sourced** party positions
  for a fixed set of parties and issues.
- Machine-readable exports: `issues.json`, `policies.json`, `policies.csv`.

## What this is not

- Not a scorecard, ranking, star rating, letter grade or “best party on X”.
- Not voting advice or a how-to-vote card.
- Not a complete encyclopaedia of every party statement ever made.
- Not legal advice about constitutional powers.

## Non-partisanship

1. **Evidence first.** Every claim requires a structured source (URL, publisher,
   accessed date; published date and archive URL encouraged).
2. **Quote over paraphrase.** Prefer verbatim text from official manifestos,
   party press releases, Hansard, or Parliamentary Budget Office (PBO)
   costings. Short neutral headlines for scannability are optional and must not
   editorialize.
3. **Identical structure** for every party in the matrix. No party-specific
   display treatment beyond conventional party colours in column chrome.
4. **Empty cells are honest.** “No sourced position recorded” means the ledger
   has no qualifying source yet — not silence, weakness, or irrelevance.

## v1 matrix parties

Fixed columns (left to right):

| Order | Slug | Label |
|---|---|---|
| 1 | `greens` | Greens |
| 2 | `labor` | Labor |
| 3 | `liberal` | Liberal |
| 4 | `nationals` | Nationals |
| 5 | `one-nation` | One Nation |

Users may toggle columns on/off for pairwise comparison. Expanding the column
set requires a methodology update (not an ad hoc UI change).

**Coalition joint announcements:** record under the party that issued the
statement, or duplicate with separate sources if both parties claim it. There
is no sixth “Coalition” column.

## Issues taxonomy

Issues live in `data/<election>/issues.yaml`. Order in that file is display
order. Issues may be added, renamed, merged or split by editing the taxonomy
and updating related policy files.

Each issue has a **jurisdiction** enum:

| Value | Badge |
|---|---|
| `state_primary` | State Primary |
| `shared_fed_state` | Shared Fed/State |
| `federal_primary` | Federal Primary |
| `local_primary` | Local |
| `shared_state_local` | Shared State/Local |

Jurisdiction notes are plain-language guides for voters, not legal opinions.

## Policy records

One YAML file per party × issue when a position exists:

```text
data/<election>/policies/<party>--<issue>.yaml
```

### Claim kinds

| Kind | Use |
|---|---|
| `pledge` | Forward commitment if elected / in government |
| `position` | Stated view without a concrete delivery commitment |
| `costed_measure` | Measure with an attached public costing |
| `opposition_to` | Explicit opposition to a measure or approach |

### Fiscal fields (optional)

When a claim involves public money, prefer taxpayer framing:

- **taxpayer_label:** `Upfront capital` | `Ongoing operational` | `Debt / interest` | `Not specified`
- **amount_aud:** whole Australian dollars (integer)
- **amount_display:** human string (e.g. `$1.2 billion`)
- **financing:** `taxpayer` | `borrowing` | `user_charges` | `mixed` | `unspecified`
- **pbo_status:** `pbo_costed` | `uncosted` | `not_applicable`

If `pbo_status` is `pbo_costed`, a `pbo_ref` source object is **required**.

UI chips may show amount, PBO status, and borrowing labels. Absence of fiscal
fields means “not a financial claim in the ledger,” not “free.”

## Forbidden fields

Validation rejects subjective ratings on policy records, including:
`rating`, `score`, `stars`, `rank`, `grade` (and the same on claims).

## Corrections

Same spirit as the candidate ledger: correct via new commit; optional
`corrections` array on the policy file; public history in git. Requests via
GitHub Issues.

## Open data

Published on every successful build under `/data/<election>/`:

- `issues.json` — taxonomy and jurisdiction notes
- `policies.json` — full claims with sources and stats
- `policies.csv` — flattened claims for spreadsheets

Licence: CC BY 4.0 (see `data/LICENSE`).

## Related docs

- [SCOPE.md](SCOPE.md) — product boundaries
- [METHODOLOGY.md](METHODOLOGY.md) — candidate ledger rules
- [DECISIONS.md](DECISIONS.md) — ADR for this secondary product
