// FORECAST MODEL — this site's own model, not sourced data and not a
// prediction of the result. Kept apart from the poll ledger on purpose.
// Method (docs/forecast-methodology.md): uniform swing on the 2022 Labor v
// Coalition two-party-preferred count in each district, where the statewide
// swing comes from the change in the tracker's primary-vote average since 2022
// under three stated preference-flow scenarios.

/** Assumed share of each party's preferences reaching Labor ahead of the Coalition. */
export const FLOW_SCENARIOS = [
  { id: "low", label: "Lower flows to Labor", grn: 0.8, onp: 0.2, others: 0.4 },
  { id: "central", label: "Central", grn: 0.85, onp: 0.25, others: 0.45 },
  { id: "high", label: "Higher flows to Labor", grn: 0.88, onp: 0.35, others: 0.52 },
];
export const IN_DOUBT_PP = 3;
export const LEANING_PP = 6;
const MAJORS = new Set(["labor", "liberal", "nationals"]);

const r1 = (x) => Math.round(x * 10) / 10;

function prefIndex(p, f) {
  return p.alp + f.grn * p.grn + f.onp * p.onp + f.others * p.others;
}

/** Statewide primaries from the 2022 results file in ledger keys. */
export function baselineFromResults(results) {
  const pct = (party) => results.statewide.primaries.find((x) => x.party === party)?.pct ?? 0;
  return {
    alp: pct("labor"),
    lnp: r1(pct("liberal") + pct("nationals")),
    grn: pct("greens"),
    onp: pct("one-nation"),
    others: pct("others"),
    tpp_alp: results.statewide.two_party_preferred.labor_pct,
  };
}

export function statewideTpp(average, base, f) {
  return r1(base.tpp_alp + prefIndex(average, f) - prefIndex(base, f));
}

export function classify(marginPp) {
  const m = Math.abs(marginPp);
  if (m <= IN_DOUBT_PP) return "doubt";
  if (m <= LEANING_PP) return "leaning";
  return "firm";
}

/**
 * @param {object} average primaries {alp,lnp,grn,onp,others}
 * @param {object} results parsed district-results-2022.yaml
 * @param {object[]} districts [{slug,name}]
 */
export function buildForecast(average, results, districts) {
  const base = baselineFromResults(results);
  const names = new Map(districts.map((d) => [d.slug, d.name]));
  const scenarios = FLOW_SCENARIOS.map((f) => {
    const tpp = statewideTpp(average, base, f);
    return { ...f, tpp_alp: tpp, swing_to_alp: r1(tpp - base.tpp_alp) };
  });
  const central = scenarios.find((s) => s.id === "central");

  const seats = results.districts.map((d) => {
    const name = names.get(d.slug) ?? d.slug;
    const tcp = d.two_candidate_preferred;
    const tpp = d.two_party_preferred;
    const winner2022 = tcp?.winner?.party ?? null;
    if (!tpp || !winner2022 || !MAJORS.has(winner2022)) {
      return { slug: d.slug, name, modelled: false, winner2022, reason: !tpp ? "No 2022 Labor v Coalition count" : "Won by a non-major candidate in 2022" };
    }
    const alp2022 = tpp.winner.party === "labor" ? tpp.winner.pct : tpp.runner_up.pct;
    const byScenario = Object.fromEntries(
      scenarios.map((s) => [s.id, r1(alp2022 + s.swing_to_alp - 50)])
    );
    const margin = byScenario.central;
    return {
      slug: d.slug,
      name,
      modelled: true,
      winner2022,
      alp_tpp_2022: alp2022,
      margin_central: margin,
      ahead: margin > 0 ? "labor" : margin < 0 ? "coalition" : "tied",
      rating: classify(margin),
      by_scenario: byScenario,
    };
  });

  const modelled = seats.filter((s) => s.modelled);
  const count = (pred) => modelled.filter(pred).length;
  const summary = {
    labor: { firm: 0, leaning: 0, doubt: 0 },
    coalition: { firm: 0, leaning: 0, doubt: 0 },
  };
  for (const s of modelled) {
    const side = s.margin_central >= 0 ? "labor" : "coalition";
    summary[side][s.rating]++;
  }
  const ranges = Object.fromEntries(
    scenarios.map((s) => [
      s.id,
      { labor_ahead: count((x) => x.by_scenario[s.id] > 0), coalition_ahead: count((x) => x.by_scenario[s.id] < 0) },
    ])
  );
  const laborVals = Object.values(ranges).map((r) => r.labor_ahead);
  const coalVals = Object.values(ranges).map((r) => r.coalition_ahead);

  return {
    kind: "forecast-model",
    banner: "Forecast: our model, not a prediction of the result",
    baseline: base,
    average,
    scenarios,
    central_tpp_alp: central.tpp_alp,
    seats,
    summary,
    ranges,
    range: {
      labor_ahead: [Math.min(...laborVals), Math.max(...laborVals)],
      coalition_ahead: [Math.min(...coalVals), Math.max(...coalVals)],
    },
    not_modelled: seats.filter((s) => !s.modelled).length,
    total: seats.length,
  };
}

/** Load the Vic inputs from the repo data dir (works from scripts and the Astro build). */
export async function loadVicInputs() {
  const { readFileSync, existsSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { parse } = await import("yaml");
  const roots = [join(process.cwd(), "data"), join(process.cwd(), "..", "data")];
  const root = roots.find((r) => existsSync(join(r, "vic2026", "district-results-2022.yaml")));
  if (!root) throw new Error("data/vic2026 not found");
  return {
    results: parse(readFileSync(join(root, "vic2026", "district-results-2022.yaml"), "utf8")),
    districts: parse(readFileSync(join(root, "vic2026", "districts.yaml"), "utf8")).districts,
  };
}
