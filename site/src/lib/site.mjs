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
  // Google Search Console. Primary verification is by DNS (sc-domain), which
  // covers every subdomain and protocol. This meta tag is a second method so
  // verification survives a DNS change — the HTML-file method cannot be used
  // here because Cloudflare's drop-trailing-slash rule strips the .html
  // extension, and Google requires that exact URL to return 200.
  googleSiteVerification: "c1C819fHSzS0z2WXIPZE419OrNveoSyQy1LDXjijkiw",
  // Google Analytics 4 Measurement ID. Loaded sitewide from Base.astro.
  // See docs/DECISIONS.md ADR-12. Empty string disables the tag.
  gaMeasurementId: "G-CLH6BNKFEV",
  publisherUrl: "https://oze.net.au",
};

/** How reusers should credit the data under CC BY 4.0. */
export const ATTRIBUTION = SITE.domain;

/**
 * Project social presence only (Election Tracker brand).
 * Footer + privacy + JSON-LD sameAs. Do NOT put personal channels here
 * (e.g. mallacoota2020) — see docs/SOCIAL.md.
 */
export const SOCIAL = {
  facebook: "https://www.facebook.com/election.tracker.au/",
  youtube: "https://www.youtube.com/@electiontrackerau",
};

/** Display labels for SOCIAL keys (footer, privacy). */
export const SOCIAL_LABELS = {
  facebook: "Facebook",
  youtube: "YouTube",
  instagram: "Instagram",
  x: "X",
};

/**
 * Maintainer / publisher identity (Colin), not product brand channels.
 * Linked from /about only — not footer project icons, not Organization sameAs.
 * Tips with public sources welcome on X; LinkedIn is professional contact.
 */
export const MAINTAINER = {
  name: "Colin Dixon",
  x: "https://x.com/colindixon",
  xHandle: "@colindixon",
  linkedin: "https://www.linkedin.com/in/colindixon/",
  publisherUrl: SITE.publisherUrl,
};

/** Ordered list of { key, label, url } for defined project social links. */
export function socialLinks() {
  return Object.entries(SOCIAL)
    .filter(([, url]) => typeof url === "string" && url.length > 0)
    .map(([key, url]) => ({
      key,
      label: SOCIAL_LABELS[key] ?? key,
      url,
    }));
}

/**
 * Last review date for the legal pages. Bump whenever privacy, terms or the
 * disclaimer change materially — the pages display it, and a stale date on a
 * legal page is worse than none.
 */
export const LEGAL_UPDATED = "2026-08-09";

/**
 * Party colours, used ONLY inside party-specific data visualisation.
 * Conventional Australian party colours so charts read correctly at a glance;
 * they never appear in site chrome. Parties without a widely recognised colour
 * get a neutral, so the palette can't imply prominence.
 *
 * `coalition` is a virtual display column only. Its muted blue distinguishes the
 * combined view without pretending the Coalition is a sixth registered party.
 */
export const PARTY_COLOURS = {
  labor: "#C8102E",
  liberal: "#1B4F9C",
  nationals: "#0B7A4B",
  coalition: "#315B82",
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
  "socialist-alliance": "#D0342C",
  "west-party": "#8C6A3F",
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

/**
 * Format a calendar date (YYYY-MM-DD) for display.
 *
 * Date-only strings must not be shifted by the build host timezone. Cloudflare
 * (and other CI hosts) run in UTC; parsing midnight+11 without an explicit
 * display zone made every date render one day early on the live site
 * (e.g. election day Saturday 28 Nov → Friday 27 Nov).
 *
 * Parse as noon UTC so the instant falls on the same calendar day in Melbourne
 * under both AEST (+10) and AEDT (+11), and always format in Melbourne time.
 */
export const formatDate = (iso, opts = {}) =>
  iso
    ? new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...opts,
        timeZone: "Australia/Melbourne",
      })
    : null;

export const formatDateLong = (iso) =>
  formatDate(iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
