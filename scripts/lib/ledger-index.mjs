// Build an in-memory index of candidacies already in data/ for lead de-dupe.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

/** Lowercase, collapse spaces/hyphens/apostrophes for fuzzy match. */
export function normalizePerson(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function normalizeContest(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/electoral district of |region$/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * @param {string} candidatesDir absolute path to data/<election>/candidates
 * @returns {{ byKey: Set<string>, byName: Set<string>, byNameContest: Set<string>, list: object[] }}
 */
export function indexCandidates(candidatesDir) {
  const byKey = new Set();
  const byName = new Set();
  const byNameContest = new Set();
  const list = [];

  for (const f of readdirSync(candidatesDir).sort()) {
    if (!f.endsWith(".yaml") || f.startsWith("_")) continue;
    const raw = readFileSync(join(candidatesDir, f), "utf8");
    let doc;
    try {
      doc = parse(raw);
    } catch {
      continue;
    }
    const c = doc?.candidate;
    if (!c?.name) continue;
    const n = normalizePerson(c.name);
    const party = (c.party || "").toLowerCase();
    const contest = (c.contest || "").toLowerCase();
    const chamber = (c.chamber || "").toLowerCase();
    byKey.add(`${n}|${party}|${contest}`);
    byName.add(n);
    byNameContest.add(`${n}|${contest}`);
    list.push({
      file: f,
      name: c.name,
      party,
      contest,
      chamber,
      status: c.status,
      nameKey: n,
    });
  }

  return { byKey, byName, byNameContest, list };
}

export function indexRetirements(retirementsPath) {
  const names = new Set();
  try {
    const doc = parse(readFileSync(retirementsPath, "utf8"));
    for (const r of doc?.retirements || []) {
      if (r?.name) names.add(normalizePerson(r.name));
    }
  } catch {
    /* optional */
  }
  return names;
}

/**
 * Sitting MLAs by district slug → normalized name.
 * Wikipedia often lists incumbents as “candidates” without a recontest source;
 * suppress those as leads (our methodology requires individual verification).
 */
export function indexIncumbents(districtsPath) {
  /** @type {Map<string, string>} contest -> nameKey */
  const byContest = new Map();
  const names = new Set();
  try {
    const doc = parse(readFileSync(districtsPath, "utf8"));
    for (const d of doc?.districts || []) {
      if (!d?.slug || !d?.incumbent) continue;
      const n = normalizePerson(d.incumbent);
      byContest.set(String(d.slug).toLowerCase(), n);
      names.add(n);
    }
  } catch {
    /* optional */
  }
  return { byContest, names };
}

/** True if this person+party+contest (or person+contest) is already encoded. */
export function alreadyInLedger(index, { name, party, contest }) {
  const n = normalizePerson(name);
  if (!n) return false;
  const p = (party || "").toLowerCase();
  const c = (contest || "").toLowerCase();
  if (p && c && index.byKey.has(`${n}|${p}|${c}`)) return true;
  if (c && index.byNameContest.has(`${n}|${c}`)) return true;
  // Name-only hit is weaker — still suppress as "known person" for news leads
  if (index.byName.has(n)) return true;
  return false;
}
