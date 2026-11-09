import test from 'node:test';
import assert from 'node:assert/strict';
import {officialVocabulary,courseWords} from '../src/lib/hsk.ts';
import {getCourseCharacter,getCourseCharactersForWords,getWordsForCourseCharacter,getRelatedCourseCharacters,matchCourseCombination,nodeIds,getCourseWordCharacters,searchCourseCharacters,getSpecimenHeadword} from '../src/lib/course.ts';

test('every official word opens complete per-character lessons, including advanced words',()=>{
 for(const word of officialVocabulary){
  const chars=getCourseWordCharacters(word);
  assert.ok(chars.length>0,word.hanzi);
  assert.ok(chars.every(char=>!!getCourseCharacter(char)),word.hanzi);
 }
 assert.equal(getCourseCharactersForWords(officialVocabulary).length,3088);
 assert.deepEqual(getCourseWordCharacters({hanzi:'安全带'}),['安','全','带']);
 assert.deepEqual(getCourseWordCharacters({hanzi:'爸爸'}),['爸']);
 assert.equal(nodeIds(getCourseCharacter('练')!.tree),'⿰纟𫠣');
 assert.equal(getCourseCharacter('安')!.tree.type,'layout');
 assert.equal(getCourseCharacter('安')!.ids,'⿱宀女');
});

test('all-word character and component connections respect grade and retain homograph entries',()=>{
 const beginner=courseWords({course:'official',level:1,range:'cumulative'});
 const advanced=courseWords({course:'official',level:7,range:'level'});
 const used=getCourseCharactersForWords(beginner);
 assert.equal(used.length,248);
 assert.ok(used.every(char=>beginner.some(word=>word.hanzi.includes(char.hanzi))));
 assert.deepEqual(getWordsForCourseCharacter('主',beginner),beginner.filter(word=>word.hanzi.includes('主')));
 assert.ok(getWordsForCourseCharacter('主',advanced).some(word=>word.hanzi==='做主'));
 for(const char of getCourseCharactersForWords(officialVocabulary)){
  assert.deepEqual(getWordsForCourseCharacter(char.hanzi,officialVocabulary),officialVocabulary.filter(word=>word.hanzi.includes(char.hanzi)));
 }
 assert.ok(getRelatedCourseCharacters('清',officialVocabulary,100).some(char=>char.hanzi==='请'));
});

test('general component combinations use exact modern source structure rather than inferred meanings',()=>{
 assert.ok(matchCourseCombination('⿰',['氵','由'],officialVocabulary).some(char=>char.hanzi==='油'));
 assert.ok(matchCourseCombination('⿰',['氵','永'],officialVocabulary).some(char=>char.hanzi==='泳'));
 assert.ok(matchCourseCombination('⿱',['宀','女'],officialVocabulary).some(char=>char.hanzi==='安'));
 assert.deepEqual(matchCourseCombination('⿰',['氵','女'],officialVocabulary),[]);
 assert.deepEqual(matchCourseCombination('⿰',['③','匕'],officialVocabulary),[]);
 assert.deepEqual(matchCourseCombination('⿱',['女','宀'],officialVocabulary),[]);
});
test('character lessons include corrected Korean glosses and accept untoned character search',()=>{
 const pool=getCourseCharactersForWords(officialVocabulary);
 assert.ok(pool.every(char=>!!char.korean&&/[가-힣]/u.test(char.korean)));
 assert.ok(searchCourseCharacters(pool,'nv').some(char=>char.hanzi==='女'));
 assert.ok(searchCourseCharacters(pool,'luo').some(char=>char.hanzi==='罗'));
 assert.deepEqual(getCourseCharacter('脊')?.pinyin,['jǐ']);
 assert.deepEqual(getCourseCharacter('宁')?.pinyin,['níng','nìng']);
 assert.match(getCourseCharacter('袱')?.korean??'',/보자기/);
});
test('specimen file headwords do not falsely label related glyphs as the target modern character',()=>{
 assert.equal(getSpecimenHeadword('https://img.zdic.net/zy/xiaozhuan/27_66F3.svg'),'曳');
 assert.equal(getSpecimenHeadword('https://img.zdic.net/zy/xiaozhuan/27_7DF4.svg'),'練');
 assert.equal(getSpecimenHeadword('https://img.zdic.net/zy/jinwen/34_E0C5.svg'),undefined);
 assert.equal(getSpecimenHeadword('https://img.zdic.net/zy/jiaguwen/42_ED1B.svg'),undefined);
});
