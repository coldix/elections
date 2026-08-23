#!/usr/bin/env node
/**
 * Incremental discovery scanner for Victorian 2026 candidacy / retirement / poll leads.
 *
 * Design goals (token + time efficient):
 * 1. Fetch watch sources once; cache by content hash — unchanged sources are not re-parsed.
 * 2. Diff extracts against the existing YAML ledger — known people are suppressed.
 * 3. Persist seen lead fingerprints — already-reported leads are not re-printed.
 * 4. Emit a compact JSON + Markdown digest for humans/agents (not full page dumps).
 *
 * NEVER writes candidate YAML. NEVER merges. Human verifies before encoding.
 *
 * Usage:
 *   npm run scan:leads           # incremental (default)
 *   npm run scan:leads -- --full # ignore content-hash skip (still de-dupes ledger + seen)
 *   npm run scan:leads -- --json # JSON only on stdout
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";
import {
  alreadyInLedger,
  indexCandidates,
  indexRetirements,
  indexIncumbents,
  normalizePerson,
  normalizeContest,
} from "./lib/ledger-index.mjs";
import { createFetcher } from "./lib/scan-fetch.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ELECTION = "vic2026";
const DATA = join(ROOT, "data", ELECTION);
const CACHE = join(ROOT, ".cache", "scan");
const STATE_PATH = join(CACHE, "state.json");
const OUT_JSON = join(CACHE, "leads-latest.json");
const OUT_MD = join(CACHE, "leads-latest.md");
const SOURCES_PATH = join(DATA, "watch-sources.yaml");

const args = new Set(process.argv.slice(2));
const FULL = args.has("--full");
const JSON_ONLY = args.has("--json");
const REPORT_ONLY = args.has("--report-only");

function loadState() {
  if (!existsSync(STATE_PATH)) {
    return { version: 1, seen_leads: {}, last_run: null };
  }
  try {
    return JSON.parse(readFileSync(STATE_PATH, "utf8"));
  } catch {
    return { version: 1, seen_leads: {}, last_run: null };
  }
}

function saveState(state) {
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function leadId(lead) {
  const raw = [lead.kind, lead.name || "", lead.contest || "", lead.source_url || "", lead.title || ""]
    .join("|")
    .toLowerCase();
  return createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** @returns {object[]} */
function parseGreens(html) {
  const leads = [];
  const re = /href="(\/vic\/person\/([a-z0-9-]+))"/g;
  let m;
  const seen = new Set();
  while ((m = re.exec(html))) {
    const slug = m[2];
    if (seen.has(slug)) continue;
    seen.add(slug);
    const chunk = html.slice(m.index, m.index + 900);
    const seatM = chunk.match(
      /(?:Candidate for|Lead Candidate for|State Member for|MLC for|Leader of the Victorian Greens, State Member for)\s*([^<]+)/i
    );
    let seat = seatM ? seatM[1].replace(/\s+and Councillor[\s\S]*/i, "").trim() : "";
    seat = seat.replace(/\s+Region$/i, "").trim();
    const name = slug
      .replace(/^dr-/, "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const contest = normalizeContest(seat);
    leads.push({
      kind: "candidate",
      name,
      party: "greens",
      contest: contest || undefined,
      chamber: contest?.includes("metropolitan") || contest?.includes("victoria") ? "council" : "assembly",
      source_url: `https://greens.org.au/vic/person/${slug}`,
      title: seat ? `Greens candidate for ${seat}` : `Greens person ${slug}`,
      source_id: "greens-vic",
    });
  }
  return leads;
}

function parseOneNation(html) {
  const text = stripTags(html);
  const leads = [];
  // "Darren Hercus for Nepean". The name token must allow internal hyphens and
  // apostrophes ("Rikkie-Lee", "O'Brien"); a first token of [A-Z][a-z]+ cannot
  // start on "Rikkie-Lee" and instead matches from "Lee", which both truncates
  // the name and drags the lost fragment into the seat.
  const NAME = "[A-Z][A-Za-z'’.-]*[A-Za-z]";
  // Cards read "<name> for <seat> Meet <name>, One Nation's candidate ...".
  // Terminating the seat only on a dash/pipe missed most of the page, so also
  // stop where the candidate's own name recurs (backreference \1).
  const re = new RegExp(
    `(${NAME}(?:\\s+${NAME})+)\\s+for\\s+([A-Za-z][A-Za-z\\s-]+?)(?:\\s*[-–—|]|\\s+Pauline|\\s+\\1\\b|\\s*$)`,
    "g",
  );
  let m;
  while ((m = re.exec(text))) {
    const name = m[1].trim();
    let seat = m[2].trim();
    // Candidate cards repeat the name straight after the seat ("... for
    // Northern Victoria Region Rikkie-Lee Tyrrell made history in 2022 ...").
    // Cut the seat at the point the name recurs, then drop the Region suffix
    // so the slug matches the council contest ids.
    const firstToken = name.split(/[\s\-'’]/)[0];
    const dup = seat.search(new RegExp(`\\b${firstToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i"));
    if (dup > 0) seat = seat.slice(0, dup).trim();
    // Trailing call-to-action left over from the card ("... Pakenham Support").
    seat = seat.replace(/\s+(?:Meet|Support|Learn|Read|About|Donate|Volunteer)$/i, "").trim();
    seat = seat.replace(/\s+Region$/i, "").trim();
    if (name.length < 5 || seat.length < 3) continue;
    if (/One Nation|Victoria|Candidates|Donate/i.test(name)) continue;
    leads.push({
      kind: "candidate",
      name,
      party: "one-nation",
      contest: normalizeContest(seat),
      chamber: /victoria|metropolitan/i.test(seat) ? "council" : "assembly",
      source_url: "https://vic.onenation.org.au/candidates",
      title: `${name} for ${seat}`,
      source_id: "onenation-vic",
    });
  }
  return leads;
}

function cleanWikiCell(s) {
  return String(s || "")
    .replace(/''+/g, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
    .replace(/<ref[^>]*\/>/gi, "")
    .replace(/\{\{[\s\S]*?\}\}/g, "")
    // Belt-and-braces: any citation markup still unclosed here is malformed or
    // truncated. The candidate name always precedes it, so drop the remainder
    // rather than letting "{{Cite web" survive into a person's name.
    .replace(/<ref\b[\s\S]*$/i, "")
    .replace(/\{\{[\s\S]*$/, "")
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, "$1")
    .replace(/<br\s*\/?>/gi, " / ")
    .replace(/<[^>]+>/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// A wikitext citation may wrap across several lines, and continuation lines
// often begin with "|" (e.g. "|url=..."). Treating those as new table cells
// both truncates the name mid-citation and shifts every later column by one,
// silently misattributing candidates to the wrong party. Only start a new cell
// when no {{template}} or <ref> is still open.
function markupDepth(depth, line) {
  const opens = (line.match(/\{\{/g) || []).length;
  const closes = (line.match(/\}\}/g) || []).length;
  const refOpens = (line.match(/<ref(?![^>]*\/>)[^>]*>/gi) || []).length;
  const refCloses = (line.match(/<\/ref>/gi) || []).length;
  return Math.max(0, depth + opens - closes + refOpens - refCloses);
}

function splitWikiRows(section) {
  const rows = [];
  let current = [];
  let depth = 0;

  for (const line of section.split("\n")) {
    if (depth === 0 && line.startsWith("|-")) {
      if (current.length) rows.push(current);
      current = [];
    } else if (depth === 0 && line.startsWith("|")) {
      // Some rows open a cell with "||"; treat it as one cell, not an empty
      // one followed by a second, which would shift every later column.
      current.push(line.replace(/^\|+/, "").trim());
    } else if (current.length) {
      // Continuation of the cell above, not a new one.
      current[current.length - 1] += ` ${line.trim()}`;
    }
    depth = markupDepth(depth, line);
  }
  if (current.length) rows.push(current);
  return rows;
}

// Parse debris never looks like a person's name.
function looksLikeName(name) {
  return !/[{}<>=]|https?:|\|/.test(name);
}

function splitCellEntries(cell) {
  return String(cell || "").split(/<br\s*\/?>/i);
}

function parseWikiCandidates(wikitext) {
  const leads = [];
  const section = wikitext.split("==Legislative Assembly==")[1]?.split("==Legislative Council==")[0];
  if (!section) return leads;

  const rows = splitWikiRows(section);

  for (const r of rows) {
    if (r.length < 5) continue;
    const dist = cleanWikiCell(r[0]);
    if (!dist || dist.length > 40 || /Electorate|Held by|party style/i.test(dist)) continue;
    const contest = normalizeContest(dist);
    // Table columns are: Electorate | Held by | Labor | Coalition | Greens |
    // One Nation | Socialists | Other. Column 5 is One Nation, not Socialists
    // -- mapping it to Socialists put every One Nation candidate under the
    // wrong party and meant the Socialists column was never read at all.
    const cols = [
      { party: "labor", cell: r[2] },
      { party: "coalition", cell: r[3] },
      { party: "greens", cell: r[4] },
      { party: "one-nation", cell: r[5] },
      { party: "victorian-socialists", cell: r[6] },
    ];
    for (const { party, cell } of cols) {
      // One cell can hold several candidates separated by <br> (e.g. a
      // Nationals and a Liberal both contesting the same seat). Split first so
      // each becomes its own lead with its own party, rather than one merged
      // "A / B" name attributed to whichever party matched the cell.
      for (const entry of splitCellEntries(cell)) {
        const name = cleanWikiCell(entry);
        if (!name || name.length < 3 || name.length > 60) continue;
        if (!looksLikeName(name)) continue;
        // Coalition cells may be "Name (L)" already stripped
        let p = party;
        if (party === "coalition") {
          if (/\(N\)/i.test(entry) || /National/i.test(entry)) p = "nationals";
          else p = "liberal";
        }
        // Skip placeholders
        if (/^tbd$|to be|vacant|independent/i.test(name)) continue;
        leads.push({
          kind: "candidate",
          name,
          party: p,
          contest,
          chamber: "assembly",
          source_url: "https://en.wikipedia.org/wiki/Candidates_of_the_2026_Victorian_state_election",
          title: `Wiki Assembly table: ${name} — ${dist}`,
          source_id: "wiki-candidates",
        });
      }
    }
  }

  // Retiring section
  const ret = wikitext.match(/== Retiring MPs ==([\s\S]*?)==Legislative Assembly==/);
  if (ret) {
    for (const line of ret[1].split("\n")) {
      if (!line.startsWith("*")) continue;
      const nm = line.match(/\[\[([^\]]+)\]\]/);
      if (!nm) continue;
      const name = nm[1].split("|").pop().replace(/\(.*?\)/g, "").trim();
      const seat = line.match(/Electoral district of ([^|]+)\|/) || line.match(/Region\|([^\]]+)/);
      leads.push({
        kind: "retirement",
        name,
        contest: seat ? normalizeContest(seat[1]) : undefined,
        source_url: "https://en.wikipedia.org/wiki/Candidates_of_the_2026_Victorian_state_election",
        title: `Wiki retiring: ${line.replace(/<[^>]+>/g, "").slice(0, 120)}`,
        source_id: "wiki-candidates",
      });
    }
  }
  return leads;
}

function parseRss(xml, sourceId) {
  const leads = [];
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const item of items) {
    const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
      item.match(/<title>([^<]*)<\/title>/))?.[1]?.trim();
    const link = (item.match(/<link>([^<]*)<\/link>/) ||
      item.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/))?.[1]?.trim();
    if (!title || !link) continue;

    const blob = `${title} ${link}`;
    // Drop clear off-topic noise
    if (
      /rowing|cricket|afl|nrl|soccer|recipe|rental system|foreign interference|south australian|queensland|nsw election|federal election only/i.test(
        blob
      )
    ) {
      continue;
    }

    const isVic = /victoria|victorian|#springst|melbourne|spring street/i.test(blob);
    const isCandidateSignal =
      /candidate|preselect|pre-select|endorsed|will contest|to stand|contesting|how.to.vote|ticket/i.test(
        title
      );
    const isRetire =
      /retire|retirement|not recontest|will not contest|standing down|step(?:ping)? down|quit parliament/i.test(
        title
      );
    const isPoll =
      /\bpoll\b|newspoll|resolve strategic|redbridge|freshwater|roy morgan|demosau|primary vote/i.test(
        title
      );

    // Poll feed: polls only. Candidate feed: candidate/retire signals. Retire feed: retire only.
    if (sourceId.includes("poll")) {
      if (!isPoll || !isVic) continue;
    } else if (sourceId.includes("retire")) {
      if (!isRetire || !isVic) continue;
    } else {
      // gnews-vic-candidates: require candidacy signal + Victoria
      if (!isVic || (!isCandidateSignal && !isRetire)) continue;
    }

    const kind = isRetire
      ? "retirement_news"
      : isPoll
        ? "poll_news"
        : "candidate_news";
    leads.push({
      kind,
      title,
      source_url: link,
      source_id: sourceId,
      name: undefined,
    });
  }
  // Cap per feed so one noisy RSS cannot dominate the digest
  return leads.slice(0, 20);
}

async function fetchWiki(page, ua) {
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json`;
  const res = await fetch(url, {
    headers: { "User-Agent": ua, Accept: "application/json" },
  });
  const data = await res.json();
  const body = data?.parse?.wikitext?.["*"] || "";
  return { body, status: res.status, url };
}

async function main() {
  if (REPORT_ONLY) {
    if (existsSync(OUT_MD) && !JSON_ONLY) {
      console.log(readFileSync(OUT_MD, "utf8"));
      return;
    }
    if (existsSync(OUT_JSON)) {
      console.log(readFileSync(OUT_JSON, "utf8"));
      return;
    }
    console.error("No prior scan. Run: npm run scan:leads");
    process.exit(1);
  }

  if (!existsSync(SOURCES_PATH)) {
    console.error("missing", SOURCES_PATH);
    process.exit(1);
  }
  const cfg = parse(readFileSync(SOURCES_PATH, "utf8"));
  const ua = cfg.user_agent || "ElectionTrackerBot/1.0";
  const sources = cfg.sources || [];

  const index = indexCandidates(join(DATA, "candidates"));
  const retired = indexRetirements(join(DATA, "retirements.yaml"));
  const incumbents = indexIncumbents(join(DATA, "districts.yaml"));
  const state = loadState();
  const fetcher = createFetcher(CACHE, ua);

  const sourceReports = [];
  const rawLeads = [];

  for (const src of sources) {
    const report = { id: src.id, type: src.type, status: null, unchanged: false, extracted: 0, error: null };
    try {
      if (src.type === "wikipedia-parse") {
        const { body, status, url } = await fetchWiki(src.page, ua);
        report.status = status;
        const hash = createHash("sha256").update(body).digest("hex");
        const metaPath = join(CACHE, `${src.id}.meta.json`);
        let prevHash = null;
        if (existsSync(metaPath)) {
          try {
            prevHash = JSON.parse(readFileSync(metaPath, "utf8")).hash;
          } catch {
            /* */
          }
        }
        const unchanged = !FULL && prevHash === hash;
        writeFileSync(
          metaPath,
          JSON.stringify({ id: src.id, url, hash, status, fetched_at: new Date().toISOString() }, null, 2)
        );
        writeFileSync(join(CACHE, "bodies", `${src.id}.txt`), body);
        report.unchanged = unchanged;
        if (!unchanged) {
          const leads = parseWikiCandidates(body);
          report.extracted = leads.length;
          rawLeads.push(...leads);
        }
      } else if (src.type === "html-greens" || src.type === "html-onenation" || src.type === "html") {
        const r = await fetcher.fetchText(src.id, src.url, { force: FULL });
        report.status = r.status;
        report.unchanged = !!r.skippedUnchanged;
        if (!r.skippedUnchanged) {
          const leads =
            src.type === "html-greens"
              ? parseGreens(r.body)
              : src.type === "html-onenation"
                ? parseOneNation(r.body)
                : [];
          report.extracted = leads.length;
          rawLeads.push(...leads);
        }
      } else if (src.type === "rss") {
        const r = await fetcher.fetchText(src.id, src.url, { force: FULL });
        report.status = r.status;
        report.unchanged = !!r.skippedUnchanged;
        if (!r.skippedUnchanged) {
          const leads = parseRss(r.body, src.id);
          report.extracted = leads.length;
          rawLeads.push(...leads);
        }
      } else {
        report.error = `unknown type ${src.type}`;
      }
    } catch (e) {
      report.error = e.message || String(e);
    }
    sourceReports.push(report);
  }

  // Filter: ledger + retirements + already-seen
  const newLeads = [];
  const suppressed = {
    in_ledger: 0,
    already_reported: 0,
    retired: 0,
    sitting_incumbent: 0,
  };

  for (const lead of rawLeads) {
    if (lead.kind === "candidate" && lead.name) {
      const n = normalizePerson(lead.name);
      if (retired.has(n)) {
        suppressed.retired++;
        continue;
      }
      // Wiki lists sitting MLAs as candidates; we need a recontest source first.
      if (lead.contest && incumbents.byContest.get(lead.contest) === n) {
        suppressed.sitting_incumbent++;
        continue;
      }
      if (alreadyInLedger(index, lead)) {
        suppressed.in_ledger++;
        continue;
      }
    }
    if (lead.kind === "retirement" && lead.name) {
      if (retired.has(normalizePerson(lead.name))) {
        suppressed.retired++;
        continue;
      }
    }
    const id = leadId(lead);
    lead.id = id;
    if (state.seen_leads[id] && !FULL) {
      suppressed.already_reported++;
      continue;
    }
    newLeads.push(lead);
    state.seen_leads[id] = {
      first_seen: state.seen_leads[id]?.first_seen || new Date().toISOString(),
      last_seen: new Date().toISOString(),
      kind: lead.kind,
      title: lead.title || lead.name,
    };
  }

  // Cap seen map growth (keep last 2000)
  const ids = Object.keys(state.seen_leads);
  if (ids.length > 2000) {
    const sorted = ids.sort(
      (a, b) =>
        new Date(state.seen_leads[a].last_seen) - new Date(state.seen_leads[b].last_seen)
    );
    for (const old of sorted.slice(0, ids.length - 2000)) delete state.seen_leads[old];
  }

  state.last_run = new Date().toISOString();
  state.last_summary = {
    new_leads: newLeads.length,
    suppressed,
    sources: sourceReports,
  };
  saveState(state);

  const digest = {
    generated_at: state.last_run,
    election: ELECTION,
    mode: FULL ? "full" : "incremental",
    ledger_candidates: index.list.length,
    sources: sourceReports,
    suppressed,
    new_leads: newLeads,
    instructions: {
      next: "Human verifies each lead. Encode YAML only with durable primary sources. Do not trust RSS titles alone.",
      agent: "Read .cache/scan/leads-latest.json — only process new_leads[]. Do not re-scan HTML in chat.",
      encode: "npm run check after adding data/<election>/candidates/*.yaml",
    },
  };

  mkdirSync(CACHE, { recursive: true });
  writeFileSync(OUT_JSON, JSON.stringify(digest, null, 2));

  const md = [
    `# Lead scan — ${digest.generated_at}`,
    ``,
    `Mode: **${digest.mode}** · Ledger: **${digest.ledger_candidates}** candidacies`,
    ``,
    `## Sources`,
    ...sourceReports.map(
      (s) =>
        `- \`${s.id}\` (${s.type}) status=${s.status ?? "—"} unchanged=${s.unchanged} extracted=${s.extracted}${s.error ? ` ERROR: ${s.error}` : ""}`
    ),
    ``,
    `## Suppressed (not shown again)`,
    `- Already in ledger: ${suppressed.in_ledger}`,
    `- Sitting MLA listed as candidate (need recontest source): ${suppressed.sitting_incumbent}`,
    `- Already reported this fingerprint: ${suppressed.already_reported}`,
    `- Already in retirements.yaml: ${suppressed.retired}`,
    ``,
    `## New leads (${newLeads.length})`,
    ...(newLeads.length === 0
      ? ["_None. Incremental scan found nothing new._"]
      : newLeads.map((l, i) => {
          const head = l.name || l.title || "(untitled)";
          const meta = [l.kind, l.party, l.contest, l.chamber].filter(Boolean).join(" · ");
          return `${i + 1}. **${head}**  \n   ${meta}  \n   ${l.source_url || ""}`;
        })),
    ``,
    `---`,
    `Machine digest: \`.cache/scan/leads-latest.json\` (gitignored). Re-run: \`npm run scan:leads\`. Force: \`npm run scan:leads -- --full\`.`,
    ``,
  ].join("\n");
  writeFileSync(OUT_MD, md);

  if (JSON_ONLY) {
    console.log(JSON.stringify(digest, null, 2));
  } else {
    console.log(md);
    console.log(`\nWrote ${OUT_JSON}`);
    console.log(`Wrote ${OUT_MD}`);
  }

  // Exit 0 always — this is discovery, not CI gate
}

// Pure parsers, exported so tests can exercise them against saved fixtures
// without touching the network. Everything below stays internal.
export {
  cleanWikiCell,
  splitWikiRows,
  splitCellEntries,
  looksLikeName,
  parseWikiCandidates,
  parseOneNation,
};

// Only scan when run as a command. Importing the module (tests) must not fetch.
const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
