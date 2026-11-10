import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {officialVocabulary} from '../src/lib/hsk.ts';
import {getWordImage} from '../src/lib/word-images.ts';

const baseline=JSON.parse(readFileSync(new URL('./fixtures/word-images-original.json',import.meta.url),'utf8'));

test('adding vocabulary photographs preserves every existing mapping and image byte',()=>{
 for(const [id,expected] of Object.entries(baseline.entries))assert.deepEqual(getWordImage({id}),expected,id);
 for(const [src,expected] of Object.entries(baseline.assets)){
  const bytes=readFileSync(new URL(`../public${src}`,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),expected,src);
 }
});

test('every official level-one word has a real local meaning photograph with a caption',()=>{
 const words=officialVocabulary.filter(word=>word.level===1);
 assert.equal(words.length,300);
 const missing=words.filter(word=>!getWordImage(word)).map(word=>word.hanzi);
 assert.deepEqual(missing,[],'word photographs are incomplete');
 for(const word of words){
  const picture=getWordImage(word)!;
  assert.match(picture.src,/^\/images\/[A-Za-z0-9/_\-.]+\.(?:jpg|jpeg|webp|png)$/);
  assert.ok(existsSync(new URL(`../public${picture.src}`,import.meta.url)),word.hanzi);
  assert.ok(picture.caption.trim().length>=6,word.hanzi);
  if(picture.relation==='example-word'&&!baseline.entries[word.id])assert.ok(picture.note?.trim(),`new context note: ${word.hanzi}`);
 }
});

test('every official level-two word has a real local meaning photograph with a caption',()=>{
 const words=officialVocabulary.filter(word=>word.level===2);
 assert.equal(words.length,200);
 assert.deepEqual(words.filter(word=>!getWordImage(word)).map(word=>word.hanzi),[],'level-two photographs are incomplete');
 for(const word of words){
  const picture=getWordImage(word)!;
  assert.match(picture.src,/^\/images\/[A-Za-z0-9/_\-.]+\.(?:jpg|jpeg|webp|png)$/);
  assert.ok(existsSync(new URL(`../public${picture.src}`,import.meta.url)),word.hanzi);
  assert.ok(picture.caption.trim().length>=6,word.hanzi);
  if(picture.relation==='example-word'&&!baseline.entries[word.id])assert.ok(picture.note?.trim(),`new context note: ${word.hanzi}`);
 }
});

test('every official level-three word has a real local meaning photograph with a caption',()=>{
 const words=officialVocabulary.filter(word=>word.level===3);
 assert.equal(words.length,500);
 assert.deepEqual(words.filter(word=>!getWordImage(word)).map(word=>word.hanzi),[],'level-three photographs are incomplete');
 for(const word of words){
  const picture=getWordImage(word)!;
  assert.match(picture.src,/^\/images\/[A-Za-z0-9/_\-.]+\.(?:jpg|jpeg|webp|png)$/);
  assert.ok(existsSync(new URL(`../public${picture.src}`,import.meta.url)),word.hanzi);
  assert.ok(picture.caption.trim().length>=6,word.hanzi);
  if(picture.relation==='example-word'&&!baseline.entries[word.id])assert.ok(picture.note?.trim(),`new context note: ${word.hanzi}`);
 }
});

test('every official level-four word has a real local meaning photograph with a caption',()=>{
 const words=officialVocabulary.filter(word=>word.level===4);
 assert.equal(words.length,1000);
 assert.deepEqual(words.filter(word=>!getWordImage(word)).map(word=>word.hanzi),[],'level-four photographs are incomplete');
 for(const word of words){
  const picture=getWordImage(word)!;
  assert.match(picture.src,/^\/images\/[A-Za-z0-9/_\-.]+\.(?:jpg|jpeg|webp|png)$/);
  assert.ok(existsSync(new URL(`../public${picture.src}`,import.meta.url)),word.hanzi);
  // Original captions remain byte-for-byte preserved by the baseline test.
  assert.ok(picture.caption.trim().length>=(baseline.entries[word.id]?1:6),word.hanzi);
  if(picture.relation==='example-word'&&!baseline.entries[word.id])assert.ok(picture.note?.trim(),`new context note: ${word.hanzi}`);
 }
});

test('every official level-five word has a real local meaning photograph with a caption',()=>{
 const words=officialVocabulary.filter(word=>word.level===5);
 assert.equal(words.length,1600);
 assert.deepEqual(words.filter(word=>!getWordImage(word)).map(word=>word.hanzi),[],'level-five photographs are incomplete');
 for(const word of words){
  const picture=getWordImage(word)!;
  assert.match(picture.src,/^\/images\/[A-Za-z0-9/_\-.]+\.(?:jpg|jpeg|webp|png)$/);
  assert.ok(existsSync(new URL(`../public${picture.src}`,import.meta.url)),word.hanzi);
  assert.ok(picture.caption.trim().length>=(baseline.entries[word.id]?1:6),word.hanzi);
  if(picture.relation==='example-word'&&!baseline.entries[word.id])assert.ok(picture.note?.trim(),`new context note: ${word.hanzi}`);
 }
});

test('every official level-six word has a reviewed meaning photograph with a caption',()=>{
 const words=officialVocabulary.filter(word=>word.level===6);
 assert.equal(words.length,1800);
 const missing=words.filter(word=>!getWordImage(word));
 assert.equal(missing.length,0,`level-six photographs are incomplete: ${missing.slice(0,20).map(word=>word.hanzi).join(', ')}`);
 for(const word of words){
  const picture=getWordImage(word)!;
  assert.match(picture.src,/^\/images\/[A-Za-z0-9/_\-.]+\.(?:jpg|jpeg|webp|png)$/);
  assert.ok(existsSync(new URL(`../public${picture.src}`,import.meta.url)),word.hanzi);
  assert.ok(picture.caption.trim().length>=(baseline.entries[word.id]?1:6),word.hanzi);
  if(picture.relation==='example-word'&&!baseline.entries[word.id])assert.ok(picture.note?.trim(),`new context note: ${word.hanzi}`);
 }
});

test('every official level-seven-to-nine word has a reviewed meaning photograph with a caption',()=>{
 const words=officialVocabulary.filter(word=>word.level===7);
 assert.equal(words.length,5600);
 const missing=words.filter(word=>!getWordImage(word));
 assert.equal(missing.length,0,`level-seven-to-nine photographs are incomplete: ${missing.slice(0,20).map(word=>word.hanzi).join(', ')}`);
 for(const word of words){
  const picture=getWordImage(word)!;
  assert.match(picture.src,/^\/images\/[A-Za-z0-9/_\-.]+\.(?:jpg|jpeg|webp|png)$/);
  assert.ok(existsSync(new URL(`../public${picture.src}`,import.meta.url)),word.hanzi);
  assert.ok(picture.caption.trim().length>=(baseline.entries[word.id]?1:6),word.hanzi);
  if(picture.relation==='example-word'&&!baseline.entries[word.id])assert.ok(picture.note?.trim(),`new context note: ${word.hanzi}`);
 }
});
