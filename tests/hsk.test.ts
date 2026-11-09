import test from 'node:test';
import assert from 'node:assert/strict';
import {lexicon} from '../src/lib/combine.ts';
import {officialVocabulary,DEFAULT_SELECTION,courseWords,searchCourseWords,getEligibleCharacters,formatWordLevel,OFFICIAL_SOURCE_URL} from '../src/lib/hsk.ts';

test('official 2025/2026 syllabus retains 11000 serials and exact grade boundaries',()=>{
 assert.equal(officialVocabulary.length,11000);
 assert.equal(new Set(officialVocabulary.map(w=>w.id)).size,11000);
 const endpoints=[300,500,1000,2000,3600,5400,11000],lastWords=['做饭','左边','做客','做梦','作出','罪','做主'];
 endpoints.forEach((count,i)=>{
  const cumulative=courseWords({course:'official',level:i+1,range:'cumulative'});
  const level=courseWords({course:'official',level:i+1,range:'level'});
  assert.equal(cumulative.length,count);assert.equal(level.length,count-(endpoints[i-1]??0));
  assert.equal(cumulative.at(-1)?.hanzi,lastWords[i]);
  assert.ok(getEligibleCharacters({course:'official',level:i+1,range:'level'},level).length>0);
 });
 officialVocabulary.forEach((w,i)=>{assert.equal(w.officialIndex,i+1);assert.equal(w.id,`hsk3-${String(i+1).padStart(5,'0')}`);assert.ok(w.hanzi&&w.pinyin&&w.korean);assert.ok(w.sourcePage>=80&&w.sourcePage<=354);});
 assert.match(OFFICIAL_SOURCE_URL,/hsk.cn-bj.ufileos.com/);
});
test('legacy cumulative HSK5 stays separate from new HSK5 and advanced group',()=>{
 assert.equal(DEFAULT_SELECTION.course,'legacy5');
 assert.equal(courseWords(DEFAULT_SELECTION).length,2500);
 assert.deepEqual(courseWords(DEFAULT_SELECTION).map(w=>w.id),lexicon.map(w=>w.id));
 assert.equal(courseWords({course:'official',level:5,range:'cumulative'}).length,3600);
 const advanced=courseWords({course:'official',level:7,range:'level'});assert.equal(advanced.length,5600);
 assert.ok(advanced.every(w=>w.level===7));assert.match(formatWordLevel(advanced[0]),/7[—–-]9/);
 assert.match(formatWordLevel(lexicon[0]),/기존/);
});
test('search and eligible character practice respect the selected corpus',()=>{
 const beginner=courseWords({course:'official',level:1,range:'cumulative'});
 const advanced=courseWords({course:'official',level:7,range:'level'});
 assert.equal(searchCourseWords(beginner,'做主').length,0);
 assert.ok(searchCourseWords(advanced,'zuozhu').some(w=>w.hanzi==='做主'));
 assert.ok(searchCourseWords(officialVocabulary,'nv').some(w=>w.hanzi.includes('女')));
 assert.ok(searchCourseWords(officialVocabulary,'lv').some(w=>w.hanzi.includes('绿')));
 const first=beginner[0];assert.ok(searchCourseWords(beginner,first.korean).some(w=>w.id===first.id));
 const pool=getEligibleCharacters({course:'official',level:1,range:'cumulative'},beginner);
 assert.ok(pool.length>0);assert.ok(pool.every(c=>beginner.some(w=>w.hanzi.includes(c.hanzi))));
 assert.equal(new Set(pool.map(c=>c.id)).size,pool.length);
});
