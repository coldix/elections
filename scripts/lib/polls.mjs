// Statewide poll ledger + tracker average.
// Rules: docs/poll-methodology.md. Used by export and the /polls page.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
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

export const POLL_CAVEAT =
  "Bands reflect sampling uncertainty and disagreement among recent polls, " +
  "not a forecast of election day. They do not model preference flows, " +
  "turnout, or late swings. Party, union and advocacy-commissioned polls " +
  "are excluded from the average by default; rare documented exceptions only.";

const DEFAULT_DEFF = 1.3;
const HALF_LIFE_DAYS = 21;
const LAMBDA = Math.LN2 / HALF_LIFE_DAYS;
const WINDOW_DAYS = 45;
const WINDOW_EXTEND_DAYS = 60;
const MIN_POLLS = 2;
const MIN_POLLSTERS = 2;
const SIGMA_MIN_PP = 1.0; // percentage points
const Z95 = 1.96;
const PARTIES = ["alp", "lnp", "onp", "grn", "others"];

export const PARTY_LABELS = {
  alp: "Labor",
  lnp: "Coalition (L-NP)",
  onp: "One Nation",
  grn: "Greens",
  others: "Others",
};

/**
 * Illustrative two-bloc grouping of primary shares (not preference-flow 2PP).
 * Left = Labor + Greens; Right = Coalition + One Nation.
 * Others is either left residual or split into the two blocs.
 *
 * @param {{ alp: number, lnp: number, onp: number, grn: number, others: number }} primaries
 * @returns {object | null}
 */
export function computeBlocSplit(primaries) {
  if (!primaries) return null;
  const leftCore = Number(primaries.alp) + Number(primaries.grn);
  const rightCore = Number(primaries.lnp) + Number(primaries.onp);
  const other = Number(primaries.others);
  const coreTotal = leftCore + rightCore;
  if (!(coreTotal > 0) || !Number.isFinite(other)) return null;

  const leftShare = leftCore / coreTotal;
  const rightShare = rightCore / coreTotal;
  const leftFromOther = other * leftShare;
  const rightFromOther = other * rightShare;

  const round1 = (x) => Math.round(x * 10) / 10;

  return {
    // Neutral labels for display (not a formal ideology score)
    labels: {
      left: "Labor + Greens",
      right: "Coalition + One Nation",
      other: "Others",
      short_left: "Left bloc",
      short_right: "Right bloc",
    },
    definition: {
      left: ["alp", "grn"],
      right: ["lnp", "onp"],
      other: ["others"],
    },
    caveat:
      "Primary-vote groupings only. Not a two-party preferred result, seat model, " +
      "or preference forecast. Others are minor parties and independents combined.",
    core: {
      left: round1(leftCore),
      right: round1(rightCore),
      other: round1(other),
    },
    /** Two-way after allocating Others in proportion to the core blocs. */
    other_split_proportional: {
      method: "proportional_to_core_blocs",
      left: round1(leftCore + leftFromOther),
      right: round1(rightCore + rightFromOther),
      left_from_other: round1(leftFromOther),
      right_from_other: round1(rightFromOther),
    },
    /** Two-way after splitting Others evenly (sensitivity check). */
    other_split_even: {
      method: "even_split",
      left: round1(leftCore + other / 2),
      right: round1(rightCore + other / 2),
      left_from_other: round1(other / 2),
      right_from_other: round1(other / 2),
    },
  };
}

function daysBetween(isoA, isoB) {
  const a = Date.parse(`${isoA}T00:00:00Z`);
  const b = Date.parse(`${isoB}T00:00:00Z`);
  return Math.round((b - a) / 86400000);
}

function loadPollFile(path) {
  const raw = parse(readFileSync(path, "utf8"));
  return raw.poll ?? raw;
}

/**
 * Load all poll YAML files for an election. Files starting with _ are ignored.
 * @param {string} electionId
 * @param {string} [dataDir] optional; discovered from the repo if omitted
 */
export function loadPolls(electionId, dataDir = findDataDir()) {
  const dir = join(dataDir, electionId, "polls");
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  return readdirSync(dir)
    .filter((f) => !f.startsWith("_") && f.endsWith(".yaml"))
    .sort()
    .map((f) => {
      const poll = loadPollFile(join(dir, f));
      return { ...poll, file: f };
    });
}

function effectiveN(poll) {
  const deff = poll.design_effect == null ? DEFAULT_DEFF : Number(poll.design_effect);
  return poll.sample_size / deff;
}

/**
 * Select polls for the average: eligible only, rolling window, one per pollster.
 * @param {object[]} polls
 * @param {string} [asOf] ISO date; default = latest fieldwork_end among eligible
 */
export function selectForAverage(polls, asOf) {
  const eligible = polls.filter((p) => p.eligible_for_average === true);
  if (!eligible.length) {
    return { included: [], asOf: asOf ?? null, windowDays: WINDOW_DAYS, reason: "no_eligible" };
  }

  const latest = eligible.reduce(
    (max, p) => (p.fieldwork_end > max ? p.fieldwork_end : max),
    eligible[0].fieldwork_end
  );
  const T = asOf && asOf > latest ? asOf : latest;

  const inWindow = (maxAge) =>
    eligible.filter((p) => {
      const age = daysBetween(p.fieldwork_end, T);
      return age >= 0 && age <= maxAge;
    });

  let windowDays = WINDOW_DAYS;
  let pool = inWindow(WINDOW_DAYS);
  if (pool.length < 3) {
    windowDays = WINDOW_EXTEND_DAYS;
    pool = inWindow(WINDOW_EXTEND_DAYS);
  }

  // One poll per pollster: newest fieldwork_end wins
  const byPollster = new Map();
  for (const p of pool) {
    const prev = byPollster.get(p.pollster);
    if (!prev || p.fieldwork_end > prev.fieldwork_end) byPollster.set(p.pollster, p);
  }
  const included = [...byPollster.values()].sort((a, b) =>
    a.fieldwork_end < b.fieldwork_end ? 1 : -1
  );

  if (included.length < MIN_POLLS || byPollster.size < MIN_POLLSTERS) {
    return {
      included: [],
      candidates: included,
      asOf: T,
      windowDays,
      reason: "insufficient",
    };
  }

  return { included, asOf: T, windowDays, reason: null };
}

function weightedMean(items, getP) {
  let sw = 0;
  let sp = 0;
  for (const it of items) {
    sw += it.w;
    sp += it.w * getP(it.poll);
  }
  return sw === 0 ? null : sp / sw;
}

function largestRemainder(values, total = 100, decimals = 1) {
  const factor = 10 ** decimals;
  const scaled = PARTIES.map((k) => {
    const raw = values[k] * factor;
    const floor = Math.floor(raw + 1e-9);
    return { k, raw, floor, frac: raw - floor };
  });
  let sumFloor = scaled.reduce((s, x) => s + x.floor, 0);
  let need = total * factor - sumFloor;
  const ordered = [...scaled].sort((a, b) => b.frac - a.frac);
  const bump = new Set();
  for (const x of ordered) {
    if (need <= 0) break;
    bump.add(x.k);
    need--;
  }
  const out = {};
  for (const x of scaled) {
    out[x.k] = (x.floor + (bump.has(x.k) ? 1 : 0)) / factor;
  }
  return out;
}

/**
 * Compute the tracker primary-vote average and error bars.
 * Returns a plain object safe to JSON-export and render.
 */
export function computePollAverage(polls, options = {}) {
  const selection = selectForAverage(polls, options.asOf);
  const base = {
    generated: new Date().toISOString(),
    methodology: "docs/poll-methodology.md",
    caveat: POLL_CAVEAT,
    parameters: {
      design_effect_default: DEFAULT_DEFF,
      half_life_days: HALF_LIFE_DAYS,
      window_days_default: WINDOW_DAYS,
      window_days_extended: WINDOW_EXTEND_DAYS,
      sigma_min_pp: SIGMA_MIN_PP,
      min_polls: MIN_POLLS,
      min_pollsters: MIN_POLLSTERS,
    },
    as_of: selection.asOf,
    window_days_used: selection.windowDays,
    status: selection.reason ? "insufficient" : "ok",
    status_reason: selection.reason,
    included_poll_ids: [],
    excluded_from_average: polls
      .filter((p) => !p.eligible_for_average)
      .map((p) => ({
        id: p.id,
        pollster: p.pollster,
        reason: p.exclusion_reason ?? "not eligible",
      })),
    primaries: null,
    intervals: null,
    weights: null,
  };

  if (selection.reason) {
    base.note =
      selection.reason === "no_eligible"
        ? "No eligible polls in the ledger yet."
        : "Fewer than two pollsters in the rolling window after de-duplication; no numeric average published.";
    base.near_miss_ids = (selection.candidates ?? []).map((p) => p.id);
    return base;
  }

  const T = selection.asOf;
  const items = selection.included.map((poll) => {
    const d = daysBetween(poll.fieldwork_end, T);
    const nEff = effectiveN(poll);
    const decay = Math.exp(-LAMBDA * d);
    const w = nEff * decay;
    return { poll, d, nEff, decay, w };
  });

  const raw = {};
  for (const k of PARTIES) {
    raw[k] = weightedMean(items, (p) => p.primaries[k]);
  }
  const primaries = largestRemainder(raw, 100, 1);

  const intervals = {};
  for (const k of PARTIES) {
    const pHat = primaries[k]; // percentage points
    const W = items.reduce((s, it) => s + it.w, 0);

    // Sampling variance in proportion space, convert to pp²
    let num = 0;
    for (const it of items) {
      const pi = it.poll.primaries[k] / 100;
      num += it.w ** 2 * ((pi * (1 - pi)) / it.nEff);
    }
    const varSampPp = (num / W ** 2) * 10000;

    // Between-poll dispersion in percentage points
    let s2 = 0;
    for (const it of items) {
      s2 += it.w * (it.poll.primaries[k] - pHat) ** 2;
    }
    s2 = (s2 / W) * (items.length / Math.max(items.length - 1, 1));
    const varBetween = items.length >= 3 ? Math.max(s2, SIGMA_MIN_PP ** 2) : SIGMA_MIN_PP ** 2;

    const se = Math.sqrt(varSampPp + varBetween);
    const lo = Math.max(0, pHat - Z95 * se);
    const hi = Math.min(100, pHat + Z95 * se);
    intervals[k] = {
      estimate: pHat,
      se: Math.round(se * 100) / 100,
      low: Math.round(lo * 10) / 10,
      high: Math.round(hi * 10) / 10,
      var_sampling_pp2: Math.round(varSampPp * 1000) / 1000,
      var_between_pp2: Math.round(varBetween * 1000) / 1000,
    };
  }

  base.included_poll_ids = items.map((it) => it.poll.id);
  base.weights = items.map((it) => ({
    id: it.poll.id,
    pollster: it.poll.pollster,
    fieldwork_end: it.poll.fieldwork_end,
    sample_size: it.poll.sample_size,
    n_eff: Math.round(it.nEff * 100) / 100,
    age_days: it.d,
    decay: Math.round(it.decay * 10000) / 10000,
    weight: Math.round(it.w * 100) / 100,
  }));
  base.primaries = primaries;
  base.intervals = intervals;
  base.bloc_split = computeBlocSplit(primaries);
  return base;
}
