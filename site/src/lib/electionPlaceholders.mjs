import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { loadElectionCalendar } from "./electionCalendar.mjs";

function findDataFile() {
  const starts = [];
  try {
    starts.push(dirname(fileURLToPath(import.meta.url)));
  } catch {
    // Astro's bundled build may not expose a useful file URL.
  }
  starts.push(process.cwd());

  for (const start of starts) {
    let dir = resolve(start);
    for (let i = 0; i < 8; i++) {
      const candidate = join(dir, "data", "election-placeholders.yaml");
      if (existsSync(candidate)) return candidate;
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  throw new Error("could not locate data/election-placeholders.yaml");
}

function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validSource(source) {
  if (!source?.url || !source?.publisher || !source?.title || !validDate(source?.accessed)) {
    return false;
  }
  try {
    new URL(source.url);
    return true;
  } catch {
    return false;
  }
}

function validateChamber(chamber, label) {
  for (const key of ["name", "role", "constituencies", "election_scope", "voting_system"]) {
    if (!chamber?.[key]) throw new Error(`${label}: chamber missing ${key}`);
  }
  if (!Number.isInteger(chamber.seats) || chamber.seats < 1) {
    throw new Error(`${label}: chamber seats must be a positive integer`);
  }
}

function validatePlaceholder(entry) {
  const label = entry?.planned_path ?? "placeholder entry";
  if (!entry?.planned_path?.startsWith("/elections/")) {
    throw new Error(`${label}: planned_path must begin with /elections/`);
  }
  for (const key of ["summary", "parliament", "contest_summary", "tracking_status"]) {
    if (!entry?.[key]) throw new Error(`${label}: missing ${key}`);
  }
  if (!Number.isInteger(entry.total_members) || entry.total_members < 1) {
    throw new Error(`${label}: total_members must be a positive integer`);
  }
  if (!Array.isArray(entry.chambers) || entry.chambers.length === 0) {
    throw new Error(`${label}: chambers must be a non-empty array`);
  }
  entry.chambers.forEach((chamber) => validateChamber(chamber, label));
  if (!Array.isArray(entry.sources) || entry.sources.length === 0 || !entry.sources.every(validSource)) {
    throw new Error(`${label}: sources must contain valid official sources`);
  }
  if (entry.notes && !Array.isArray(entry.notes)) {
    throw new Error(`${label}: notes must be an array`);
  }
}

export function loadElectionPlaceholders() {
  const raw = parse(readFileSync(findDataFile(), "utf8"));
  const placeholders = raw?.placeholders;
  if (!placeholders || !validDate(placeholders.updated)) {
    throw new Error("election placeholders: missing placeholders.updated date");
  }

  const entries = placeholders.entries ?? [];
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("election placeholders: entries must be a non-empty array");
  }

  const seen = new Set();
  entries.forEach((entry) => {
    validatePlaceholder(entry);
    if (seen.has(entry.planned_path)) {
      throw new Error(`duplicate election placeholder path: ${entry.planned_path}`);
    }
    seen.add(entry.planned_path);
  });

  const calendar = loadElectionCalendar();
  const calendarEntries = [...calendar.elections, ...calendar.periodicElections];
  const calendarByPath = new Map(calendarEntries.map((entry) => [entry.planned_path, entry]));

  for (const entry of entries) {
    if (!calendarByPath.has(entry.planned_path)) {
      throw new Error(`${entry.planned_path}: placeholder has no matching calendar entry`);
    }
  }

  for (const entry of calendarEntries) {
    if (entry.jurisdiction !== "vic" && !seen.has(entry.planned_path)) {
      throw new Error(`${entry.planned_path}: future calendar entry has no placeholder page`);
    }
  }

  return entries
    .map((entry) => ({
      ...entry,
      ...calendarByPath.get(entry.planned_path),
      updated: placeholders.updated,
    }))
    .sort((a, b) => a.date_sort.localeCompare(b.date_sort));
}
