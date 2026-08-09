#!/usr/bin/env node
// Notify IndexNow (Bing and partners) of priority URLs after deploy.
// Key file must be public at https://electiontracker.au/<key>.txt
// See https://www.indexnow.org/documentation
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOST = "electiontracker.au";
const KEY_PATH = join(__dirname, "indexnow.key");

// Keep aligned with sitemap main hubs + atlases in site/astro.config.mjs
// and the GSC priority list in docs/DISCOVERY.md.
// Prefer *canonical* election-scoped HTML paths (legacy short URLs 301).
const VIC = `https://${HOST}/elections/vic/2026`;
const FED = `https://${HOST}/elections/federal/49`;
const PRIORITY = [
  `https://${HOST}/`,
  `https://${HOST}/elections`,
  VIC,
  `${VIC}/voting`,
  `${VIC}/data`,
  `${VIC}/polls`,
  `${VIC}/assembly`,
  `${VIC}/council`,
  `${VIC}/parties`,
  `${VIC}/parties/matrix`,
  `${VIC}/districts`,
  `${VIC}/regions`,
  `${VIC}/open-seats`,
  FED,
  `${FED}/representatives`,
  `${FED}/senate`,
  `${FED}/parties`,
  `${FED}/polls`,
  `${FED}/data`,
  `https://${HOST}/methodology`,
  `https://${HOST}/about`,
  `https://${HOST}/privacy`,
  `https://${HOST}/llms.txt`,
  `https://${HOST}/llms-full.txt`,
  `https://${HOST}/robots.txt`,
  `https://${HOST}/sitemap.xml`,
  `https://${HOST}/sitemap-index.xml`,
  `https://${HOST}/data/index.json`,
  `https://${HOST}/data/vic2026/poll-average.json`,
  `https://${HOST}/data/vic2026/candidates.json`,
  `https://${HOST}/data/federal-49/summary.json`,
  `https://${HOST}/data/federal-49/house-members.json`,
  `https://${HOST}/data/federal-49/senate-members.json`,
  `https://${HOST}/data/federal-49/polls.json`,
  `https://${HOST}/data/federal-49/poll-average.json`,
];

if (!existsSync(KEY_PATH)) {
  console.error("missing scripts/indexnow.key — generate a key and public key file first");
  process.exit(1);
}

const key = readFileSync(KEY_PATH, "utf8").trim();
if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) {
  console.error("indexnow key must be 8–128 alphanumeric characters");
  process.exit(1);
}

const body = {
  host: HOST,
  key,
  keyLocation: `https://${HOST}/${key}.txt`,
  urlList: PRIORITY,
};

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log(`IndexNow ${res.status} ${res.statusText}`);
if (text) console.log(text);

// 200 / 202 = accepted; 422 often means key file not found yet (deploy lag)
if (res.status !== 200 && res.status !== 202) {
  process.exitCode = 1;
}
