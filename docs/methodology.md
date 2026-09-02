# Methodology

> **Version** `20260803.2033-aest+654ffb4` · **Updated** 2026-08-03 20:33 AEST  
> git `agent/people-links-policy` · hub [../README.md](../README.md)

Published rules applied identically to every party and independent.

## Candidate statuses

A candidacy holds exactly one current status; all prior statuses remain in its
history with dates and sources.

| Status | Meaning | Minimum evidence |
|---|---|---|
| `announced` | Person or media state an intention to stand; party endorsement not confirmed | Public statement by the person, party or a named news report |
| `endorsed` | Party has preselected or endorsed the person for the seat | Party announcement, or news report citing the party |
| `nominated` | Formal nomination accepted by the electoral commission | Commission nominations list |
| `withdrawn` | Candidacy ended before or after nomination | Statement or news report; reason recorded neutrally if published |
| `disendorsed` | Party revoked endorsement | Party statement or news report; wording sticks to the sourced fact |
| `elected` | Declared elected | Commission declaration |
| `defeated` | Contested and not elected | Commission results |

Rumour and speculation are **not** statuses and are not recorded.

## Sourcing rules

- Every status entry requires at least one source: URL, publisher, title,
  date published and date accessed.
- Prefer primary sources such as electoral commissions, parliaments, parties
  and candidates over secondary sources.
- Record secondary sources by outlet name, never with vague wording such as
  "reports say".
- Paywalled sources are acceptable if publicly citable; add an archive URL
  where possible.
- Social-media posts count as evidence only when they come from a confidently
  identified official account of the party or candidate.

### Source quality hierarchy (project standard)

Goal: be the **most accurate** public ledger of Australian election information.
Original sources are preferred; secondary compilations are a fallback.

| Priority | Examples | Use |
|---|---|---|
| **1. Primary / original** | Electoral commissions (AEC, VEC, …), Parliament of Australia / state parliaments, official party and candidate publications, Hansard, legislation, court/commission declarations | **Preferred** for every material claim |
| **2. Quality secondary** | Named news outlets, academic or public research with clear provenance | Acceptable when primary is paywalled, delayed, or not online; cite the outlet, not “reports say” |
| **3. Wikipedia and similar wikis** | Wikipedia, Fandom, etc. | **Second-class fallback only.** OK to *check* against, or to bootstrap a bulk list that will be re-verified. **Not preferred** as the sole durable source for living-person roles, candidacies, or membership. Replace with (1) or (2) when practical; label clearly if still only Wikipedia |

Rules:

- Do not treat a Wikipedia citation as equal to an AEC or APH record.
- Bootstrap from Wikipedia is allowed only as a temporary scaffold; membership
  and candidacy ledgers should be re-sourced to commissions or parliaments.
- Policies and polls: prefer party sites, PBO, Hansard, and named media that
  publish full fieldwork/primaries over wiki tables alone.

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
- Election material uses scoped paths such as `/elections/vic/2026`, with
  `/next` reserved for jurisdictions where the year is not sufficiently certain.

The Astro calendar loader performs build-time checks for recognised statuses,
ISO dates and complete sources. Invalid calendar data therefore fails the site
build rather than publishing silently.

## Candidate links

Candidate cards may include a small number of external links. These links are
provided for identification and further reading, not as endorsements.

Use this order of preference:

1. an official candidate, campaign, parliamentary or party profile
2. one principal public political social-media account, where it can be
   confidently identified
3. Wikipedia only when no better official profile is available, clearly
   labelled as an external reference

Do not add several social accounts merely to increase exposure. Do not link a
personal account unless the candidate publicly uses it for political
campaigning. Dead, renamed or ambiguous accounts are removed rather than
guessed.

## Proposed people pages — not approved

There are currently no `/people` routes and no separate people dataset. A
possible future design is recorded in
[people-pages-proposal.md](people-pages-proposal.md), but it remains a proposal
only. No route, schema or public profile page should be created until the scope,
minimum evidence and privacy rules are approved.

For now, public information remains attached to the relevant election and
candidate record, with external links following the rule above.

## Optional profile fields

Candidacy YAML may include short public context fields. They are **optional**
and never required for a valid record.

| Field | Use | Do not use for |
|---|---|---|
| `occupation` | Public job or political role | Guesswork or private employment detail |
| `background` | One-line public career note | Family, sex, health or private life |

**Out of scope permanently, or without a new decision:** sex or gender as a
required field, marital status, children, home address and personal contact
details. Only information already public in a political context may be used.

If occupation or background is filled, it should be checkable against a public
source such as a campaign biography, party page or news profile.

## Historical Assembly results (Victoria 2022)

Each Assembly district page may publish the **2022 first-preference vote**
and the **two-candidate preferred (2CP)** finish for that seat, with a
Labor–Coalition **two-party preferred (2PP)** count when the VEC published
one. These are last-election facts on the current boundaries.

Rules:

- Cite the VEC district results page as the source of truth. Wikipedia may
  be used to discover figures; it is not the durable citation (ADR-14).
- 2CP is who actually finished. It is not always Labor versus Coalition.
- A statewide comparison of 2022 primaries with the current tracker average
  is context only. It is not applied as a swing to the seat.
- Do not publish a 2026 likely winner, uniform swing, MRP, or seat total
  from this ledger (ADR-17, ADR-10).

## Corrections

- Errors are corrected by a new commit; history is never rewritten.
- Where appropriate, the candidate file gains a `corrections` entry stating
  what was wrong, what changed and when.
- A genuine change of candidacy is recorded as status history, not disguised as
  a correction or deletion.
- Anyone may request a correction through GitHub Issues. Requests concerning
  living people are prioritised.

## Neutrality

- All registered parties and independents receive identical structure, rules
  and display treatment.
- Party listings are ordered by seats currently held in the relevant parliament,
  largest first, then alphabetically. Districts and electorates are ordered by
  seat name.
- Listings are never ordered by candidate coverage, campaign activity, polling
  or an editorial judgement of importance.
- Editorial features are generated from the same data for every party.
- No payment, sponsorship or advertising can affect coverage, ordering or
  verification. Any sponsorship must be disclosed.

## What is never published

- unverified submissions
- submitter identities or contact details
- private contact information about candidates
- home addresses, family details, health information or other personal material
  unrelated to the public candidacy
- rumours, allegations or biographical claims without an appropriate source
