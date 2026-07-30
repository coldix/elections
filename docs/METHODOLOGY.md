# Methodology

Published rules applied identically to every party and independent.

## Candidate statuses

A candidacy holds exactly one current status; all prior statuses remain in its
history with dates and sources.

| Status | Meaning | Minimum evidence |
|---|---|---|
| `announced` | Person or media state an intention to stand; party endorsement not confirmed | Public statement by the person, party or a named news report |
| `endorsed` | Party has preselected/endorsed the person for the seat | Party announcement, or news report citing the party |
| `nominated` | Formal nomination accepted by the electoral commission | Commission nominations list |
| `withdrawn` | Candidacy ended before or after nomination | Statement or news report; reason recorded neutrally if published |
| `disendorsed` | Party revoked endorsement | Party statement or news report; wording sticks to the sourced fact |
| `elected` | Declared elected | Commission declaration |
| `defeated` | Contested and not elected | Commission results |

Rumour and speculation are **not** statuses and are not recorded.

## Sourcing rules

- Every status entry requires at least one source: URL, publisher, title,
  date published, date accessed.
- Prefer primary sources (commission, party, candidate) over secondary; record
  secondary sources by outlet name, never "reports say".
- Paywalled sources are acceptable if publicly citable; add an archive URL
  where possible.
- Social media posts count only from verified/official accounts of the party
  or candidate.

## Optional profile fields

Candidacy YAML may include short public context fields. They are **optional**
and never required for a valid record.

| Field | Use | Do not use for |
|---|---|---|
| `occupation` | Public job or role (e.g. lawyer, teacher, publican) | Guesswork |
| `background` | One-line public career note | Family, sex, health, private life |

**Out of scope permanently (or without a new decision):** sex/gender as a
required field, marital status, children, home address, personal contact
details. Privacy policy: only what is already public in a political context.

If occupation/background is filled, it should be checkable against a public
source (campaign bio, party page, news profile).

## Corrections

- Errors are corrected by a new commit; history is never rewritten. The
  candidate file gains a `corrections` entry stating what was wrong, what
  changed, and when.
- Anyone may request a correction via GitHub Issues. Requests about living
  persons are prioritised.

## Neutrality

- All registered parties and independents get identical structure, rules and
  display treatment.
- **Ordering.** Party listings are ordered by seats currently held in the
  Parliament of Victoria (both houses), largest first, then alphabetically —
  an objective, externally verifiable fact about the sitting parliament.
  District listings are ordered by seat name. Listings are never ordered by
  candidate coverage, campaign activity, polling, or any editorial judgement of
  importance.
- Editorial features (e.g. coverage dashboards) are generated from the same
  data for every party.
- No payments, sponsorship or advertising can affect coverage, ordering or
  verification. Any sponsorship is disclosed on the site.

## What is never published

- Unverified submissions (they live in GitHub Issues until verified or closed,
  and issues containing unsourced claims about living persons are edited or
  deleted on sight)
- Submitter identities or contact details
- Personal information about candidates beyond their public candidacy
  (no home addresses, families, employers unless self-published in the
  candidacy context)
