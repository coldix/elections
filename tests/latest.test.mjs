import { test } from "node:test";
import assert from "node:assert/strict";
import { loadLatest, pollFeedDate } from "../site/src/lib/latest.mjs";
import { loadPolls } from "../scripts/lib/polls.mjs";

test("pollFeedDate prefers latest source published over fieldwork_end", () => {
  const polls = loadPolls("nsw2027");
  const mca = polls.find((p) => p.id === "insightfully-2026-08-mca");
  assert.ok(mca, "Insightfully MCA poll must be in nsw2027 ledger");
  assert.equal(mca.fieldwork_end, "2026-08-12");
  assert.equal(mca.eligible_for_average, false);
  assert.equal(pollFeedDate(mca), "2026-09-18");
});

test("loadLatest includes NSW out-of-average polls by published date", () => {
  // Freeze window so Aug fieldwork alone would miss, but Sep published hits.
  const latest = loadLatest({ cutoff: "2026-09-01", windowDays: 21 });
  const nswPolls = latest.polls.filter((p) => p.jurisdiction === "nsw");
  assert.ok(
    nswPolls.some((p) => /insightfully/i.test(p.title)),
    "Insightfully NSW poll must appear on /latest when published in window"
  );
  assert.ok(
    nswPolls.every((p) => p.href === "/elections/nsw/2027/polls"),
    "NSW poll cards link to NSW polls page"
  );
});

test("loadLatest includes NSW foundation open milestone", () => {
  const latest = loadLatest({ cutoff: "2026-09-01", windowDays: 21 });
  assert.ok(
    latest.foundations.some(
      (f) => f.jurisdiction === "nsw" && /foundation open/i.test(f.title)
    ),
    "NSW foundation open note must surface on /latest"
  );
});

test("loadLatest still lists federal and does not filter eligible_for_average", () => {
  const latest = loadLatest({ cutoff: "2026-09-01", windowDays: 21 });
  assert.ok(latest.polls.some((p) => p.jurisdiction === "federal"));
  // Out-of-average NSW poll is present (eligible flag false on source poll).
  const nsw = latest.polls.find((p) => /insightfully/i.test(p.title));
  assert.ok(nsw);
  assert.equal(nsw.eligible_for_average, false);
});
