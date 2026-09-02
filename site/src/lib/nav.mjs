// Election-scoped chrome. Canonical URLs only — no Vic shorts in global nav.
import { SITE, OZE_MONTHLY_POLL, VIC2026, FEDERAL_49, NSW2027 } from "./site.mjs";

export function normalisePath(pathname) {
  return (pathname || "/").replace(/\/$/, "") || "/";
}

export function electionScope(path) {
  const p = normalisePath(path);
  if (p === VIC2026 || p.startsWith(`${VIC2026}/`)) return "vic";
  if (p === FEDERAL_49 || p.startsWith(`${FEDERAL_49}/`)) return "federal";
  if (p === NSW2027 || p.startsWith(`${NSW2027}/`)) return "nsw";
  return null;
}

export function pathIs(path, href, { prefix = false } = {}) {
  const p = normalisePath(path);
  const h = normalisePath(href);
  if (p === h) return true;
  return prefix && p.startsWith(`${h}/`);
}

function under(path, root, rest) {
  const p = normalisePath(path);
  const base = `${normalisePath(root)}/${rest}`;
  return p === base || p.startsWith(`${base}/`);
}

const ELECTIONS = {
  vic: {
    id: "vic",
    label: "Victoria 2026",
    hub: VIC2026,
    data: `${VIC2026}/data`,
    sections: [
      {
        href: `${VIC2026}/assembly`,
        label: "Seats",
        current: (path) =>
          under(path, VIC2026, "assembly") ||
          under(path, VIC2026, "districts") ||
          under(path, VIC2026, "open-seats"),
      },
      {
        href: `${VIC2026}/council`,
        label: "Council",
        current: (path) =>
          under(path, VIC2026, "council") || under(path, VIC2026, "regions"),
      },
      {
        href: `${VIC2026}/polls`,
        label: "Polls",
        current: (path) => under(path, VIC2026, "polls"),
      },
      {
        href: `${VIC2026}/parties/matrix`,
        label: "Policies",
        current: (path) => {
          if (under(path, VIC2026, "policies")) return true;
          if (under(path, VIC2026, "parties/matrix")) return true;
          if (under(path, VIC2026, "parties/issues")) return true;
          if (under(path, VIC2026, "parties/policies")) return true;
          const p = normalisePath(path);
          return /\/parties\/[^/]+\/policies$/.test(p);
        },
      },
      {
        href: `${VIC2026}/voting`,
        label: "Voting",
        current: (path) => under(path, VIC2026, "voting"),
      },
    ],
  },
  federal: {
    id: "federal",
    label: "Federal",
    hub: FEDERAL_49,
    data: `${FEDERAL_49}/data`,
    sections: [
      {
        href: `${FEDERAL_49}/representatives`,
        label: "House",
        current: (path) => under(path, FEDERAL_49, "representatives"),
      },
      {
        href: `${FEDERAL_49}/senate`,
        label: "Senate",
        current: (path) => under(path, FEDERAL_49, "senate"),
      },
      {
        href: `${FEDERAL_49}/polls`,
        label: "Polls",
        current: (path) => under(path, FEDERAL_49, "polls"),
      },
      {
        href: `${FEDERAL_49}/parties/matrix`,
        label: "Policies",
        current: (path) =>
          under(path, FEDERAL_49, "policies") ||
          under(path, FEDERAL_49, "parties/matrix"),
      },
    ],
  },
  nsw: {
    id: "nsw",
    label: "NSW 2027",
    hub: NSW2027,
    data: `${NSW2027}/data`,
    sections: [
      {
        href: `${NSW2027}/assembly`,
        label: "Assembly",
        current: (path) =>
          under(path, NSW2027, "assembly") || under(path, NSW2027, "districts"),
      },
      {
        href: `${NSW2027}/council`,
        label: "Council",
        current: (path) => under(path, NSW2027, "council"),
      },
    ],
  },
};

export function navFor(pathname) {
  const path = normalisePath(pathname);
  const scope = electionScope(path);
  const election = scope ? ELECTIONS[scope] : null;

  const global = [
    { href: VIC2026, label: "Victoria", current: scope === "vic" },
    { href: FEDERAL_49, label: "Federal", current: scope === "federal" },
    { href: "/elections", label: "Elections", current: path === "/elections" },
    { href: "/latest", label: "What's new", current: path === "/latest" },
  ];

  const sections = (election?.sections ?? []).map((item) => ({
    href: item.href,
    label: item.label,
    current: item.current(path),
  }));

  const dataHref = election?.data ?? `${VIC2026}/data`;
  const dataLabel = scope === "federal" ? "Federal data" : scope === "nsw" ? "NSW data" : "Open data";

  const more = [
    { href: "/methodology", label: "Methodology", current: path === "/methodology" },
    { href: dataHref, label: dataLabel, current: path === dataHref },
    { href: "/about", label: "About", current: path === "/about" || path.startsWith("/about/") },
    { href: OZE_MONTHLY_POLL.url, label: "Survey", external: true },
  ];

  const trackers = [
    { href: VIC2026, label: "Victoria 2026" },
    { href: FEDERAL_49, label: "Federal" },
    { href: NSW2027, label: "NSW 2027" },
    { href: "/elections", label: "All elections" },
    { href: "/latest", label: "What's new" },
  ];

  const thisElection = election
    ? [{ href: election.hub, label: election.label }, ...sections.map(({ href, label }) => ({ href, label }))]
    : [];

  const evidence = [
    { href: "/methodology", label: "Methodology" },
    { href: dataHref, label: dataLabel },
    { href: SITE.issues, label: "Submit a correction", external: true },
    { href: SITE.repo, label: "Source repository", external: true },
  ];

  const about = [
    ...(scope === "vic" || !scope
      ? [{ href: `${VIC2026}/voting`, label: "Voting in Victoria" }]
      : []),
    { href: "/about", label: "Independence statement" },
    { href: "/about#authorisation", label: "Legal authorisation" },
    { href: "/about#contact", label: "Contact" },
  ];

  const legal = [
    { href: "/disclaimer", label: "Disclaimer" },
    { href: "/privacy", label: "Privacy policy" },
    { href: "/terms", label: "Terms of use" },
  ];

  return {
    path,
    scope,
    election,
    global,
    sections,
    more,
    footer: { trackers, thisElection, evidence, about, legal },
  };
}
