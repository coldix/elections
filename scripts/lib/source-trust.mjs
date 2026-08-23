/**
 * Source trust tiers for discovery leads.
 *
 * Implements the hierarchy in docs/methodology.md § "Source quality hierarchy"
 * and ADR-14: original sources first, named news second, Wikipedia a
 * second-class fallback that is never equal to a commission or party record.
 *
 * This ranks *leads*, not published records — encoding still requires a human.
 * Its job is to stop a wiki row looking as trustworthy as a party page in the
 * digest, and to surface the citation underneath a wiki row so that citation
 * can be checked directly instead of Wikipedia being taken at its word.
 */

/** Electoral commissions, parliaments and legislatures. */
const OFFICIAL_DOMAINS = [
  "vec.vic.gov.au",
  "aec.gov.au",
  "ecq.qld.gov.au",
  "ecsa.sa.gov.au",
  "elections.nsw.gov.au",
  "tec.tas.gov.au",
  "elections.wa.gov.au",
  "parliament.vic.gov.au",
  "parliament.nsw.gov.au",
  "aph.gov.au",
  "legislation.vic.gov.au",
];

/** Registered party and official campaign domains. */
const PARTY_DOMAINS = [
  "viclabor.org.au",
  "alp.org.au",
  "liberal.org.au",
  "vicliberal.org.au",
  "nationals.org.au",
  "vicnationals.org.au",
  "greens.org.au",
  "onenation.org.au",
  "victoriansocialists.org.au",
  "animaljusticeparty.org",
  "legalisecannabis.org.au",
  "sustainableaustralia.org.au",
  "libertarian.org.au",
  "familyfirst.org.au",
];

/** Wikis — discovery only, never a preferred durable source (ADR-14). */
const WIKI_DOMAINS = ["wikipedia.org", "wikimedia.org", "wikidata.org", "fandom.com"];

/**
 * Social platforms. Methodology allows these only from a confidently
 * identified official account, which a scanner cannot establish, so they rank
 * below named news rather than as party primaries.
 */
const SOCIAL_DOMAINS = [
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "threads.net",
  "tiktok.com",
  "youtube.com",
];

export const TRUST = {
  PRIMARY: { tier: 1, label: "primary" },
  SECONDARY: { tier: 2, label: "secondary" },
  SOCIAL: { tier: 3, label: "social" },
  WIKI: { tier: 4, label: "wikipedia-only" },
  NONE: { tier: 5, label: "uncited" },
};

function hostOf(url) {
  try {
    return new URL(String(url)).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function matches(host, domains) {
  return domains.some((d) => host === d || host.endsWith(`.${d}`));
}

/**
 * Classify a single URL into a trust tier.
 * @param {string|undefined} url
 * @returns {{tier: number, label: string, host: string}}
 */
export function classifySource(url) {
  const host = hostOf(url);
  if (!host) return { ...TRUST.NONE, host: "" };
  if (matches(host, WIKI_DOMAINS)) return { ...TRUST.WIKI, host };
  if (matches(host, OFFICIAL_DOMAINS)) return { ...TRUST.PRIMARY, host };
  if (matches(host, PARTY_DOMAINS)) return { ...TRUST.PRIMARY, host };
  if (matches(host, SOCIAL_DOMAINS)) return { ...TRUST.SOCIAL, host };
  // Named news and everything else with a real host: quality secondary.
  return { ...TRUST.SECONDARY, host };
}

/**
 * Trust for a lead. A lead discovered on Wikipedia is only as good as the
 * citation underneath it: a wiki row citing a party page is primary evidence
 * that merely happens to have been found via Wikipedia, while a wiki row with
 * no usable citation is the weakest thing in the digest.
 *
 * @param {{source_url?: string, cited_url?: string}} lead
 */
export function classifyLead(lead) {
  const cited = classifySource(lead.cited_url);
  if (lead.cited_url && cited.tier <= TRUST.SECONDARY.tier) {
    return { ...cited, via_wiki: classifySource(lead.source_url).label === TRUST.WIKI.label };
  }
  const direct = classifySource(lead.source_url);
  // A wiki page citing only itself, another wiki, or nothing stays lowest.
  if (direct.label === TRUST.WIKI.label && !lead.cited_url) {
    return { ...TRUST.WIKI, host: direct.host, via_wiki: true };
  }
  if (direct.label === TRUST.WIKI.label) {
    return { ...cited, via_wiki: true };
  }
  return { ...direct, via_wiki: false };
}

/** Sort comparator: most trustworthy first, stable within a tier. */
export function byTrust(a, b) {
  return (a.trust?.tier ?? 9) - (b.trust?.tier ?? 9);
}

/**
 * Map of named wikitext references ("<ref name=Barnes>...") to their URL, so a
 * row using the shorthand "<ref name=Barnes/>" is rated on the source it
 * actually cites rather than being written off as uncited.
 */
export function collectNamedRefs(wikitext) {
  const refs = new Map();
  const re = /<ref\s+name\s*=\s*"?([^">/]+?)"?\s*>([\s\S]*?)<\/ref>/gi;
  for (const m of String(wikitext || "").matchAll(re)) {
    const url = firstUrl(m[2]);
    const key = m[1].trim();
    if (url && !refs.has(key)) refs.set(key, url);
  }
  return refs;
}

function firstUrl(text) {
  const m = String(text || "").match(/\|\s*url\s*=\s*([^ |}\]\n]+)/i);
  return m ? m[1].trim() : undefined;
}

/**
 * First citation URL inside a wikitext cell, if any.
 * @param {string} cell
 * @param {Map<string,string>} [namedRefs] from collectNamedRefs
 */
export function citedUrlFromWikitext(cell, namedRefs) {
  const direct = firstUrl(cell);
  if (direct) return direct;
  if (namedRefs?.size) {
    const named = String(cell || "").match(/<ref\s+name\s*=\s*"?([^">/]+?)"?\s*\/?>/i);
    if (named) return namedRefs.get(named[1].trim());
  }
  return undefined;
}
