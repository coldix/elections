#!/usr/bin/env node
// Post-process Astro's sitemap output into a crawler-friendly sitemap.xml.
//
// Why: @astrojs/sitemap emits a sitemap-index + sitemap-0 with extra xmlns
// noise and millisecond lastmod. A single pretty-printed urlset at /sitemap.xml
// is what many tools (and operators) expect, and is slightly easier for GSC.
//
// Keeps sitemap-0.xml and sitemap-index.xml so existing submissions keep working.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, "..", "site", "dist");
const sourcePath = join(dist, "sitemap-0.xml");

if (!existsSync(sourcePath)) {
  console.error("finalize-sitemap: missing site/dist/sitemap-0.xml — run astro build first");
  process.exit(1);
}

const raw = readFileSync(sourcePath, "utf8");

// Extract url blocks (namespace-agnostic).
const urlBlocks = [...raw.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
if (urlBlocks.length === 0) {
  console.error("finalize-sitemap: no <url> entries found in sitemap-0.xml");
  process.exit(1);
}

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return m ? m[1].trim() : null;
}

function normalizeLastmod(iso) {
  if (!iso) return null;
  // Drop fractional seconds — some validators are fussy; W3C datetime still ok.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const urls = urlBlocks.map((block) => {
  let loc = pick(block, "loc");
  if (!loc) return null;
  // Canonical root with trailing slash is unambiguous for crawlers.
  if (loc === "https://electiontracker.au") loc = "https://electiontracker.au/";
  return {
    loc,
    lastmod: normalizeLastmod(pick(block, "lastmod")),
    changefreq: pick(block, "changefreq"),
    priority: pick(block, "priority"),
  };
}).filter(Boolean);

// Sort: home first, then path alpha (stable for diffs / human review).
urls.sort((a, b) => {
  if (a.loc === "https://electiontracker.au/") return -1;
  if (b.loc === "https://electiontracker.au/") return 1;
  return a.loc.localeCompare(b.loc);
});

const lines = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
];

for (const u of urls) {
  lines.push("  <url>");
  lines.push(`    <loc>${escapeXml(u.loc)}</loc>`);
  if (u.lastmod) lines.push(`    <lastmod>${u.lastmod}</lastmod>`);
  if (u.changefreq) lines.push(`    <changefreq>${u.changefreq}</changefreq>`);
  if (u.priority) lines.push(`    <priority>${u.priority}</priority>`);
  lines.push("  </url>");
}
lines.push("</urlset>");
lines.push("");

const sitemapXml = lines.join("\n");
writeFileSync(join(dist, "sitemap.xml"), sitemapXml);

// Point the index at both the clean single file and the Astro chunk
// (GSC may already have the index URL bookmarked).
const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
const indexXml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  `  <sitemap>`,
  `    <loc>https://electiontracker.au/sitemap.xml</loc>`,
  `    <lastmod>${now}</lastmod>`,
  `  </sitemap>`,
  `  <sitemap>`,
  `    <loc>https://electiontracker.au/sitemap-0.xml</loc>`,
  `    <lastmod>${now}</lastmod>`,
  `  </sitemap>`,
  `</sitemapindex>`,
  ``,
].join("\n");
writeFileSync(join(dist, "sitemap-index.xml"), indexXml);

console.log(`finalize-sitemap: wrote sitemap.xml (${urls.length} URLs) + updated sitemap-index.xml`);
