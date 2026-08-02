// Policy matrix + issues ledger loader.
// Sibling to data.mjs: shared by export and Astro so pages and JSON never drift.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

/** v1 matrix columns — fixed order left to right. */
export const MATRIX_PARTIES = ["greens", "labor", "liberal", "nationals", "one-nation"];

export const MATRIX_PARTY_LABELS = {
  greens: "Greens",
  labor: "Labor",
  liberal: "Liberal",
  nationals: "Nationals",
  "one-nation": "One Nation",
};

export const JURISDICTIONS = [
  "state_primary",
  "shared_fed_state",
  "federal_primary",
  "local_primary",
  "shared_state_local",
];

export const JURISDICTION_LABELS = {
  state_primary: "State Primary",
  shared_fed_state: "Shared Fed/State",
  federal_primary: "Federal Primary",
  local_primary: "Local",
  shared_state_local: "Shared State/Local",
};

export const CLAIM_KINDS = ["pledge", "position", "costed_measure", "opposition_to"];

export const POLICY_CAVEAT =
  "Policy cells show only positions with an individually sourced public record " +
  "(manifesto, press release, Hansard, or Parliamentary Budget Office costing). " +
  "An empty cell means no sourced position is in the ledger yet — not that a " +
  "party has no view, and not an editorial judgement of importance.";

function findDataDir() {
  const starts = [];
  try {
    starts.push(dirname(fileURLToPath(import.meta.url)));
  } catch {
    /* bundled */
  }
  starts.push(process.cwd());

  for (const start of starts) {
    let dir = resolve(start);
    for (let i = 0; i < 8; i++) {
      const candidate = join(dir, "data");
      if (existsSync(join(candidate, "vic2026", "election.yaml"))) return candidate;
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  throw new Error("could not locate the repository data/ directory");
}

const DATA_DIR = findDataDir();

const loadYaml = (path) => parse(readFileSync(path, "utf8"));

/** Load issue taxonomy for an election. Empty array if file missing. */
export function loadIssues(electionId = "vic2026") {
  const path = join(DATA_DIR, electionId, "issues.yaml");
  if (!existsSync(path)) return [];
  const doc = loadYaml(path);
  return (doc.issues ?? []).map((issue) => ({
    ...issue,
    jurisdiction_label: JURISDICTION_LABELS[issue.jurisdiction] ?? issue.jurisdiction,
  }));
}

/** Load all policy position files for an election. */
export function loadPolicies(electionId = "vic2026") {
  const dir = join(DATA_DIR, electionId, "policies");
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];

  return readdirSync(dir)
    .filter((f) => !f.startsWith("_") && !f.startsWith(".") && f.endsWith(".yaml"))
    .sort()
    .map((f) => {
      const doc = loadYaml(join(dir, f));
      const p = doc.policy;
      if (!p) return null;
      return {
        ...p,
        file: f,
        claim_count: Array.isArray(p.claims) ? p.claims.length : 0,
      };
    })
    .filter(Boolean);
}

/** Map party|issue → policy record (or null). */
export function policyIndex(policies) {
  const map = new Map();
  for (const p of policies) {
    map.set(`${p.party}|${p.issue}`, p);
  }
  return map;
}

/**
 * Build matrix rows for the UI and exports.
 * Always includes every issue × every MATRIX_PARTIES column.
 */
export function matrixFor(electionId = "vic2026") {
  const issues = loadIssues(electionId);
  const policies = loadPolicies(electionId);
  const byKey = policyIndex(policies);

  let filledCells = 0;
  let claimCount = 0;

  const rows = issues.map((issue) => {
    const cells = {};
    for (const party of MATRIX_PARTIES) {
      const policy = byKey.get(`${party}|${issue.slug}`) ?? null;
      if (policy) {
        filledCells++;
        claimCount += policy.claim_count;
      }
      cells[party] = policy;
    }
    return { issue, cells };
  });

  const totalCells = issues.length * MATRIX_PARTIES.length;

  return {
    parties: MATRIX_PARTIES.map((slug) => ({
      slug,
      label: MATRIX_PARTY_LABELS[slug] ?? slug,
    })),
    issues,
    rows,
    stats: {
      issues: issues.length,
      parties: MATRIX_PARTIES.length,
      total_cells: totalCells,
      filled_cells: filledCells,
      empty_cells: totalCells - filledCells,
      claims: claimCount,
      policy_records: policies.length,
    },
    caveat: POLICY_CAVEAT,
  };
}

/** Flatten claims for CSV export. */
export function flattenPolicyClaims(policies, issues = []) {
  const issueName = new Map(issues.map((i) => [i.slug, i.name]));
  const rows = [];
  for (const p of policies) {
    for (const c of p.claims ?? []) {
      rows.push({
        party: p.party,
        issue: p.issue,
        issue_name: issueName.get(p.issue) ?? "",
        claim_id: c.id,
        kind: c.kind,
        statement: c.statement,
        headline: p.headline ?? "",
        taxpayer_label: c.fiscal?.taxpayer_label ?? "",
        amount_aud: c.fiscal?.amount_aud ?? "",
        amount_display: c.fiscal?.amount_display ?? "",
        timeframe: c.fiscal?.timeframe ?? "",
        financing: c.fiscal?.financing ?? "",
        pbo_status: c.fiscal?.pbo_status ?? "",
        source_url: c.source?.url ?? "",
        source_publisher: c.source?.publisher ?? "",
        source_title: c.source?.title ?? "",
        source_published: c.source?.published ?? "",
        source_accessed: c.source?.accessed ?? "",
      });
    }
  }
  return rows;
}
