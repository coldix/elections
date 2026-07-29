# Social media — brand split and channel policy

Rules for anything that speaks as the **Australian Election Tracker**.
Personal creative or political channels are not the product brand.

## Brand architecture

```
oze.au / Colin          →  publisher identity (portfolio)
        │
        ├── electiontracker.au + project social   →  neutral civic product
        │
        └── personal channels (e.g. mallacoota2020) →  personal creative/politics
                 └── optional soft link only
```

| Brand | Owns | Does not own |
|---|---|---|
| **Election Tracker** | Voting explainers, candidate-data notes, poll average notes, links to the site | Personal opinions, party bashing, lifestyle content |
| **OZE / oze.au** | Who publishes the project | Day-to-day election posts |
| **Personal channels** | Scenic, music, personal politics | Official tracker voting explainers as the *primary* home |

## Channels (project only)

List only channels you actually maintain. Dead icons hurt trust.

| Channel | Status | Role |
|---|---|---|
| Facebook Page | Live — `facebook.com/election.tracker.au` | Primary social distribution |
| YouTube (project) | Live — [youtube.com/@electiontrackerau](https://www.youtube.com/@electiontrackerau) (listed with Google and Bing) | Canonical long-form video home |
| Facebook Group | **Do not create** | High moderation; becomes partisan |
| Instagram / X / TikTok / Bluesky | Optional later | Only if posting regularly |

**Never** put a personal political/lifestyle channel (e.g. `@mallacoota2020`) in:

- site footer social links  
- JSON-LD `sameAs`  
- privacy “we run” list as a tracker property  

That wires personal politics into the product for search and AI citation.

## Soft cross-promotion from personal channels (allowed)

- Community post or end-card on a *non-political* video: project URL + one neutral line.  
- Point people at the **project** YouTube or Facebook Page for the explainer.  
- Do **not** upload the official preferential-voting explainer as a personal-channel main video with political intros/outros.  
- Do **not** put tracker videos in a playlist mixed with anti-party rants.

## Content pillars (project)

1. How the voting system works (enrol, compulsory vote, preferences) — always defer to VEC.  
2. How to check who is standing (district pages, statuses, sources).  
3. Occasional methodology / open-data notes.  
4. Key dates (cite VEC).

## Never post as the tracker

- How-to-vote preference orders or “vote for / against X”.  
- Forecasts or “who will win”.  
- Abuse of named candidates.  
- Content that would contradict `/about` independence.

## Video packaging

1. Full explainer → **project YouTube** (canonical).  
2. Short cuts → Facebook Reels (and Instagram if active).  
3. Every description / end card:  
   - `https://electiontracker.au/voting`  
   - Authorisation: *Authorised by Colin Dixon, 2 Fern Court, Mallacoota VIC 3892*  
   - “Not the VEC. Not advice for any party or candidate.”

## Wiring a new channel into the site

When a project URL is real:

1. Add it to `SOCIAL` in `site/src/lib/site.mjs` (and `SOCIAL_LABELS` if needed).  
2. Footer and JSON-LD `sameAs` pick it up via `socialLinks()`.  
3. Update the privacy page “Our social accounts” section.  
4. Optional: “Watch the explainer” CTA on `/voting`.

## Related

- [SCOPE.md](SCOPE.md) — no how-to-vote advice  
- [METHODOLOGY.md](METHODOLOGY.md) — neutrality  
- Site: `/voting`, `/about`, `/privacy`
