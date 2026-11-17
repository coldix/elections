import { test } from "node:test";
import assert from "node:assert/strict";
import {
  loadStateFoundationElection,
  stateFoundationSummaryFor,
} from "../scripts/lib/state-foundation.mjs";
import { ALL_STATUSES, listElections, electionKind } from "../scripts/lib/data.mjs";
import { navFor } from "../site/src/lib/nav.mjs";

const data = loadStateFoundationElection("nsw2027");

test("election set is unchanged: federal-49, nsw2027 (state-foundation), vic2026", () => {
  assert.deepEqual(listElections(), ["federal-49", "nsw2027", "vic2026"]);
  assert.equal(electionKind("nsw2027"), "state-foundation");
});

test("nsw2027 loads a candidates and retirements ledger in the vic2026 format", () => {
  assert.ok(data.candidates.length > 0, "candidates loaded");
  assert.ok(data.retirements.length > 0, "retirements loaded");
  const districts = new Set(data.districts.map((d) => d.slug));
  const parties = new Set(data.parties.map((p) => p.slug));
  for (const c of data.candidates) {
    assert.ok(parties.has(c.party), `${c.name}: party ${c.party}`);
    assert.equal(c.chamber, "assembly");
    assert.ok(districts.has(c.contest), `${c.name}: contest ${c.contest}`);
    assert.ok(ALL_STATUSES.includes(c.status), `${c.name}: status ${c.status}`);
    assert.equal(c.history.at(-1).status, c.status);
    for (const h of c.history) {
      assert.match(h.source.url, /^https:\/\//, `${c.name}: source url`);
      assert.ok(h.source.publisher, `${c.name}: publisher`);
      assert.ok(h.source.accessed, `${c.name}: accessed`);
    }
  }
});

test("retirements include the announced NSW departures and match sitting members", () => {
  const byName = new Map(data.retirements.map((r) => [r.name, r]));
  const expected = {
    "Jordan Lane": ["liberal", "ryde", "2026-11-06"],
    "Mark Coure": ["liberal", "oatley", "2026-11-03"],
    "Sonia Hornery": ["labor", "wallsend", "2026-11-03"],
    "James Griffin": ["liberal", "manly", "2026-09-02"],
    "Alister Henskens": ["liberal", "wahroonga", "2026-09-11"],
  };
  for (const [name, [party, seat, date]] of Object.entries(expected)) {
    const r = byName.get(name);
    assert.ok(r, `${name} retirement present`);
    assert.equal(r.party, party);
    assert.equal(r.seat, seat);
    assert.equal(String(r.announced), date);
  }
  const liberals = data.retirements.filter((r) => r.party === "liberal");
  assert.equal(liberals.length, 7, "seven Liberal MLAs not recontesting");
  for (const r of data.retirements) {
    const sitting = data.assemblyMembers.find((m) => m.district === r.seat);
    assert.equal(sitting?.name, r.name, `${r.name} is the sitting member for ${r.seat}`);
  }
});

test("district pages get their candidacies and retirement joined", () => {
  const ryde = data.districts.find((d) => d.slug === "ryde");
  assert.ok(ryde.retirement && ryde.retirement.name === "Jordan Lane");
  assert.ok(ryde.candidates.some((c) => c.name === "Lyndal Howison" && c.party === "labor"));
  const summary = stateFoundationSummaryFor(data);
  assert.equal(summary.candidates, data.candidates.length);
  assert.equal(summary.retirements, data.retirements.length);
  assert.ok(summary.districts_with_candidates > 0);
});

test("NSW nav has a Candidates section", () => {
  const nav = navFor("/elections/nsw/2027/candidates");
  assert.equal(nav.scope, "nsw");
  const cands = nav.sections.find((s) => s.label === "Candidates");
  assert.ok(cands);
  assert.equal(cands.current, true);
  assert.equal(nav.sections.filter((s) => s.current).length, 1);
});
