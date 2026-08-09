# Social media — brand split and channel policy

> **Version** `20260803.1631-aest+91ecdbf` · **Updated** 2026-08-03 16:31 AEST  
> git `main` @ [`91ecdbf`](https://github.com/coldix/elections/commit/91ecdbf) · hub [../README.md](../README.md)

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
| Instagram / X / TikTok / Bluesky (project handles) | Optional later | Only if posting regularly as the product |

### Maintainer contacts (not product brand)

Listed on **`/about` only** via `MAINTAINER` in `site.mjs` — not footer project icons,
not Organization `sameAs`, not privacy “we run these accounts as the tracker.”

| Channel | URL | Role |
|---|---|---|
| X | [x.com/colindixon](https://x.com/colindixon) | Maintainer tips + sparse ship notes (public sources still required) |
| LinkedIn | [linkedin.com/in/colindixon](https://www.linkedin.com/in/colindixon/) | Professional / publisher contact |

**Never** put a personal political/lifestyle channel (e.g. `@mallacoota2020`) in:

- site footer social links  
- JSON-LD `sameAs`  
- privacy “we run” list as a tracker property  

That wires personal politics into the product for search and AI citation.
`@colindixon` and LinkedIn are maintainer identity, deliberately kept off product
`sameAs` for the same reason.

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

## On-site video embeds (2026-07)

Explainers live on the project YouTube channel. A curated set is embedded with
**click-to-load** (`YouTubeLite.astro` + `lib/videos.mjs`) so YouTube only loads
after the visitor presses play:

| Video key | Page |
|---|---|
| `tracker` | `/` (homepage) |
| `ballot` | `/voting` |
| `localSeat` | `/assembly` |
| `regions` | `/regions` (linked from `/council`) |

Other channel videos stay as outbound links only. Privacy page discloses the
click-to-load behaviour.

## Wiring a new channel into the site

When a project URL is real:

1. Add it to `SOCIAL` in `site/src/lib/site.mjs` (and `SOCIAL_LABELS` if needed).  
2. Footer and JSON-LD `sameAs` pick it up via `socialLinks()`.  
3. Update the privacy page “Our social accounts” section.  
4. Add an entry to `site/src/lib/videos.mjs` and a `YouTubeLite` on the matching page.

## Suggested X bio (@colindixon)

Paste into the X profile (160-character class; adjust if X’s limit moves):

```text
Independent election data at electiontracker.au · tips with sources welcome · East Gippsland tech & media · @OzeAuMusic · Mallacoota VIC
```

Shorter alternative:

```text
Maintainer of electiontracker.au (sourced candidate ledger). Tips + public URLs welcome. East Gippsland · Mallacoota VIC
```

Keep `@mallacoota2020` out of the tracker site chrome; soft-link personal work
elsewhere if needed.

## Related

- [ops.md](ops.md) — tips still need human verification before merge  
- [scope.md](scope.md) — no how-to-vote advice  
- [methodology.md](methodology.md) — neutrality  
- Site: `/voting`, `/about`, `/privacy`
