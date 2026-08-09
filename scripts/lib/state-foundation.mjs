// State-foundation election loader — structure + sitting members, no candidates.
// Used for NSW 2027 and future thin state starts. Parallel to federal.mjs.
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

const DATA_DIR = findDataDir();
const load = (dir, name) => parse(readFileSync(join(dir, name), "utf8"));

/** Load a state-foundation ledger (districts, assembly/council members, parties). */
export function loadStateFoundationElection(id) {
  const dir = join(DATA_DIR, id);
  const election = load(dir, "election.yaml").election;
  if (election.kind !== "state-foundation") {
    throw new Error(`${id}: expected kind state-foundation, got ${election.kind}`);
  }

  const parties = load(dir, "parties.yaml").parties;
  const partyBySlug = new Map(parties.map((p) => [p.slug, p]));
  const districts = load(dir, "districts.yaml").districts;
  const assemblyMembers = load(dir, "assembly-members.yaml").assembly_members ?? [];
  const councilMembers = load(dir, "council-members.yaml").council_members ?? [];
  const fileSourceAssembly = load(dir, "assembly-members.yaml").source ?? null;
  const fileSourceCouncil = load(dir, "council-members.yaml").source ?? null;
  const fileSourceDistricts = load(dir, "districts.yaml").source ?? null;
  const fileTermSource = load(dir, "council-members.yaml").term_source ?? null;

  const assemblyByDistrict = new Map(assemblyMembers.map((m) => [m.district, m]));

  const districtsEnriched = districts.map((d) => {
    const member = assemblyByDistrict.get(d.slug) ?? null;
    return {
      ...d,
      member,
      incumbent: member?.name ?? d.incumbent ?? null,
      incumbent_party: member?.party ?? d.incumbent_party ?? null,
    };
  });

  return {
    id,
    kind: "state-foundation",
    election,
    parties,
    partyBySlug,
    districts: districtsEnriched,
    assemblyMembers,
    councilMembers,
    sources: {
      assembly: fileSourceAssembly,
      council: fileSourceCouncil,
      districts: fileSourceDistricts,
      council_term: fileTermSource,
    },
  };
}

/** Seats held in the sitting state parliament (both houses). */
export function stateFoundationRepresentationFor(data) {
  const map = new Map();
  const bump = (slug, house) => {
    if (!slug) return;
    const row = map.get(slug) ?? { assembly: 0, council: 0 };
    row[house]++;
    map.set(slug, row);
  };

  for (const m of data.assemblyMembers) bump(m.party, "assembly");
  for (const m of data.councilMembers) bump(m.party, "council");

  return Object.fromEntries(
    [...map.entries()].map(([slug, r]) => [slug, { ...r, total: r.assembly + r.council }])
  );
}

/** Headline counts for state-foundation structure pages. */
export function stateFoundationSummaryFor(data) {
  const up = data.councilMembers.filter((m) => m.term_status === "up").length;
  const continuing = data.councilMembers.filter((m) => m.term_status === "continuing").length;
  const rep = stateFoundationRepresentationFor(data);
  const partiesWithSeats = Object.keys(rep).filter((s) => s !== "independent").length;

  return {
    districts: data.districts.length,
    assembly_members: data.assemblyMembers.length,
    council_members: data.councilMembers.length,
    council_up: up,
    council_continuing: continuing,
    parties: data.parties.length,
    parties_with_seats: partiesWithSeats,
    parliament_number: data.election.parliament_number,
    sitting_parliament_number: data.election.sitting_parliament_number,
  };
}
