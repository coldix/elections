# Methodology

> **Version** `20260803.1909-aest+d68d420` · **Updated** 2026-08-03 19:09 AEST  
> git `agent/upcoming-elections-implementation8` @ [`d68d420`](https://github.com/coldix/elections/commit/d68d420c4620cdf64df2524c25056d4faa73cdf5) · hub [../README.md](../README.md)

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

## Election calendar and date certainty

The public [upcoming elections page](https://electiontracker.au/elections) is
built from `data/election-calendar.yaml`. It lists the next general
parliamentary election for the Commonwealth and each state or territory.
By-elections, local government elections and referendums are excluded unless a
separate product decision adds them. Tasmania's rotating Legislative Council
elections are included as a clearly labelled parliamentary exception.

Dates are not presented with more certainty than the evidence supports:

| Status | Meaning |
|---|---|
| `confirmed` | An electoral commission or other authoritative body has published the polling date |
| `fixed_cycle` | Calculated directly from a statutory recurring rule; exceptional postponement may still be possible |
| `window` | No polling day has been announced, so the normal or lawful election range is shown |
| `not_fixed` | The term or expected year is known, but an earlier election may be called |
| `periodic` | A recurring partial parliamentary election held separately from the jurisdiction's general election |

Rules:

- Prefer electoral commissions, parliaments and current legislation.
- Every calendar entry requires a structured source and verification date.
- A calculated date is never described as announced or confirmed.
- Where the lawful range is more useful than a speculative single date, publish
  the range and state what kind of election it describes.
- When a writ or official announcement supersedes a calculated date or window,
  update the record and retain the change in Git history.
- Public ordering uses `date_sort`, representing the earliest plausible or
  scheduled point, and does not imply political importance.
- Permanent people pages use global paths such as `/people/warren-pickering`.
  Election material progressively uses scoped paths such as
  `/elections/vic/2026`, with `/next` reserved for jurisdictions where the year
  is not yet sufficiently certain.

The Astro calendar loader performs build-time checks for recognised statuses,
ISO dates and complete sources. Invalid calendar data therefore fails the site
build rather than publishing silently.

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
  relevant parliament (both houses where applicable), largest first, then
  alphabetically — an objective, externally verifiable fact. District or
  electorate listings are ordered by seat name. Listings are never ordered by
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
