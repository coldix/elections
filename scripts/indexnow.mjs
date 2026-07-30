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
const PRIORITY = [
  `https://${HOST}/`,
  `https://${HOST}/voting`,
  `https://${HOST}/data`,
  `https://${HOST}/methodology`,
  `https://${HOST}/polls`,
  `https://${HOST}/assembly`,
  `https://${HOST}/council`,
  `https://${HOST}/parties`,
  `https://${HOST}/districts`,
  `https://${HOST}/regions`,
  `https://${HOST}/about`,
  `https://${HOST}/llms.txt`,
  `https://${HOST}/robots.txt`,
  `https://${HOST}/sitemap.xml`,
  `https://${HOST}/sitemap-index.xml`,
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
