# Lead digests (discovery only)

Use the scanner instead of re-scraping the web in chat every session.

```bash
npm run scan:leads          # fetch + diff (incremental)
npm run scan:leads:report   # re-print last digest, no network
npm run scan:leads:full     # force re-parse all sources
```

Output (gitignored):

- `.cache/scan/leads-latest.md`
- `.cache/scan/leads-latest.json`
- `.cache/scan/state.json` — content hashes + seen lead fingerprints

Sources: `data/vic2026/watch-sources.yaml`.

**Never** treat the digest as authority. Encode YAML only after opening a primary source and applying [methodology.md](../methodology.md). See [ops.md](../ops.md#lead-scan-efficient-discovery).

## Rejected leads

Leads investigated and deliberately **not** encoded. Recorded so the same lead
is not re-triaged from scratch every scan. The scanner has no memory of a
human decision — its `state.json` only suppresses a fingerprint it has already
printed, and that cache is gitignored.

| Lead | Checked | Why not encoded |
|---|---|---|
| Catherine D'Arcy — Greens, Dandenong | 2026-08-23 | Wikipedia's candidates table lists her, citing a [Star Journal report on a Dandenong anti-racism rally](https://endeavourhillshallamdoveton.starcommunity.com.au/news/2026-08-19/dandenong-rally-calls-for-solidarity-against-rising-racism/). The full article does not mention her at all. The Victorian Greens' own candidate list (80 candidates) has no D'Arcy and no Dandenong candidate. No evidence supports the claim. Re-check if the Greens publish a Dandenong candidate. |

A rejected lead is not a statement that the claim is false — only that nothing
found so far supports it. Encode it the moment a real source appears.
