# Labor Assembly recontest gap

**As of 2026-08-01.** Labor holds many Assembly seats, but the tracker only counts a
Labor candidacy when there is an **individual dated source** that the person (or a named
replacement) is standing in 2026. Wikipedia “incumbent” columns are **not** enough.

## Counts

| | n |
|---|---|
| Labor-held Assembly seats | 54 |
| Labor MLA retirements (open seats) | 9 (incl. Mill Park / D’Ambrosio, Narre Warren South / Maas) |
| Labor-held seats with sourced Labor 2026 candidacy | 5 |
| **Gap — sitting Labor MLA, no sourced recontest** | **40** |

A blank Labor cell is usually **missing public recontest source**, not “Labor not standing.”

## How to close (priority)

1. Party / media announcement that the sitting member is recontesting (or a named successor).
2. Encode `data/vic2026/candidates/<district>--<slug>.yaml` with `party: labor`.
3. Prefer primary URLs over Wikipedia.
4. **Also valid:** challenger coverage that explicitly frames the sitting MLA as seeking
   re-election or as Labor’s 2026 opponent (same bar as Jacinta Allan / Alison Marchant).

## What does **not** count alone

- Wikipedia “incumbent” / candidates tables
- `viclabor.org.au/our-team` **“Candidate for …”** labels on the index, or **“State Member for …”**
  profile pages — the same roster still lists announced retirees (Vulin, Pearson, Maas,
  D’Ambrosio, etc.) as if they were candidates. Treat as MP directory, not a 2026 slate.
- Emily’s List “seeking re-election” lists that still include known retirees

## Gap list (sitting Labor MLA, not in retirements, no live Labor candidacy)

Generate anytime:

```bash
node -e "
import { loadElection, LIVE_STATUSES } from './scripts/lib/data.mjs';
const d = loadElection('vic2026');
const ret = new Set(d.retirements.filter(r => r.role==='MLA' && r.party==='labor').map(r => r.seat));
for (const x of d.districts.filter(x => x.incumbent_party==='labor')) {
  if (ret.has(x.slug)) continue;
  const has = x.candidates.some(c => c.party==='labor' && LIVE_STATUSES.includes(c.status));
  if (!has) console.log(x.slug + '\t' + x.incumbent);
}
"
```

Do **not** bulk-import wiki incumbents without individual sources (methodology / legal risk).
