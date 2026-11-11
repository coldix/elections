import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {parse} from 'yaml';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/vec2026-final-nominations.json',import.meta.url),'utf8'));
const dir=new URL('../data/vic2026/candidates/',import.meta.url);
const candidates=readdirSync(dir).filter(f=>f.endsWith('.yaml')&&!f.startsWith('_')).map(f=>parse(readFileSync(new URL(f,dir),'utf8')).candidate);
const normal=s=>s.normalize('NFKD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const matches=(c,r)=>normal(c.name)===normal(r.name)&&c.contest===r.contest&&c.party===r.party&&c.chamber===r.chamber;
test('VEC final report fixture contains 1,037 unique candidates in all 96 electorates, with identity columns only',()=>{
 assert.equal(fixture.candidates.length,1037);
 assert.equal(new Set(fixture.candidates.map(r=>r.contest)).size,96);
 assert.equal(new Set(fixture.candidates.map(r=>r.row)).size,1037);
 for(const r of fixture.candidates) assert.deepEqual(Object.keys(r).sort(),['chamber','contest','name','party','raw','row']);
});
test('every final VEC nomination has exactly one party/seat/chamber/name match and official nomination evidence',()=>{
 for(const r of fixture.candidates){
  const found=candidates.filter(c=>matches(c,r));
  assert.equal(found.length,1,`${r.name}, ${r.contest}`);
  assert.ok(found[0].history.some(h=>h.status==='nominated'&&h.date==='2026-11-09'&&h.source.url===fixture.source.url),r.name);
  const c=found[0],last=c.history[c.history.length-1];
  // A party can disendorse after nominations close; the name stays on the ballot.
  if(c.status==='disendorsed') assert.ok(last.status==='disendorsed'&&last.date>'2026-11-09'&&last.source?.url,r.name);
  else assert.equal(c.status,'nominated',r.name);
 }
});
test('all 14 unmatched ledger entries retain their previous status, with no inferred withdrawals',()=>{
 assert.equal(fixture.retainedUnmatched.length,14);
 assert.equal(candidates.length,1037+14);
 for(const r of fixture.retainedUnmatched){
  const found=candidates.filter(c=>normal(c.name)===normal(r.name)&&c.contest===r.contest&&c.party===r.party);
  assert.equal(found.length,1,r.name);assert.equal(found[0].status,r.status,r.name);
 }
});
test('all 19 explicit ballot-name/electorate corrections retain sourced correction and endorsement history',()=>{
 assert.equal(fixture.corrections.length,19);
 for(const {was,now} of fixture.corrections){
  const c=candidates.find(c=>matches(c,now));assert.ok(c,now.name);
  assert.ok(c.corrections.some(r=>r.source.url===fixture.source.url&&r.was.includes(was.name)&&r.now.includes(now.name)),now.name);
  assert.ok(c.history.some(h=>h.status!=='nominated'),now.name);
 }
});
