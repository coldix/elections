// Federal (kind: federal) election loader — structure + sitting members.
// Separate from Vic-shaped loadElection so incomplete candidate ledgers do not
// force empty districts/regions/candidates trees.
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

export const STATE_LABELS = {
  nsw: "New South Wales",
  vic: "Victoria",
  qld: "Queensland",
  wa: "Western Australia",
  sa: "South Australia",
  tas: "Tasmania",
  act: "Australian Capital Territory",
  nt: "Northern Territory",
};

export const STATE_ORDER = ["nsw", "vic", "qld", "wa", "sa", "tas", "act", "nt"];

/** Load a federal election ledger (divisions, senate, sitting members, parties). */
export function loadFederalElection(id) {
  const dir = join(DATA_DIR, id);
  const election = load(dir, "election.yaml").election;
  if (election.kind !== "federal") {
    throw new Error(`${id}: expected kind federal, got ${election.kind}`);
  }

  const parties = load(dir, "parties.yaml").parties;
  const partyBySlug = new Map(parties.map((p) => [p.slug, p]));
  const divisions = load(dir, "divisions.yaml").divisions;
  const houseMembers = load(dir, "house-members.yaml").house_members ?? [];
  const senateContests = load(dir, "senate-contests.yaml").contests ?? [];
  const senateMembers = load(dir, "senate-members.yaml").senate_members ?? [];
  const fileSourceHouse = load(dir, "house-members.yaml").source ?? null;
  const fileSourceSenate = load(dir, "senate-members.yaml").source ?? null;
  const fileSourceDivisions = load(dir, "divisions.yaml").source ?? null;

  const houseByDivision = new Map(houseMembers.map((m) => [m.division, m]));
  const senateByState = new Map();
  for (const m of senateMembers) {
    const list = senateByState.get(m.state) ?? [];
    list.push(m);
    senateByState.set(m.state, list);
  }

  const divisionsEnriched = divisions.map((d) => {
    const member = houseByDivision.get(d.slug) ?? null;
    return {
      ...d,
      member,
      incumbent: member?.name ?? d.incumbent ?? null,
      incumbent_party: member?.party ?? d.incumbent_party ?? null,
    };
  });

  const contestsEnriched = senateContests.map((c) => ({
    ...c,
    members: (senateByState.get(c.slug) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return {
    id,
    kind: "federal",
    election,
    parties,
    partyBySlug,
    divisions: divisionsEnriched,
    houseMembers,
    senateContests: contestsEnriched,
    senateMembers,
    sources: {
      house: fileSourceHouse,
      senate: fileSourceSenate,
      divisions: fileSourceDivisions,
    },
  };
}

/** Seats held in the sitting federal parliament (48th), both houses. */
export function federalRepresentationFor(data) {
  const map = new Map();
  const bump = (slug, house) => {
    if (!slug) return;
    const row = map.get(slug) ?? { representatives: 0, senate: 0 };
    row[house]++;
    map.set(slug, row);
  };

  for (const m of data.houseMembers) bump(m.party, "representatives");
  for (const m of data.senateMembers) bump(m.party, "senate");

  return Object.fromEntries(
    [...map.entries()].map(([slug, r]) => [
      slug,
      { ...r, total: r.representatives + r.senate },
    ])
  );
}

/** Headline counts for federal structure pages. */
export function federalSummaryFor(data) {
  const up = data.senateMembers.filter((m) => m.term_status === "up").length;
  const continuing = data.senateMembers.filter((m) => m.term_status === "continuing").length;
  const territory = data.senateMembers.filter((m) => m.term_status === "territory").length;
  const rep = federalRepresentationFor(data);
  const partiesWithSeats = Object.keys(rep).filter((s) => s !== "independent").length;

  return {
    divisions: data.divisions.length,
    house_members: data.houseMembers.length,
    senate_members: data.senateMembers.length,
    senate_up: up,
    senate_continuing: continuing,
    senate_territory: territory,
    senate_contests: data.senateContests.length,
    parties: data.parties.length,
    parties_with_seats: partiesWithSeats,
    parliament_number: data.election.parliament_number,
    sitting_parliament_number: data.election.sitting_parliament_number,
  };
}
