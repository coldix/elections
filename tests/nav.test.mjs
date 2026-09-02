import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { navFor, electionScope } from "../site/src/lib/nav.mjs";

const headerSrc = readFileSync(
  fileURLToPath(new URL("../site/src/components/Header.astro", import.meta.url)),
  "utf8"
);
const footerSrc = readFileSync(
  fileURLToPath(new URL("../site/src/components/Footer.astro", import.meta.url)),
  "utf8"
);

test("federal pages are not given Victorian Assembly or Vic /polls shorts", () => {
  const nav = navFor("/elections/federal/49/polls");
  assert.equal(nav.scope, "federal");
  assert.deepEqual(
    nav.sections.map((s) => s.href),
    [
      "/elections/federal/49/representatives",
      "/elections/federal/49/senate",
      "/elections/federal/49/polls",
      "/elections/federal/49/parties/matrix",
    ]
  );
  assert.equal(nav.sections.find((s) => s.label === "Polls").current, true);
  assert.ok(!nav.sections.some((s) => s.href.includes("/vic/")));
  assert.ok(!nav.footer.thisElection.some((s) => s.href === "/elections/vic/2026/assembly"));
  assert.ok(!nav.footer.evidence.some((s) => s.href === "/polls"));
});

test("Victorian Assembly marks Seats, not Policies", () => {
  const nav = navFor("/elections/vic/2026/assembly");
  assert.equal(electionScope("/elections/vic/2026/assembly"), "vic");
  assert.equal(nav.global.find((g) => g.label === "Victoria").current, true);
  assert.equal(nav.global.find((g) => g.label === "Federal").current, false);
  assert.equal(nav.sections.find((s) => s.label === "Seats").current, true);
  assert.equal(nav.sections.filter((s) => s.current).length, 1);
});

test("Bass district is Seats; matrix is Policies", () => {
  const bass = navFor("/elections/vic/2026/districts/bass");
  assert.equal(bass.sections.find((s) => s.label === "Seats").current, true);
  const matrix = navFor("/elections/vic/2026/parties/matrix");
  assert.equal(matrix.sections.find((s) => s.label === "Policies").current, true);
  assert.equal(matrix.sections.find((s) => s.label === "Seats").current, false);
});

test("Elections calendar is exact, not every /elections path", () => {
  const cal = navFor("/elections");
  assert.equal(cal.global.find((g) => g.label === "Elections").current, true);
  const vic = navFor("/elections/vic/2026");
  assert.equal(vic.global.find((g) => g.label === "Elections").current, false);
  assert.equal(vic.sections.filter((s) => s.current).length, 0);
});

test("header and footer source use navFor, not a Vic-only list", () => {
  assert.match(headerSrc, /navFor\(/);
  assert.match(footerSrc, /navFor\(/);
  assert.doesNotMatch(headerSrc, /label: "Assembly"/);
  assert.doesNotMatch(footerSrc, /href="\/polls"/);
  assert.doesNotMatch(footerSrc, /href="\/data"/);
});
