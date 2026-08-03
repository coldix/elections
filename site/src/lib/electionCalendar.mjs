import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const ALLOWED_STATUSES = new Set([
  "confirmed",
  "fixed_cycle",
  "window",
  "not_fixed",
  "periodic",
]);

function findCalendarFile() {
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
      const candidate = join(dir, "data", "election-calendar.yaml");
      if (existsSync(candidate)) return candidate;
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  throw new Error("could not locate data/election-calendar.yaml");
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

function validateEntry(entry, section) {
  const label = entry?.election_name ?? `${section} entry`;
  if (!entry?.jurisdiction || !entry?.name || !entry?.date_label || !entry?.date_sort) {
    throw new Error(`${label}: missing required election calendar fields`);
  }
  if (!validDate(entry.date_sort)) throw new Error(`${label}: date_sort must be YYYY-MM-DD`);
  if (!ALLOWED_STATUSES.has(entry.status)) throw new Error(`${label}: invalid status '${entry.status}'`);
  if (!validSource(entry.source)) throw new Error(`${label}: missing or invalid source`);

  for (const key of ["polling_day", "earliest", "latest"]) {
    if (entry[key] && !validDate(entry[key])) {
      throw new Error(`${label}: ${key} must be YYYY-MM-DD`);
    }
  }
}

export const ELECTION_DATE_STATUS = {
  confirmed: {
    label: "Confirmed",
    explanation: "An electoral commission or other authoritative body has published the polling date.",
  },
  fixed_cycle: {
    label: "Fixed-cycle date",
    explanation: "Calculated directly from a statutory recurring rule; exceptional postponement may still be possible.",
  },
  window: {
    label: "Legal window",
    explanation: "No polling day has been announced, so the lawful or normal election range is shown.",
  },
  not_fixed: {
    label: "Not fixed",
    explanation: "The term or expected year is known, but an earlier election may be called.",
  },
  periodic: {
    label: "Periodic election",
    explanation: "A recurring partial election held separately from the jurisdiction's general election.",
  },
};

export function loadElectionCalendar() {
  const raw = parse(readFileSync(findCalendarFile(), "utf8"));
  const calendar = raw?.calendar;
  if (!calendar || !validDate(calendar.updated)) {
    throw new Error("election calendar: missing calendar.updated date");
  }

  const elections = calendar.elections ?? [];
  const periodicElections = calendar.periodic_elections ?? [];
  if (!Array.isArray(elections) || elections.length === 0) {
    throw new Error("election calendar: elections must be a non-empty array");
  }

  elections.forEach((entry) => validateEntry(entry, "general"));
  periodicElections.forEach((entry) => validateEntry(entry, "periodic"));

  return {
    ...calendar,
    elections: [...elections].sort((a, b) => a.date_sort.localeCompare(b.date_sort)),
    periodicElections: [...periodicElections].sort((a, b) =>
      a.date_sort.localeCompare(b.date_sort)
    ),
  };
}
