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
