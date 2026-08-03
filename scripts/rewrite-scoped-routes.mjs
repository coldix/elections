#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "..", "site", "dist");
const DOMAIN = "https://electiontracker.au";
const VIC = "/elections/vic/2026";
const prefixes = [
  "/assembly",
  "/council",
  "/districts",
  "/regions",
  "/parties",
  "/policies",
  "/polls",
  "/open-seats",
  "/voting",
];

if (!existsSync(dist)) {
  console.error("rewrite-scoped-routes: site/dist is missing");
  process.exit(1);
}

function filesUnder(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...filesUnder(path));
    else if (path.endsWith(".html")) out.push(path);
  }
  return out;
}

function rewrite(html) {
  for (const old of prefixes) {
    const next = VIC + old;
    html = html.replaceAll(`href="${old}`, `href="${next}`);
    html = html.replaceAll(`href='${old}`, `href='${next}`);
    html = html.replaceAll(`${DOMAIN}${old}`, `${DOMAIN}${next}`);
  }

  // The HTML data page moves; machine-readable /data/vic2026/** exports do not.
  html = html.replace(/href="\/data(?=["#?])/g, `href="${VIC}/data`);
  html = html.replace(/href='\/data(?=['#?])/g, `href='${VIC}/data`);
  html = html.replaceAll(`${DOMAIN}/data"`, `${DOMAIN}${VIC}/data"`);
  html = html.replaceAll(`${DOMAIN}/data#`, `${DOMAIN}${VIC}/data#`);

  return html;
}

let changed = 0;
for (const file of filesUnder(dist)) {
  const before = readFileSync(file, "utf8");
  let after = rewrite(before);

  // The preserved Victorian landing-page component originally identified the
  // root URL as its Dataset URL. Correct that one graph node after relocation.
  if (file.endsWith(join("elections", "vic", "2026", "index.html"))) {
    const marker = "Australian Election Tracker — Victorian state election 2026 candidate ledger";
    const at = after.indexOf(marker);
    if (at >= 0) {
      const urlAt = after.indexOf(`\"url\":\"${DOMAIN}\"`, at);
      if (urlAt >= 0 && urlAt - at < 2500) {
        after = after.slice(0, urlAt) + `\"url\":\"${DOMAIN}${VIC}\"` + after.slice(urlAt + `\"url\":\"${DOMAIN}\"`.length);
      }
    }
  }

  if (after !== before) {
    writeFileSync(file, after);
    changed++;
  }
}

const legacyHref = new RegExp(`href=[\"']/(?:assembly|council|districts|regions|parties|policies|polls|open-seats|voting)(?:[\"'/#?])`);
const legacyData = /href=["']\/data(?:["#?])/;
const failures = [];
for (const file of filesUnder(dist)) {
  const html = readFileSync(file, "utf8");
  if (legacyHref.test(html) || legacyData.test(html)) failures.push(file.replace(dist, ""));
}
if (failures.length) {
  console.error("rewrite-scoped-routes: legacy internal links remain in", failures.slice(0, 20));
  process.exit(1);
}

console.log(`rewrite-scoped-routes: updated ${changed} HTML files; legacy link check passed`);
