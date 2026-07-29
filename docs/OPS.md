# Operations — monitor data, update the site

How this project stays current without turning editorial judgment into a bot.

The **site does not need its own update schedule.** Pushing valid data to
`main` rebuilds and deploys (~1 min). What needs a rhythm is **watching for
real-world changes** and **encoding them as sourced YAML**.

Related: [METHODOLOGY.md](METHODOLOGY.md), [POLL-METHODOLOGY.md](POLL-METHODOLOGY.md),
[DISCOVERY.md](DISCOVERY.md), [CHANGELOG.md](CHANGELOG.md), [DECISIONS.md](DECISIONS.md).

## Who does what

```text
Monitor (semi-auto OK) → Verify (human) → Encode YAML (agent may draft)
      → validate/export (CI) → merge (human) → deploy (auto)
```

| Step | Owner | Notes |
|---|---|---|
| Notice a possible change | You, calendar, later: digests | Low risk if wrong |
| Decide status is real | **Human** | Per [METHODOLOGY.md](METHODOLOGY.md); rumour is not a status |
| Draft YAML + sources | Human or agent | Agent drafts from a **known URL**; you accept |
| `npm run check` / CI | Automated | Schema, sources present, referential integrity |
| Merge to `main` | **Human** | Never auto-merge candidacy/status PRs |
| Cloudflare deploy + IndexNow | Automated | After merge |

**Hard rule:** agents and scripts must not publish claims about named people
without a human merge. Wrong `disendorsed` / `withdrawn` / false endorsement is
the project’s largest legal risk (see HANDOVER).

Polls are slightly safer to semi-automate later (public numbers), but still need
a human check for `eligible_for_average` and transcription accuracy.

---

## Cadence

| Period | Rhythm | Focus |
|---|---|---|
| Quiet (now → ~early campaign) | **2–3× per week** | Party pages, major news, new statewide polls |
| Busy (campaign → nominations close **13 Nov 2026**) | **Daily** | Same, denser; value window peaks here |
| After formal nominations | Maintenance | Align to VEC lists; less “scoop” value |
| After every merge to `main` | None extra | Deploy and IndexNow already run |

Use a personal calendar reminder (“Election tracker scan”) rather than a
production monitoring product until volume forces it.

---

## Watch list (signals only)

Primary (prefer as sources when verifying):

1. Registered-party candidate / media pages (major parties first, then others)
2. VEC key dates and later nomination publications
3. Major outlets (ABC, Age, Guardian, local papers with party announcements)

Secondary (leads only — **never** sole source):

4. Tally Room, Wikipedia, social re-posts  
5. Tips via email / GitHub Issues (verify before anything is written to `data/`)

Polls: [polls-inventory.md](polls-inventory.md) + new statewide primary-vote
releases.

Do **not** commit private tipster identities or unverified notes into the public
repo (ADR-4).

---

## Procedure — one candidacy or status change

1. **Source** — durable public URL; prefer party/candidate/commission over
   “reports say”.
2. **Classify** — exactly one current status from the methodology table;
   keep prior statuses in `history` with dates and sources.
3. **Encode** — edit or add `data/<election>/candidates/<seat>--<slug>.yaml`
   (or retirements / polls as appropriate). Full `source` block: `url`,
   `publisher`, `title`, `published` (if known), `accessed`.
4. **Check** — `npm run check` (or `npm run build` before a big ship).
5. **Publish** — PR preferred for non-trivial batches; merge to `main` deploys.
6. **Optional** — short neutral note on the project Facebook Page if the change
   is shareable; never forecasts or how-to-vote.

Issue form: use the **New candidacy / status change** template when filing work
for later.

### One new poll

1. Add YAML under `data/<election>/polls/` matching existing files and
   [POLL-METHODOLOGY.md](POLL-METHODOLOGY.md).
2. Set `eligible_for_average` honestly (party/union/advocacy → usually `false`).
3. `npm run check` → merge.
4. Update inventory notes if useful.

---

## Agents — allowed vs forbidden

**Allowed**

- Draft a candidate/poll file from a URL you provide
- Run validate/export, fix schema errors, summarise coverage gaps
- Open a **draft PR** for human review
- Later (Phase 2): produce a private digest of “possible updates” with links

**Forbidden without a new decision**

- Cron that merges to `main` or writes people data unattended
- Scrapers that invent candidacies from headlines alone
- Treating secondary blogs as primary sources
- Putting personal political channels into site `SOCIAL` / JSON-LD `sameAs`

---

## Automation in this repo (Phase 1)

| Tool | Command / trigger | Publishes data? |
|---|---|---|
| Validate + export + site build | `npm run build`; CI on every PR/`main` | No — only gates ship |
| Source link health | `npm run check:sources`; weekly GitHub Action | **No** — report only |
| Coverage snapshot | `npm run report:coverage` | **No** — stdout summary |
| IndexNow | after deploy | Notifies search engines of URLs |

### Source health

```bash
npm run check:sources
```

Walks `data/**/*.yaml`, collects unique `source.url` / `url` values, and
checks HTTP reachability.

- **FAIL** (exit 1): clear dead links (404, 410, DNS failure).
- **WARN** (exit 0): 401/403/429/timeouts — often bot-blocking, not proof the
  source is gone. Re-check in a browser; prefer archive URLs when paywalled.

Weekly Action: `.github/workflows/source-health.yml` (Mondays UTC + manual
`workflow_dispatch`). Red check = fix or archive the source; do not ignore
true 404s on living candidacy claims.

### Coverage report

```bash
npm run report:coverage
```

Prints live candidacy counts per party (same rules as the site/export). Use
during a scan to see where verification is thin.

---

## Phase 2 (only when manual scan hurts)

1. Scheduled **digest** of candidate-related headlines / party page changes  
2. Agent or script opens **draft PRs** only  
3. You still merge after methodology check  

Do not build a “live feed” product; this remains a **ledger**, not a wire
service (ADR-2).

---

## Site and discovery after data changes

| Action | Automatic? |
|---|---|
| Cloudflare deploy from `main` | Yes |
| IndexNow hub ping | Yes (CI after deploy) |
| GSC “Request indexing” for every district | **No** — hubs only, sparingly ([DISCOVERY.md](DISCOVERY.md)) |
| Facebook scrape of every URL | **No** — homepage once; `/voting` when video lands |

---

## Quick checklist (copy for a scan session)

- [ ] Major party candidate pages scanned  
- [ ] News alerts / tips triaged  
- [ ] New or changed candidacies encoded with sources  
- [ ] New polls encoded (if any)  
- [ ] `npm run check` clean  
- [ ] Merged / deployed  
- [ ] (Weekly) skim source-health Action or run `npm run check:sources`  

---

## Related

- [SCOPE.md](SCOPE.md) — what is in / out of product  
- [SOCIAL.md](SOCIAL.md) — what to post as the tracker  
- [DEPLOYMENT.md](DEPLOYMENT.md) — Cloudflare / domains  
