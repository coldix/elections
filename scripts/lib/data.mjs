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

/**
 * Peek election.kind without full load.
 * Vic-shaped ledgers omit kind (treated as state-assembly-council).
 */
export function electionKind(id) {
  const dir = join(DATA_DIR, id);
  const election = load(dir, "election.yaml").election;
  return election.kind ?? "state-assembly-council";
}

/** Load one election, with candidates joined onto districts, regions and parties. */
export function loadElection(id) {
  const dir = join(DATA_DIR, id);

  const election = load(dir, "election.yaml").election;
  if (election.kind === "federal") {
    throw new Error(
      `loadElection(${id}): federal elections use loadFederalElection from scripts/lib/federal.mjs`
    );
  }
  if (election.kind === "state-foundation") {
    throw new Error(
      `loadElection(${id}): state-foundation elections use loadStateFoundationElection from scripts/lib/state-foundation.mjs`
    );
  }
  const districts = load(dir, "districts.yaml").districts;
  const regions = load(dir, "regions.yaml").regions;
  const parties = load(dir, "parties.yaml").parties;
  const retirements = loadOptional(dir, "retirements.yaml", "retirements");
  const councilMembers = loadOptional(dir, "council-members.yaml", "council_members");
  // Optional geographic stats (area_km2, formed year) for atlas pages.
  const districtStats = loadOptional(dir, "district-stats.yaml", "district_stats");
  const statsBySlug = new Map(districtStats.map((s) => [s.slug, s]));

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
    councilMembers,
    districtStats,
    districts: districts.map((d) => {
      const stats = statsBySlug.get(d.slug) ?? null;
      return {
        ...d,
        area_km2: stats?.area_km2 ?? null,
        formed: stats?.formed ?? null,
        candidates: byContest(d.slug, "assembly"),
        retirements: retirements.filter((r) => r.role === "MLA" && r.seat === d.slug),
      };
    }),
    regions: regions.map((r) => ({
      ...r,
      candidates: byContest(r.slug, "council"),
      retirements: retirements.filter((x) => x.role === "MLC" && x.seat === r.slug),
      members: councilMembers.filter((m) => m.region === r.slug),
    })),
  };
}

/**
 * Current parliamentary representation per party: seats actually held right
 * now in each house, including mid-term party changes and replacements.
 *
 * This is a record of the sitting parliament, NOT a 2026 candidate count and
 * NOT a 2022 election result. Sorting listings by this figure is defensible
 * because it is an objective, externally verifiable fact rather than an
 * editorial ranking — see docs/METHODOLOGY.md#ordering.
 */
export function representationFor(data) {
  const map = new Map();
  const bump = (slug, house) => {
    if (!slug) return;
    const row = map.get(slug) ?? { assembly: 0, council: 0 };
    row[house]++;
    map.set(slug, row);
  };

  for (const d of data.districts) bump(d.incumbent_party, "assembly");
  for (const m of data.councilMembers) bump(m.party, "council");

  return Object.fromEntries(
    [...map.entries()].map(([slug, r]) => [slug, { ...r, total: r.assembly + r.council }])
  );
}

/**
 * Per-party coverage for both houses:
 *  - Assembly: how many of the 88 single-member districts have a live candidacy
 *  - Council: how many live candidacies (each of the 40 seats is multi-member;
 *    one sourced name = one seat covered until more ticket members are recorded)
 *
 * Combined progress is over 128 (= 88 + 40).
 *
 * Ordering: by seats currently held in the Parliament (both houses), largest
 * first, then alphabetically. That is an objective, externally verifiable fact
 * about the sitting parliament — never a ranking by coverage, campaign
 * prominence or editorial preference. See docs/METHODOLOGY.md#ordering.
 */
export function coverageFor(data) {
  const totalDistricts = data.districts.length;
  const totalCouncilSeats = data.regions.reduce((n, r) => n + (r.seats || 5), 0);
  const totalBoth = totalDistricts + totalCouncilSeats;
  const rep = representationFor(data);

  const rows = data.parties.map((p) => {
    const live = data.candidates.filter(
      (c) => c.party === p.slug && c.chamber === "assembly" && LIVE_STATUSES.includes(c.status)
    );
    const ended = data.candidates.filter(
      (c) => c.party === p.slug && c.chamber === "assembly" && ENDED_STATUSES.includes(c.status)
    );
    const councilLive = data.candidates.filter(
      (c) => c.party === p.slug && c.chamber === "council" && LIVE_STATUSES.includes(c.status)
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
    const councilRegions = new Set(councilLive.map((c) => c.contest));
    // Multi-member: each live candidacy counts as one of 40 seats covered.
    const councilSeats = councilLive.length;
    const combined = seats.size + councilSeats;
    return {
      party: p.slug,
      name: p.name,
      short_name: p.short_name,
      family: p.family ?? null,
      assembly_seats_covered: seats.size,
      assembly_seats_total: totalDistricts,
      // Assembly-only fill (kept for charts that are district-scoped).
      pct: totalDistricts ? Math.round((seats.size / totalDistricts) * 100) : 0,
      council_seats_covered: councilSeats,
      council_seats_total: totalCouncilSeats,
      council_pct: totalCouncilSeats
        ? Math.round((councilSeats / totalCouncilSeats) * 100)
        : 0,
      // Regions with ≥1 live Council candidacy (for maps/grids).
      council_regions_covered: councilRegions.size,
      council_regions_total: data.regions.length,
      combined_seats_covered: combined,
      combined_seats_total: totalBoth,
      // Progress over both houses (88 + 40 = 128).
      combined_pct: totalBoth ? Math.round((combined / totalBoth) * 100) : 0,
      by_status: byStatus,
      ended_count: ended.length,
      covered_districts: [...seats].sort(),
      covered_regions: [...councilRegions].sort(),
      // Seats held in the CURRENT parliament — context for the coverage
      // figure, and the basis for listing order.
      current: rep[p.slug] ?? { assembly: 0, council: 0, total: 0 },
      // A party's own public claim about how many seats it will contest,
      // where it has made one. Recorded as a claim, never as a fact.
      commitments: p.commitments ?? [],
    };
  });

  return rows.sort(
    (a, b) =>
      b.current.total - a.current.total ||
      b.current.assembly - a.current.assembly ||
      a.name.localeCompare(b.name)
  );
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
    council_members: data.councilMembers.length,
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

/**
 * Whole calendar days from "today" (Melbourne) until a YYYY-MM-DD date.
 * Uses Australia/Melbourne calendar dates so build-host UTC does not skew the count.
 */
export function daysUntil(dateStr, today = new Date()) {
  const melbourneYmd = (d) =>
    d.toLocaleDateString("en-CA", { timeZone: "Australia/Melbourne" }); // YYYY-MM-DD
  const todayStr = melbourneYmd(today);
  const t0 = Date.parse(`${todayStr}T00:00:00Z`);
  const t1 = Date.parse(`${dateStr}T00:00:00Z`);
  return Math.round((t1 - t0) / 86400000);
}
