import test from 'node:test';
import assert from 'node:assert/strict';
import {officialVocabulary} from '../src/lib/hsk.ts';
import {getWordImage,getPictureWordChain} from '../src/lib/word-images.ts';
import {lexicon as legacyVocabulary} from '../src/lib/combine.ts';

test('西红柿 uses a tomato photograph in both courses instead of the 红 character photograph',()=>{
 const official=officialVocabulary.find(word=>word.hanzi==='西红柿')!;
 const legacy=legacyVocabulary.find(word=>word.hanzi==='西红柿')!;
 assert.ok(official);
 assert.ok(legacy);
 for(const word of [official,legacy]){
  assert.equal(getWordImage(word)?.character,'西红柿');
  assert.match(getWordImage(word)?.src??'',/tomato\.jpg$/);
 }
});

test('word photographs are explicit sense matches, not a contains-character fallback',()=>{
 const tears=officialVocabulary.find(word=>word.hanzi==='泪水')!;
 assert.equal(getWordImage(tears)?.character,'泪');
 assert.match(getWordImage(tears)?.src??'',/6cea/);
 const knotFruit=officialVocabulary.find(word=>word.hanzi==='结'&&word.pinyin==='jiē');
 if(knotFruit)assert.equal(getWordImage(knotFruit),undefined);
 const context={id:'unreviewed-red-words',hanzi:'红细胞',pinyin:'hóngxìbāo',korean:'적혈구',level:7,pos:'名'};
 assert.equal(getWordImage(context),undefined);
 const chain=getPictureWordChain('泪',officialVocabulary);
 assert.ok(chain.some(word=>word.hanzi==='眼泪'));
 assert.ok(chain.some(word=>word.hanzi==='泪水'));
 assert.ok(chain.every(word=>getWordImage(word)?.character==='泪'));
});

test('the restored screen retains the photograph workspace instead of a replacement explorer',async()=>{
 const {readFile}=await import('node:fs/promises');
 const app=await readFile(new URL('../src/App.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(app,/CourseExplorer|WordLearningPanel|CourseConnections/);
 assert.match(app,/className="learning-workspace"/);
 assert.match(app,/<RootEvolution/);
 assert.match(app,/<LearningPhoto character=\{selected\}/);
 assert.match(app,/className="connection-panel"/);
});
