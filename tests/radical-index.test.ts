import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/data/dictionary-radicals.json';
import {officialVocabulary,courseWords} from '../src/lib/hsk.ts';
import {getRadicalCounts,filterRadicalWords,RADICAL_VERSION} from '../src/lib/radical-index.ts';

test('dictionary index covers every official Hanzi with traceable Unicode 18 groups',()=>{
 const chars=new Set(officialVocabulary.flatMap(word=>[...word.hanzi].filter(c=>/\p{Script=Han}/u.test(c))));
 assert.equal(chars.size,3088);
 assert.equal(RADICAL_VERSION,'18.0.0');
 assert.equal(data.groups.length,206);
 assert.equal(new Set(data.groups.map(group=>group.id)).size,206);
 const assignments=data.characterRadicals as Record<string,string[]>;
 for(const char of chars){
  assert.ok(assignments[char]?.length,`${char} must be classified`);
  for(const id of assignments[char])assert.ok(data.groups.find(group=>group.id===id)?.characters.includes(char));
 }
 assert.deepEqual(assignments['井'],['7']);
 assert.deepEqual(assignments['和'],['30']);
 assert.deepEqual(assignments['月'],['74']);
 assert.deepEqual(assignments['肉'],['130']);
 assert.ok(assignments['院'].includes('170'));
 assert.ok(assignments['都'].includes('163'));
});

test('word groups overlap across characters but retain each official entry only once',()=>{
 const words=officialVocabulary.filter(word=>word.hanzi==='安全'||word.hanzi==='啊');
 assert.ok(words.length>=2);
 const roof=filterRadicalWords(words,'40');
 assert.ok(roof.some(word=>word.hanzi==='安全'));
 const mouth=filterRadicalWords(words,'30');
 assert.deepEqual(mouth,words.filter(word=>word.hanzi==='啊'));
 const counts=getRadicalCounts(officialVocabulary);
 assert.equal(counts.length,206);
 for(const group of counts){
  const matches=filterRadicalWords(officialVocabulary,group.id);
  assert.equal(group.wordCount,matches.length);
  assert.ok(matches.length>0);
  assert.equal(new Set(matches.map(word=>word.id)).size,matches.length);
 }
 assert.deepEqual(filterRadicalWords(words,'unknown'),[]);
});

test('dictionary counts respect grade scope and preserve legacy vocabulary',()=>{
 const beginner=courseWords({course:'official',level:1,range:'cumulative'});
 const counts=getRadicalCounts(beginner);
 assert.equal(counts.filter(group=>group.wordCount>0).length,97);
 assert.ok(counts.every(group=>group.wordCount<=300));
 const roof=filterRadicalWords(beginner,'40');
 assert.ok(roof.length>0&&roof.every(word=>beginner.includes(word)));
 const legacy=courseWords({course:'legacy5',level:5,range:'cumulative'});
 assert.ok(filterRadicalWords(legacy,'75').some(word=>word.hanzi==='桔子'));
});
