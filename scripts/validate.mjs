#!/usr/bin/env node
// Validate all election data: structure, vocab, referential integrity, sources.
// Exits non-zero on any error. Run in CI on every push/PR.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { parse } from "yaml";

const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const STATUSES = ["announced", "endorsed", "nominated", "withdrawn", "disendorsed", "elected", "defeated"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

let errors = 0;
const fail = (file, msg) => { errors++; console.error(`FAIL ${file}: ${msg}`); };

const isDate = (v) => typeof v === "string" && DATE_RE.test(v) && !isNaN(Date.parse(v));
const isUrl = (v) => { try { new URL(v); return true; } catch { return false; } };

function checkSource(file, ctx, s) {
  if (!s || typeof s !== "object") return fail(file, `${ctx}: missing source`);
  if (!isUrl(s.url)) fail(file, `${ctx}: source.url invalid`);
  if (!s.publisher) fail(file, `${ctx}: source.publisher required`);
  if (!isDate(s.accessed)) fail(file, `${ctx}: source.accessed must be YYYY-MM-DD`);
  if (s.published && !isDate(s.published)) fail(file, `${ctx}: source.published must be YYYY-MM-DD`);
}

for (const election of readdirSync(DATA_DIR)) {
  const dir = join(DATA_DIR, election);
  if (!statSync(dir).isDirectory()) continue;

  const load = (name) => parse(readFileSync(join(dir, name), "utf8"));
  const districts = load("districts.yaml").districts;
  const regions = load("regions.yaml").regions;
  const parties = load("parties.yaml").parties;
  const meta = load("election.yaml").election;

  // election.yaml
  if (!isDate(String(meta.election_day))) fail(`${election}/election.yaml`, "election_day invalid");
  for (const d of meta.dates ?? []) checkSource(`${election}/election.yaml`, `date ${d.date}`, d.source);

  // uniqueness of slugs
  for (const [label, list] of [["district", districts], ["region", regions], ["party", parties]]) {
    const seen = new Set();
    for (const item of list) {
      if (!item.slug || !/^[a-z0-9-]+$/.test(item.slug)) fail(`${election}/${label}s.yaml`, `bad slug: ${item.slug}`);
      if (seen.has(item.slug)) fail(`${election}/${label}s.yaml`, `duplicate slug: ${item.slug}`);
      seen.add(item.slug);
      if (!item.name) fail(`${election}/${label}s.yaml`, `${item.slug}: name required`);
    }
  }

  const districtSlugs = new Set(districts.map((d) => d.slug));
  const regionSlugs = new Set(regions.map((r) => r.slug));
  const partySlugs = new Set(parties.map((p) => p.slug));

  for (const d of districts) {
    if (d.incumbent_party && !partySlugs.has(d.incumbent_party)) {
      fail(`${election}/districts.yaml`, `${d.slug}: unknown incumbent_party '${d.incumbent_party}'`);
    }
    if (d.region && !regionSlugs.has(d.region)) {
      fail(`${election}/districts.yaml`, `${d.slug}: unknown region '${d.region}'`);
    }
  }

  // retirements (optional file)
  try {
    const retirements = load("retirements.yaml").retirements ?? [];
    for (const r of retirements) {
      const file = `${election}/retirements.yaml`;
      if (!r.name) fail(file, "retirement missing name");
      if (!partySlugs.has(r.party)) fail(file, `${r.name}: unknown party '${r.party}'`);
      if (!["MLA", "MLC"].includes(r.role)) fail(file, `${r.name}: role must be MLA|MLC`);
      const validSeats = r.role === "MLC" ? regionSlugs : districtSlugs;
      if (!validSeats.has(r.seat)) fail(file, `${r.name}: unknown seat '${r.seat}' for role ${r.role}`);
      if (!isDate(String(r.announced))) fail(file, `${r.name}: announced must be YYYY-MM-DD`);
      checkSource(file, r.name, r.source);
    }
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }

  // council members (optional file) — who currently holds each upper-house seat
  try {
    const members = load("council-members.yaml").council_members ?? [];
    const file = `${election}/council-members.yaml`;
    const perRegion = {};
    for (const m of members) {
      if (!m.name) fail(file, "council member missing name");
      if (!partySlugs.has(m.party)) fail(file, `${m.name}: unknown party '${m.party}'`);
      if (!regionSlugs.has(m.region)) fail(file, `${m.name}: unknown region '${m.region}'`);
      checkSource(file, m.name, m.source);
      perRegion[m.region] = (perRegion[m.region] ?? 0) + 1;
    }
    // Each Victorian Legislative Council region returns exactly five members.
    // A miscount means a member was dropped or duplicated during entry.
    for (const r of regions) {
      const n = perRegion[r.slug] ?? 0;
      if (members.length && n !== r.seats) {
        fail(file, `${r.slug}: ${n} members recorded, expected ${r.seats}`);
      }
    }
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }

  // candidates
  const candDir = join(dir, "candidates");
  let count = 0;
  for (const f of readdirSync(candDir)) {
    if (f.startsWith("_") || !f.endsWith(".yaml")) continue;
    count++;
    const file = `${election}/candidates/${f}`;
    const c = parse(readFileSync(join(candDir, f), "utf8"))?.candidate;
    if (!c) { fail(file, "missing top-level 'candidate' key"); continue; }

    if (!c.name) fail(file, "name required");
    if (!partySlugs.has(c.party)) fail(file, `unknown party: ${c.party}`);
    if (!["assembly", "council"].includes(c.chamber)) fail(file, `chamber must be assembly|council`);
    const contests = c.chamber === "council" ? regionSlugs : districtSlugs;
    if (!contests.has(c.contest)) fail(file, `unknown ${c.chamber} contest: ${c.contest}`);
    if (!STATUSES.includes(c.status)) fail(file, `invalid status: ${c.status}`);

    if (!Array.isArray(c.history) || c.history.length === 0) {
      fail(file, "history must have at least one entry");
    } else {
      for (const h of c.history) {
        if (!STATUSES.includes(h.status)) fail(file, `history: invalid status ${h.status}`);
        if (!isDate(String(h.date))) fail(file, `history ${h.status}: date must be YYYY-MM-DD`);
        checkSource(file, `history ${h.status}`, h.source);
      }
      const last = c.history[c.history.length - 1];
      if (last.status !== c.status) fail(file, `status '${c.status}' != last history entry '${last.status}'`);
    }

    // filename convention: <contest>--<name-slug>.yaml
    if (!f.startsWith(`${c.contest}--`)) fail(file, `filename must start with '${c.contest}--'`);
  }

  // polls (optional directory) — statewide VI ledger; see docs/POLL-METHODOLOGY.md
  const pollDir = join(dir, "polls");
  let pollCount = 0;
  if (existsSync(pollDir) && statSync(pollDir).isDirectory()) {
    const COMMISSIONER_TYPES = [
      "media", "self", "academic", "excluded_advocacy", "party", "union", "candidate",
    ];
    const EXCLUDED_TYPES = new Set(["excluded_advocacy", "party", "union", "candidate"]);
    const MODES = ["online", "sms", "phone", "mixed", "other"];
    const PRIMARY_KEYS = ["alp", "lnp", "onp", "grn", "others"];

    for (const f of readdirSync(pollDir)) {
      if (f.startsWith("_") || !f.endsWith(".yaml")) continue;
      pollCount++;
      const file = `${election}/polls/${f}`;
      const raw = parse(readFileSync(join(pollDir, f), "utf8"));
      const p = raw?.poll ?? raw;
      if (!p || typeof p !== "object") {
        fail(file, "missing poll fields");
        continue;
      }
      if (!p.id) fail(file, "id required");
      if (!p.pollster) fail(file, "pollster required");
      if (!p.commissioner) fail(file, "commissioner required");
      if (!COMMISSIONER_TYPES.includes(p.commissioner_type)) {
        fail(file, `invalid commissioner_type: ${p.commissioner_type}`);
      }
      if (!isDate(String(p.fieldwork_start))) fail(file, "fieldwork_start must be YYYY-MM-DD");
      if (!isDate(String(p.fieldwork_end))) fail(file, "fieldwork_end must be YYYY-MM-DD");
      if (p.fieldwork_end < p.fieldwork_start) fail(file, "fieldwork_end before fieldwork_start");
      if (!Number.isInteger(p.sample_size) || p.sample_size < 1) {
        fail(file, "sample_size must be a positive integer");
      }
      if (!MODES.includes(p.mode)) fail(file, `invalid mode: ${p.mode}`);
      if (!p.population) fail(file, "population required");
      if (!p.primaries || typeof p.primaries !== "object") {
        fail(file, "primaries required");
      } else {
        let sum = 0;
        for (const k of PRIMARY_KEYS) {
          const v = p.primaries[k];
          if (typeof v !== "number" || v < 0 || v > 100) {
            fail(file, `primaries.${k} must be a number 0–100`);
          } else {
            sum += v;
          }
        }
        if (Math.abs(sum - 100) > 0.6) {
          fail(file, `primaries sum to ${sum.toFixed(1)}, expected ~100`);
        }
      }
      if (!["allocated", "excluded", "not-stated"].includes(p.undecided_handling)) {
        fail(file, `invalid undecided_handling: ${p.undecided_handling}`);
      }
      if (typeof p.eligible_for_average !== "boolean") {
        fail(file, "eligible_for_average must be boolean");
      }
      if (EXCLUDED_TYPES.has(p.commissioner_type) && p.eligible_for_average) {
        fail(file, "eligible_for_average must be false for party/union/advocacy commissioner");
      }
      if (!p.eligible_for_average && !p.exclusion_reason) {
        fail(file, "exclusion_reason required when not eligible for average");
      }
      if (!Array.isArray(p.sources) || p.sources.length === 0) {
        fail(file, "at least one source required");
      } else {
        p.sources.forEach((s, i) => checkSource(file, `sources[${i}]`, s));
      }
    }
  }

  console.log(
    `${election}: ${districts.length} districts, ${regions.length} regions, ${parties.length} parties, ${count} candidates, ${pollCount} polls`
  );
}

if (errors) { console.error(`\n${errors} error(s)`); process.exit(1); }
console.log("OK: all data valid");
