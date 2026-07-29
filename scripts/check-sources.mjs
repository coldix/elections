#!/usr/bin/env node
// Reachability check for every source URL in data/**/*.yaml.
// Report-only: never mutates data. Exit 1 only on clear dead links (404/410/DNS).
// Soft-fail (WARN, exit 0) for bot walls, rate limits, and timeouts.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "yaml";

const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const CONCURRENCY = 12;
const TIMEOUT_MS = 12_000;
const UA =
  "electiontracker-source-check/1.0 (+https://electiontracker.au; ops; source health)";

const FAIL_STATUSES = new Set([404, 410]);
const WARN_STATUSES = new Set([401, 403, 429, 451, 500, 502, 503, 504]);

/** @type {Map<string, string[]>} url -> ["file path", ...] */
const refs = new Map();

function walk(dir) {
  for (const name of readdirSync(dir)) {
    // Skip fixtures / drafts (_EXAMPLE.yaml etc.) — same convention as loadElection.
    if (name.startsWith(".") || name.startsWith("_")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".yaml") || name.endsWith(".yml")) collect(p);
  }
}

function add(url, ref) {
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) return;
  try {
    new URL(url);
  } catch {
    return;
  }
  if (!refs.has(url)) refs.set(url, []);
  const list = refs.get(url);
  if (!list.includes(ref)) list.push(ref);
}

function walkObject(file, node) {
  if (node == null) return;
  if (Array.isArray(node)) {
    for (const item of node) walkObject(file, item);
    return;
  }
  if (typeof node !== "object") return;

  for (const [k, v] of Object.entries(node)) {
    if (k === "url" && typeof v === "string") add(v, file);
    else walkObject(file, v);
  }
}

function collect(filePath) {
  const rel = relative(join(DATA_DIR, ".."), filePath);
  let doc;
  try {
    doc = parse(readFileSync(filePath, "utf8"));
  } catch (e) {
    console.error(`SKIP parse error ${rel}: ${e.message}`);
    return;
  }
  walkObject(rel, doc);
}

async function probe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const headers = {
    "User-Agent": UA,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  };
  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers,
    });
    // Many news CDNs reject HEAD or bot-block it — retry GET once.
    if (res.status === 405 || res.status === 501 || res.status === 403 || res.status === 401) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers,
      });
    }
    clearTimeout(timer);
    return { ok: res.ok, status: res.status, error: null };
  } catch (e) {
    clearTimeout(timer);
    const msg = e.name === "AbortError" ? "timeout" : e.message || String(e);
    return { ok: false, status: 0, error: msg };
  }
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

function classify(result) {
  if (result.error) {
    if (/timeout/i.test(result.error)) return "warn";
    if (/ENOTFOUND|EAI_AGAIN|getaddrinfo|DNS/i.test(result.error)) return "fail";
    if (/ECONNREFUSED|certificate|SSL|TLS|CERT/i.test(result.error)) return "fail";
    return "warn";
  }
  if (result.ok || (result.status >= 200 && result.status < 400)) return "ok";
  if (FAIL_STATUSES.has(result.status)) return "fail";
  if (WARN_STATUSES.has(result.status)) return "warn";
  if (result.status >= 400) return "fail";
  return "warn";
}

walk(DATA_DIR);

const urls = [...refs.keys()].sort();
console.log(`Checking ${urls.length} unique source URL(s) (concurrency ${CONCURRENCY})…\n`);

const outcomes = await mapPool(urls, CONCURRENCY, async (url) => {
  const result = await probe(url);
  return { url, ...result, level: classify(result) };
});

const ok = outcomes.filter((o) => o.level === "ok");
const warn = outcomes.filter((o) => o.level === "warn");
const fail = outcomes.filter((o) => o.level === "fail");

function printGroup(label, list) {
  if (!list.length) return;
  console.log(`\n=== ${label} (${list.length}) ===`);
  for (const o of list) {
    const status = o.error ? o.error : `HTTP ${o.status}`;
    console.log(`${status}\t${o.url}`);
    for (const ref of (refs.get(o.url) || []).slice(0, 3)) {
      console.log(`    ↳ ${ref}`);
    }
    if ((refs.get(o.url) || []).length > 3) {
      console.log(`    ↳ … +${refs.get(o.url).length - 3} more`);
    }
  }
}

printGroup("FAIL — fix or archive", fail);
printGroup("WARN — re-check in browser / often bot-block", warn);

console.log(`\nSummary: ${ok.length} ok, ${warn.length} warn, ${fail.length} fail (${urls.length} total)`);

if (fail.length) {
  console.error("\nSource health: FAIL");
  process.exit(1);
}
console.log("\nSource health: OK (warnings allowed)");
process.exit(0);
