import test from 'node:test';
import assert from 'node:assert/strict';
import {officialVocabulary} from '../src/lib/hsk.ts';
import {getRadicalCounts} from '../src/lib/radical-index.ts';

test('every dictionary radical has searchable Korean reading and meaning labels',()=>{
 const groups=getRadicalCounts(officialVocabulary);
 assert.equal(groups.length,206);
 for(const group of groups){
  assert.match(group.koreanName,/[가-힣]/u,`${group.id} Korean name`);
  assert.match(group.koreanMeaning,/[가-힣]/u,`${group.id} Korean meaning`);
  assert.ok(group.searchTerms.includes(group.koreanName));
  assert.ok(group.searchTerms.includes(group.koreanMeaning));
 }
 assert.equal(groups.find(group=>group.id==='18')?.koreanName,'칼 도');
 assert.equal(groups.find(group=>group.id==='18')?.koreanMeaning,'칼');
 assert.ok(groups.find(group=>group.id==='19')?.koreanMeaning.includes('힘'));
 assert.notEqual(groups.find(group=>group.id==='22')?.koreanName,groups.find(group=>group.id==='23')?.koreanName);
});
