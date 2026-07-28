// Site-level constants. Kept out of scripts/lib/data.mjs because these are
// presentation concerns, not data.

export const SITE = {
  name: "Australian Election Tracker",
  short: "Election Tracker",
  url: "https://elections.oze.net.au",
  tagline: "Independent, sourced and machine-readable Australian election information",
  repo: "https://github.com/coldix/elections",
  issues: "https://github.com/coldix/elections/issues/new",
  publisher: "OZE",
  publisherUrl: "https://oze.net.au",
};

/**
 * Party colours, used ONLY inside party-specific data visualisation.
 * Conventional Australian party colours so charts read correctly at a glance;
 * they never appear in site chrome. Parties without a widely recognised colour
 * get a neutral, so the palette can't imply prominence.
 */
export const PARTY_COLOURS = {
  labor: "#C8102E",
  liberal: "#1B4F9C",
  nationals: "#0B7A4B",
  greens: "#1E9E43",
  "one-nation": "#E8730C",
  "legalise-cannabis": "#4C8C2B",
  "animal-justice": "#C2185B",
  "victorian-socialists": "#A31621",
  libertarian: "#C99A00",
  "family-first": "#6A3FA0",
  dlp: "#8C4A2F",
  "shooters-fishers-farmers": "#5B6B23",
  "sustainable-australia": "#0F7C86",
  "end-mass-immigration": "#5A5A66",
  "new-democrats": "#3D6B99",
  "freedom-party": "#7A5C99",
  independent: "#6E6E7A",
};

export const partyColour = (slug) => PARTY_COLOURS[slug] ?? "#6E6E7A";

/** Where a status sits on the announced -> endorsed -> nominated pipeline. */
export const STATUS_STAGE = {
  announced: 1,
  endorsed: 2,
  nominated: 3,
  elected: 4,
};

export const formatDate = (iso, opts = {}) =>
  iso
    ? new Date(`${iso}T00:00:00+11:00`).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...opts,
      })
    : null;

export const formatDateLong = (iso) =>
  formatDate(iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
