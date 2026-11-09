import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {archivedPhotoFilename,archivedWordPhotoResponse} from '../lib/remote-word-photos.ts';

const bytes=new Uint8Array([255,216,255,224,1,2,3,255,217]);
const sha256=createHash('sha256').update(bytes).digest('hex');
const revision='a'.repeat(40);
const filename='hsk5-test-scene.jpg';
const catalog={revision,files:{[filename]:{sha256,bytes:bytes.length}}};
const request=(init?:RequestInit)=>new Request(`https://lesson.example/images/words/${filename}`,init);

test('only exact catalogued photo paths are intercepted before the framework static-asset shortcut',()=>{
 assert.equal(archivedPhotoFilename(`https://lesson.example/images/words/${filename}`,catalog),filename);
 for(const path of ['/admin','/api/admin/summary','/images/words/unknown.jpg','/images/words/nested/'+filename,'/images/words/%2e%2e%2f'+filename,'/other/images/words/'+filename])assert.equal(archivedPhotoFilename('https://lesson.example'+path,catalog),null,path);
});

test('an archived word photo uses the fixed public repository and returns the unchanged verified bytes',async()=>{
 let calls=0;
 const response=await archivedWordPhotoResponse(request({headers:{Cookie:'private-session',Authorization:'private-auth','X-OpenAI-User-ID':'private-owner','CF-Connecting-IP':'198.51.100.7','X-Real-IP':'198.51.100.7','X-Forwarded-For':'198.51.100.7',Forwarded:'for=198.51.100.7',Referer:'https://lesson.example/private-view'}}),filename,catalog,async(input,init)=>{
  calls++;
  assert.equal(String(input),`https://raw.githubusercontent.com/shuangxuejing521-cyber/hanzi-links-playground/${revision}/public/images/words/${filename}`);
  // Workers rejects redirect:'error' before making the request.
  assert.equal(init?.redirect,'manual');
  const headers=new Headers(init?.headers);
  assert.equal(headers.get('Accept'),'image/jpeg');
  for(const key of ['cookie','authorization','x-openai-user-id','cf-connecting-ip','x-real-ip','x-forwarded-for','forwarded','referer'])assert.equal(headers.get(key),null,key);
  return new Response(bytes,{headers:{'Content-Type':'image/jpeg'}});
 });
 assert.equal(calls,1);
 assert.equal(response.status,200);
 assert.deepEqual(new Uint8Array(await response.arrayBuffer()),bytes);
 assert.equal(response.headers.get('Content-Type'),'image/jpeg');
 assert.equal(response.headers.get('Content-Length'),String(bytes.length));
 assert.equal(response.headers.get('X-Content-Type-Options'),'nosniff');
 assert.match(response.headers.get('Cache-Control')??'',/public.*immutable/);
 assert.equal(response.headers.get('ETag'),`"sha256-${sha256}"`);
});

test('unknown, encoded and traversal filenames never cause a network request',async()=>{
 for(const name of ['unknown.jpg','../secret.jpg','%2e%2e.jpg','https://evil.example/a.jpg','hsk5-test-scene.svg','hsk5-test-scene.jpg/extra']){
  const response=await archivedWordPhotoResponse(request(),name,catalog,async()=>{throw Error('must not fetch')});
  assert.equal(response.status,404,name);
 }
});

test('the immutable manifest fails closed before fetching when its revision or digest is invalid',async()=>{
 for(const invalid of [{...catalog,revision:'main'},{...catalog,files:{[filename]:{sha256:'not-a-hash',bytes:bytes.length}}},{...catalog,files:{[filename]:{sha256,bytes:-1}}}]){
  const response=await archivedWordPhotoResponse(request(),filename,invalid,async()=>{throw Error('must not fetch')});
  assert.equal(response.status,503);
 }
});

test('upstream failures, HTML, changed JPEG bytes and incorrect lengths are not served as reviewed photographs',async()=>{
 const changed=new Uint8Array(bytes);changed[4]=9;
 const replies=[()=>new Response(null,{status:302,headers:{Location:'https://other.example/photo.jpg'}}),()=>new Response('missing',{status:404}),()=>new Response(bytes,{headers:{'Content-Type':'text/html'}}),()=>new Response(bytes,{headers:{'Content-Type':'image/jpeg','Content-Length':'999'}}),()=>new Response(changed,{headers:{'Content-Type':'image/jpeg'}}),()=>new Response(bytes.slice(0,-1),{headers:{'Content-Type':'image/jpeg'}})];
 for(const reply of replies){
  const response=await archivedWordPhotoResponse(request(),filename,catalog,async()=>reply());
  assert.equal(response.status,502);
  assert.equal(response.headers.get('Cache-Control'),'no-store');
 }
 const failed=await archivedWordPhotoResponse(request(),filename,catalog,async()=>{throw Error('network details must remain private')});
 assert.equal(failed.status,502);
 assert.doesNotMatch(await failed.text(),/network details/);
});

test('an oversized body without Content-Length is cancelled before the full stream is read',async()=>{
 let produced=0;let cancelled=false;
 const stream=new ReadableStream<Uint8Array>({
  pull(controller){produced++;controller.enqueue(bytes.slice(0,4));if(produced===100)controller.close();},
  cancel(){cancelled=true;},
 });
 const response=await archivedWordPhotoResponse(request(),filename,catalog,async()=>new Response(stream,{headers:{'Content-Type':'image/jpeg'}}));
 assert.equal(response.status,502);
 assert.ok(produced<10,`read ${produced} chunks for a ${bytes.length}-byte photo`);
 assert.equal(cancelled,true);
});

test('an interrupted photo stream fails without exposing the stream error',async()=>{
 const stream=new ReadableStream<Uint8Array>({start(controller){controller.error(Error('private-stream-details'));}});
 const response=await archivedWordPhotoResponse(request(),filename,catalog,async()=>new Response(stream,{headers:{'Content-Type':'image/jpeg'}}));
 assert.equal(response.status,502);
 assert.doesNotMatch(await response.text(),/private-stream-details/);
});

test('HEAD and a matching ETag use verified manifest metadata without downloading again',async()=>{
 const noFetch=async()=>{throw Error('must not fetch')};
 const head=await archivedWordPhotoResponse(request({method:'HEAD'}),filename,catalog,noFetch);
 assert.equal(head.status,200);assert.equal(await head.text(),'');assert.equal(head.headers.get('Content-Length'),String(bytes.length));
 const cached=await archivedWordPhotoResponse(request({headers:{'If-None-Match':`"sha256-${sha256}"`}}),filename,catalog,noFetch);
 assert.equal(cached.status,304);assert.equal(await cached.text(),'');
 const post=await archivedWordPhotoResponse(request({method:'POST'}),filename,catalog,noFetch);
 assert.equal(post.status,405);assert.equal(post.headers.get('Allow'),'GET, HEAD');
});
