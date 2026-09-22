// Build-time feed of recent ledger changes for /latest.
import { loadPolls, PARTY_LABELS } from "../../../scripts/lib/polls.mjs";
import { loadElection, STATUS_LABELS } from "../../../scripts/lib/data.mjs";
import { loadStateFoundationElection } from "../../../scripts/lib/state-foundation.mjs";
import { VIC2026, FEDERAL_49, NSW2027, formatDate } from "./site.mjs";

const WINDOW_DAYS = 21;

/** Poll ledgers included on /latest (all jurisdictions with a statewide VI folder). */
const POLL_LEDGERS = [
  {
    electionId: "vic2026",
    jurisdiction: "vic",
    href: `${VIC2026}/polls`,
    kicker: "Victorian Assembly poll",
  },
  {
    electionId: "federal-49",
    jurisdiction: "federal",
    href: `${FEDERAL_49}/polls`,
    kicker: "Federal House poll",
  },
  {
    electionId: "nsw2027",
    jurisdiction: "nsw",
    href: `${NSW2027}/polls`,
    kicker: "NSW Assembly poll",
  },
];

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
 * Feed date for a poll: prefer the latest source published date (release),
 * then fieldwork_end. Matches product intent for "what's new" (when the
 * release entered the public record), not average-window age.
 */
export function pollFeedDate(p) {
  const published = (Array.isArray(p.sources) ? p.sources : [])
    .map((s) => s?.published)
    .filter((d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d));
  if (published.length) {
    return published.sort().at(-1);
  }
  return p.fieldwork_end ?? null;
}

function mapPollItem(p, ledger) {
  const date = pollFeedDate(p);
  if (!date) return null;
  return {
    kind: "poll",
    date,
    jurisdiction: ledger.jurisdiction,
    href: ledger.href,
    kicker: ledger.kicker,
    title: `${pollsterLabel(p)} · fieldwork ending ${formatDate(p.fieldwork_end)}`,
    body: pollLine(p),
    n: p.sample_size,
    eligible_for_average: p.eligible_for_average !== false,
  };
}

/**
 * Notable foundation opens from election.yaml notes:
 * "Foundation open (YYYY-MM-DD): …"
 */
function foundationMilestones(electionId, href, kickerTitle) {
  let data;
  try {
    data = loadStateFoundationElection(electionId);
  } catch {
    return [];
  }
  const notes = Array.isArray(data.election?.notes) ? data.election.notes : [];
  const out = [];
  for (const note of notes) {
    const text = String(note);
    const m = text.match(/Foundation open \((\d{4}-\d{2}-\d{2})\)\s*:?\s*(.*)/i);
    if (!m) continue;
    const detail = (m[2] || text).replace(/\s+/g, " ").trim();
    out.push({
      kind: "foundation",
      date: m[1],
      jurisdiction: data.election?.jurisdiction ?? electionId,
      href,
      kicker: kickerTitle,
      title: `${data.election?.name ?? electionId} · foundation open`,
      body: detail.slice(0, 220) + (detail.length > 220 ? "…" : ""),
    });
  }
  return out;
}

/**
 * Recent sourced polls, Victorian candidacies, and foundation milestones,
 * newest first. Out-of-average polls are included (same as Vic/federal).
 */
export function loadLatest(options = {}) {
  const windowDays = options.windowDays ?? WINDOW_DAYS;
  const cutoff = options.cutoff ?? isoDaysAgo(windowDays);

  const polls = POLL_LEDGERS.flatMap((ledger) =>
    loadPolls(ledger.electionId)
      .map((p) => mapPollItem(p, ledger))
      .filter(Boolean)
  ).filter((item) => item.date >= cutoff);

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

  const foundations = foundationMilestones(
    "nsw2027",
    NSW2027,
    "NSW foundation"
  ).filter((item) => item.date >= cutoff);

  const kindRank = { poll: 0, foundation: 1, candidate: 2 };
  const items = [...polls, ...foundations, ...candidates].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    const ka = kindRank[a.kind] ?? 9;
    const kb = kindRank[b.kind] ?? 9;
    if (ka !== kb) return ka - kb;
    return (a.title || "").localeCompare(b.title || "");
  });

  return {
    cutoff,
    windowDays,
    items,
    polls: polls.sort((a, b) => (a.date < b.date ? 1 : -1)),
    foundations: foundations.sort((a, b) => (a.date < b.date ? 1 : -1)),
    candidates: candidates.sort((a, b) => (a.date < b.date ? 1 : -1)),
  };
}
