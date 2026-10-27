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
