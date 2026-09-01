import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadPolls, computePollAverage } from "../scripts/lib/polls.mjs";

const vicPage = fileURLToPath(new URL("../site/src/vicpages/polls.astro", import.meta.url));

test("Victorian and federal poll averages are distinct ledgers", () => {
  const vic = computePollAverage(loadPolls("vic2026"));
  const fed = computePollAverage(loadPolls("federal-49"));
  assert.equal(vic.status, "ok");
  assert.equal(fed.status, "ok");
  assert.ok(vic.as_of, "Vic average has an as-of date");
  assert.ok(fed.as_of, "Federal average has an as-of date");
  assert.notDeepEqual(
    vic.primaries,
    fed.primaries,
    "Vic and federal primary averages must not be the same numbers"
  );
  assert.notDeepEqual(
    vic.included_poll_ids.sort(),
    fed.included_poll_ids.sort(),
    "Vic and federal averages must not rest on the same poll ids"
  );
});

test("Vic polls page loads vic2026, not listElections()[0]", () => {
  const src = readFileSync(vicPage, "utf8");
  assert.match(src, /const electionId = "vic2026"/);
  assert.match(src, /loadPolls\("vic2026"\)/);
  assert.doesNotMatch(
    src,
    /listElections\(/,
    "the first data directory alphabetically is federal-49, which published the wrong ledger"
  );
});
