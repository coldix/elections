import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { buildPollFeed, marginOfError, pollsterKey, whatChanged } from "../scripts/lib/poll-feed.mjs";
import { buildForecast, classify, statewideTpp, FLOW_SCENARIOS } from "../scripts/lib/forecast.mjs";

const p = (o) => ({ pollster: "DemosAU", sample_size: 1000, design_effect: null, fieldwork_start: "2026-08-01", fieldwork_end: "2026-08-05", ...o });

test("margin of error: stated wins, else estimated with deff 1.3", () => {
  assert.deepEqual(marginOfError(p({ margin_of_error: 3.9 })), { value: 3.9, stated: true });
  assert.deepEqual(marginOfError(p({})), { value: 3.5, stated: false });
});

test("pollster aliases collapse", () => {
  assert.equal(pollsterKey("Resolve Strategic"), pollsterKey("resolve"));
  assert.equal(pollsterKey("Newspoll / Pyxis"), "newspoll");
});

test("what-changed bullets are 2–4 and flag moves outside MoE", () => {
  const prev = p({ primaries: { alp: 30, lnp: 30, onp: 20, grn: 12, others: 8 } });
  const cur = p({ sample_size: 1100, fieldwork_end: "2026-09-05", primaries: { alp: 25, lnp: 31, onp: 24, grn: 12, others: 8 } });
  const b = whatChanged(cur, prev, { value: 3.5, stated: false }, "nsw");
  assert.ok(b.length >= 2 && b.length <= 4);
  assert.match(b[0], /Labor down 5 to 25%/);
  assert.match(b.join(" "), /more than the ±3.5-point margin/);
  const first = whatChanged(cur, null, { value: 3.5, stated: false }, "nsw");
  assert.equal(first.length, 2);
});

test("feed covers every ledger, each entry sourced, newest first", () => {
  const feed = buildPollFeed();
  for (const j of ["nsw", "vic", "qld", "sa", "wa", "tas", "federal"]) {
    assert.ok(feed.some((e) => e.jurisdiction === j), `missing ${j}`);
  }
  for (const e of feed) {
    assert.ok(e.sources.length > 0);
    assert.ok(e.bullets.length >= 2 && e.bullets.length <= 4);
  }
  for (let i = 1; i < feed.length; i++) assert.ok(feed[i - 1].fieldwork_end >= feed[i].fieldwork_end);
});

test("forecast: ratings, scenario ordering and no-change identity", () => {
  assert.equal(classify(2.9), "doubt");
  assert.equal(classify(-4), "leaning");
  assert.equal(classify(6.5), "firm");
  const base = { alp: 36.66, lnp: 34.49, grn: 11.5, onp: 0.28, others: 17.08, tpp_alp: 55 };
  assert.equal(statewideTpp(base, base, FLOW_SCENARIOS[1]), 55);
  const results = parse(readFileSync(new URL("../data/vic2026/district-results-2022.yaml", import.meta.url), "utf8"));
  const districts = parse(readFileSync(new URL("../data/vic2026/districts.yaml", import.meta.url), "utf8")).districts;
  const fc = buildForecast({ alp: 30, lnp: 32, grn: 13, onp: 15, others: 10 }, results, districts);
  assert.equal(fc.total, 88);
  assert.ok(fc.ranges.low.labor_ahead <= fc.ranges.central.labor_ahead);
  assert.ok(fc.ranges.central.labor_ahead <= fc.ranges.high.labor_ahead);
  assert.equal(fc.banner, "Forecast: our model, not a prediction of the result");
});
