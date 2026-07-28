#!/usr/bin/env node
// Export public data as JSON and CSV.
//
// Output goes to site/public/data/<election>/ so the Astro build serves the
// exports directly at https://elections.oze.net.au/data/<election>/... — the
// machine-readable half of the project is published by the same deploy as the
// human-readable half, and can never drift out of sync with it.
//
// site/public/data/ is generated and gitignored. The YAML in data/ is the
// source of truth; these files are build artefacts. Astro's own output is
// site/dist/, so the two no longer collide.
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
  listElections,
  loadElection,
  coverageFor,
  summaryFor,
  COVERAGE_CAVEAT,
} from "./lib/data.mjs";

const OUT_ROOT = new URL("../site/public/data/", import.meta.url).pathname;

const csv = (rows, cols) =>
  [
    cols.join(","),
    ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? "").replaceAll('"', '""')}"`).join(",")),
  ].join("\n") + "\n";

rmSync(OUT_ROOT, { recursive: true, force: true });

const index = { generated: new Date().toISOString(), elections: [] };

for (const id of listElections()) {
  const data = loadElection(id);
  const out = join(OUT_ROOT, id);
  mkdirSync(out, { recursive: true });

  const write = (name, obj) => writeFileSync(join(out, name), JSON.stringify(obj, null, 2));

  // Strip the derived convenience fields back out of the published records so
  // the export mirrors the repository files rather than our internal shape.
  const candidates = data.candidates.map(({ file, latest_source, latest_date, verified, ...c }) => c);
  const districts = data.districts.map(({ candidates, retirements, ...d }) => d);
  const regions = data.regions.map(({ candidates, retirements, ...r }) => r);

  write("election.json", data.election);
  write("districts.json", districts);
  write("regions.json", regions);
  write("parties.json", data.parties);
  write("candidates.json", candidates);
  write("retirements.json", data.retirements);
  write("summary.json", { generated: new Date().toISOString(), ...summaryFor(data) });
  write("coverage.json", {
    generated: new Date().toISOString(),
    caveat: COVERAGE_CAVEAT,
    coverage: coverageFor(data),
  });

  writeFileSync(
    join(out, "districts.csv"),
    csv(districts, ["slug", "name", "chamber", "region", "incumbent", "incumbent_party"])
  );
  writeFileSync(
    join(out, "candidates.csv"),
    csv(
      data.candidates.map((c) => ({
        ...c,
        source_url: c.latest_source?.url,
        source_publisher: c.latest_source?.publisher,
        status_date: c.latest_date,
        verified: c.verified,
      })),
      ["name", "party", "contest", "chamber", "status", "status_date", "verified", "source_publisher", "source_url"]
    )
  );
  writeFileSync(
    join(out, "retirements.csv"),
    csv(
      data.retirements.map((r) => ({ ...r, source_url: r.source?.url })),
      ["name", "party", "role", "seat", "announced", "source_url"]
    )
  );

  const summary = summaryFor(data);
  index.elections.push({
    id,
    name: data.election.name,
    election_day: data.election.election_day,
    candidates: summary.candidates,
    files: [
      "election.json", "districts.json", "regions.json", "parties.json",
      "candidates.json", "retirements.json", "summary.json", "coverage.json",
      "districts.csv", "candidates.csv", "retirements.csv",
    ],
  });

  console.log(`${id}: exported ${summary.candidates} candidates -> site/public/data/${id}/`);
}

writeFileSync(join(OUT_ROOT, "index.json"), JSON.stringify(index, null, 2));
console.log(`wrote site/public/data/index.json (${index.elections.length} election(s))`);
