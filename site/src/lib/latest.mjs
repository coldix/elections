// Build-time feed of recent ledger changes for /latest.
import { loadPolls, PARTY_LABELS } from "../../../scripts/lib/polls.mjs";
import { loadElection, STATUS_LABELS } from "../../../scripts/lib/data.mjs";
import { VIC2026, FEDERAL_49, formatDate } from "./site.mjs";

const WINDOW_DAYS = 21;

function isoDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function pollLine(p) {
  return ["alp", "lnp", "onp", "grn", "others"]
    .map((k) => `${PARTY_LABELS[k]} ${Number(p.primaries[k]).toFixed(1).replace(/\.0$/, "")}%`)
    .join(" · ");
}

function pollsterLabel(p) {
  return String(p.pollster).replace(/\s+/g, " ").trim();
}

/**
 * Recent sourced polls and Victorian candidacies, newest first.
 */
export function loadLatest(options = {}) {
  const windowDays = options.windowDays ?? WINDOW_DAYS;
  const cutoff = isoDaysAgo(windowDays);

  const polls = [
    ...loadPolls("vic2026").map((p) => ({
      kind: "poll",
      date: p.fieldwork_end,
      jurisdiction: "vic",
      href: `${VIC2026}/polls`,
      kicker: "Victorian Assembly poll",
      title: `${pollsterLabel(p)} · fieldwork ending ${formatDate(p.fieldwork_end)}`,
      body: pollLine(p),
      n: p.sample_size,
    })),
    ...loadPolls("federal-49").map((p) => ({
      kind: "poll",
      date: p.fieldwork_end,
      jurisdiction: "federal",
      href: `${FEDERAL_49}/polls`,
      kicker: "Federal House poll",
      title: `${pollsterLabel(p)} · fieldwork ending ${formatDate(p.fieldwork_end)}`,
      body: pollLine(p),
      n: p.sample_size,
    })),
  ].filter((item) => item.date >= cutoff);

  const data = loadElection("vic2026");
  const contestName = new Map([
    ...data.districts.map((d) => [d.slug, d.name]),
    ...data.regions.map((r) => [r.slug, r.name]),
  ]);
  const partyName = new Map(data.parties.map((p) => [p.slug, p.short_name || p.name]));

  const candidates = data.candidates
    .filter((c) => c.latest_date && c.latest_date >= cutoff)
    .map((c) => {
      const latest = c.history[c.history.length - 1];
      const seat = contestName.get(c.contest) ?? c.contest;
      const party = partyName.get(c.party) ?? c.party;
      const href =
        c.chamber === "council"
          ? `${VIC2026}/regions/${c.contest}`
          : `${VIC2026}/districts/${c.contest}`;
      return {
        kind: "candidate",
        date: c.latest_date,
        jurisdiction: "vic",
        href,
        kicker: "Victorian candidacy",
        title: `${c.name} · ${STATUS_LABELS[latest.status] ?? latest.status}`,
        body: `${seat}${c.chamber === "council" ? " region" : ""} · ${party}`,
      };
    });

  const items = [...polls, ...candidates].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    if (a.kind !== b.kind) return a.kind === "poll" ? -1 : 1;
    return (a.title || "").localeCompare(b.title || "");
  });

  return {
    cutoff,
    windowDays,
    items,
    polls: polls.sort((a, b) => (a.date < b.date ? 1 : -1)),
    candidates: candidates.sort((a, b) => (a.date < b.date ? 1 : -1)),
  };
}
