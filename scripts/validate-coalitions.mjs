#!/usr/bin/env node
// Validate optional coalition display relationships used by the policy matrix.
// Underlying party policy files remain the source of truth; this ledger only
// controls when their columns may be consolidated for presentation.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SCOPES = new Set(["coalition_shared", "mixed", "party_specific"]);

let errors = 0;
const fail = (file, message) => {
  errors++;
  console.error(`FAIL ${file}: ${message}`);
};

for (const election of readdirSync(DATA_DIR)) {
  const dir = join(DATA_DIR, election);
  if (!statSync(dir).isDirectory()) continue;

  const coalitionPath = join(dir, "coalitions.yaml");
  if (!existsSync(coalitionPath)) continue;

  const file = `${election}/coalitions.yaml`;
  const load = (name) => parse(readFileSync(join(dir, name), "utf8"));
  const parties = new Set((load("parties.yaml").parties ?? []).map((party) => party.slug));
  const issues = new Set((load("issues.yaml").issues ?? []).map((issue) => issue.slug));
  const policyDir = join(dir, "policies");
  const policies = new Set();

  if (existsSync(policyDir)) {
    for (const name of readdirSync(policyDir)) {
      if (name.startsWith("_") || name.startsWith(".") || !name.endsWith(".yaml")) continue;
      const policy = parse(readFileSync(join(policyDir, name), "utf8"))?.policy;
      if (policy?.party && policy?.issue) policies.add(`${policy.party}|${policy.issue}`);
    }
  }

  const coalitions = parse(readFileSync(coalitionPath, "utf8"))?.coalitions ?? [];
  const coalitionIds = new Set();
  let defaults = 0;

  for (const coalition of coalitions) {
    const context = coalition.id ?? "unnamed coalition";
    if (!coalition.id || !ID_RE.test(coalition.id)) fail(file, `${context}: invalid id`);
    if (coalitionIds.has(coalition.id)) fail(file, `${context}: duplicate id`);
    coalitionIds.add(coalition.id);
    if (!coalition.label) fail(file, `${context}: label required`);
    if (!coalition.short_label) fail(file, `${context}: short_label required`);
    if (coalition.default_combined) defaults++;

    if (!Array.isArray(coalition.parties) || coalition.parties.length < 2) {
      fail(file, `${context}: parties must contain at least two party slugs`);
      continue;
    }

    const members = new Set();
    for (const party of coalition.parties) {
      if (!parties.has(party)) fail(file, `${context}: unknown party '${party}'`);
      if (members.has(party)) fail(file, `${context}: duplicate member '${party}'`);
      members.add(party);
    }

    const seenIssues = new Set();
    for (const relation of coalition.issues ?? []) {
      const relationContext = `${context}/${relation.issue ?? "unknown issue"}`;
      if (!issues.has(relation.issue)) fail(file, `${relationContext}: unknown issue`);
      if (seenIssues.has(relation.issue)) fail(file, `${relationContext}: duplicate issue relationship`);
      seenIssues.add(relation.issue);

      if (!SCOPES.has(relation.scope)) {
        fail(file, `${relationContext}: invalid scope '${relation.scope}'`);
      }

      if (["coalition_shared", "mixed"].includes(relation.scope)) {
        if (!relation.shared_policy_id || !ID_RE.test(relation.shared_policy_id)) {
          fail(file, `${relationContext}: valid shared_policy_id required for ${relation.scope}`);
        }
        if (!relation.representative_party || !members.has(relation.representative_party)) {
          fail(file, `${relationContext}: representative_party must be a coalition member`);
        }
      }

      const presentMembers = coalition.parties.filter((party) => policies.has(`${party}|${relation.issue}`));
      if (relation.scope === "coalition_shared" && presentMembers.length !== coalition.parties.length) {
        fail(file, `${relationContext}: shared policy requires a policy record for every member`);
      }
      if (relation.scope === "mixed" && presentMembers.length < 2) {
        fail(file, `${relationContext}: mixed policy requires records for at least two members`);
      }
      if (relation.scope === "party_specific" && presentMembers.length === 0) {
        fail(file, `${relationContext}: party-specific relationship has no member policy record`);
      }
    }

    if (coalition.default_combined) {
      for (const issue of issues) {
        if (!seenIssues.has(issue)) fail(file, `${context}: default combined coalition missing issue '${issue}'`);
      }
    }
  }

  if (defaults > 1) fail(file, "only one coalition may set default_combined: true");
  console.log(`${election}: validated ${coalitions.length} coalition relationship ledger(s)`);
}

if (errors) {
  console.error(`\n${errors} coalition validation error(s)`);
  process.exit(1);
}
console.log("OK: coalition display relationships valid");
