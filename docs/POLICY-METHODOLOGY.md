# Policy matrix & issues ledger methodology

> **Version** `20260803.1631-aest+91ecdbf` · **Updated** 2026-08-03 16:31 AEST  
> git `main` @ [`91ecdbf`](https://github.com/coldix/elections/commit/91ecdbf) · hub [../README.md](../README.md)

Rules for recording party policy positions and the jurisdiction guide on
[electiontracker.au](https://electiontracker.au). Enforced in data validation
where mechanical checks are possible.

This is a **secondary product**. The primary wedge remains the candidate
coverage ledger (see [SCOPE.md](SCOPE.md)).

## What this is

- A **jurisdiction guide** (`/parties/issues`) explaining State vs Federal vs
  Local responsibility for each issue area.
- A **comparison matrix** (`/parties/matrix`) of **sourced** party positions.
- A default combined view that may consolidate a formally documented Coalition
  relationship for readability while preserving every underlying party record.
- Machine-readable exports: `issues.json`, `coalitions.json`, `policies.json`,
  `policies.csv`.

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
3. **Identical underlying structure** for every party in the matrix. No
   party-specific display treatment beyond conventional party colours in
   column chrome.
4. **Coalition display is reversible.** Combining party columns never merges,
   deletes or rewrites their source records. A separate-party view must remain
   available.
5. **Empty cells are honest.** “No sourced position recorded” means the ledger
   has no qualifying source yet — not silence, weakness, or irrelevance.

## Underlying matrix parties

The source ledger keeps five separate party columns (left to right):

| Order | Slug | Label |
|---|---|---|
| 1 | `greens` | Greens |
| 2 | `labor` | Labor |
| 3 | `liberal` | Liberal |
| 4 | `nationals` | Nationals |
| 5 | `one-nation` | One Nation |

Users may toggle columns on/off for focused comparison. Expanding the source
column set requires a methodology update, not an ad hoc UI change.

## Coalition display relationships

Coalition relationships live in:

```text
data/<election>/coalitions.yaml
```

This is a **display relationship ledger**, not a party-policy source. Liberal
and Nationals policy claims remain in their own files and exports. The default
Victorian view presents four display columns — Greens, Labor,
Liberal–Nationals, and One Nation — with a one-click five-party view.

Each issue relationship uses one of these scopes:

| Scope | Meaning | Combined display |
|---|---|---|
| `coalition_shared` | The available records describe the same joint commitment | Show once with a “Shared Coalition policy” badge and provide a separate-record drill-down |
| `mixed` | A joint core platform exists alongside party-specific material | Show both party records within the Coalition column |
| `party_specific` | No qualifying shared position is recorded | Show each member’s position, including an honest empty state where applicable |

`shared_policy_id` is required for `coalition_shared` and `mixed` relationships.
It is a stable identifier for the shared policy family; it does not replace
claim IDs or sources. `representative_party` selects which complete policy
record is shown in the collapsed shared cell. Both original records remain
available in the drill-down and separate-party view.

Validation requires a default combined coalition to classify every issue. A
shared relationship must have an underlying policy record for every member;
`mixed` requires at least two member records; `party_specific` requires at
least one.

## Source quality

Same hierarchy as [METHODOLOGY.md](METHODOLOGY.md): **primary sources first**
(party sites, PBO, Hansard, government publications). Named media OK when they
quote or publish the claim. **Wikipedia is a second-class fallback** for
discovery only — do not leave a policy claim sourced only to a wiki page when a
party or primary publication exists.

## Federal policies

Where a matrix party has no Victorian-specific public position, a **national
party policy** may be recorded if it is relevant to the issue and clearly
labelled as **federal** (headline and/or statement). Prefer party websites and
dated primary sources.

This is especially appropriate for `federal_primary` issues such as
immigration and for parties whose Victorian branch has not yet published a
state manifesto on that topic. Federal claims do **not** become state-law
commitments unless a Victorian source says so.

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

### Deferred for federal elections (not Vic 2026)

Issues considered and **left out** of the Victorian 2026 taxonomy because they
are Commonwealth-primary and would produce a one-party or culture-war row on a
state matrix. Revisit when standing up `data/<federal-election-id>/issues.yaml`.

| Candidate issue | Why deferred for Vic 2026 | Federal setup notes |
|---|---|---|
| **Public broadcasting (ABC / SBS)** | Funding and charters are Commonwealth. One Nation has a clear federal pledge (e.g. metro ABC → subscription / regional funding retained; defund SBS — Press Club and party statements, 2026). Other matrix parties lack comparable Victorian-campaign positions; a row would be lopsided and misread as a state lever. | Strong `federal_primary` candidate. Prefer a neutral slug such as `public-media` or `media-broadcasting`. Source multi-party positions (defend funding, partial reform, defund/subscription) before promoting to the matrix; do not ship a row that only One Nation fills unless empty cells are explicitly accepted for that election. |

Do **not** force-fit ABC/SBS claims into Vic `debt-budget` or `gender-social`.

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
- `coalitions.json` — reversible display relationships between separate parties
- `policies.json` — full claims, sources, matrix metadata and display views
- `policies.csv` — flattened underlying party claims for spreadsheets

The CSV deliberately remains party-level: a virtual Coalition display column
must never create duplicate policy claims in the source export.

Licence: CC BY 4.0 (see `data/LICENSE`).

## Related docs

- [SCOPE.md](SCOPE.md) — product boundaries
- [METHODOLOGY.md](METHODOLOGY.md) — candidate ledger rules
- [DECISIONS.md](DECISIONS.md) — ADR for this secondary product
