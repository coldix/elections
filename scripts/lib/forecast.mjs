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

// ---------------------------------------------------------------------------
// Primary-vote layer (multi-party). Our model, not sourced data.
// 1. Each party's 2022 district primary is moved by the same number of points
//    as its statewide change since 2022 (uniform additive swing). One Nation
//    starts from its 2022 district vote, or 0 where it did not stand.
//    Negative values are clamped to 0 and the district renormalised to 100.
// 2. The two highest projected primaries are the finalists.
// 3. Labor v Coalition finalists: the existing uniform two-party swing above
//    (keeps the Labor/Coalition layer unchanged). Any other pair: excluded
//    parties' votes are split between the finalists using the assumed
//    preference weights below (our assumptions, not measured flows).
// 4. If "others" (independents and minor parties lumped together) is a
//    finalist, the seat is shown as an IND contest, not modelled, because the
//    lump is not one candidate.
// ---------------------------------------------------------------------------

export const PARTY_KEYS = ["alp", "lnp", "grn", "onp", "others"];
export const PARTY_LABEL = { alp: "Labor", lnp: "Coalition", grn: "Greens", onp: "One Nation", others: "Independent/other" };
const SUMMARY_PARTY = { alp: "labor", lnp: "coalition", grn: "greens", onp: "one-nation" };

/** Coalition -> One Nation flow, defined as equal to One Nation -> Coalition (1 - o) in the same scenario. */
export const lnpToOnp = (f) => 1 - f.onp;

/** Preference weights from each excluded party; only ratios between the two finalists matter. */
export function prefWeights(f) {
  return {
    alp: { grn: 0.8, lnp: 0.3, onp: 0.1 },
    // Symmetric with One Nation -> Coalition: Coalition voters send 1 - f.onp to ONP (rest to Labor).
    lnp: { alp: f.onp, grn: f.onp * 0.5, onp: lnpToOnp(f) },
    grn: { alp: f.grn, lnp: (1 - f.grn) * 0.67, onp: (1 - f.grn) * 0.33 },
    onp: { alp: f.onp, lnp: 1 - f.onp, grn: f.onp * 0.4 },
    // The 2022 "others" lump was mostly right-of-centre minors (Family First, Freedom, Libertarian, DLP, etc.),
    // so when ONP is a finalist it gets the same right-leaning share (1 − others→Labor) the Coalition would.
    others: { alp: f.others, lnp: 1 - f.others, onp: 1 - f.others, grn: 0.6 * f.others },
  };
}

/**
 * Editor-set assumption (Colin, Oct 2026): where One Nation did not stand in
 * 2022, it starts from this share instead of 0, taken off the other parties
 * proportionally so the district still sums to 100. Not a sourced figure: the
 * real 2022 VEC statewide ONP primary was 0.28% (it stood in 5 of 88 districts,
 * averaging about 5% where it stood).
 */
export const ONP_BASELINE_PP = 6;

function districtPrimaries(d, onpBaseline = ONP_BASELINE_PP) {
  const pct = (p) => d.primaries.filter((x) => x.party === p).reduce((a, x) => a + x.pct, 0);
  const p = { alp: pct("labor"), lnp: pct("liberal") + pct("nationals"), grn: pct("greens"), onp: pct("one-nation"), others: pct("others") };
  if (p.onp > 0 || !onpBaseline) return { ...p, onp_baseline: false };
  const rest = p.alp + p.lnp + p.grn + p.others;
  const scale = rest > 0 ? (100 - onpBaseline) / rest : 0;
  return { alp: p.alp * scale, lnp: p.lnp * scale, grn: p.grn * scale, onp: onpBaseline, others: p.others * scale, onp_baseline: true };
}

export function projectPrimaries(d2022, average, base) {
  const raw = {};
  for (const k of PARTY_KEYS) raw[k] = Math.max(0, d2022[k] + (average[k] - base[k]));
  const total = PARTY_KEYS.reduce((a, k) => a + raw[k], 0) || 1;
  return Object.fromEntries(PARTY_KEYS.map((k) => [k, r1((raw[k] / total) * 100)]));
}

/** Two-candidate share for finalist a over b from projected primaries. */
export function twoCandidate(prim, a, b, weights) {
  let va = prim[a];
  let vb = prim[b];
  for (const k of PARTY_KEYS) {
    if (k === a || k === b) continue;
    const w = weights[k] ?? {};
    const wa = w[a] ?? 0.5;
    const wb = w[b] ?? 0.5;
    const share = wa + wb > 0 ? wa / (wa + wb) : 0.5;
    va += prim[k] * share;
    vb += prim[k] * (1 - share);
  }
  return r1((va / (va + vb)) * 100);
}

export function buildMultiPartyForecast(average, results, districts, { onpBaseline = ONP_BASELINE_PP } = {}) {
  const twoParty = buildForecast(average, results, districts);
  const base = twoParty.baseline;
  const names = new Map(districts.map((d) => [d.slug, d.name]));
  const tppBySlug = new Map(twoParty.seats.map((s) => [s.slug, s]));

  const seats = results.districts.map((d) => {
    const name = names.get(d.slug) ?? d.slug;
    const winner2022 = d.two_candidate_preferred?.winner?.party ?? null;
    const p2022 = districtPrimaries(d, onpBaseline);
    if (!d.primaries.some((x) => x.party === "labor")) {
      return { slug: d.slug, name, winner2022, status: "not-modelled", reason: "No Labor candidate in the 2022 count (supplementary election), so there is no baseline to swing" };
    }
    const prim = projectPrimaries(p2022, average, base);
    const order = [...PARTY_KEYS].sort((x, y) => prim[y] - prim[x]);
    const [a, b] = order;
    if (a === "others" || b === "others") {
      return { slug: d.slug, name, winner2022, onp_baseline: p2022.onp_baseline, status: "ind-contest", primaries: prim, finalists: [a, b], reason: "Independent/other vote projected in the top two — Greens/IND contest, not modelled" };
    }
    const byScenario = {};
    const pair = [a, b].sort().join("-");
    const tppSeat = tppBySlug.get(d.slug);
    for (const s of twoParty.scenarios) {
      let shareA;
      if (pair === "alp-lnp" && tppSeat?.modelled) {
        const alpShare = 50 + tppSeat.by_scenario[s.id];
        shareA = a === "alp" ? alpShare : 100 - alpShare;
      } else {
        shareA = twoCandidate(prim, a, b, prefWeights(s));
      }
      byScenario[s.id] = { leader: shareA >= 50 ? a : b, margin: r1(Math.abs(shareA - 50)) };
    }
    const c = byScenario.central;
    return {
      slug: d.slug,
      name,
      winner2022,
      onp_baseline: p2022.onp_baseline,
      status: "modelled",
      method: pair === "alp-lnp" && tppSeat?.modelled ? "two-party swing" : "primary layer + assumed preferences",
      primaries: prim,
      finalists: [a, b],
      leader: c.leader,
      margin_central: c.margin,
      rating: classify(c.margin),
      by_scenario: byScenario,
    };
  });

  const modelled = seats.filter((s) => s.status === "modelled");
  const summary = {};
  for (const k of Object.values(SUMMARY_PARTY)) summary[k] = { firm: 0, leaning: 0, doubt: 0 };
  for (const s of modelled) summary[SUMMARY_PARTY[s.leader]][s.rating]++;
  const ranges = {};
  for (const sc of twoParty.scenarios) {
    const r = Object.fromEntries(Object.values(SUMMARY_PARTY).map((k) => [k, 0]));
    for (const s of modelled) r[SUMMARY_PARTY[s.by_scenario[sc.id].leader]]++;
    ranges[sc.id] = r;
  }
  // Implied statewide ONP: formal-vote-weighted mean of projected district ONP.
  let wSum = 0, onpSum = 0;
  for (const s of seats) {
    if (!s.primaries) continue;
    const f = results.districts.find((x) => x.slug === s.slug)?.formal ?? 1;
    wSum += f; onpSum += f * s.primaries.onp;
  }
  const onpImplied = wSum ? r1(onpSum / wSum) : null;
  return {
    kind: "forecast-model",
    onp_baseline_pp: onpBaseline,
    onp_baseline_seats: seats.filter((s) => s.onp_baseline).length,
    onp_statewide_2022: base.onp,
    onp_implied_statewide: onpImplied,
    onp_poll_average: average.onp,
    banner: twoParty.banner,
    baseline: base,
    average,
    scenarios: twoParty.scenarios,
    seats,
    summary,
    ranges,
    ind_contest: seats.filter((s) => s.status === "ind-contest").length,
    not_modelled: seats.filter((s) => s.status === "not-modelled").length,
    total: seats.length,
    twoParty,
  };
}
