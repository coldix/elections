// Single source of truth for loading and deriving election data from data/.
// Used by scripts/export.mjs and by the Astro site, so the numbers published
// on the site and in the exports can never drift apart.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

/**
 * Locate the repository's data/ directory.
 *
 * This module is imported both directly by Node (scripts/) and by the Astro
 * build, which bundles it into site/dist/ — so a path relative to
 * import.meta.url is wrong at runtime in the bundled case. Walk up from both
 * this file and the working directory until we find the real data/ directory.
 */
function findDataDir() {
  const starts = [];
  try {
    starts.push(dirname(fileURLToPath(import.meta.url)));
  } catch {
    /* bundled contexts may not expose a file URL */
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

/** Statuses that mean a person is currently standing (or has won). */
export const LIVE_STATUSES = ["announced", "endorsed", "nominated", "elected"];
/** Statuses that mean a candidacy has ended. */
export const ENDED_STATUSES = ["withdrawn", "disendorsed", "defeated"];
export const ALL_STATUSES = [...LIVE_STATUSES, ...ENDED_STATUSES];

export const STATUS_LABELS = {
  announced: "Announced",
  endorsed: "Endorsed",
  nominated: "Formally nominated",
  elected: "Elected",
  withdrawn: "Withdrawn",
  disendorsed: "Disendorsed",
  defeated: "Defeated",
};

/**
 * The coverage caveat. Held here, not in a template, because it must appear
 * identically in the JSON export and on the site — it is a material
 * qualification of every coverage number we publish.
 */
export const COVERAGE_CAVEAT =
  "Counts only candidacies with an individually-sourced record. Sitting MPs " +
  "presumed to be recontesting but lacking a specific dated announcement are " +
  "NOT counted, so parties holding many seats (notably the governing party) " +
  "undercount relative to their likely ballot presence until each seat is " +
  "individually verified.";

const load = (dir, name) => parse(readFileSync(join(dir, name), "utf8"));

function loadOptional(dir, name, key) {
  const path = join(dir, name);
  if (!existsSync(path)) return [];
  return load(dir, name)[key] ?? [];
}

/** List of election ids present in data/ (e.g. ["vic2026"]). */
export function listElections() {
  return readdirSync(DATA_DIR)
    .filter((f) => statSync(join(DATA_DIR, f)).isDirectory())
    .sort();
}

/** Load one election, with candidates joined onto districts, regions and parties. */
export function loadElection(id) {
  const dir = join(DATA_DIR, id);

  const election = load(dir, "election.yaml").election;
  const districts = load(dir, "districts.yaml").districts;
  const regions = load(dir, "regions.yaml").regions;
  const parties = load(dir, "parties.yaml").parties;
  const retirements = loadOptional(dir, "retirements.yaml", "retirements");

  const candidates = readdirSync(join(dir, "candidates"))
    .filter((f) => !f.startsWith("_") && f.endsWith(".yaml"))
    .sort()
    .map((f) => {
      const c = parse(readFileSync(join(dir, "candidates", f), "utf8")).candidate;
      const latest = c.history[c.history.length - 1];
      return {
        ...c,
        file: f,
        // Convenience fields the site needs everywhere; derived, never stored.
        latest_source: latest?.source ?? null,
        latest_date: latest?.date ?? null,
        verified: latest?.source?.accessed ?? null,
      };
    });

  const partyBySlug = new Map(parties.map((p) => [p.slug, p]));
  const byContest = (slug, chamber) =>
    candidates.filter((c) => c.contest === slug && c.chamber === chamber);

  return {
    id,
    election,
    parties,
    partyBySlug,
    retirements,
    candidates,
    districts: districts.map((d) => ({
      ...d,
      candidates: byContest(d.slug, "assembly"),
      retirements: retirements.filter((r) => r.role === "MLA" && r.seat === d.slug),
    })),
    regions: regions.map((r) => ({
      ...r,
      candidates: byContest(r.slug, "council"),
      retirements: retirements.filter((x) => x.role === "MLC" && x.seat === r.slug),
    })),
  };
}

/**
 * Per-party Legislative Assembly coverage: how many of the 88 districts have a
 * live candidacy for that party, broken down by status.
 * Parties are returned in a fixed, neutral order (alphabetical by name) —
 * never ranked by coverage, size or preference. See docs/METHODOLOGY.md.
 */
export function coverageFor(data) {
  const totalDistricts = data.districts.length;

  const rows = data.parties.map((p) => {
    const live = data.candidates.filter(
      (c) => c.party === p.slug && c.chamber === "assembly" && LIVE_STATUSES.includes(c.status)
    );
    const ended = data.candidates.filter(
      (c) => c.party === p.slug && c.chamber === "assembly" && ENDED_STATUSES.includes(c.status)
    );
    const byStatus = Object.fromEntries(
      ALL_STATUSES.map((s) => [
        s,
        data.candidates.filter(
          (c) => c.party === p.slug && c.chamber === "assembly" && c.status === s
        ).length,
      ])
    );
    const seats = new Set(live.map((c) => c.contest));
    return {
      party: p.slug,
      name: p.name,
      short_name: p.short_name,
      family: p.family ?? null,
      assembly_seats_covered: seats.size,
      assembly_seats_total: totalDistricts,
      pct: totalDistricts ? Math.round((seats.size / totalDistricts) * 100) : 0,
      by_status: byStatus,
      ended_count: ended.length,
      covered_districts: [...seats].sort(),
      // A party's own public claim about how many seats it will contest,
      // where it has made one. Recorded as a claim, never as a fact.
      commitments: p.commitments ?? [],
    };
  });

  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

/** Headline counts for the homepage. All derived, none hand-entered. */
export function summaryFor(data) {
  const sources = new Set();
  let statusEvents = 0;
  let latestVerified = null;

  for (const c of data.candidates) {
    for (const h of c.history) {
      statusEvents++;
      if (h.source?.url) sources.add(h.source.url);
      if (h.source?.accessed && (!latestVerified || h.source.accessed > latestVerified)) {
        latestVerified = h.source.accessed;
      }
    }
  }
  for (const r of data.retirements) {
    if (r.source?.url) sources.add(r.source.url);
    if (r.source?.accessed && (!latestVerified || r.source.accessed > latestVerified)) {
      latestVerified = r.source.accessed;
    }
  }

  const live = data.candidates.filter((c) => LIVE_STATUSES.includes(c.status));

  return {
    districts: data.districts.length,
    regions: data.regions.length,
    // "Registered parties" excludes the `independent` pseudo-party, which is a
    // grouping for non-party candidates, not an entry on the VEC register.
    registered_parties: data.parties.filter((p) => p.slug !== "independent").length,
    candidates: data.candidates.length,
    live_candidates: live.length,
    retirements: data.retirements.length,
    sources: sources.size,
    status_events: statusEvents,
    latest_verified: latestVerified,
    districts_with_candidates: new Set(
      data.candidates.filter((c) => c.chamber === "assembly").map((c) => c.contest)
    ).size,
    by_status: Object.fromEntries(
      ALL_STATUSES.map((s) => [s, data.candidates.filter((c) => c.status === s).length])
    ),
  };
}

/** Days until the election, computed from a supplied "today" for testability. */
export function daysUntil(dateStr, today = new Date()) {
  const target = new Date(`${dateStr}T00:00:00+11:00`);
  return Math.ceil((target - today) / 86400000);
}
