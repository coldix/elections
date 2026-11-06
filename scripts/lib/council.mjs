// Legislative Council seat model (our model, not a prediction).
// 1. Start from each group's 2022 first-preference share in each region (VEC).
// 2. Labor, Coalition, Greens and One Nation move by their statewide change in the
//    poll average since 2022 (Assembly polls; there is no upper house polling).
//    Every other party shares the change in "others" in proportion to its 2022 vote.
//    Negative shares are set to zero and each region is rescaled to 100%.
// 3. Party-level count: quota is one sixth of the vote (16.67%). A party at or above
//    a quota wins a seat and keeps its surplus for its next candidate. When no party
//    has a quota, the smallest party is excluded and its votes move under the
//    assumed preference flows below. When the parties left equal the seats left,
//    they all win.
// 4. The count is repeated under lower and higher preference assumptions; any seat
//    that changes hands between them is flagged lower confidence.
// All preference flows here are assumptions. 2026 is the first Victorian election
// without group voting tickets, so there is no measured flow to use.

export const QUOTA_PCT = 100 / 6;
export const SEATS_PER_REGION = 5;
export const IN_DOUBT_PP = 2;
export const SMALL_PRIMARY_PP = 5;

export const COUNCIL_SCENARIOS = [
  { id: "low", label: "Weaker preference flows", exhaust: 0.35, sameBloc: 0.45 },
  { id: "central", label: "Central", exhaust: 0.2, sameBloc: 0.6 },
  { id: "high", label: "Stronger preference flows", exhaust: 0.1, sameBloc: 0.75 },
];

// Which way each party's preferences mostly lean. Our assumption, used only for
// excluded votes. "centre" spreads across every party still in the count.
export const BLOC = {
  labor: "left", greens: "left", "victorian-socialists": "left", "animal-justice": "left", "reason-2022": "left", "legalise-cannabis": "left",
  liberal: "right", "liberal-nationals": "right", nationals: "right", "one-nation": "right", "family-first": "right", "freedom-party": "right",
  dlp: "right", "liberal-democrats-2022": "right", "shooters-fishers-farmers": "right", "united-australia-2022": "right",
  "angry-victorians-2022": "right", "sack-dan-andrews-2022": "right", "health-australia-2022": "right",
};
export const blocOf = (p) => BLOC[p] ?? "centre";

// Poll key for each party. Coalition tickets (Liberal, Liberal/Nationals) count as one.
const POLL_KEY = { labor: "alp", liberal: "lnp", "liberal-nationals": "lnp", nationals: "lnp", greens: "grn", "one-nation": "onp" };
export const pollKey = (p) => POLL_KEY[p] ?? "others";
export const isCoalition = (p) => pollKey(p) === "lnp";
/** Seat-count bucket: Coalition parties merge, everything else keeps its own slug. */
export const seatParty = (p) => (isCoalition(p) ? "coalition" : p);

const r2 = (x) => Math.round(x * 100) / 100;

/** 2022 shares by party slug for one region (groups of the same party summed). */
export function regionShares2022(region) {
  const out = {};
  for (const g of region.groups) {
    const key = g.party === "independent-group" || g.party === "ungrouped" ? `${g.party}-${g.group}` : g.party;
    out[key] = (out[key] ?? 0) + (g.votes / region.formal) * 100;
  }
  return out;
}

/** Apply the statewide swing. average/base are {alp,lnp,grn,onp,others} in percent. */
export function swingRegion(shares, average, base) {
  const out = {};
  let minorTotal = 0;
  for (const [p, v] of Object.entries(shares)) if (pollKey(p) === "others") minorTotal += v;
  const minorNew = Math.max(0, minorTotal + (average.others - base.others));
  const scale = minorTotal > 0 ? minorNew / minorTotal : 0;
  for (const [p, v] of Object.entries(shares)) {
    const k = pollKey(p);
    out[p] = k === "others" ? v * scale : Math.max(0, v + (average[k] - base[k]));
  }
  // A Coalition party with two tickets in one region is not possible; nothing else to merge.
  const total = Object.values(out).reduce((a, b) => a + b, 0) || 1;
  for (const p of Object.keys(out)) out[p] = (out[p] / total) * 100;
  return out;
}

/** Party-level count for one region. Returns the 5 winners in order with how each won. */
export function countRegion(primaries, flow, seats = SEATS_PER_REGION) {
  const live = new Map(Object.entries(primaries).filter(([, v]) => v > 0));
  const winners = [];
  const steps = [];
  let lastGap = null;
  while (winners.length < seats) {
    const left = seats - winners.length;
    const [topP, topV] = [...live.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topV >= QUOTA_PCT - 1e-9) {
      const fromPrimary = primaries[topP] - winners.filter((w) => w.party === topP).length * QUOTA_PCT >= QUOTA_PCT - 1e-9;
      winners.push({ party: topP, how: fromPrimary ? "quota" : "quota-after-preferences", share: r2(topV) });
      live.set(topP, topV - QUOTA_PCT);
      if (live.get(topP) <= 1e-9) live.delete(topP);
      steps.push({ elect: topP });
      continue;
    }
    if (live.size <= left) {
      const rest = [...live.entries()].sort((a, b) => b[1] - a[1]);
      for (const [p, v] of rest) winners.push({ party: p, how: "remainder", share: r2(v), gap: lastGap });
      break;
    }
    const sorted = [...live.entries()].sort((a, b) => a[1] - b[1]);
    const [lowP, lowV] = sorted[0];
    lastGap = { excluded: lowP, excluded_share: r2(lowV), next: sorted[1][0], next_share: r2(sorted[1][1]) };
    live.delete(lowP);
    const moving = lowV * (1 - flow.exhaust);
    const bloc = blocOf(lowP);
    const same = bloc === "centre" ? [] : [...live.keys()].filter((p) => blocOf(p) === bloc);
    const totalAll = [...live.values()].reduce((a, b) => a + b, 0) || 1;
    const totalSame = same.reduce((a, p) => a + live.get(p), 0);
    const toSame = same.length && totalSame > 0 ? moving * flow.sameBloc : 0;
    const toAll = moving - toSame;
    const add = new Map();
    for (const [p, v] of live) add.set(p, toAll * (v / totalAll));
    for (const p of same) add.set(p, add.get(p) + toSame * (live.get(p) / totalSame));
    for (const [p, a] of add) live.set(p, live.get(p) + a);
    steps.push({ exclude: lowP, share: r2(lowV) });
  }
  return { winners, steps };
}

function rateSeat(w, primary) {
  if (w.how === "quota") return "firm";
  if (w.how === "quota-after-preferences") return "leaning";
  if (!w.gap) return "leaning";
  // Last seat: compare the winner's final total with the last party excluded.
  return w.share - w.gap.excluded_share < IN_DOUBT_PP ? "doubt" : "leaning";
}

const multiset = (list) => list.reduce((m, p) => m.set(p, (m.get(p) ?? 0) + 1), new Map());

/** Compare two seat lists by seat-party, counting matches. */
export function matchCount(a, b) {
  const mb = multiset(b.map(seatParty));
  let n = 0;
  for (const p of a.map(seatParty)) if (mb.get(p) > 0) { n++; mb.set(p, mb.get(p) - 1); }
  return n;
}

/** Central defaults for the /forecast/council "try your own" sliders. */
export const DEFAULT_COUNCIL_PARAMS = Object.freeze({ exhaust: 0.2, sameBloc: 0.6 });

/**
 * Count and rate seats from already-swung region primaries.
 * Used by buildCouncilForecast (server) and the in-browser Council sliders.
 * @param {Array<{slug:string,name:string,primaries:Record<string,number>,group_names?:Record<string,string>,elected_2022?:string[]}>} regionInputs
 * @param {typeof COUNCIL_SCENARIOS} scenarios
 */
export function forecastFromPrimaries(regionInputs, scenarios = COUNCIL_SCENARIOS) {
  const regions = regionInputs.map((r) => {
    const prim = r.primaries;
    const by = Object.fromEntries(scenarios.map((sc) => [sc.id, countRegion(prim, sc)]));
    const central = by.central ?? Object.values(by)[0];
    const altSeats = scenarios.filter((sc) => sc.id !== "central").map((sc) => by[sc.id].winners.map((w) => seatParty(w.party)));
    const centralSeats = central.winners.map((w) => seatParty(w.party));
    const seats = central.winners.map((w, i) => {
      const rating = rateSeat(w, prim[w.party]);
      const reasons = [];
      if (pollKey(w.party) === "others") reasons.push("This party is not in the polls, so its vote is its 2022 share scaled by the change in the minor party vote.");
      if (i === central.winners.length - 1 && w.how !== "remainder") reasons.push("This is the last seat in the region, decided on preferences. Nobody can measure preference flows yet under the new voting rules.");
      if (w.how === "remainder") reasons.push(`Won on leftover votes and preferences, not a full quota. ${prim[w.party] < SMALL_PRIMARY_PP ? `It starts on only ${r2(prim[w.party])}%. ` : ""}Nobody can measure preference flows yet under the new voting rules.`);
      const changes = altSeats.some((alt) => matchCount([w.party], alt) === 0 || multiset(alt).get(seatParty(w.party)) < multiset(centralSeats).get(seatParty(w.party)));
      if (changes && w.how !== "quota") reasons.push("The seat changes hands under the weaker or stronger preference assumptions.");
      return { order: i + 1, party: w.party, seat_party: seatParty(w.party), how: w.how, share: w.share, rating, lower_confidence: reasons.length > 0, note: reasons.join(" ") };
    });
    const runnerUp = central.winners.at(-1)?.gap ?? null;
    return {
      slug: r.slug,
      name: r.name,
      primaries: Object.fromEntries(Object.entries(prim).sort((a, b) => b[1] - a[1]).map(([p, v]) => [p, r2(v)])),
      quotas: Object.fromEntries(Object.entries(prim).filter(([, v]) => v >= 1).sort((a, b) => b[1] - a[1]).map(([p, v]) => [p, r2(v / QUOTA_PCT)])),
      seats,
      closest: runnerUp,
      by_scenario: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, v.winners.map((w) => seatParty(w.party))])),
      elected_2022: r.elected_2022 ?? [],
      group_names: r.group_names ?? {},
    };
  });
  const totals = {};
  for (const r of regions) for (const s of r.seats) totals[s.seat_party] = (totals[s.seat_party] ?? 0) + 1;
  const ranges = Object.fromEntries(scenarios.map((sc) => {
    const t = {};
    for (const r of regions) for (const p of r.by_scenario[sc.id]) t[p] = (t[p] ?? 0) + 1;
    return [sc.id, t];
  }));
  return {
    kind: "council-forecast-model",
    quota_pct: r2(QUOTA_PCT),
    regions,
    totals: Object.fromEntries(Object.entries(totals).sort((a, b) => b[1] - a[1])),
    ranges,
    scenarios,
    lower_confidence: regions.reduce((a, r) => a + r.seats.filter((s) => s.lower_confidence).length, 0),
    total: regions.reduce((a, r) => a + r.seats.length, 0),
    params: scenarios.find((s) => s.id === "central") ?? scenarios[0],
  };
}

/** Scenarios for a custom exhaust/sameBloc pair: fixed low/high brackets, custom as central. */
export function councilScenariosFor(params = DEFAULT_COUNCIL_PARAMS) {
  const p = { ...DEFAULT_COUNCIL_PARAMS, ...params };
  return [
    COUNCIL_SCENARIOS[0],
    { id: "central", label: "Central", exhaust: p.exhaust, sameBloc: p.sameBloc },
    COUNCIL_SCENARIOS[2],
  ];
}

export function buildCouncilForecast(average, base, council, scenarios = COUNCIL_SCENARIOS) {
  const regionInputs = council.regions.map((r) => {
    const s2022 = regionShares2022(r);
    const prim = swingRegion(s2022, average, base);
    return {
      slug: r.slug,
      name: r.name,
      primaries: prim,
      elected_2022: r.elected_2022.map((e) => e.party),
      group_names: Object.fromEntries(r.groups.map((g) => [g.party === "independent-group" || g.party === "ungrouped" ? `${g.party}-${g.group}` : g.party, g.name])),
    };
  });
  return forecastFromPrimaries(regionInputs, scenarios);
}

/** 2022 check: the same count with zero swing, compared with who actually won. */
export function backtest2022(council, flow = COUNCIL_SCENARIOS[1]) {
  const regions = council.regions.map((r) => {
    const res = countRegion(regionShares2022(r), flow);
    const model = res.winners.map((w) => w.party);
    const actual = r.elected_2022.map((e) => e.party);
    return { slug: r.slug, name: r.name, model: model.map(seatParty), actual: actual.map(seatParty), matched: matchCount(model, actual) };
  });
  const matched = regions.reduce((a, r) => a + r.matched, 0);
  return { regions, matched, total: regions.length * SEATS_PER_REGION };
}

export async function loadCouncilResults() {
  const { readFileSync, existsSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { parse } = await import("yaml");
  const roots = [join(process.cwd(), "data"), join(process.cwd(), "..", "data")];
  const root = roots.find((r) => existsSync(join(r, "vic2026", "council-results-2022.yaml")));
  if (!root) throw new Error("council-results-2022.yaml not found");
  return parse(readFileSync(join(root, "vic2026", "council-results-2022.yaml"), "utf8"));
}
