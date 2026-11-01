// Marginal Assembly seats for Vic 2026, derived from the 2022 VEC results in
// data/vic2026/district-results-2022.yaml. A seat is "marginal" when the 2022
// two-candidate preferred margin (winner share minus 50) is under 6 points,
// the usual threshold on Australian electoral pendulums.
import { loadElection } from "../../../scripts/lib/data.mjs";
import { loadDistrictResults2022, resultForDistrict } from "../../../scripts/lib/district-results.mjs";

export const MARGINAL_THRESHOLD_PP = 6;

export function marginalSeats() {
  const data = loadElection("vic2026");
  const results = loadDistrictResults2022("vic2026");
  return data.districts
    .map((d) => ({ district: d, result: resultForDistrict(d.slug, results) }))
    .filter((x) => x.result?.two_candidate_preferred?.margin_pp < MARGINAL_THRESHOLD_PP)
    .sort((a, b) => a.result.two_candidate_preferred.margin_pp - b.result.two_candidate_preferred.margin_pp);
}
