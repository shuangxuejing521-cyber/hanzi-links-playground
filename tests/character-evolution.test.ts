import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {officialVocabulary} from '../src/lib/hsk.ts';
import {lexicon} from '../src/lib/combine.ts';
import {getCourseWordCharacters} from '../src/lib/course.ts';
import {partitionEvolutionStages,type CharacterEvolutionRecord} from '../src/lib/character-evolution.ts';
import WordCharacterOrigins,{CharacterEvolutionContent} from '../src/components/CharacterEvolution.tsx';

const manifest=JSON.parse(readFileSync(new URL('../public/sources/course-evolution.json',import.meta.url),'utf8'));
test('all vocabulary characters retain a checked dictionary source entry',()=>{
 const chars=new Set([...officialVocabulary,...lexicon].flatMap(getCourseWordCharacters));
 assert.equal(chars.size,3089);
 for(const char of chars){
  const entry=manifest.characters[char];
  assert.ok(entry,char);
  assert.equal(entry.form,char);
  assert.equal(entry.sourceUrl,`https://zdic.net/hans/${encodeURIComponent(char)}`);
  assert.match(entry.checked,/^\d{4}-\d{2}-\d{2}$/);
 }
});

test('related small-seal index forms remain separate from the selected character and modern form',()=>{
 const record=manifest.characters['拽'] as CharacterEvolutionRecord;
 const result=partitionEvolutionStages('拽',record);
 assert.equal(result.associated.some(stage=>stage.url.includes('66F3')),true);
 assert.equal(result.primary.some(stage=>stage.url.includes('66F3')),false);
 const traditional=partitionEvolutionStages('练',manifest.characters['练']);
 assert.equal(traditional.primary.some(stage=>stage.url.includes('7DF4')),true);
});

test('source cards distinguish unavailable historical evidence from modern structure',()=>{
 const empty:CharacterEvolutionRecord={form:'爸',sourceUrl:'https://zdic.net/hans/%E7%88%B8',checked:'2026-11-06',availability:'not-listed',stages:[]};
 const html=renderToStaticMarkup(createElement(CharacterEvolutionContent,{hanzi:'爸',entry:empty}));
 assert.match(html,/尚未收录经核实释形/);
 assert.match(html,/未收录可展示的古字形/);
 assert.match(html,/现代字形/);
 assert.match(html,/https:\/\/zdic.net\/hans\/%E7%88%B8/);
 assert.doesNotMatch(html,/甲骨文.*<img/);
});

test('dictionary analysis is visibly attributed and remote specimens do not become local images',()=>{
 const record:CharacterEvolutionRecord={...manifest.characters['早'],stages:[...manifest.characters['早'].stages,{stage:'隶书',src:'https://img.zdic.net/zy/lishu/example.svg',url:'https://img.zdic.net/zy/lishu/example.svg',provenanceNote:'source example'}]};
 const html=renderToStaticMarkup(createElement(CharacterEvolutionContent,{hanzi:'早',entry:record}));
 assert.match(html,/汉典条目说明/);
 assert.match(html,/会意；从日、从十/);
 assert.ok(!html.includes('<img src="https://img.zdic.net/zy/lishu/example.svg"'));
 assert.match(html,/原站查看/);
});

test('advanced word characters have enabled source buttons, while repeated characters appear once',()=>{
 for(const hanzi of ['安全带','酝酿','氧气','拽','爸爸']){
  const html=renderToStaticMarkup(createElement(WordCharacterOrigins,{word:{id:'source-check',hanzi,pinyin:'',korean:'',level:7,pos:''},selected:null,onSelect:()=>{},speak:()=>{}}));
  assert.equal((html.match(/aria-pressed="false"/g)??[]).length,getCourseWordCharacters({hanzi}).length,hanzi);
  assert.doesNotMatch(html,/disabled/);
 }
});

test('a source cross-reference retains the quoted headword and its limited relationship',()=>{
 const entry:CharacterEvolutionRecord={form:'饭',checked:'2026-11-06',sourceUrl:'https://zdic.net/hans/%E9%A5%AD',availability:'found',stages:[],sourceExplanation:{kind:'shuowen-original',text:'食也。从食反聲。',indexForm:'飯',title:'说文解字',sourceUrl:'https://zdic.net/hans/%E9%A5%AD#swjz',attribution:'许慎《说文解字》；汉典条目转录',association:'dictionary-cross-reference',note:'Quoted source text'}};
 const html=renderToStaticMarkup(createElement(CharacterEvolutionContent,{hanzi:'饭',entry}));
 assert.match(html,/索引字 飯/);
 assert.match(html,/条目关联引文/);
 assert.doesNotMatch(html,/尚未收录经核实释形/);
});

test('source analysis gaps have attributed explanations without invented historic images',()=>{
 for(const hanzi of ['亮','脸','账','乒','由','瞪','噩','钙','喇','胀','岖','倘','臀']){
  const html=renderToStaticMarkup(createElement(CharacterEvolutionContent,{hanzi,entry:manifest.characters[hanzi]}));
  assert.doesNotMatch(html,/尚未收录经核实释形/,hanzi);
  assert.match(html,/<a href="https:\/\//,hanzi);
 }
 const calcium=renderToStaticMarkup(createElement(CharacterEvolutionContent,{hanzi:'钙',entry:manifest.characters['钙']}));
 assert.match(calcium,/《说文》未收此字/);
 assert.doesNotMatch(calcium,/甲骨文字形/);
});

test('早 retains all seven source-listed stages with local specimens and modern labels',()=>{
 const entry=manifest.characters['早'] as CharacterEvolutionRecord;
 assert.deepEqual(entry.stages.map(stage=>stage.stage),['甲骨文','金文','楚系简帛','说文','秦系简牍','隶书','楷书']);
 assert.ok(entry.stages.every(stage=>stage.src.startsWith('/images/course-evolution/')));
 const html=renderToStaticMarkup(createElement(CharacterEvolutionContent,{hanzi:'早',entry}));
 assert.match(html,/楚系简帛/);
 assert.match(html,/秦系简牍/);
 assert.match(html,/隶书/);
 assert.match(html,/楷书 · 现代/);
});

test('a documented blank source SVG uses its exact recovered embedded image without mutating the original record',()=>{
 const original=manifest.characters['挂'] as CharacterEvolutionRecord;
 const before=JSON.stringify(original);
 const stage=partitionEvolutionStages('挂',original).primary.find(stage=>stage.stage==='说文')!;
 assert.equal(stage.src,'/images/course-evolution/recovered-xiaozhuan-27_6302.png');
 assert.equal(createHash('sha256').update(readFileSync(new URL(`../public${stage.src}`,import.meta.url))).digest('hex'),stage.sha256);
 assert.equal(JSON.stringify(original),before);
 assert.ok(original.stages.some(stage=>stage.src==='/images/course-evolution/xiaozhuan-27_6302.svg'));
});
