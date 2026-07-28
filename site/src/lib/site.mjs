// Site-level constants. Kept out of scripts/lib/data.mjs because these are
// presentation concerns, not data.

export const SITE = {
  name: "Australian Election Tracker",
  short: "Election Tracker",

  // Canonical origin. Change this and the `site` value in astro.config.mjs
  // together — everything else on the site derives from here.
  url: "https://electiontracker.au",
  domain: "electiontracker.au",
  // Secondary registration. 301-redirects to the matching path on the
  // canonical domain at the edge; it never serves content, so there is no
  // duplicate-content split. See docs/DEPLOYMENT.md.
  altDomain: "electiontracker.com.au",

  tagline: "Independent, sourced and machine-readable Australian election information",
  repo: "https://github.com/coldix/elections",
  issues: "https://github.com/coldix/elections/issues/new",
  email: "elections@electiontracker.au",
  publisher: "OZE",
  publisherUrl: "https://oze.net.au",
};

/** How reusers should credit the data under CC BY 4.0. */
export const ATTRIBUTION = SITE.domain;

/** Social presence. Listed so the footer and about page stay in step. */
export const SOCIAL = {
  facebook: "https://www.facebook.com/election.tracker.au/",
};

/**
 * Last review date for the legal pages. Bump whenever privacy, terms or the
 * disclaimer change materially — the pages display it, and a stale date on a
 * legal page is worse than none.
 */
export const LEGAL_UPDATED = "2026-07-29";

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
