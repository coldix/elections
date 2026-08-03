import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadElectionCalendar } from "../site/src/lib/electionCalendar.mjs";
import { loadElectionPlaceholders } from "../site/src/lib/electionPlaceholders.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const IGNORE_DIRS = new Set([".git", ".wrangler", ".cache", "node_modules", "dist"]);
const GENERATED_PREFIXES = [normalize("site/dist"), normalize("site/public/data")];
const TEMP_FILE_PATTERNS = [
  /(^|\/)\.DS_Store$/,
  /(^|\/)Thumbs\.db$/i,
  /\.(bak|orig|rej|tmp|temp|swp)$/i,
  /(^|\/)README\.tmp\d*$/i,
  /~$/,
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (IGNORE_DIRS.has(name)) continue;
    const abs = join(dir, name);
    const rel = normalize(relative(ROOT, abs));
    if (GENERATED_PREFIXES.some((prefix) => rel === prefix || rel.startsWith(`${prefix}${sep}`))) continue;
    const stat = statSync(abs);
    if (stat.isDirectory()) out.push(...walk(abs));
    else out.push(abs);
  }
  return out;
}

function cleanLinkTarget(raw) {
  const target = raw.trim().replace(/^<|>$/g, "");
  if (!target || target.startsWith("#")) return null;
  if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(target)) return null;
  return decodeURIComponent(target.split("#", 1)[0].split("?", 1)[0]);
}

function markdownLinks(content) {
  const links = [];
  const pattern = /\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  for (const match of content.matchAll(pattern)) links.push(match[1]);
  return links;
}

function resolveDocLink(fromFile, rawTarget) {
  const target = cleanLinkTarget(rawTarget);
  if (!target) return null;
  return target.startsWith("/") ? resolve(ROOT, `.${target}`) : resolve(dirname(fromFile), target);
}

const files = walk(ROOT);
const errors = [];

for (const abs of files) {
  const rel = relative(ROOT, abs).split(sep).join("/");
  if (TEMP_FILE_PATTERNS.some((pattern) => pattern.test(rel))) {
    errors.push(`temporary or editor file committed: ${rel}`);
  }
}

const markdownFiles = files.filter((file) => extname(file).toLowerCase() === ".md");
const markdownSet = new Set(markdownFiles.map((file) => normalize(file)));
const graph = new Map(markdownFiles.map((file) => [normalize(file), new Set()]));

for (const file of markdownFiles) {
  const content = readFileSync(file, "utf8");
  for (const rawTarget of markdownLinks(content)) {
    const target = resolveDocLink(file, rawTarget);
    if (!target) continue;

    let existingTarget = target;
    if (!existsSync(existingTarget) && existsSync(`${target}.md`)) existingTarget = `${target}.md`;
    if (!existsSync(existingTarget) && existsSync(join(target, "README.md"))) existingTarget = join(target, "README.md");

    if (!existsSync(existingTarget)) {
      errors.push(`broken relative link in ${relative(ROOT, file)}: ${rawTarget}`);
      continue;
    }

    const normalTarget = normalize(existingTarget);
    if (markdownSet.has(normalTarget)) graph.get(normalize(file)).add(normalTarget);
  }
}

const rootReadme = normalize(join(ROOT, "README.md"));
if (!markdownSet.has(rootReadme)) {
  errors.push("README.md is missing");
} else {
  const reachable = new Set();
  const queue = [rootReadme];
  while (queue.length) {
    const current = queue.shift();
    if (reachable.has(current)) continue;
    reachable.add(current);
    for (const next of graph.get(current) ?? []) queue.push(next);
  }

  for (const file of markdownFiles) {
    if (!reachable.has(normalize(file))) {
      errors.push(`orphaned Markdown document: ${relative(ROOT, file)}`);
    }
  }
}

const calendar = loadElectionCalendar();
const placeholders = loadElectionPlaceholders();
const placeholderPaths = new Set(placeholders.map((entry) => entry.planned_path));
for (const entry of [...calendar.elections, ...calendar.periodicElections]) {
  if (entry.jurisdiction === "vic") continue;
  if (!placeholderPaths.has(entry.planned_path)) {
    errors.push(`calendar entry has no foundation page: ${entry.planned_path}`);
  }
}

const activeVicPath = calendar.elections.find((entry) => entry.jurisdiction === "vic")?.planned_path;
if (activeVicPath !== "/elections/vic/2026") {
  errors.push(`unexpected active Victorian path: ${activeVicPath ?? "missing"}`);
}

const readme = readFileSync(join(ROOT, "README.md"), "utf8");
const forbiddenReadmeUrls = [
  "https://electiontracker.au/assembly",
  "https://electiontracker.au/council",
  "https://electiontracker.au/parties",
  "https://electiontracker.au/polls",
  "https://electiontracker.au/policies",
];
for (const url of forbiddenReadmeUrls) {
  if (readme.includes(url)) errors.push(`README uses legacy public URL: ${url}`);
}
if (!readme.includes("/elections/vic/2026")) {
  errors.push("README does not describe the scoped Victoria 2026 tracker path");
}
if (!readme.includes("/elections/nsw/2027")) {
  errors.push("README does not mention the future-election foundation pages");
}

if (errors.length) {
  console.error("Repository hygiene check failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Repository hygiene OK: ${files.length} source files, ${markdownFiles.length} linked Markdown documents, ${placeholders.length} future-election foundation pages.`
);
