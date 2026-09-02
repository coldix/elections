// 2022 Victorian Assembly results. Historical only — not a 2026 forecast.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

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

export const RESULT_PARTY_LABELS = {
  labor: "Labor",
  liberal: "Liberal",
  nationals: "Nationals",
  greens: "Greens",
  "one-nation": "One Nation",
  independent: "Independent",
  others: "Others",
};

export function partyResultLabel(slug) {
  return RESULT_PARTY_LABELS[slug] ?? slug;
}

export const RESULT_CAVEAT =
  "Historical 2022 Victorian Assembly first-preference and two-candidate / two-party preferred figures. Not a 2026 forecast, swing, or likely winner.";

export function loadDistrictResults2022(electionId = "vic2026", dataDir = findDataDir()) {
  const path = join(dataDir, electionId, "district-results-2022.yaml");
  if (!existsSync(path)) return null;
  return parse(readFileSync(path, "utf8"));
}

export function resultForDistrict(slug, data = loadDistrictResults2022()) {
  if (!data?.districts) return null;
  return data.districts.find((d) => d.slug === slug) ?? null;
}

/** Coalition 2022 primary = Liberal + Nationals, matching the poll ledger L-NP bucket. */
export function statewidePrimaryShare(statewide, key) {
  const rows = statewide?.primaries ?? [];
  const get = (party) => rows.find((r) => r.party === party)?.pct ?? 0;
  if (key === "lnp") return get("liberal") + get("nationals");
  return get(key);
}

export function flattenDistrictResults(data) {
  return (data?.districts ?? []).map((d) => {
    const primary = (party) => d.primaries.find((r) => r.party === party);
    const tcp = d.two_candidate_preferred;
    const tpp = d.two_party_preferred;
    return {
      slug: d.slug,
      formal: d.formal,
      informal: d.informal ?? "",
      turnout: d.turnout ?? "",
      labor_pct: primary("labor")?.pct ?? "",
      liberal_pct: primary("liberal")?.pct ?? "",
      nationals_pct: primary("nationals")?.pct ?? "",
      greens_pct: primary("greens")?.pct ?? "",
      onp_pct: primary("one-nation")?.pct ?? "",
      others_pct: primary("others")?.pct ?? "",
      tcp_winner_name: tcp?.winner?.name ?? "",
      tcp_winner_party: tcp?.winner?.party ?? "",
      tcp_winner_pct: tcp?.winner?.pct ?? "",
      tcp_runner_name: tcp?.runner_up?.name ?? "",
      tcp_runner_party: tcp?.runner_up?.party ?? "",
      tcp_runner_pct: tcp?.runner_up?.pct ?? "",
      tcp_margin_pp: tcp?.margin_pp ?? "",
      tpp_winner_party: tpp?.winner?.party ?? "",
      tpp_winner_pct: tpp?.winner?.pct ?? "",
      tpp_runner_party: tpp?.runner_up?.party ?? "",
      tpp_runner_pct: tpp?.runner_up?.pct ?? "",
      source_url: d.source?.url ?? "",
    };
  });
}
