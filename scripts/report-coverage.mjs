#!/usr/bin/env node
// Print a coverage snapshot using the same loader as the site/exports (ADR-8).
// Report-only — does not write files or publish.
import {
  listElections,
  loadElection,
  coverageFor,
  summaryFor,
  COVERAGE_CAVEAT,
  LIVE_STATUSES,
} from "./lib/data.mjs";

const elections = listElections();
if (!elections.length) {
  console.error("No elections under data/");
  process.exit(1);
}

for (const id of elections) {
  const data = loadElection(id);
  const summary = summaryFor(data);
  const rows = coverageFor(data);

  console.log(`\n# ${id} — ${data.election?.name ?? id}`);
  console.log(
    `Districts: ${summary.districts}  |  candidacy files: ${summary.candidates}  |  live: ${summary.live_candidates}`
  );
  console.log(`Districts with ≥1 assembly candidacy: ${summary.districts_with_candidates}`);
  console.log(`Unique sources: ${summary.sources}  |  latest verified: ${summary.latest_verified ?? "—"}`);
  console.log(`Live statuses: ${LIVE_STATUSES.join(", ")}`);
  console.log("");
  console.log("Party assembly coverage (sourced live seats / total districts):");
  console.log(
    `${"Party".padEnd(28)} ${"Cov".padStart(6)} ${"%".padStart(4)}  ${"Held*".padStart(6)}  by status (ann/end/nom/…)`
  );

  for (const row of rows) {
    if (row.party === "independent" && row.assembly_seats_covered === 0) continue;
    const held = row.current?.total ?? 0;
    const st = row.by_status;
    const bits = [
      st.announced || 0,
      st.endorsed || 0,
      st.nominated || 0,
      st.withdrawn || 0,
      st.disendorsed || 0,
    ].join("/");
    console.log(
      `  ${row.name.padEnd(26)} ${String(row.assembly_seats_covered).padStart(3)}/${row.assembly_seats_total} ${String(row.pct).padStart(3)}%  ${String(held).padStart(6)}  ${bits}`
    );
  }

  console.log("\n  * Held = seats in current parliament (both houses), sort key only.");
  console.log(`\nCaveat: ${COVERAGE_CAVEAT}`);
}

console.log("");
