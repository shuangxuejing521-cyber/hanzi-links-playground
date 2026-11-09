import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {characters,combineParts,getWordsForCharacter} from '../src/lib/combine.ts';
import {roleFor} from '../src/lib/evidence.ts';

const data=async(name:string)=>JSON.parse(await readFile(new URL(`../src/data/${name}.json`,import.meta.url),'utf8'));
const sha=(bytes:string|Buffer)=>createHash('sha256').update(bytes).digest('hex');
function canonical(value:unknown):string{
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 if(value&&typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>JSON.stringify(k)+':'+canonical(v)).join(',')+'}';
 return JSON.stringify(value);
}
const additions=[['汗','氵','干'],['流','氵','㐬'],['池','氵','也'],['泥','氵','尼'],['吹','口','欠'],['咳','口','亥'],['桃','木','兆'],['柳','木','卯'],['坡','土','皮'],['塔','土','荅'],['铃','钅','令'],['饮','饣','欠']];

test('v5 original 171 lessons, 26 root materials and every original image byte stay unchanged',async()=>{
 const baseline=JSON.parse(await readFile(new URL('./fixtures/restoration-v5-baseline.json',import.meta.url),'utf8'));
 assert.equal(baseline.revision,'39e89e45da95a4b9f44817e4d9814ae013a1d80b');
 assert.equal(baseline.records.characters.length,171);assert.equal(baseline.records.radicals.length,26);
 for(const [name,original] of Object.entries(baseline.records)){
  const current=await data(name);
  if(name==='characters')assert.deepEqual(current.filter((c:any)=>!additions.some(([h])=>h===c.hanzi)),original);
  else if(name==='character-evidence'||name==='image-manifest')for(const [h,record] of Object.entries(original as object))assert.deepEqual(current[h],record,`${name}: ${h}`);
  else assert.deepEqual(current,original,name);
 }
 for(const [name,entries] of Object.entries(baseline.entryHashes)){
  const current=await data(name);
  for(const [h,hash] of Object.entries(entries as object))assert.equal(sha(canonical(current[h])),hash,`${name}: ${h}`);
 }
 for(const [path,hash] of Object.entries(baseline.imageHashes))assert.equal(sha(await readFile(new URL('../'+path,import.meta.url))),hash,path);
});

test('exactly twelve additions have primary structures, real stroke ownership, independent photos and legacy word links',async()=>{
 const evidence=await data('character-evidence'),components=await data('component-evidence'),geometry=await data('glyph-geometry'),images=await data('image-manifest');
 const sources=JSON.parse(await readFile(new URL('./fixtures/structure-source-lines.json',import.meta.url),'utf8'));
 const photos=JSON.parse(await readFile(new URL('../public/sources/restored-new-photos.json',import.meta.url),'utf8'));
 const audit=JSON.parse(await readFile(new URL('../public/sources/restored-additions-audit.json',import.meta.url),'utf8'));
 assert.equal(characters.length,183);assert.equal(Object.keys(evidence).length,183);assert.equal(Object.keys(components).length,157);assert.equal(Object.keys(images).length,183);
 for(const [h,left,right] of additions){
  const result=combineParts(left,right);assert.equal(result.status,'found',h);const c=result.character!;
  assert.equal(c.hanzi,h);assert.equal(c.ids,'⿰'+left+right);assert.equal(sources[h].makeMeAHanziDecomposition,c.ids);
  assert.ok(sources[h].cjkviRawLine.includes(c.ids),h);assert.deepEqual(c.wordIds,getWordsForCharacter(h).map(w=>w.id));
  assert.ok(c.korean&&c.pinyin&&c.example.korean,h);assert.ok(evidence[h].sources.length,h);
  assert.equal(geometry[h].strokes.length,geometry[h].sides.length,h);assert.deepEqual([...new Set(geometry[h].sides)].sort(),[0,1]);
  assert.equal(audit.characters[h].cjkviRawLine,sources[h].cjkviRawLine);assert.equal(audit.characters[h].makeMeAHanziDecomposition,c.ids);
  assert.deepEqual(audit.characters[h].makeMeAHanziMatches.map((m:number[])=>m[0]),geometry[h].sides,h);
  assert.equal(images[h].src,photos[h].src);assert.equal(sha(await readFile(new URL('../public'+images[h].src,import.meta.url))),photos[h].sha256,h);
 }
 assert.equal(images['西红柿'],undefined);assert.ok(!characters.some(c=>c.hanzi==='西红柿'));
 for(const name of ['characters','character-evidence','component-evidence','glyph-geometry','image-manifest'])assert.equal(await readFile(new URL(`../src/data/${name}.json`,import.meta.url),'utf8'),await readFile(new URL(`../public/sources/${name}.json`,import.meta.url),'utf8'),name);
});

test('new historical explanations distinguish altered shapes, semantic combination and modern meaning',async()=>{
 const evidence=await data('character-evidence'),components=await data('component-evidence');
 const c=(h:string)=>characters.find(c=>c.hanzi===h)!;
 assert.equal(evidence['池']?.phoneticPart,'它');assert.equal(roleFor(c('池'),1).label,'现代字形部件');
 assert.equal(evidence['吹']?.phoneticPart,null);assert.equal(roleFor(c('吹'),1).label,'意义线索');
 assert.equal(c('咳')?.pinyin,'ké');assert.match(evidence['咳']?.historicalNote??'',/笑/);
 assert.equal(components['荅']?.pinyin,'dá');assert.equal(components['卯']?.confidence,'disputed');assert.equal(components['亥']?.confidence,'disputed');
 assert.match(evidence['泥']?.historicalNote??'',/水名|河流/);assert.match(evidence['饮']?.historicalNote??'',/酉|酓/);
});
