# Public navigation tree

> **Updated** 2026-09-02 · hub [../README.md](../README.md)

Human sitemap for [electiontracker.au](https://electiontracker.au). Canonical
URL rules stay in [routes.md](routes.md). This file records **what exists** and
**what the chrome shows**.

The header is election-scoped. Victoria, Federal, Elections and What’s new are
always in the top bar. A second row of section links appears only inside that
election. Extra policy doors, atlases and open seats stay on hub pages.

## Header

Always:

```text
[Australian Election Tracker]     →  /
Victoria                          →  /elections/vic/2026
Federal                           →  /elections/federal/49
Elections                         →  /elections
What's new                        →  /latest
More
  Methodology                     →  /methodology
  Open data                       →  data for the current election (Vic default)
  About                           →  /about
  Survey                          →  survey.oze.net.au
```

Victoria 2026 section bar (`/elections/vic/2026…`):

```text
Seats      →  /elections/vic/2026/assembly
Council    →  /elections/vic/2026/council
Polls      →  /elections/vic/2026/polls
Policies   →  /elections/vic/2026/parties/matrix
Voting     →  /elections/vic/2026/voting
```

Federal section bar (`/elections/federal/49…`):

```text
House      →  /elections/federal/49/representatives
Senate     →  /elections/federal/49/senate
Polls      →  /elections/federal/49/polls
Policies   →  /elections/federal/49/parties/matrix
```

NSW 2027 section bar (`/elections/nsw/2027…`):

```text
Assembly   →  /elections/nsw/2027/assembly
Council    →  /elections/nsw/2027/council
```

## Footer

Trackers (Victoria, Federal, NSW, calendar, What’s new), **This election**
(same links as the section bar, when inside one), Evidence, About, Legal.
Footer never uses Vic short paths (`/polls`, `/data`) as if they were national.

## Full route tree

### National

```text
/                         national home
/latest                   What's new
/elections                calendar
/methodology
/about
/disclaimer  /privacy  /terms
```

### Victoria 2026 — `/elections/vic/2026`

```text
.                         hub
assembly                  88-seat candidate index          section
council                   8-region candidate index         section
districts                 map atlas                        hub / Assembly
districts/:slug           one seat (88)
regions                   map atlas                        hub / Council
regions/:slug             one region (8)
parties                   party list                       hub
parties/:slug             one party
parties/:slug/policies    that party’s policy profile
parties/issues            state vs federal vs local
parties/matrix            comparison matrix                section (Policies)
parties/policies          all policy profiles
policies                  issue index
policies/:slug            one issue comparison
policies/key-differences  key differences
polls                     Vic average                      section
voting                    civic guide                      section
data                      Vic JSON/CSV                     More
open-seats                retirements                      Assembly / footer
```

### Federal 49 — `/elections/federal/49`

```text
.                         hub
representatives           House sitting members            section
representatives/:slug     one division (150)
senate                    Senate sitting members           section
parties                   party list
parties/:slug             one party
parties/matrix            policy matrix                    section (Policies)
policies                  issue index
policies/:slug            one issue
polls                     federal average                  section
data                      federal JSON/CSV                 More
```

### NSW 2027 — `/elections/nsw/2027`

```text
.                         hub (sitting members)
assembly                  93 districts                     section
council                   MLCs                             section
districts                 district index
districts/:slug           one district (93)
parties  /  parties/:slug
data
```

### Outline only (calendar, not in the menu)

```text
/elections/tas/2027/legislative-council
/elections/tas/next
/elections/nt/2028
/elections/act/2028
/elections/qld/2028
/elections/wa/2029
/elections/sa/2030
```

### Machine-readable (not HTML chrome)

```text
/data/vic2026/   /data/federal-49/   /data/nsw2027/
```

Former short Victorian paths (`/assembly`, `/polls`, `/data`, …) still redirect
to `/elections/vic/2026/…`. Do not add them back to the header or footer.
