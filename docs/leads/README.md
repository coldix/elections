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
