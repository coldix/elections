// Dated poll feed: one entry per poll across every ledger, with the change
// since the same pollster's previous poll in the same ledger, a margin-of-error
// flag and 2–4 plain "what changed" bullets generated from the figures only.
// No editorial text: every bullet is a sentence built from ledger numbers.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { loadPolls } from "./polls.mjs";

const DEFAULT_DEFF = 1.3;

/** Ledgers shown in the feed, in display order. NSW first (next election). */
export const FEED_LEDGERS = [
  { id: "nsw2027", jurisdiction: "nsw", label: "NSW", election: "NSW state (13 Mar 2027)" },
  { id: "vic2026", jurisdiction: "vic", label: "Victoria", election: "Victorian state (28 Nov 2026)" },
  { id: "_state-polls/qld", jurisdiction: "qld", label: "Queensland", election: "Queensland state" },
  { id: "_state-polls/sa", jurisdiction: "sa", label: "South Australia", election: "South Australian state" },
  { id: "_state-polls/wa", jurisdiction: "wa", label: "Western Australia", election: "WA state" },
  { id: "_state-polls/tas", jurisdiction: "tas", label: "Tasmania", election: "Tasmanian state" },
  { id: "federal-49", jurisdiction: "federal", label: "Federal", election: "Federal House" },
];

const PARTY_ORDER = ["alp", "lnp", "onp", "grn", "others"];

/** Neutral party names per jurisdiction ("lnp" key means the main non-Labor party). */
export function partyLabel(key, jurisdiction) {
  if (key === "lnp") {
    if (jurisdiction === "qld") return "LNP";
    if (["sa", "wa", "tas"].includes(jurisdiction)) return "Liberal";
    return "Coalition";
  }
  return (
    { alp: "Labor", onp: "One Nation", grn: "Greens", others: "Others", nationals: "Nationals" }[key] ??
    key
  );
}

const POLLSTER_ALIASES = {
  resolvestrategic: "resolve",
  resolve: "resolve",
  newspoll: "newspoll",
  newspollpyxis: "newspoll",
  redbridge: "redbridge",
  redbridgeaccent: "redbridge",
  roymorgan: "roy-morgan",
  demosau: "demosau",
  freshwater: "freshwater",
  freshwaterstrategy: "freshwater",
  essential: "essential",
  yougov: "yougov",
  insightfully: "insightfully",
  emrs: "emrs",
};
const POLLSTER_NAMES = {
  resolve: "Resolve Strategic",
  newspoll: "Newspoll / Pyxis",
  redbridge: "RedBridge / Accent",
  "roy-morgan": "Roy Morgan",
  demosau: "DemosAU",
  freshwater: "Freshwater Strategy",
  essential: "Essential",
  yougov: "YouGov",
  insightfully: "Insightfully",
  emrs: "EMRS",
};

export function pollsterKey(name) {
  const flat = String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
  return POLLSTER_ALIASES[flat] ?? flat;
}
export function pollsterName(name) {
  return POLLSTER_NAMES[pollsterKey(name)] ?? String(name);
}

/** 95% margin of error in points. Stated by pollster when recorded; else estimated at p=50%. */
export function marginOfError(poll) {
  if (typeof poll.margin_of_error === "number") {
    return { value: poll.margin_of_error, stated: true };
  }
  const deff = poll.design_effect == null ? DEFAULT_DEFF : Number(poll.design_effect);
  const nEff = poll.sample_size / deff;
  const value = Math.round(1.96 * Math.sqrt(0.25 / nEff) * 1000) / 10;
  return { value, stated: false };
}

const round1 = (x) => Math.round(x * 10) / 10;
const fmt = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(1));

function fmtRange(p) {
  const s = new Date(`${p.fieldwork_start}T00:00:00Z`);
  const e = new Date(`${p.fieldwork_end}T00:00:00Z`);
  const o = { day: "numeric", month: "short", timeZone: "UTC" };
  const oy = { ...o, year: "numeric" };
  if (p.fieldwork_start === p.fieldwork_end) return e.toLocaleDateString("en-AU", oy);
  return `${s.toLocaleDateString("en-AU", o)} – ${e.toLocaleDateString("en-AU", oy)}`;
}

/**
 * Build bullets from figures only. 2–4 items.
 */
export function whatChanged(poll, prev, moe, jurisdiction) {
  const L = (k) => partyLabel(k, jurisdiction);
  const bullets = [];
  if (!prev) {
    bullets.push(
      `First ${pollsterName(poll.pollster)} poll for this contest in the ledger, so there is no earlier poll from this pollster to compare.`
    );
    const top = PARTY_ORDER.filter((k) => k !== "others")
      .map((k) => [k, poll.primaries[k]])
      .sort((a, b) => b[1] - a[1]);
    bullets.push(
      `Primary votes: ${top.map(([k, v]) => `${L(k)} ${fmt(v)}%`).join(", ")}, others ${fmt(poll.primaries.others)}%.`
    );
    return bullets;
  }
  const deltas = PARTY_ORDER.map((k) => [k, round1(poll.primaries[k] - prev.primaries[k])]);
  const moved = deltas.filter(([, d]) => d !== 0).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const describe = ([k, d]) =>
    d === 0
      ? `${L(k)} unchanged at ${fmt(poll.primaries[k])}%`
      : `${L(k)} ${d > 0 ? "up" : "down"} ${fmt(Math.abs(d))} to ${fmt(poll.primaries[k])}%`;
  if (moved.length === 0) {
    bullets.push(`No change in any primary vote since this pollster's previous poll (${fmtRange(prev)}).`);
  } else {
    bullets.push(`Largest move: ${describe(moved[0])}, compared with this pollster's previous poll (${fmtRange(prev)}).`);
    const rest = deltas.filter(([k]) => k !== moved[0][0] && k !== "others");
    bullets.push(`${rest.map(describe).join("; ")}.`);
  }
  const outside = moved.filter(([, d]) => Math.abs(d) > moe.value);
  bullets.push(
    outside.length === 0
      ? `Every change is within the ±${fmt(moe.value)}-point margin of error${moe.stated ? "" : " (estimated from sample size)"}.`
      : `${outside.map(([k, d]) => `${L(k)} (${d > 0 ? "+" : ""}${fmt(d)})`).join(", ")} moved by more than the ±${fmt(moe.value)}-point margin of error${moe.stated ? "" : " (estimated from sample size)"}.`
  );
  if (poll.sample_size !== prev.sample_size) {
    bullets.push(`Sample size ${poll.sample_size.toLocaleString("en-AU")}, compared with ${prev.sample_size.toLocaleString("en-AU")} last time.`);
  }
  return bullets.slice(0, 4);
}

/** All feed entries, newest fieldwork first. */
export function buildPollFeed({ ledgers = FEED_LEDGERS, dataDir } = {}) {
  const entries = [];
  for (const ledger of ledgers) {
    const polls = (dataDir ? loadPolls(ledger.id, dataDir) : loadPolls(ledger.id)).sort((a, b) =>
      a.fieldwork_end < b.fieldwork_end ? -1 : a.fieldwork_end > b.fieldwork_end ? 1 : 0
    );
    const lastBy = new Map();
    for (const poll of polls) {
      const key = pollsterKey(poll.pollster);
      const prev = lastBy.get(key) ?? null;
      const moe = marginOfError(poll);
      const change = prev
        ? Object.fromEntries(PARTY_ORDER.map((k) => [k, round1(poll.primaries[k] - prev.primaries[k])]))
        : null;
      const maxMove = change ? Math.max(...Object.values(change).map(Math.abs)) : null;
      entries.push({
        id: `${ledger.jurisdiction}-${poll.id}`,
        poll_id: poll.id,
        ledger: ledger.id,
        jurisdiction: ledger.jurisdiction,
        jurisdiction_label: ledger.label,
        election: ledger.election,
        pollster: pollsterName(poll.pollster),
        commissioner: poll.commissioner,
        commissioner_type: poll.commissioner_type,
        fieldwork_start: poll.fieldwork_start,
        fieldwork_end: poll.fieldwork_end,
        fieldwork_label: fmtRange(poll),
        sample_size: poll.sample_size,
        mode: poll.mode,
        primaries: poll.primaries,
        previous: prev ? { poll_id: prev.id, fieldwork_end: prev.fieldwork_end, fieldwork_label: fmtRange(prev) } : null,
        change,
        moe,
        within_moe: change ? maxMove <= moe.value : null,
        eligible_for_average: poll.eligible_for_average,
        exclusion_reason: poll.exclusion_reason ?? null,
        bullets: whatChanged(poll, prev, moe, ledger.jurisdiction),
        sources: poll.sources,
      });
      lastBy.set(key, poll);
    }
  }
  return entries.sort((a, b) =>
    a.fieldwork_end < b.fieldwork_end ? 1 : a.fieldwork_end > b.fieldwork_end ? -1 : a.id.localeCompare(b.id)
  );
}

function findExtrasDir() {
  for (const base of [new URL("../../data/_poll-extras/", import.meta.url).pathname, join(process.cwd(), "data/_poll-extras"), join(process.cwd(), "../data/_poll-extras")]) {
    if (existsSync(base)) return base;
  }
  throw new Error("data/_poll-extras not found");
}

export function loadVoterGroups(dir = findExtrasDir()) {
  return parse(readFileSync(join(dir, "voter-groups.yaml"), "utf8"));
}
export function loadUpperHouseProjections(dir = findExtrasDir()) {
  return parse(readFileSync(join(dir, "upper-house-projections.yaml"), "utf8"));
}
