import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {characters,parts,radicals} from '../src/lib/combine.ts';
const data=async(name:string)=>JSON.parse(await readFile(new URL(`../src/data/${name}.json`,import.meta.url),'utf8'));
test('every selectable component and complete character has specific evidence, never a generic missing picture',async()=>{
 const components=await data('component-evidence'),audit=await data('character-evidence'),geometry=await data('glyph-geometry');
 assert.equal(Object.keys(components).length,157);assert.equal(Object.keys(audit).length,183);
 for(const part of parts){const e=components[part.form];assert.ok(e,part.form);assert.ok(e.meaningZh&&e.originNote&&e.shapeNote);assert.ok(e.sources.length);assert.ok(geometry[part.form]?.strokes.length,part.form);}
 for(const c of characters){const e=audit[c.hanzi];assert.ok(e?.historicalNote,c.hanzi);assert.ok(e.sources.length,c.hanzi);assert.equal(geometry[c.hanzi]?.strokes.length,geometry[c.hanzi]?.sides.length);assert.ok(geometry[c.hanzi]?.sides.includes(0));assert.ok(geometry[c.hanzi]?.sides.includes(1));}
 const signatures=characters.map(c=>geometry[c.hanzi].strokes.join('|'));assert.equal(new Set(signatures).size,183);
 for(const r of radicals)assert.ok(components[r.form],r.form);
});
test('phonetic and simplified roles do not inherit invented object etymologies',async()=>{
 const e=await data('character-evidence'),p=await data('component-evidence');
 assert.equal(e['油'].phoneticPart,'由');assert.equal(e['泳'].phoneticPart,'永');
 assert.match(e['细'].historicalNote,/囟/);assert.match(e['练'].historicalNote,/柬/);assert.match(e['经'].historicalNote,/巠/);
 assert.match(e['脏'].historicalNote,/髒|骨|葬/);assert.doesNotMatch(e['脏'].historicalNote,/月.*表示.*身体/);
 assert.equal(p['由'].confidence,'disputed');assert.equal(p['𫠣'].originKind,'simplified-shape');assert.equal(p['𢀖'].originKind,'simplified-shape');
});
test('component path extraction uses the actual simplified glyph including rare parts',async()=>{
 const g=await data('glyph-geometry');
 for(const [part,parent] of [['𫠣','练'],['𢀖','经']]){
  assert.equal(g[part].extractedFrom,parent);
  assert.deepEqual(g[part].strokes,g[parent].strokes.filter((_:string,i:number)=>g[parent].sides[i]===1));
 }
});
test('contextual roles recognize traditional phonetics and semantic variants without assigning meat to dirty',async()=>{
 const {roleFor}=await import('../src/lib/evidence.ts');
 const c=(h:string)=>characters.find(c=>c.hanzi===h)!;
 for(const h of ['妈','绿','钱','现'])assert.equal(roleFor(c(h),1).label,'历史声旁',h);
 for(const h of ['冰','初','料'])assert.equal(roleFor(c(h),0).label,'意义线索',h);
 assert.equal(roleFor(c('初'),1).label,'意义线索');
 assert.equal(roleFor(c('视'),1).label,'意义线索');
 assert.equal(roleFor(c('脏'),0).label,'简化后字形');
 assert.equal(roleFor(c('视'),0).label,'简化后字形');
});
test('all published root and silk-use photographs exist and are distinct, and object diagrams never share a fallback',async()=>{
 const {createHash}=await import('node:crypto');const {createElement}=await import('react');const {renderToStaticMarkup}=await import('react-dom/server');
 const {default:RootObject}=await import('../src/components/RootObject.tsx');const roots=await data('root-evidence');const hashes=[];
 for(const file of [...radicals.map(r=>`roots/${r.id}`),...[...'红绿级结练组经细线续纪约织给绝纸'].map(h=>`characters/${h.codePointAt(0)!.toString(16)}`)]){
  const bytes=await readFile(new URL(`../public/images/${file}.webp`,import.meta.url));assert.ok(bytes.length>1000,file);hashes.push(createHash('sha256').update(bytes).digest('hex'));
 }
 assert.equal(new Set(hashes).size,42);
 const diagrams=roots.map((r:any)=>renderToStaticMarkup(createElement(RootObject,{kind:r.visualKey,label:'shape',trace:true})).replace(/id="[^"]*"/g,''));
 assert.equal(new Set(diagrams).size,26);for(const svg of diagrams)assert.doesNotMatch(svg,/形体说明/);
});
test('dirty zāng does not inherit the meat-root identity from its browsing category',async()=>{
 const {createElement}=await import('react');const {renderToStaticMarkup}=await import('react-dom/server');const {default:Panel}=await import('../src/components/ComponentEvidencePanel.tsx');
 const c=characters.find(c=>c.hanzi==='脏')!;const html=renderToStaticMarkup(createElement(Panel,{first:c.firstPart,second:c.secondPart,character:c,speak:()=>{}}));
 assert.doesNotMatch(html,/(?:본자|本字) 肉/);assert.match(html,/간체 형태/);
 const evidence=await data('character-evidence');assert.equal(evidence['脏'].traditional,'髒');
});
test('simplification lessons retain the historical phonetic shapes for visual comparison',async()=>{
 const g=await data('glyph-geometry');for(const h of ['囟','柬','巠','戠','髒','骨','葬'])assert.ok(g[h]?.strokes.length,h);
});
test('every combination has its own modern-meaning photograph, with no reused scene file',async()=>{
 const images=await data('image-manifest');const {createHash}=await import('node:crypto');const hashes=[];
 assert.equal(Object.keys(images).length,183);
 for(const c of characters){const m=images[c.hanzi];assert.ok(m?.caption&&m?.alt,c.hanzi);const bytes=await readFile(new URL(`../public${m.src}`,import.meta.url));hashes.push(createHash('sha256').update(bytes).digest('hex'));}
 assert.equal(new Set(hashes).size,183);
});
test('source-confirmed contextual exceptions carry their actual meaning or sound role',async()=>{
 const {roleFor}=await import('../src/lib/evidence.ts');const c=(h:string)=>characters.find(c=>c.hanzi===h)!;
 assert.equal(roleFor(c('城'),0).label,'意义线索');assert.equal(roleFor(c('烟'),1).label,'历史声旁');assert.equal(roleFor(c('矿'),1).label,'历史声旁');
});
test('HanDian evolution uses each root actual attested stages and local sourced specimens',async()=>{
 const e=await data('radical-evolution');assert.equal(Object.keys(e).length,26);
 assert.deepEqual(e.wood.stages.map((s:any)=>s.stage),['甲骨文','金文','楚系简帛','说文','秦系简牍','隶书','楷书']);
 assert.equal(e.hand.stages[0].stage,'金文');assert.equal(e.metal.stages[0].stage,'金文');assert.ok(!e.body.stages.some((s:any)=>s.stage==='金文'));
 for(const r of radicals){const item=e[r.id];assert.ok(item.sourceUrl.includes('zdic.net/hans/'));assert.ok(item.stages.length);for(const s of item.stages){assert.equal(s.license,'CC0 1.0');assert.ok(s.provenanceNote);const b=await readFile(new URL(`../public${s.src}`,import.meta.url),'utf8');assert.match(b,/<svg/);assert.doesNotMatch(b,/<script|<foreignObject/);}}
});
test('teaching sequence selects representative forms without manufacturing a universal chronology',async()=>{
 const {getPrimaryStages,stageLabel}=await import('../src/lib/evolution.ts');
 assert.deepEqual(getPrimaryStages('wood').map(s=>s.stage),['甲骨文','金文','说文','楷书']);
 assert.deepEqual(getPrimaryStages('hand').map(s=>s.stage),['金文','说文','楷书']);assert.ok(!getPrimaryStages('fire').some(s=>s.stage==='金文'));
 assert.equal(stageLabel('说文'),'《说文》小篆');
});
