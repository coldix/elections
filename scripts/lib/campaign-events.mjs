// Sourced campaign events (debates, forums) — data/<election>/campaign-events.yaml.
// Neutral records only; validated by scripts/validate.mjs. Used by /latest and
// the Victorian leaders' debate page.
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

export function loadCampaignEvents(electionId = "vic2026") {
  const file = join(findDataDir(), electionId, "campaign-events.yaml");
  if (!existsSync(file)) return [];
  const events = parse(readFileSync(file, "utf8"))?.events ?? [];
  return [...events].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function findCampaignEvent(id, electionId = "vic2026") {
  return loadCampaignEvents(electionId).find((e) => e.id === id) ?? null;
}
