#!/usr/bin/env node
// Export public data to dist/<election>/ as JSON and CSV.
// Also emits coverage.json: per-party count of assembly seats with a live candidacy.
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const DIST_DIR = new URL("../dist/", import.meta.url).pathname;
const LIVE = new Set(["announced", "endorsed", "nominated", "elected"]);

const csv = (rows, cols) =>
  [cols.join(","), ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? "").replaceAll('"', '""')}"`).join(","))].join("\n") + "\n";

for (const election of readdirSync(DATA_DIR)) {
  const dir = join(DATA_DIR, election);
  if (!statSync(dir).isDirectory()) continue;
  const out = join(DIST_DIR, election);
  mkdirSync(out, { recursive: true });

  const load = (name) => parse(readFileSync(join(dir, name), "utf8"));
  const districts = load("districts.yaml").districts;
  const regions = load("regions.yaml").regions;
  const parties = load("parties.yaml").parties;
  const meta = load("election.yaml").election;

  const candidates = readdirSync(join(dir, "candidates"))
    .filter((f) => !f.startsWith("_") && f.endsWith(".yaml"))
    .map((f) => parse(readFileSync(join(dir, "candidates", f), "utf8")).candidate);

  writeFileSync(join(out, "election.json"), JSON.stringify(meta, null, 2));
  writeFileSync(join(out, "districts.json"), JSON.stringify(districts, null, 2));
  writeFileSync(join(out, "regions.json"), JSON.stringify(regions, null, 2));
  writeFileSync(join(out, "parties.json"), JSON.stringify(parties, null, 2));
  writeFileSync(join(out, "candidates.json"), JSON.stringify(candidates, null, 2));

  writeFileSync(join(out, "districts.csv"), csv(districts, ["slug", "name", "chamber", "region", "incumbent", "incumbent_party"]));
  writeFileSync(join(out, "candidates.csv"), csv(
    candidates.map((c) => ({ ...c, first_source: c.history[0]?.source?.url, first_date: c.history[0]?.date })),
    ["name", "party", "contest", "chamber", "status", "first_date", "first_source"]
  ));

  // Party coverage: assembly seats with a live (not withdrawn/disendorsed/defeated) candidacy.
  const coverage = parties.map((p) => {
    const seats = new Set(
      candidates.filter((c) => c.party === p.slug && c.chamber === "assembly" && LIVE.has(c.status)).map((c) => c.contest)
    );
    return { party: p.slug, short_name: p.short_name, family: p.family, assembly_seats_covered: seats.size, assembly_seats_total: districts.length };
  });
  writeFileSync(join(out, "coverage.json"), JSON.stringify({ generated: new Date().toISOString(), coverage }, null, 2));

  console.log(`${election}: exported ${candidates.length} candidates to dist/${election}/`);
}
