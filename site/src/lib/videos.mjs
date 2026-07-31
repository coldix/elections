/**
 * Project YouTube explainers (channel @electiontrackerau).
 * Only videos listed here are eligible for on-site click-to-load embeds.
 * Canonical long-form home remains YouTube — see docs/SOCIAL.md.
 */

export const YOUTUBE_CHANNEL = "https://www.youtube.com/@electiontrackerau";

/** @typedef {{ id: string, title: string, blurb: string, youtubeTitle?: string }} ExplainerVideo */

/** @type {Record<string, ExplainerVideo>} */
export const VIDEOS = {
  /** What the tracker is — homepage / about */
  tracker: {
    id: "oKkD0mOhT9g",
    title: "What is Australian Election Tracker?",
    blurb:
      "Sourced candidate tracking for Victoria 2026 — 88 districts, 8 Council regions, open data, coverage caveats, and why the VEC stays authoritative for enrolment and voting.",
  },
  /** Preferential ballot numbering — primary for /voting */
  ballot: {
    id: "FNPDWVxz6Jo",
    title: "How to number your Victorian Assembly ballot",
    blurb:
      "Preferential voting in plain language: rank 1, 2, 3…, absolute majority, and why how-to-vote cards are suggestions only.",
  },
  /** Local district + tracker — /assembly */
  localSeat: {
    id: "VVuNXCEfYew",
    title: "Your local seat, not a statewide race",
    blurb:
      "Why the lower house is 88 local contests, open seats when members retire, and how this site records announced, endorsed and nominated candidates with sources.",
  },
  /** 8 Council regions landscapes — /regions */
  regions: {
    id: "tKmBl-0Ce6w",
    title: "Victoria’s 8 Legislative Council regions",
    blurb:
      "A tour of the five metropolitan and three country regions — geography and communities — and how each elects five upper-house members.",
  },
  /** Optional deeper prefs math — linked from /voting, not auto-embedded */
  spoiler: {
    id: "vVijxowyXsA",
    title: "Preferential voting and the spoiler effect",
    blurb:
      "How ranking and preference transfers stop vote-splitting in multi-candidate Assembly contests.",
  },
  /** Optional overview — linked, not auto-embedded */
  machinery: {
    id: "C6rv1y5swEw",
    title: "How a Victorian state election works",
    blurb:
      "Parliament’s two houses, paper ballots, scrutiny, and why independent candidate tracking exists.",
  },
};

export function watchUrl(id) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function embedUrl(id) {
  // privacy-enhanced domain; still Google when the user chooses to play
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
}

export function thumbUrl(id) {
  // Prefer maxres (16:9) when YouTube has it; hqdefault is often 4:3 with bars.
  // maxresdefault 404s on some videos — poster still works via browser if we use sddefault fallback later.
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}
