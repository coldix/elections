export const POLICY_PROFILES = [
  {
    slug: "greens",
    label: "Greens",
    fullName: "Australian Greens Victoria",
    colourSlug: "greens",
    approach:
      "The recorded policies emphasise expanded public services and public ownership, rent controls, stronger climate and biodiversity rules, and progressive revenue measures.",
    themes: [
      "Public services and ownership",
      "Rent controls and public housing",
      "Climate and biodiversity action",
      "Progressive taxes and revenue",
    ],
    partyHref: "/parties/greens",
  },
  {
    slug: "labor",
    label: "Labor",
    fullName: "Australian Labor Party — Victorian Branch",
    colourSlug: "labor",
    approach:
      "The recorded policies combine the incumbent government's enacted measures and funded Budget programs with continued infrastructure, public-service and energy-transition delivery.",
    themes: [
      "Incumbent government delivery",
      "Budget-funded public services",
      "Infrastructure and housing supply",
      "Renewable energy transition",
    ],
    partyHref: "/parties/labor",
  },
  {
    slug: "coalition",
    label: "Liberal–Nationals",
    fullName: "Victorian Liberal–Nationals Coalition",
    colourSlug: "coalition",
    approach:
      "The combined record emphasises tax and charge relief, private-sector development, energy reliability, roads and transport, and tougher criminal-justice measures, while retaining separate Liberal and Nationals positions where they differ.",
    themes: [
      "Tax and charge relief",
      "Private investment and development",
      "Energy reliability and supply",
      "Law-and-order measures",
    ],
    partyHref: null,
  },
  {
    slug: "one-nation",
    label: "One Nation",
    fullName: "Pauline Hanson's One Nation",
    colourSlug: "one-nation",
    approach:
      "The recorded policies emphasise lower migration and population growth, conventional energy and lower costs, law and order, firearms rights, and opposition to Treaty and identity-based government policy.",
    themes: [
      "Lower migration and population growth",
      "Conventional energy and lower costs",
      "Law and order",
      "Opposition to Treaty and identity policy",
    ],
    partyHref: "/parties/one-nation",
  },
];

export const POLICY_PROFILE_BY_SLUG = new Map(
  POLICY_PROFILES.map((profile) => [profile.slug, profile])
);
