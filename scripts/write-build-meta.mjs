#!/usr/bin/env node
// Write build identity for the footer (git SHA + AEST timestamp).
// Run as part of `npm run build` so every deploy is stamped.
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "site", "src", "generated");
const outFile = join(outDir, "build-meta.json");

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

const now = new Date();
const aest = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Melbourne",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
  timeZoneName: "short",
}).format(now);

// Compact machine stamp: 2026-08-01T14:30:00+10:00 (or +11)
const aestIso = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Australia/Melbourne",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})
  .formatToParts(now)
  .reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});

// Melbourne offset (AEDT/AEST)
const offsetMin = -new Date(
  now.toLocaleString("en-US", { timeZone: "Australia/Melbourne" })
);
// simpler: format with formatToParts doesn't give offset; use a known formatter
const offsetFmt = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Melbourne",
  timeZoneName: "longOffset",
})
  .formatToParts(now)
  .find((p) => p.type === "timeZoneName")?.value; // e.g. GMT+11:00

const sha = sh("git rev-parse --short HEAD") || "unknown";
const shaFull = sh("git rev-parse HEAD") || null;
const dirty = sh("git status --porcelain") ? true : false;

// Display version: date.time-aest + short sha (not semver — data product, not app releases)
const ymd = `${aestIso.year}${aestIso.month}${aestIso.day}`;
const hm = `${aestIso.hour}${aestIso.minute}`;
const version = `${ymd}.${hm}-aest+${sha}${dirty ? "-dirty" : ""}`;

const meta = {
  version,
  git_sha: sha,
  git_sha_full: shaFull,
  git_dirty: dirty,
  built_at_utc: now.toISOString(),
  built_at_aest: aest,
  built_at_aest_offset: offsetFmt || "Australia/Melbourne",
  built_at_aest_compact: `${aestIso.year}-${aestIso.month}-${aestIso.day} ${aestIso.hour}:${aestIso.minute}:${aestIso.second}`,
};

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, JSON.stringify(meta, null, 2) + "\n");
// Also public for curl debugging
const publicDir = join(__dirname, "..", "site", "public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "build-meta.json"), JSON.stringify(meta, null, 2) + "\n");
console.log(`build-meta: ${version} (${aest})`);
