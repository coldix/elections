import { test } from "node:test";
import assert from "node:assert/strict";
import { hemicyclePoints, renderHemicycle } from "../site/src/lib/forecast-view.mjs";
import { buildMultiPartyForecast, loadVicInputs } from "../scripts/lib/forecast.mjs";

test("hemicycle has exactly n seats ordered left to right", () => {
  for (const n of [1, 45, 88, 151]) {
    const p = hemicyclePoints(n);
    assert.equal(p.length, n);
    for (let i = 1; i < n; i++) assert.ok(p[i - 1].a >= p[i].a);
  }
});

test("renders 88 linked seats from model data with consistent totals", async () => {
  const { results, districts } = await loadVicInputs();
  const mp = buildMultiPartyForecast({ alp: 24.3, lnp: 30.4, grn: 14.6, onp: 21.8, others: 8.9 }, results, districts);
  const html = renderHemicycle(mp);
  assert.equal((html.match(/<circle /g) || []).length, 88);
  assert.match(html, /45 to govern/);
  const nums = [...html.matchAll(/class="hc-num">(\d+)</g)].map((m) => +m[1]);
  const other = mp.ind_contest + mp.not_modelled;
  assert.equal(nums.reduce((a, b) => a + b, 0) + other, 88);
  const doubt = mp.seats.filter((s) => s.status === "modelled" && s.rating === "doubt");
  for (const s of doubt) assert.ok(html.includes(`hc-doubt`) && html.includes(`/districts/${s.slug}"`));
});
