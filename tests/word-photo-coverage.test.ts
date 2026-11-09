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
