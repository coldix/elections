/**
 * Fixture tests for the discovery scanner's parsers.
 *
 * These guard the name-parsing defects fixed in #25. Each one could silently
 * drop a candidate or file a real person under the wrong party — failures that
 * are invisible in the digest, because a lead that is never emitted looks
 * exactly like a lead that does not exist.
 *
 * Fixtures are verbatim rows from the live sources, so they keep reflecting
 * the markup actually published rather than an idealised version of it.
 * No network: the parsers are pure and imported directly.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  cleanWikiCell,
  splitWikiRows,
  parseWikiCandidates,
  parseOneNation,
  looksLikeName,
} from "../scripts/scan-leads.mjs";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const wikitext = readFileSync(join(FIXTURES, "wiki-assembly-table.wikitext"), "utf8");
const onenationHtml = readFileSync(join(FIXTURES, "onenation-candidates.html"), "utf8");

const wikiLeads = parseWikiCandidates(wikitext);
const find = (name) => wikiLeads.find((l) => l.name === name);

test("clean row parses every column to the right party", () => {
  // Box Hill has no wrapped citations — the control case.
  assert.equal(find("Sally Houguet")?.party, "liberal");
  assert.equal(find("Aaron Qin")?.party, "greens");
  assert.equal(find("Saravina Afaj")?.party, "victorian-socialists");
  assert.equal(find("Sally Houguet")?.contest, "box-hill");
});

test("column 5 is One Nation, not Socialists", () => {
  // Columns run: Electorate | Held by | Labor | Coalition | Greens |
  // One Nation | Socialists | Other. Reading column 5 as Socialists filed
  // every One Nation candidate under the wrong party and skipped the
  // Socialists column entirely.
  const piastrino = find("Michael Piastrino");
  assert.ok(piastrino, "One Nation candidate must be extracted");
  assert.equal(piastrino.party, "one-nation");
  assert.equal(piastrino.contest, "berwick");

  const nalinda = find("Nalinda Amarasiri Gunawardana");
  assert.ok(nalinda, "Socialists column must be read");
  assert.equal(nalinda.party, "victorian-socialists");
});

test("a cell opened with || is one cell, not two", () => {
  // Berwick's Socialists cell starts with "||". Treating that as an empty
  // cell plus a real one would shift the remaining columns.
  assert.equal(find("Nalinda Amarasiri Gunawardana")?.party, "victorian-socialists");
  assert.ok(
    !wikiLeads.some((l) => l.name.startsWith("|")),
    "no name should retain a leading pipe",
  );
});

test("a citation wrapping across lines does not corrupt the name", () => {
  // Sydenham's Liberal cell ends mid-{{Cite web}}, continuing on the next
  // line. Previously yielded "Nathalie Moussi {{Cite web", which also
  // defeated ledger dedup and made a known candidate look new.
  assert.ok(find("Nathalie Moussi"), "Moussi should parse with a clean name");
  assert.equal(find("Nathalie Moussi").party, "liberal");
  assert.equal(find("Nathalie Moussi").contest, "sydenham");
  assert.equal(
    wikiLeads.filter((l) => l.name.includes("Cite")).length,
    0,
    "no lead should carry citation markup in its name",
  );
});

test("a wrapped citation does not shift later columns", () => {
  // The continuation line was counted as a table cell, pushing every later
  // column along by one. Maggie Jane fell past the mapped columns and was
  // dropped entirely; a wrap one column earlier would have misattributed her.
  const jane = find("Maggie Jane");
  assert.ok(jane, "Greens candidate after a wrapped citation must survive");
  assert.equal(jane.party, "greens");
  assert.equal(jane.contest, "sydenham");
});

test("two candidates in one cell split into separate leads", () => {
  // Ripon is a three-cornered contest: Nationals and Liberal in one cell
  // separated by <br>. Previously merged into "Jo Armstrong / Megan Read"
  // and attributed wholly to the Nationals.
  assert.equal(find("Jo Armstrong")?.party, "nationals");
  assert.equal(find("Megan Read")?.party, "liberal");
  assert.equal(find("Jo Armstrong")?.contest, "ripon");
  assert.equal(
    wikiLeads.filter((l) => l.name.includes("/")).length,
    0,
    "no lead should merge two people into one name",
  );
});

test("no lead escapes with parse debris in its name", () => {
  for (const lead of wikiLeads) {
    assert.ok(
      looksLikeName(lead.name),
      `lead name contains markup or a URL: ${JSON.stringify(lead.name)}`,
    );
    assert.ok(lead.name.length >= 3 && lead.name.length <= 60);
  }
  assert.ok(wikiLeads.length >= 10, "fixture should yield a useful number of leads");
});

test("splitWikiRows keeps a wrapped citation inside one cell", () => {
  const section = wikitext.split("==Legislative Assembly==")[1].split("==Legislative Council==")[0];
  const rows = splitWikiRows(section);
  const sydenham = rows.find((r) => r[0]?.includes("Sydenham"));
  assert.ok(sydenham, "Sydenham row should parse");
  // District, Held by, Labor, Liberal, Greens, One Nation, Victorian Socialists
  assert.ok(sydenham[3].includes("Nathalie Moussi"));
  assert.ok(
    sydenham[3].includes("vicliberal.org.au"),
    "the wrapped continuation belongs to the same cell",
  );
  assert.ok(sydenham[4].includes("Maggie Jane"), "Greens column must not shift");
});

test("cleanWikiCell strips citations, links and unclosed markup", () => {
  assert.equal(cleanWikiCell("|'''[[Paul Hamer]]'''<ref name=Incumbents/>".slice(1)), "Paul Hamer");
  assert.equal(cleanWikiCell("Ada Lovelace<ref>{{cite web|url=https://x.test}}</ref>"), "Ada Lovelace");
  // Truncated markup: the name always precedes the citation.
  assert.equal(cleanWikiCell("Ada Lovelace ([[Party|L]])<ref>{{Cite web"), "Ada Lovelace");
  assert.equal(cleanWikiCell("Ada Lovelace {{Cite"), "Ada Lovelace");
});

test("looksLikeName rejects markup, URLs and pipes", () => {
  assert.ok(looksLikeName("Rikkie-Lee Tyrrell"));
  assert.ok(looksLikeName("Michael O'Brien"));
  assert.ok(!looksLikeName("Nathalie Moussi {{Cite web"));
  assert.ok(!looksLikeName("url=https://example.test"));
  assert.ok(!looksLikeName("website=greens.org.au|title=X"));
});

test("One Nation names may start with a hyphenated first name", () => {
  const leads = parseOneNation(onenationHtml);
  const byName = (n) => leads.find((l) => l.name === n);

  // "[A-Z][a-z]+" could not start on "Rikkie-Lee", so the match began at
  // "Lee" — truncating the name and dragging "Rikkie" into the seat.
  const tyrrell = byName("Rikkie-Lee Tyrrell");
  assert.ok(tyrrell, "hyphenated first name must parse whole");
  assert.equal(tyrrell.contest, "northern-victoria");
  assert.equal(tyrrell.chamber, "council");
  assert.equal(
    leads.filter((l) => l.name === "Lee Tyrrell").length,
    0,
    "the truncated name must not appear",
  );

  // Terminating the seat only on a dash/pipe matched almost nothing on this
  // page, so most cards were silently skipped. Every candidate in the
  // fixture must now come through, with the trailing call-to-action
  // ("... Pakenham Support") trimmed off the seat.
  assert.equal(leads.length, 3, "every candidate card must be extracted");
  assert.equal(byName("Warren Pickering")?.contest, "pakenham");
  assert.equal(byName("Warren Pickering")?.chamber, "assembly");
  assert.equal(byName("Chris Burson")?.contest, "western-victoria");

  for (const lead of leads) {
    assert.ok(looksLikeName(lead.name), `bad One Nation name: ${lead.name}`);
    assert.ok(!/\bRegion$/i.test(lead.contest ?? ""), "Region suffix should be stripped");
  }
});
