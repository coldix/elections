import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { buildCouncilForecast, forecastFromPrimaries, councilScenariosFor, backtest2022, countRegion, swingRegion, regionShares2022, QUOTA_PCT, COUNCIL_SCENARIOS, DEFAULT_COUNCIL_PARAMS } from "../scripts/lib/council.mjs";
import { baselineFromResults } from "../scripts/lib/forecast.mjs";
import { renderCouncilChamber, renderCouncilLive, renderLastSeatTable } from "../site/src/lib/council-view.mjs";

const council = parse(readFileSync(new URL("../data/vic2026/council-results-2022.yaml", import.meta.url), "utf8"));
const results = parse(readFileSync(new URL("../data/vic2026/district-results-2022.yaml", import.meta.url), "utf8"));
const base = baselineFromResults(results);

test("council data: 8 regions, groups sum to VEC formal, 5 sourced winners each", () => {
  assert.equal(council.regions.length, 8);
  for (const r of council.regions) {
    const sum = r.groups.reduce((a, g) => a + g.votes, 0);
    assert.equal(sum, r.formal, r.slug);
    assert.equal(r.formal + r.informal, r.total_votes, r.slug);
    assert.equal(r.elected_2022.length, 5, r.slug);
    assert.match(r.source.url, /^https:\/\/www\.vec\.vic\.gov\.au\//);
  }
  const winners = council.regions.flatMap((r) => r.elected_2022.map((e) => e.party));
  const n = (p) => winners.filter((x) => x === p).length;
  assert.equal(n("labor"), 15);
  assert.equal(n("liberal") + n("nationals"), 14);
  assert.equal(n("greens"), 4);
});

test("count: a party with two quotas wins two seats; always 5 winners", () => {
  const r = countRegion({ a: 40, b: 20, c: 18, d: 12, e: 10 }, COUNCIL_SCENARIOS[1]);
  assert.equal(r.winners.length, 5);
  assert.ok(r.winners.filter((w) => w.party === "a").length >= 2);
  assert.ok(QUOTA_PCT > 16.66 && QUOTA_PCT < 16.67);
});

test("zero swing leaves 2022 shares unchanged", () => {
  const r = council.regions[0];
  const s = regionShares2022(r);
  const z = swingRegion(s, base, base);
  for (const k of Object.keys(s)) assert.ok(Math.abs(s[k] - z[k]) < 1e-9);
});

test("forecast: 40 seats, consistent totals, notes have no em dash", () => {
  const avg = { alp: 24.3, lnp: 30.4, grn: 14.6, onp: 21.8, others: 8.9 };
  const fc = buildCouncilForecast(avg, base, council);
  assert.equal(fc.total, 40);
  assert.equal(Object.values(fc.totals).reduce((a, b) => a + b, 0), 40);
  for (const sc of COUNCIL_SCENARIOS) assert.equal(Object.values(fc.ranges[sc.id]).reduce((a, b) => a + b, 0), 40);
  for (const r of fc.regions) for (const s of r.seats) if (s.lower_confidence) assert.ok(s.note && !s.note.includes("\u2014"));
  const html = renderCouncilChamber(fc);
  assert.equal((html.match(/<circle /g) || []).length, 40);
});

test("2022 check runs over all 40 seats", () => {
  const bt = backtest2022(council);
  assert.equal(bt.total, 40);
  assert.ok(bt.matched >= 30, `matched ${bt.matched}`);
});

test("forecastFromPrimaries matches buildCouncilForecast at central defaults", () => {
  const avg = { alp: 24.3, lnp: 30.4, grn: 14.6, onp: 21.8, others: 8.9 };
  const fc = buildCouncilForecast(avg, base, council);
  const rebuilt = forecastFromPrimaries(
    fc.regions.map((r) => ({ slug: r.slug, name: r.name, primaries: r.primaries, group_names: r.group_names, elected_2022: r.elected_2022 })),
    councilScenariosFor(DEFAULT_COUNCIL_PARAMS),
  );
  assert.deepEqual(rebuilt.totals, fc.totals);
  assert.equal(rebuilt.regions.length, 8);
  for (let i = 0; i < 8; i++) {
    assert.deepEqual(rebuilt.regions[i].seats.map((s) => s.seat_party), fc.regions[i].seats.map((s) => s.seat_party));
  }
});

test("custom exhaust/sameBloc changes last seats without breaking 40-seat total", () => {
  const avg = { alp: 24.3, lnp: 30.4, grn: 14.6, onp: 21.8, others: 8.9 };
  const fc = buildCouncilForecast(avg, base, council);
  const strong = forecastFromPrimaries(
    fc.regions.map((r) => ({ slug: r.slug, name: r.name, primaries: r.primaries, group_names: r.group_names, elected_2022: r.elected_2022 })),
    councilScenariosFor({ exhaust: 0.1, sameBloc: 0.75 }),
  );
  assert.equal(strong.total, 40);
  assert.equal(Object.values(strong.totals).reduce((a, b) => a + b, 0), 40);
  const live = renderCouncilLive(strong, { label: "Your scenario" });
  assert.match(live, /Last seat in each region/);
  assert.equal((live.match(/<circle /g) || []).length, 40);
  const table = renderLastSeatTable(strong);
  assert.equal((table.match(/<tr/g) || []).length, 9); // header + 8 regions
});
