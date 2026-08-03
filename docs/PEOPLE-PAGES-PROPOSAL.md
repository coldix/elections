# People pages proposal

> **Status:** Proposal only. Not approved for implementation.  
> **Decision:** No `/people` routes are published at present.

## Purpose

A future people layer could provide one permanent page for a political person across multiple elections, chambers and roles. It would prevent the same public biography and links being repeated in every election record.

Proposed examples:

```text
/people
/people/warren-pickering
/people/jacinta-allan
/people/brad-battin
```

These paths would be national and permanent. Election-specific candidacies would remain under paths such as:

```text
/elections/vic/2026/districts/pakenham
/elections/vic/2026/parties/one-nation
```

## Suggested data model

If approved later, people records could live under `data/people/<slug>.yaml` and contain only public political information:

```yaml
person:
  name: Warren Pickering
  slug: warren-pickering
  current_roles:
    - role: Victorian leader
      organisation: Pauline Hanson's One Nation
      source: {}
  links:
    - kind: official-profile
      url: https://example.com
    - kind: facebook
      url: https://facebook.com/example
  candidacies:
    - election: vic2026
      chamber: assembly
      contest: pakenham
```

Candidate and election records would remain the source of truth for candidacy status. A people page would aggregate those records rather than duplicate or override them.

## Suggested page contents

A person page could show:

- current publicly sourced political role
- current and past candidacies already held in the election ledger
- elected offices already recorded in authoritative data
- official website or party profile
- one principal public political social-media account
- a short, sourced public-career summary
- correction history and source links

It should not become an unsourced biography, opinion page or personal dossier.

## Privacy and neutrality limits

Do not include family details, private addresses, personal contact information, health, sexuality or unrelated employment history. Do not rank people, describe character, or create editorial profiles. Apply the same fields and evidence rules to every party and independent.

## Interim approach

Until this proposal is approved, candidate cards may provide external links only, in this order:

1. official candidate, campaign, parliamentary or party profile
2. one principal public political social-media account, where it can be confidently identified
3. Wikipedia only when no better official profile is available, clearly labelled as an external reference

Do not publish multiple social accounts merely to increase exposure. Do not link a personal account unless the candidate publicly uses it for political campaigning. Dead, renamed or ambiguous accounts should be removed rather than guessed.

## Questions to decide before implementation

- Is there enough cross-election use to justify a separate people dataset?
- Should pages cover every candidate or only elected members and recognised leaders?
- How are two people with the same name distinguished?
- Which political roles belong in the global person record rather than an election record?
- Should the `/people` index be searchable, or should pages only be reached from candidate and party pages?
- What minimum sourcing threshold is required before a person page is generated?

No code, route or schema should be added until these questions are decided.
