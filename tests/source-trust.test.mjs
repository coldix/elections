/**
 * Source trust tiers.
 *
 * Encodes the hierarchy in docs/methodology.md § "Source quality hierarchy"
 * and ADR-14: original sources first, named news second, Wikipedia a
 * second-class fallback that must never rank equal to a commission, a
 * parliament or a party record.
 *
 * The point is triage order in the digest, not publication: a wiki row is a
 * pointer to check, so it is rated on the citation underneath it and sorts
 * last when it has none.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  classifySource,
  classifyLead,
  byTrust,
  collectNamedRefs,
  citedUrlFromWikitext,
  TRUST,
} from "../scripts/lib/source-trust.mjs";
import { parseWikiCandidates } from "../scripts/scan-leads.mjs";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const wikitext = readFileSync(join(FIXTURES, "wiki-assembly-table.wikitext"), "utf8");

const WIKI = "https://en.wikipedia.org/wiki/Candidates_of_the_2026_Victorian_state_election";

test("commissions, parliaments and parties are primary", () => {
  assert.equal(classifySource("https://www.vec.vic.gov.au/candidates").label, "primary");
  assert.equal(classifySource("https://www.aec.gov.au/anything").label, "primary");
  assert.equal(classifySource("https://www.parliament.vic.gov.au/members").label, "primary");
  assert.equal(classifySource("https://www.viclabor.org.au/our-team/x").label, "primary");
  assert.equal(classifySource("https://vic.liberal.org.au/team/x").label, "primary");
  assert.equal(classifySource("https://greens.org.au/vic/person/x").label, "primary");
  assert.equal(classifySource("https://www.victoriansocialists.org.au/candidates/x").label, "primary");
});

test("named news is secondary and ranks below primary", () => {
  const news = classifySource("https://www.theage.com.au/politics/victoria/story");
  assert.equal(news.label, "secondary");
  assert.ok(news.tier > TRUST.PRIMARY.tier);
  assert.ok(news.tier < TRUST.WIKI.tier);
});

test("wikipedia ranks below every other source", () => {
  const wiki = classifySource(WIKI);
  assert.equal(wiki.label, "wikipedia-only");
  assert.ok(wiki.tier > classifySource("https://www.vec.vic.gov.au/x").tier);
  assert.ok(wiki.tier > classifySource("https://www.theage.com.au/x").tier);
  assert.ok(wiki.tier > classifySource("https://www.facebook.com/x").tier);
  // Other wikis are treated the same way.
  assert.equal(classifySource("https://example.fandom.com/wiki/X").label, "wikipedia-only");
});

test("social ranks below named news", () => {
  // Only usable from a confirmed official account, which a scanner cannot
  // establish, so it must not outrank a named outlet.
  const social = classifySource("https://www.facebook.com/SomeCandidate");
  assert.equal(social.label, "social");
  assert.ok(social.tier > classifySource("https://www.abc.net.au/news/x").tier);
});

test("a wiki row is rated on the citation underneath it", () => {
  const partyCite = classifyLead({
    source_url: WIKI,
    cited_url: "https://www.viclabor.org.au/our-team/bridget-mullahy",
  });
  assert.equal(partyCite.label, "primary");
  assert.equal(partyCite.via_wiki, true, "should record that it was found via wiki");

  const newsCite = classifyLead({
    source_url: WIKI,
    cited_url: "https://www.theage.com.au/politics/victoria/story",
  });
  assert.equal(newsCite.label, "secondary");
});

test("a wiki row with no citation is the weakest lead there is", () => {
  const bare = classifyLead({ source_url: WIKI });
  assert.equal(bare.label, "wikipedia-only");
  assert.equal(bare.tier, TRUST.WIKI.tier);
  assert.ok(
    bare.tier > classifyLead({ source_url: WIKI, cited_url: "https://www.theage.com.au/x" }).tier,
    "an uncited wiki row must rank below a wiki row citing real reporting",
  );
});

test("a wiki row citing only another wiki does not get promoted", () => {
  const circular = classifyLead({
    source_url: WIKI,
    cited_url: "https://en.wikipedia.org/wiki/Something_else",
  });
  assert.equal(circular.label, "wikipedia-only");
});

test("non-wiki sources keep their own tier", () => {
  const partyPage = classifyLead({ source_url: "https://vic.onenation.org.au/candidates" });
  assert.equal(partyPage.label, "primary");
  assert.equal(partyPage.via_wiki, false);
});

test("byTrust sorts primary first and wikipedia last", () => {
  const leads = [
    { name: "wiki", trust: classifyLead({ source_url: WIKI }) },
    { name: "news", trust: classifyLead({ source_url: "https://www.abc.net.au/news/x" }) },
    { name: "party", trust: classifyLead({ source_url: "https://greens.org.au/vic/person/x" }) },
  ];
  leads.sort(byTrust);
  assert.deepEqual(leads.map((l) => l.name), ["party", "news", "wiki"]);
});

test("named references resolve to the source they cite", () => {
  // "<ref name=Barnes/>" points at a definition elsewhere on the page. Without
  // resolving it the row looks uncited and is unfairly buried.
  const refs = collectNamedRefs(wikitext);
  assert.ok(refs.size >= 2, "fixture should define named refs");
  assert.match(refs.get("Barnes") ?? "", /news24\.com\.au/);

  assert.equal(
    citedUrlFromWikitext("Michael Piastrino<ref name=Barnes/>", refs),
    refs.get("Barnes"),
  );
  // A direct url= still wins over a named ref.
  assert.match(
    citedUrlFromWikitext("X<ref>{{cite web|url=https://vec.vic.gov.au/a}}</ref>", refs),
    /vec\.vic\.gov\.au/,
  );
});

test("end to end: fixture leads are ranked, wiki-only last", () => {
  const leads = parseWikiCandidates(wikitext).map((l) => ({ ...l, trust: classifyLead(l) }));
  leads.sort(byTrust);

  assert.equal(leads[0].trust.label, "primary", "a party-cited lead should sort first");
  assert.equal(leads.at(-1).trust.label, "wikipedia-only", "an uncited wiki row should sort last");

  // Every lead carries a tier, and tiers are non-decreasing after the sort.
  let previous = 0;
  for (const lead of leads) {
    assert.ok(lead.trust.tier >= previous, "leads must be ordered by trust");
    previous = lead.trust.tier;
  }

  // A candidate cited to a party page is primary even though Wikipedia
  // is where the scanner found them.
  const moussi = leads.find((l) => l.name === "Nathalie Moussi");
  assert.equal(moussi.trust.label, "primary");
  assert.equal(moussi.trust.via_wiki, true);
  assert.match(moussi.cited_url, /vicliberal\.org\.au/);
});
