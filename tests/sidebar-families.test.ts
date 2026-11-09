import test from 'node:test';
import assert from 'node:assert/strict';
import {officialVocabulary,courseWords,getEligibleCharacters} from '../src/lib/hsk.ts';
import {radicals,characters} from '../src/lib/combine.ts';
import {sidebarFamilies,getSidebarFamilyCounts,getSidebarFamilyCharacters,filterSidebarFamilyWords,getFamilyExplorationTarget} from '../src/lib/sidebar-families.ts';

test('the left sidebar retains all26 teaching roots and appends every other attested dictionary group',()=>{
 assert.equal(sidebarFamilies.length,206);
 assert.equal(new Set(sidebarFamilies.map(family=>family.id)).size,206);
 assert.equal(new Set(sidebarFamilies.map(family=>family.dictionaryId)).size,206);
 for(const [index,root] of radicals.entries()){
  const family=sidebarFamilies[index];assert.equal(family.id,root.id);assert.equal(family.form,root.form);assert.equal(family.name,root.name);assert.equal(family.korean,root.korean);
  for(const character of characters.filter(char=>char.radical===root.id))assert.ok(family.characters.includes(character.hanzi));
 }
 assert.equal(sidebarFamilies.find(family=>family.id==='body')?.dictionaryId,'130');
 assert.equal(sidebarFamilies.find(family=>family.id==='ice')?.dictionaryId,'15');
 assert.ok(sidebarFamilies.find(family=>family.id==='ice')?.searchTerms.includes('仌'));
 assert.equal(sidebarFamilies.find(family=>family.dictionaryId==='74')?.id,'dict-74');
 assert.ok(sidebarFamilies.slice(26).every(family=>family.id===`dict-${family.dictionaryId}`));
});

test('all11000 words and all3088 characters are reachable through the extended sidebar',()=>{
 const familyCharacters=new Set(sidebarFamilies.flatMap(family=>getSidebarFamilyCharacters(family.id,officialVocabulary)));
 assert.equal(familyCharacters.size,3088);
 const reached=new Set(sidebarFamilies.flatMap(family=>filterSidebarFamilyWords(officialVocabulary,family.id).map(word=>word.id)));
 assert.equal(reached.size,11000);
 const roof=sidebarFamilies.find(family=>family.dictionaryId==='40')!;
 assert.equal(roof.id,'dict-40');assert.ok(getSidebarFamilyCharacters(roof.id,officialVocabulary).includes('安'));
 assert.ok(filterSidebarFamilyWords(officialVocabulary,roof.id).some(word=>word.hanzi==='安全'));
});

test('sidebar words respect scope, retain homographs and legacy桔, and never duplicate one entry',()=>{
 const beginner=courseWords({course:'official',level:1,range:'level'});
 const counts=getSidebarFamilyCounts(beginner);
 for(const family of counts){
  const words=filterSidebarFamilyWords(beginner,family.id);
  assert.equal(family.wordCount,words.length);
  assert.equal(new Set(words.map(word=>word.id)).size,words.length);
  assert.ok(words.every(word=>word.level===1));
 }
 const legacy=courseWords({course:'legacy5',level:5,range:'cumulative'});
 assert.ok(getSidebarFamilyCharacters('wood',legacy).includes('桔'));
 assert.ok(getSidebarFamilyCharacters('wood',officialVocabulary).includes('林'));
 assert.deepEqual(filterSidebarFamilyWords(beginner,'invalid'),[]);
});

test('a nonempty original family without a legacy lesson opens its own scoped character instead of retaining another family',()=>{
 const selection={course:'official',level:1,range:'level'} as const;
 const words=courseWords(selection),eligible=new Set(getEligibleCharacters(selection,words).map(char=>char.id));
 for(const id of ['body','fire','rice','clothes','insect','vehicle']){
  const target=getFamilyExplorationTarget(id,words,eligible);
  assert.equal(target.kind,'course',id);
  if(target.kind==='course')assert.ok(getSidebarFamilyCharacters(id,words).includes(target.hanzi),id);
 }
 const old=getFamilyExplorationTarget('water',words,eligible);
 assert.equal(old.kind,'legacy');
 assert.deepEqual(getFamilyExplorationTarget('invalid',words,eligible),{kind:'empty'});
});
