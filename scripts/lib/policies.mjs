// Policy matrix + issues ledger loader.
// Sibling to data.mjs: shared by export and Astro so pages and JSON never drift.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

/** Full party view — fixed order left to right. */
export const MATRIX_PARTIES = ["greens", "labor", "liberal", "nationals", "one-nation"];

/** Default combined view. Coalition is a virtual display column, not a registered party. */
export const COMBINED_MATRIX_PARTIES = ["greens", "labor", "coalition", "one-nation"];

export const MATRIX_PARTY_LABELS = {
  greens: "Greens",
  labor: "Labor",
  liberal: "Liberal",
  nationals: "Nationals",
  coalition: "Liberal–Nationals",
  "one-nation": "One Nation",
};

export const COALITION_SCOPES = ["coalition_shared", "mixed", "party_specific"];

export const COALITION_SCOPE_LABELS = {
  coalition_shared: "Shared Coalition policy",
  mixed: "Shared platform with party differences",
  party_specific: "Party-specific positions",
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

export const CLAIM_KIND_LABELS = {
  pledge: "Pledge",
  position: "Position",
  costed_measure: "Costed measure",
  opposition_to: "Opposition",
};

/** True when headline/statement marks a federal (national) party policy. */
export function isFederalPolicy(policy) {
  if (!policy) return false;
  const head = String(policy.headline ?? "");
  if (/federal/i.test(head)) return true;
  return (policy.claims ?? []).some((c) =>
    /\[Federal party policy\]/i.test(String(c.statement ?? ""))
  );
}

/** Strip leading federal tag from statement for display when a badge is shown. */
export function cleanClaimStatement(statement) {
  return String(statement ?? "")
    .replace(/^\[Federal party policy\]\s*/i, "")
    .replace(/^\[Federal government policy\]\s*/i, "")
    .replace(/^\[Federal government framing\]\s*/i, "")
    .replace(/^\[Federal Coalition policy\]\s*/i, "")
    .replace(/^\[Federal Coalition partner position\]\s*/i, "")
    .replace(/^\[Federal party framing[^\]]*\]\s*/i, "")
    .trim();
}

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

/**
 * Load display relationships between parties that contest an election in coalition.
 * This does not merge or replace the underlying party policy records.
 */
export function loadCoalitions(electionId = "vic2026") {
  const path = join(DATA_DIR, electionId, "coalitions.yaml");
  if (!existsSync(path)) return [];
  const doc = loadYaml(path);
  return (doc.coalitions ?? []).map((coalition) => ({
    ...coalition,
    issues: coalition.issues ?? [],
  }));
}

/** Map party|issue → policy record (or null). */
export function policyIndex(policies) {
  const map = new Map();
  for (const p of policies) map.set(`${p.party}|${p.issue}`, p);
  return map;
}

function partyDescriptors(slugs) {
  return slugs.map((slug) => ({
    slug,
    label: MATRIX_PARTY_LABELS[slug] ?? slug,
  }));
}

function buildRows(issues, partySlugs, byKey) {
  let filledCells = 0;
  let claimCount = 0;
  const rows = issues.map((issue) => {
    const cells = {};
    for (const party of partySlugs) {
      const policy = byKey.get(`${party}|${issue.slug}`) ?? null;
      if (policy) {
        filledCells++;
        claimCount += policy.claim_count;
      }
      cells[party] = policy;
    }
    return { issue, cells };
  });
  const totalCells = issues.length * partySlugs.length;
  return {
    rows,
    stats: {
      issues: issues.length,
      parties: partySlugs.length,
      total_cells: totalCells,
      filled_cells: filledCells,
      empty_cells: totalCells - filledCells,
      claims: claimCount,
    },
  };
}

function buildCoalitionCell(issue, coalition, byKey) {
  const relation = coalition.issues.find((item) => item.issue === issue.slug) ?? {
    issue: issue.slug,
    scope: "party_specific",
  };
  const memberPolicies = Object.fromEntries(
    coalition.parties.map((party) => [party, byKey.get(`${party}|${issue.slug}`) ?? null])
  );
  const representativeParty =
    relation.representative_party ?? coalition.parties.find((party) => memberPolicies[party]) ?? null;

  return {
    type: "coalition",
    coalition_id: coalition.id,
    label: coalition.label,
    short_label: coalition.short_label ?? coalition.label,
    parties: coalition.parties,
    scope: relation.scope,
    scope_label: COALITION_SCOPE_LABELS[relation.scope] ?? relation.scope,
    shared_policy_id: relation.shared_policy_id ?? null,
    note: relation.note ?? null,
    representative_party: representativeParty,
    policy: representativeParty ? memberPolicies[representativeParty] : null,
    member_policies: memberPolicies,
    has_policy: Object.values(memberPolicies).some(Boolean),
  };
}

function buildCombinedRows(issues, coalition, byKey) {
  let filledCells = 0;
  const rows = issues.map((issue) => {
    const coalitionCell = buildCoalitionCell(issue, coalition, byKey);
    const cells = {
      greens: byKey.get(`greens|${issue.slug}`) ?? null,
      labor: byKey.get(`labor|${issue.slug}`) ?? null,
      coalition: coalitionCell,
      "one-nation": byKey.get(`one-nation|${issue.slug}`) ?? null,
    };
    for (const party of COMBINED_MATRIX_PARTIES) {
      const cell = cells[party];
      if (party === "coalition" ? cell?.has_policy : Boolean(cell)) filledCells++;
    }
    return { issue, cells };
  });
  const totalCells = issues.length * COMBINED_MATRIX_PARTIES.length;
  return {
    rows,
    stats: {
      issues: issues.length,
      parties: COMBINED_MATRIX_PARTIES.length,
      total_cells: totalCells,
      filled_cells: filledCells,
      empty_cells: totalCells - filledCells,
    },
  };
}

/**
 * Build both matrix views for the UI and exports.
 * Separate view preserves every registered party record. Combined view replaces
 * Liberal and Nationals display columns with a virtual Coalition column only.
 */
export function matrixFor(electionId = "vic2026") {
  const issues = loadIssues(electionId);
  const policies = loadPolicies(electionId);
  const coalitions = loadCoalitions(electionId);
  const byKey = policyIndex(policies);

  const separate = buildRows(issues, MATRIX_PARTIES, byKey);
  separate.stats.policy_records = policies.length;

  const defaultCoalition =
    coalitions.find((coalition) => coalition.default_combined) ?? coalitions[0] ?? null;

  let combined = null;
  if (defaultCoalition) {
    const built = buildCombinedRows(issues, defaultCoalition, byKey);
    combined = {
      coalition: defaultCoalition,
      parties: partyDescriptors(COMBINED_MATRIX_PARTIES),
      rows: built.rows,
      stats: {
        ...built.stats,
        claims: separate.stats.claims,
        policy_records: policies.length,
      },
    };
  }

  return {
    parties: partyDescriptors(MATRIX_PARTIES),
    issues,
    rows: separate.rows,
    stats: separate.stats,
    coalitions,
    combined,
    default_view: combined ? "combined" : "separate",
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
