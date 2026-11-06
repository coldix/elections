// Renders the Council forecast chamber (40 seats) from buildCouncilForecast().
import { hemicyclePoints } from "./forecast-view.mjs";
import { blocOf } from "../../../scripts/lib/council.mjs";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const SEAT_LABEL = { coalition: "Coalition", labor: "Labor", greens: "Greens", "one-nation": "One Nation", "legalise-cannabis": "Legalise Cannabis", "animal-justice": "Animal Justice", dlp: "Labour DLP", "shooters-fishers-farmers": "Shooters, Fishers and Farmers", "liberal-democrats-2022": "Liberal Democrats (2022 name)", "victorian-socialists": "Victorian Socialists", "family-first": "Family First" };
export const SEAT_COLOUR = { coalition: "#2f5d9e", labor: "#c8434a", greens: "#2f7d3f", "one-nation": "#d97a0f" };
export const labelFor = (p, names = {}) => SEAT_LABEL[p] ?? names[p] ?? p;
export const colourFor = (p) => SEAT_COLOUR[p] ?? (blocOf(p) === "left" ? "#b07ab8" : blocOf(p) === "right" ? "#7a6a3a" : "#888");
const ORDER = ["greens", "labor"];
const RIGHT = ["coalition", "one-nation"];
const RATING = { firm: "firm", leaning: "leaning", doubt: "in doubt" };
export const MAJORITY = 21;

export function renderCouncilChamber(fc) {
  const seats = fc.regions.flatMap((r) => r.seats.map((s) => ({ ...s, region: r.name, slug: r.slug, names: r.group_names })));
  const rank = (p) => {
    const i = ORDER.indexOf(p); if (i >= 0) return i;
    const j = RIGHT.indexOf(p); if (j >= 0) return 10 + j;
    return blocOf(p) === "left" ? 2 : blocOf(p) === "right" ? 8 : 5;
  };
  seats.sort((a, b) => rank(a.seat_party) - rank(b.seat_party) || a.seat_party.localeCompare(b.seat_party) || (a.rating === "firm" ? -1 : 1));
  const pts = hemicyclePoints(seats.length, { rows: 4, r0: 0.5 });
  const W = 600, R = 270, cx = 300, cy = 322, dot = 16;
  const dots = seats.map((s, i) => {
    const p = pts[i]; const x = (cx + p.x * R).toFixed(1), y = (cy - p.y * R).toFixed(1);
    const tip = `${s.region}: ${labelFor(s.seat_party, s.names)}, seat ${s.order} (${RATING[s.rating]})${s.lower_confidence ? ", lower confidence" : ""}`;
    const op = s.rating === "firm" ? 1 : 0.55;
    const ring = s.lower_confidence ? ' stroke="#111" stroke-width="2.4" stroke-dasharray="3 2"' : "";
    return `<a href="#region-${esc(s.slug)}" class="hc-seat"><title>${esc(tip)}</title><circle cx="${x}" cy="${y}" r="${dot}" fill="${colourFor(s.seat_party)}" fill-opacity="${op}"${ring}/></a>`;
  }).join("");
  const legend = Object.entries(fc.totals).map(([p, n]) => `<li><span class="sw" style="background:${colourFor(p)}"></span>${esc(labelFor(p))} ${n}</li>`).join("");
  const largest = Math.max(...Object.values(fc.totals));
  return `
<figure class="hc-fig">
  <svg viewBox="0 0 ${W} 340" role="img" aria-labelledby="cc-t cc-d" class="hc-svg">
    <title id="cc-t">Projected Victorian Legislative Council, ${fc.total} seats</title>
    <desc id="cc-d">${Object.entries(fc.totals).map(([p, n]) => `${labelFor(p)} ${n}`).join(", ")}. ${MAJORITY} seats are a majority. ${fc.lower_confidence} seats are lower confidence. The tables below list the same numbers.</desc>
    ${dots}
    <line x1="${cx}" y1="${cy - R - 22}" x2="${cx}" y2="${cy - 0.5 * R + 20}" class="hc-maj"/>
    <text x="${cx}" y="${cy - R - 28}" text-anchor="middle" class="hc-maj-t">${MAJORITY} for a majority</text>
    <text x="${cx}" y="${cy - 30}" text-anchor="middle" class="hc-big">${largest}</text>
    <text x="${cx}" y="${cy - 8}" text-anchor="middle" class="hc-sub">largest party</text>
  </svg>
  <figcaption class="small muted">Each dot is one seat (click to jump to its region). Solid = won with a full quota, pale = won on preferences or leftover votes, dashed ring = lower confidence.</figcaption>
</figure>
<ul class="legend">${legend}<li><span class="sw lowconf-key"></span>Dashed ring = lower confidence</li></ul>`;
}

/** Slider definitions for /forecast/council (exhaust + same-side). */
export const COUNCIL_SLIDERS = [
  { key: "exhaust", label: "Share of excluded votes that exhaust", min: 0.05, max: 0.5, step: 0.05, fmt: (v) => `${Math.round(v * 100)}%` },
  { key: "sameBloc", label: "Of the rest, share that stay on the same side", min: 0.3, max: 0.9, step: 0.05, fmt: (v) => `${Math.round(v * 100)}%` },
];

const RATING_LABEL = { firm: "Firm", leaning: "Leaning", doubt: "In doubt" };
const HOW_LABEL = { quota: "full quota on first preferences", "quota-after-preferences": "full quota after preferences", remainder: "leftover votes and preferences" };

/** One-row-per-region last-seat table (updates with the sliders). */
export function renderLastSeatTable(fc) {
  const rows = fc.regions.map((r) => {
    const last = r.seats[r.seats.length - 1];
    const closest = r.closest
      ? `${esc(labelFor(r.closest.excluded, r.group_names))} last out on ${r.closest.excluded_share}% against ${esc(labelFor(r.closest.next, r.group_names))} on ${r.closest.next_share}%`
      : "—";
    return `<tr class="${last.lower_confidence ? "lowconf-row" : ""}"><th scope="row"><a href="#region-${esc(r.slug)}">${esc(r.name)}</a></th><td><span class="sw" style="background:${colourFor(last.seat_party)}"></span> ${esc(labelFor(last.seat_party, r.group_names))}</td><td>${RATING_LABEL[last.rating]}</td><td class="small">${closest}</td></tr>`;
  }).join("");
  return `<table class="fc-table cc-last"><thead><tr><th scope="col">Region</th><th scope="col">Last seat</th><th scope="col">Rating</th><th scope="col">Closest for the last seat</th></tr></thead><tbody>${rows}</tbody></table>`;
}

/** Live party totals for the current flow (single column). */
export function renderCurrentTotals(fc) {
  const rows = Object.entries(fc.totals).map(([p, n]) => `<tr><th scope="row"><span class="sw" style="background:${colourFor(p)}"></span> ${esc(labelFor(p))}</th><td>${n}</td></tr>`).join("");
  return `<table class="fc-table"><thead><tr><th scope="col">Party</th><th scope="col">Seats</th></tr></thead><tbody>${rows}</tbody></table><p class="small muted">${MAJORITY} seats are a majority of 40. ${fc.lower_confidence} of the ${fc.total} seats are lower confidence.</p>`;
}

/** Seat list markup for one region card (so sliders can refresh the last-seat call). */
export function renderRegionSeatList(r) {
  const items = r.seats.map((s) => {
    const note = s.lower_confidence ? `<p class="small note">Lower confidence. ${esc(s.note)}</p>` : "";
    return `<li class="${s.lower_confidence ? "lowconf" : ""}"><span class="sw" style="background:${colourFor(s.seat_party)}"></span> <strong>${esc(labelFor(s.seat_party, r.group_names))}</strong> <span class="muted">${RATING_LABEL[s.rating]}, ${HOW_LABEL[s.how]}</span>${note}</li>`;
  }).join("");
  const closest = r.closest
    ? `<p class="small cc-closest">Closest for the last seat: ${esc(labelFor(r.closest.excluded, r.group_names))} was last out on ${r.closest.excluded_share}% against ${esc(labelFor(r.closest.next, r.group_names))} on ${r.closest.next_share}%.</p>`
    : `<p class="small cc-closest"></p>`;
  return `<ol class="seats">${items}</ol>${closest}`;
}

/**
 * Live block re-rendered by the Council sliders: chamber, current totals, last-seat table.
 * Scenario comparison table stays outside this block as a static reference.
 */
export function renderCouncilLive(fc, { label = "Our default assumptions" } = {}) {
  const p = fc.params ?? { exhaust: 0.2, sameBloc: 0.6 };
  return `
<p class="fc-label"><strong>${esc(label)}</strong> · Exhaust ${Math.round(p.exhaust * 100)}% · Same side ${Math.round(p.sameBloc * 100)}%</p>
<section>
  <h2>Projected chamber</h2>
  ${renderCouncilChamber(fc)}
</section>
<section class="fc-summary">
  <div class="card">
    <h2>Seats by party (this scenario)</h2>
    ${renderCurrentTotals(fc)}
  </div>
  <div class="card">
    <h2>Last seat in each region</h2>
    <p class="small muted">The fifth seat in every region is decided on preferences. These eight contests move with the sliders.</p>
    ${renderLastSeatTable(fc)}
  </div>
</section>`;
}
