import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import {
  loadDistrictResults2022,
  resultForDistrict,
  statewidePrimaryShare,
} from "../scripts/lib/district-results.mjs";

const districtPage = fileURLToPath(
  new URL("../site/src/vicpages/districts/[slug].astro", import.meta.url)
);
const component = fileURLToPath(
  new URL("../site/src/components/DistrictResult2022.astro", import.meta.url)
);
const validateSrc = fileURLToPath(new URL("../scripts/validate.mjs", import.meta.url));
const districtsYaml = fileURLToPath(
  new URL("../data/vic2026/districts.yaml", import.meta.url)
);

test("2022 results cover every Assembly district exactly once", () => {
  const data = loadDistrictResults2022("vic2026");
  assert.ok(data, "district-results-2022.yaml must load");
  const expected = parse(readFileSync(districtsYaml, "utf8")).districts.map((d) => d.slug);
  const got = data.districts.map((d) => d.slug);
  assert.deepEqual([...got].sort(), [...expected].sort());
  assert.equal(got.length, 88);
  assert.equal(new Set(got).size, 88);
});

test("Bass 2022 2CP matches the VEC Labor–Liberal finish", () => {
  const bass = resultForDistrict("bass");
  assert.ok(bass);
  assert.equal(bass.two_candidate_preferred.winner.name, "Jordan Crugnale");
  assert.equal(bass.two_candidate_preferred.winner.party, "labor");
  assert.equal(bass.two_candidate_preferred.winner.pct, 50.24);
  assert.equal(bass.two_candidate_preferred.runner_up.name, "Aaron Brown");
  assert.equal(bass.two_candidate_preferred.runner_up.party, "liberal");
  assert.equal(bass.two_candidate_preferred.runner_up.pct, 49.76);
  assert.equal(bass.two_candidate_preferred.margin_pp, 0.24);
  assert.equal(
    bass.source.url,
    "https://www.vec.vic.gov.au/results/state-election-results/2022-state-election-results/results-by-district/bass-district-results"
  );
});

test("Brunswick 2022 2CP is Greens versus Labor, not the ALP–Coalition 2PP", () => {
  const brunswick = resultForDistrict("brunswick");
  assert.ok(brunswick);
  assert.equal(brunswick.two_candidate_preferred.winner.party, "greens");
  assert.equal(brunswick.two_candidate_preferred.winner.name, "Tim Read");
  assert.equal(brunswick.two_candidate_preferred.winner.pct, 63.68);
  assert.equal(brunswick.two_candidate_preferred.runner_up.party, "labor");
  assert.equal(brunswick.two_candidate_preferred.runner_up.pct, 36.32);
  assert.equal(brunswick.two_party_preferred.winner.party, "labor");
  assert.equal(brunswick.two_party_preferred.winner.pct, 84.06);
  assert.equal(brunswick.two_party_preferred.runner_up.party, "liberal");
  assert.equal(brunswick.two_party_preferred.runner_up.pct, 15.94);
});

test("Narracan has a 2CP and no ALP–Coalition 2PP (supplementary election)", () => {
  const narracan = resultForDistrict("narracan");
  assert.ok(narracan);
  assert.equal(narracan.two_candidate_preferred.winner.party, "liberal");
  assert.equal(narracan.two_candidate_preferred.runner_up.party, "independent");
  assert.equal(narracan.two_party_preferred, undefined);
});

test("statewide 2022 Coalition primary is Liberal plus Nationals", () => {
  const data = loadDistrictResults2022("vic2026");
  assert.equal(statewidePrimaryShare(data.statewide, "labor"), 36.66);
  assert.equal(statewidePrimaryShare(data.statewide, "lnp"), 34.49);
  assert.equal(statewidePrimaryShare(data.statewide, "one-nation"), 0.28);
});

test("district pages mount historical results and do not project a 2026 winner", () => {
  const page = readFileSync(districtPage, "utf8");
  const ui = readFileSync(component, "utf8");
  const validate = readFileSync(validateSrc, "utf8");
  assert.match(page, /DistrictResult2022/);
  assert.match(page, /loadDistrictResults2022\("vic2026"\)/);
  assert.match(ui, /Last election \(2022\)/);
  assert.match(ui, /not a forecast of 2026/);
  assert.match(ui, /Statewide picture, not this seat/);
  assert.doesNotMatch(ui, /likely winner/i);
  assert.doesNotMatch(page, /likely winner/i);
  assert.match(validate, /validateDistrictResults2022\(/);
  assert.doesNotMatch(validate, /_pollsEndUnused|validatePolls_placeholder/);
});
