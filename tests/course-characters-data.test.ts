import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import course from '../src/data/course-characters.json';
import audit from '../public/sources/course-characters-audit.json';
import reviewed from '../src/data/characters.json';
import official from '../src/data/hsk-official.json';
import legacy from '../src/data/lexicon.json';

type Node={type:'leaf';form:string}|{type:'layout';operator:string;children:Node[]};
const entries=course.characters as Record<string,{hanzi:string;ids:string;parts:string[];tree:Node;glyph:string;strokeCount:number;pinyin:string[];korean:string|null}>;
function ids(node:Node):string{return node.type==='leaf'?node.form:node.operator+node.children.map(ids).join('');}

test('course diagrams retain reviewed modern parts and support vertical and three-part layouts',()=>{
 assert.equal(entries['安'].ids,'⿱宀女');
 assert.deepEqual(entries['安'].parts,['宀','女']);
 assert.equal(entries['安'].tree.type,'layout');
 assert.equal(entries['器'].ids,'⿳吅犬吅');
 assert.deepEqual(entries['器'].parts,['吅','犬','吅']);
 assert.ok((course.glyphs as Record<string,unknown>)['吅']);
 assert.equal(entries['练'].ids,'⿰纟𫠣');
 assert.deepEqual(entries['练'].parts,['纟','𫠣']);
 assert.ok(course.glyphs['𫠣']);
});

test('unencoded source markers stay contextual and never become reusable characters',()=>{
 const components=course.components as Record<string,{pinyin:string[]}>;
 const glyphs=course.glyphs as Record<string,{src:string}>;
 assert.equal(components['③'],undefined);
 assert.equal(glyphs['③'],undefined);
 assert.ok(glyphs['不@1']);
 assert.ok(glyphs['北@0']);
 assert.notEqual(glyphs['不@1'].src,glyphs['北@0'].src);
 assert.deepEqual(components['𫠣'].pinyin,[]);
});

test('every official and legacy Hanzi has a complete modern structure and real outline',()=>{
 const chars=new Set([...official,...legacy].flatMap(word=>[...word.hanzi].filter(char=>/\p{Script=Han}/u.test(char))));
 assert.equal(chars.size,3089);
 assert.equal(Object.keys(entries).length,3089);
 for(const char of chars){
  const entry=entries[char];assert.ok(entry,char);
  assert.equal(entry.hanzi,char);assert.equal(ids(entry.tree),entry.ids);
  assert.ok(entry.pinyin.length>0&&entry.strokeCount>0);
  assert.ok(existsSync(resolve('public',entry.glyph.slice(1))),`${char} outline exists`);
  const svg=readFileSync(resolve('public',entry.glyph.slice(1)),'utf8');
  assert.match(svg,/<path /);assert.doesNotMatch(svg,/<text[\s>]/);
  assert.equal((svg.match(/<path /g)??[]).length,entry.strokeCount);
 }
 assert.equal(course.coverage.officialCharacters,3088);
 assert.equal(course.coverage.coveredOfficialCharacters,3088);
 assert.equal(course.coverage.missingCharacterGlyphs.length,0);
 for(const character of reviewed)assert.equal(entries[character.hanzi].ids,character.ids);
});

test('published outlines match their audit hashes and exact extracted stroke records',()=>{
 assert.equal(readFileSync('src/data/course-characters.json','utf8'),readFileSync('public/sources/course-characters.json','utf8'));
 const glyphs=course.glyphs as Record<string,{src:string}>;
 const glyphAudit=audit.glyphs as Record<string,{sha256:string;strokeCount:number;extractedFrom?:string;strokeIndexes?:number[]}>;
 for(const [form,glyph] of Object.entries(glyphs)){
  const bytes=readFileSync(resolve('public',glyph.src.slice(1)));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),glyphAudit[form].sha256,form);
  assert.equal((bytes.toString().match(/<path /g)??[]).length,glyphAudit[form].strokeCount,form);
 }
 assert.equal(glyphAudit['𫠣'].extractedFrom,'练');
 assert.equal(glyphAudit['吅'].extractedFrom,'品');
 assert.equal(glyphAudit['吅'].strokeIndexes?.length,6);
});
