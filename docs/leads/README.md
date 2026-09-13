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
| Catherine D'Arcy — Greens, Dandenong | 2026-08-23 (superseded 2026-09-14) | Held Aug 2026: Wikipedia cited a Star Journal rally piece that did not name her, and the Greens list had no Dandenong candidate. **Encoded 2026-09-14** after Victorian Greens published a person page (`greens.org.au/vic/person/catherine-darcy`) and listed her on the candidates index. |

A rejected lead is not a statement that the claim is false — only that nothing
found so far supports it. Encode it the moment a real source appears.
