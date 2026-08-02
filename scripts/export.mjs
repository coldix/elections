#!/usr/bin/env node
// Export public data as JSON and CSV.
//
// Output goes to site/public/data/<election>/ so the Astro build serves the
// exports directly at https://electiontracker.au/data/<election>/... — the
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
  representationFor,
  COVERAGE_CAVEAT,
} from "./lib/data.mjs";
import { loadPolls, computePollAverage, POLL_CAVEAT } from "./lib/polls.mjs";
import {
  loadIssues,
  loadPolicies,
  flattenPolicyClaims,
  matrixFor,
  POLICY_CAVEAT,
} from "./lib/policies.mjs";

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
  write("council-members.json", data.councilMembers);
  write("representation.json", {
    generated: new Date().toISOString(),
    note:
      "Seats held in the current Parliament of Victoria (2022-2026), including " +
      "mid-term replacements and party changes. Not a 2022 election result and " +
      "not a 2026 candidate count.",
    representation: representationFor(data),
  });
  write("summary.json", { generated: new Date().toISOString(), ...summaryFor(data) });
  write("coverage.json", {
    generated: new Date().toISOString(),
    caveat: COVERAGE_CAVEAT,
    coverage: coverageFor(data),
  });

  const polls = loadPolls(id);
  const pollAverage = computePollAverage(polls);
  write("polls.json", {
    generated: new Date().toISOString(),
    caveat: POLL_CAVEAT,
    methodology: "docs/POLL-METHODOLOGY.md",
    polls: polls.map(({ file, ...p }) => p),
  });
  write("poll-average.json", pollAverage);
  writeFileSync(
    join(out, "polls.csv"),
    csv(
      polls.map((p) => ({
        id: p.id,
        pollster: p.pollster,
        commissioner: p.commissioner,
        commissioner_type: p.commissioner_type,
        fieldwork_start: p.fieldwork_start,
        fieldwork_end: p.fieldwork_end,
        sample_size: p.sample_size,
        alp: p.primaries?.alp,
        lnp: p.primaries?.lnp,
        onp: p.primaries?.onp,
        grn: p.primaries?.grn,
        others: p.primaries?.others,
        eligible_for_average: p.eligible_for_average,
        eligibility_exception: p.eligibility_exception ?? "",
        source_url: p.sources?.[0]?.url,
      })),
      [
        "id", "pollster", "commissioner", "commissioner_type",
        "fieldwork_start", "fieldwork_end", "sample_size",
        "alp", "lnp", "onp", "grn", "others",
        "eligible_for_average", "eligibility_exception", "source_url",
      ]
    )
  );

  // Policy matrix + issues ledger (secondary product; may be sparse)
  const issues = loadIssues(id);
  const policies = loadPolicies(id);
  const matrix = matrixFor(id);
  write("issues.json", {
    generated: new Date().toISOString(),
    methodology: "docs/POLICY-METHODOLOGY.md",
    issues: issues.map(({ jurisdiction_label, ...rest }) => rest),
  });
  write("policies.json", {
    generated: new Date().toISOString(),
    caveat: POLICY_CAVEAT,
    methodology: "docs/POLICY-METHODOLOGY.md",
    matrix_parties: matrix.parties,
    stats: matrix.stats,
    policies: policies.map(({ file, claim_count, ...p }) => p),
  });
  writeFileSync(
    join(out, "policies.csv"),
    csv(
      flattenPolicyClaims(policies, issues),
      [
        "party", "issue", "issue_name", "claim_id", "kind", "statement", "headline",
        "taxpayer_label", "amount_aud", "amount_display", "timeframe", "financing",
        "pbo_status", "source_url", "source_publisher", "source_title",
        "source_published", "source_accessed",
      ]
    )
  );

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
    join(out, "council-members.csv"),
    csv(
      data.councilMembers.map((m) => ({ ...m, source_url: m.source?.url })),
      ["name", "party", "region", "source_url"]
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
      "candidates.json", "retirements.json", "council-members.json",
      "representation.json", "summary.json", "coverage.json",
      "polls.json", "poll-average.json",
      "issues.json", "policies.json",
      "districts.csv", "candidates.csv", "retirements.csv", "council-members.csv",
      "polls.csv", "policies.csv",
    ],
    polls: polls.length,
    poll_average_status: pollAverage.status,
    issues: issues.length,
    policies: policies.length,
  });

  console.log(
    `${id}: exported ${summary.candidates} candidates, ${polls.length} polls, ${issues.length} issues, ${policies.length} policies -> site/public/data/${id}/`
  );
}

writeFileSync(join(OUT_ROOT, "index.json"), JSON.stringify(index, null, 2));
console.log(`wrote site/public/data/index.json (${index.elections.length} election(s))`);
