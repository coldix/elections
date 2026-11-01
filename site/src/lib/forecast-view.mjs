// Renders the live part of /forecast (counts, scenario ranges, seat map, One Nation's
// closest seats) from a buildMultiPartyForecast() result. Used by the static Astro
// page AND the in-browser sliders, so both produce identical markup.
import { IN_DOUBT_PP, LEANING_PP, PARTY_LABEL } from "../../../scripts/lib/forecast.mjs";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const PARTIES = [["labor", "Labor"], ["coalition", "Coalition"], ["greens", "Greens"], ["one-nation", "One Nation"]];
const CLS = { alp: "labor", lnp: "coalition", grn: "greens", onp: "onp" };
const ORDER = { lnp: 0, onp: 1, alp: 2, grn: 3 };
const RATING = { firm: "Firm", leaning: "Leaning", doubt: "In doubt" };

export function sortSeats(seats) {
  const key = (s) => (s.status === "modelled" ? ORDER[s.leader] * 100 - s.margin_central * (s.leader === "lnp" ? 1 : -1) : 999);
  return [...seats].sort((a, b) => key(a) - key(b));
}

export function onpClosest(mp, n = 8) {
  const o = mp.seats.filter((s) => s.status === "modelled" && s.finalists.includes("onp"));
  const leads = o.filter((s) => s.leader === "onp").sort((a, b) => a.margin_central - b.margin_central);
  const trails = o.filter((s) => s.leader !== "onp").sort((a, b) => a.margin_central - b.margin_central).slice(0, n);
  return { finalTwo: o.length, leads, trails };
}

export function renderResults(mp, { label = "Our default assumptions" } = {}) {
  const tot = (k) => mp.summary[k].firm + mp.summary[k].leaning + mp.summary[k].doubt;
  const rows = PARTIES.map(([k, l]) => `<tr><th scope="row">${l}</th><td>${mp.summary[k].firm}</td><td>${mp.summary[k].leaning}</td><td>${mp.summary[k].doubt}</td><td>${tot(k)}</td></tr>`).join("");
  const ranges = mp.scenarios.map((s) => `<tr><th scope="row">${esc(s.label)}</th><td>${s.tpp_alp}%</td>${PARTIES.map(([k]) => `<td>${mp.ranges[s.id][k]}</td>`).join("")}</tr>`).join("");
  const tiles = sortSeats(mp.seats).map((s) => {
    const cls = s.status === "ind-contest" ? "indc" : s.status !== "modelled" ? "none" : s.rating === "doubt" ? "doubt" : `${CLS[s.leader]}-${s.rating === "firm" ? "firm" : "leaning"}`;
    const tip = s.status === "modelled"
      ? `${s.name}: ${PARTY_LABEL[s.finalists[0]]} v ${PARTY_LABEL[s.finalists[1]]}; ${PARTY_LABEL[s.leader]} ahead by ${s.margin_central} pts (${RATING[s.rating]}); method: ${s.method}`
      : `${s.name}: ${s.reason}`;
    const fin = s.status === "modelled" ? `<span class="fin">${PARTY_LABEL[s.finalists[0]]} v ${PARTY_LABEL[s.finalists[1]]}</span>` : "";
    return `<li class="tile ${cls}" title="${esc(tip)}"><a href="/elections/vic/2026/districts/${esc(s.slug)}" aria-label="${esc(tip)}">${esc(s.name)}${fin}</a></li>`;
  }).join("");
  const c = onpClosest(mp);
  const li = (s, sign) => `<li><strong>${esc(s.name)}</strong> — One Nation ${sign} ${PARTY_LABEL[s.finalists.find((x) => x !== "onp")]} by ${s.margin_central} pts (${RATING[s.rating].toLowerCase()})</li>`;
  return `
<p class="fc-label"><strong>${esc(label)}</strong> · One Nation start ${mp.params.onpBaseline}% · Coalition↔One Nation ${Math.round(mp.params.lnpOnp * 100)}% · Others→One Nation ${Math.round(mp.params.othersOnp * 100)}% · Greens→Labor ${Math.round(mp.params.grn * 100)}% · Others→Labor ${Math.round(mp.params.othersAlp * 100)}% · One Nation poll shift ${mp.params.onpShift > 0 ? "+" : ""}${mp.params.onpShift} pts</p>
${renderHemicycle(mp)}
<section class="fc-summary">
  <div class="card">
    <h2>Seats by party and rating (central scenario)</h2>
    <table class="fc-table"><thead><tr><th scope="col">Ahead</th><th scope="col">Firm</th><th scope="col">Leaning</th><th scope="col">In doubt</th><th scope="col">Total</th></tr></thead>
    <tbody>${rows}<tr><th scope="row">Greens/IND contest, not modelled</th><td colspan="3"></td><td>${mp.ind_contest}</td></tr><tr><th scope="row">Not modelled (no baseline)</th><td colspan="3"></td><td>${mp.not_modelled}</td></tr></tbody></table>
    <p class="small muted">In doubt: two-candidate margin within ${IN_DOUBT_PP} points of 50–50. Leaning: ${IN_DOUBT_PP}–${LEANING_PP} points. Firm: more than ${LEANING_PP}. 45 seats are needed for a majority. Implied statewide One Nation vote: ${mp.onp_implied_statewide}% (poll average ${mp.onp_poll_average}%).</p>
  </div>
  <div class="card">
    <h2>Scenario ranges</h2>
    <table class="fc-table"><thead><tr><th scope="col">Preference scenario</th><th scope="col">Labor 2PP (est.)</th>${PARTIES.map(([, l]) => `<th scope="col">${l}</th>`).join("")}</tr></thead><tbody>${ranges}</tbody></table>
    <p class="small muted">Seats each party leads under each preference scenario. ${mp.ind_contest + mp.not_modelled} seats are not modelled.</p>
  </div>
</section>
<section>
  <h2>One Nation's closest seats (central scenario)</h2>
  <p class="small muted">In the final two in ${c.finalTwo} seats; ahead in ${c.leads.length}.</p>
  ${c.leads.length ? `<h3 class="small">Ahead</h3><ul class="small">${c.leads.map((s) => li(s, "ahead of")).join("")}</ul>` : ""}
  ${c.trails.length ? `<h3 class="small">Closest behind</h3><ul class="small">${c.trails.map((s) => li(s, "behind")).join("")}</ul>` : ""}
</section>
<section>
  <h2>Seat map (central scenario)</h2>
  <p class="small muted">Each tile is one district, grouped by the party ahead and ordered by margin. Hover or tap for the projected final two and margin.</p>
  <ul class="legend"><li><span class="sw labor-firm"></span>Labor firm</li><li><span class="sw labor-leaning"></span>Labor leaning</li><li><span class="sw coalition-firm"></span>Coalition firm</li><li><span class="sw coalition-leaning"></span>Coalition leaning</li><li><span class="sw greens-firm"></span>Greens</li><li><span class="sw onp-firm"></span>One Nation</li><li><span class="sw doubt"></span>In doubt</li><li><span class="sw indc"></span>Greens/IND contest, not modelled</li><li><span class="sw none"></span>Not modelled</li></ul>
  <ol class="seatmap">${tiles}</ol>
</section>`;
}

/** Slider definitions: key, label, min, max, step, unit scale. */
export const SLIDERS = [
  { key: "onpBaseline", label: "One Nation starting share where it did not stand in 2022", min: 0, max: 12, step: 0.5, fmt: (v) => `${v}%` },
  { key: "lnpOnp", label: "Coalition ↔ One Nation preference flow (symmetric)", min: 0.4, max: 0.95, step: 0.05, fmt: (v) => `${Math.round(v * 100)}%` },
  { key: "othersOnp", label: "Others → One Nation (vs Labor)", min: 0.3, max: 0.8, step: 0.05, fmt: (v) => `${Math.round(v * 100)}%` },
  { key: "grn", label: "Greens → Labor", min: 0.6, max: 0.95, step: 0.01, fmt: (v) => `${Math.round(v * 100)}%` },
  { key: "othersAlp", label: "Others → Labor (vs Coalition)", min: 0.3, max: 0.65, step: 0.01, fmt: (v) => `${Math.round(v * 100)}%` },
  { key: "onpShift", label: "One Nation poll average: add or remove points", min: -10, max: 10, step: 0.5, fmt: (v) => `${v > 0 ? "+" : ""}${v} pts` },
];

// ---------------------------------------------------------------------------
// Hemicycle: an SVG chamber of all 88 seats, built from the same model result.
// Pure string output (no framework), so it renders at build time and the
// sliders can re-render it in the browser.
const MAJORITY = 45;
// Left to right: left bloc, the contested middle, right bloc.
const GROUPS = [
  ["grn", "firm"], ["grn", "leaning"], ["alp", "firm"], ["alp", "leaning"],
  ["doubt", null], ["indc", null], ["none", null],
  ["lnp", "leaning"], ["lnp", "firm"], ["onp", "leaning"], ["onp", "firm"],
];
const FILL = {
  "grn-firm": "#2f7d3f", "grn-leaning": "#9fd0a8",
  "alp-firm": "#c8434a", "alp-leaning": "#eba3a6",
  "lnp-firm": "#2f5d9e", "lnp-leaning": "#a5bde0",
  "onp-firm": "#d97a0f", "onp-leaning": "#f4c98f",
  doubt: "url(#hc-doubt)", indc: "url(#hc-indc)", none: "#d4d4d4",
};

export function seatGroup(s) {
  if (s.status === "ind-contest") return "indc";
  if (s.status !== "modelled") return "none";
  if (s.rating === "doubt") return "doubt";
  return `${s.leader}-${s.rating === "firm" ? "firm" : "leaning"}`;
}

/** Seat centres for an n-seat hemicycle, ordered left to right by angle. */
export function hemicyclePoints(n, { rows = 6, r0 = 0.42, r1 = 1 } = {}) {
  const radii = Array.from({ length: rows }, (_, i) => r0 + ((r1 - r0) * i) / (rows - 1));
  const total = radii.reduce((a, r) => a + r, 0);
  const counts = radii.map((r) => Math.floor((n * r) / total));
  // Hand leftover seats to the outer rows.
  for (let i = rows - 1, left = n - counts.reduce((a, b) => a + b, 0); left > 0; i = (i - 1 + rows) % rows, left--) counts[i]++;
  const pts = [];
  radii.forEach((r, i) => {
    const k = counts[i];
    for (let j = 0; j < k; j++) {
      const a = Math.PI - (Math.PI * (j + 0.5)) / k; // pi (left) -> 0 (right)
      pts.push({ a, r, x: r * Math.cos(a), y: r * Math.sin(a) });
    }
  });
  return pts.sort((p, q) => q.a - p.a || q.r - p.r);
}

export function renderHemicycle(mp) {
  const byGroup = new Map(GROUPS.map(([p, r]) => [r ? `${p}-${r}` : p, []]));
  for (const s of mp.seats) byGroup.get(seatGroup(s))?.push(s);
  // Within a group, safest seats sit furthest from the centre.
  for (const [g, list] of byGroup) {
    const leftSide = g.startsWith("grn") || g.startsWith("alp");
    list.sort((a, b) => (leftSide ? -1 : 1) * ((a.margin_central ?? 0) - (b.margin_central ?? 0)) || a.name.localeCompare(b.name));
  }
  const ordered = [...byGroup.entries()].flatMap(([g, list]) => list.map((s) => ({ s, g })));
  const n = ordered.length;
  const pts = hemicyclePoints(n);
  const W = 600, R = 270, cx = 300, cy = 292, dot = 11.5;
  const count = (k) => (byGroup.get(k) || []).length;
  const party = (p) => count(`${p}-firm`) + count(`${p}-leaning`);
  const left = party("alp") + party("grn");
  const right = party("lnp") + party("onp");
  const doubt = count("doubt");
  const other = count("indc") + count("none");
  const tip = (s) => s.status === "modelled"
    ? `${s.name}: ${PARTY_LABEL[s.leader]} ahead by ${s.margin_central} pts (${RATING[s.rating].toLowerCase()}), ${PARTY_LABEL[s.finalists[0]]} v ${PARTY_LABEL[s.finalists[1]]}`
    : `${s.name}: not modelled`;
  const dots = ordered.map(({ s, g }, i) => {
    const p = pts[i];
    const x = (cx + p.x * R).toFixed(1), y = (cy - p.y * R).toFixed(1);
    return `<a href="/elections/vic/2026/districts/${esc(s.slug)}" class="hc-seat"><title>${esc(tip(s))}</title><circle cx="${x}" cy="${y}" r="${dot}" fill="${FILL[g]}"${g === "doubt" ? ' stroke="#7a6a3a" stroke-width="1.2"' : ""}/></a>`;
  }).join("");
  const verdict = (k, label) => k >= MAJORITY ? `${label} has a majority` : `${MAJORITY - k} short of a majority`;
  const leader = Math.max(...["alp", "lnp", "onp", "grn"].map(party));
  const bar = (v, cls) => `<span class="hc-bar-seg ${cls}" style="flex:${v}" title="${v}"></span>`;
  const doubtSeats = [...(byGroup.get("doubt") || [])].sort((a, b) => a.margin_central - b.margin_central);
  const row = (p) => `<tr><th scope="row"><span class="sw" style="background:${FILL[`${p}-firm`]}"></span>${PARTY_LABEL[p]}</th><td>${count(`${p}-firm`)}</td><td>${count(`${p}-leaning`)}</td><td>${party(p)}</td></tr>`;
  const legend = [["alp-firm", "Labor"], ["grn-firm", "Greens"], ["lnp-firm", "Coalition"], ["onp-firm", "One Nation"]]
    .map(([k, l]) => `<li><span class="sw" style="background:${FILL[k]}"></span>${l}</li>`).join("");
  return `
<section class="hc" aria-labelledby="hc-h">
  <h2 id="hc-h">Projected chamber (central scenario)</h2>
  <div class="hc-stats">
    <div class="hc-stat hc-left"><span class="hc-num">${left}</span><span class="hc-lab">Left bloc<br><small>Labor ${party("alp")} · Greens ${party("grn")}</small></span></div>
    <div class="hc-stat hc-mid"><span class="hc-num">${doubt}</span><span class="hc-lab">In doubt<br><small>${other ? `+${other} not modelled` : "within " + IN_DOUBT_PP + " pts"}</small></span></div>
    <div class="hc-stat hc-right"><span class="hc-num">${right}</span><span class="hc-lab">Right bloc<br><small>Coalition ${party("lnp")} · One Nation ${party("onp")}</small></span></div>
  </div>
  <figure class="hc-fig">
    <svg viewBox="0 0 ${W} 310" role="img" aria-labelledby="hc-t hc-d" class="hc-svg">
      <title id="hc-t">Projected Victorian Legislative Assembly, ${n} seats</title>
      <desc id="hc-d">Left bloc ${left} seats, right bloc ${right}, ${doubt} in doubt, ${other} not modelled. ${MAJORITY} seats are needed to govern. The table below lists the same numbers.</desc>
      <defs>
        <pattern id="hc-doubt" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#efe8d4"/><rect width="3" height="6" fill="#cbbd92"/></pattern>
        <pattern id="hc-indc" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="6" height="6" fill="#f0f0f0"/><rect width="3" height="6" fill="#bcd9c1"/></pattern>
      </defs>
      ${dots}
      <line x1="${cx}" y1="${cy - R - 16}" x2="${cx}" y2="${cy - 0.42 * R + 16}" class="hc-maj"/>
      <text x="${cx}" y="${cy - R - 20}" text-anchor="middle" class="hc-maj-t">${MAJORITY} to govern</text>
      <text x="${cx}" y="${cy - 30}" text-anchor="middle" class="hc-big">${leader}</text>
      <text x="${cx}" y="${cy - 8}" text-anchor="middle" class="hc-sub">largest party</text>
    </svg>
    <figcaption class="small muted">Each dot is a district (click for the seat page). Solid = firm, pale = leaning, hatched = in doubt (within ${IN_DOUBT_PP} pts of 50–50). Safest seats sit at the outer edges; the closest sit beside the middle.</figcaption>
  </figure>
  <div class="hc-bar" aria-hidden="true">${bar(left, "l")}${bar(doubt + other, "m")}${bar(right, "r")}<span class="hc-bar-maj" style="left:${((MAJORITY / n) * 100).toFixed(2)}%"></span><span class="hc-bar-maj" style="left:${(100 - (MAJORITY / n) * 100).toFixed(2)}%"></span></div>
  <p class="small">${verdict(left, "The left bloc").replace(/^(\d+)/, "Left bloc: $1")} · ${verdict(right, "The right bloc").replace(/^(\d+)/, "Right bloc: $1")}.</p>
  <ul class="legend">${legend}<li><span class="sw doubt"></span>In doubt</li>${other ? `<li><span class="sw indc"></span>Not modelled</li>` : ""}</ul>
  <div class="hc-cols">
    <table class="fc-table"><caption class="small muted">Chamber in numbers</caption><thead><tr><th scope="col">Party ahead</th><th scope="col">Firm</th><th scope="col">Leaning</th><th scope="col">Total</th></tr></thead>
      <tbody>${["lnp", "onp", "alp", "grn"].map(row).join("")}<tr><th scope="row">In doubt</th><td colspan="2"></td><td>${doubt}</td></tr>${other ? `<tr><th scope="row">Not modelled</th><td colspan="2"></td><td>${other}</td></tr>` : ""}</tbody></table>
    <div>
      <h3 class="small">Seats in doubt, closest first</h3>
      ${doubtSeats.length ? `<ol class="hc-doubt small">${doubtSeats.map((s) => `<li><a href="/elections/vic/2026/districts/${esc(s.slug)}">${esc(s.name)}</a> <span class="muted">${PARTY_LABEL[s.leader]} by ${s.margin_central} v ${PARTY_LABEL[s.finalists.find((x) => x !== s.leader)]}</span></li>`).join("")}</ol>` : `<p class="small muted">None.</p>`}
    </div>
  </div>
</section>`;
}
