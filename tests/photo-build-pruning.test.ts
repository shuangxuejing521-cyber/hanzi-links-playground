import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync,symlinkSync,renameSync,unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {pruneArchivedWordPhotos} from '../scripts/prune-archived-word-photos.mjs';

const bytes=Buffer.from([255,216,255,224,1,2,3,255,217]);
const sha256=createHash('sha256').update(bytes).digest('hex');
const record={sha256,bytes:bytes.length};
function fixture(){
 const root=mkdtempSync(join(tmpdir(),'hanzi-photo-pruning-'));
 const source=join(root,'public/images/words');const built=join(root,'dist/client/images/words');
 mkdirSync(source,{recursive:true});mkdirSync(built,{recursive:true});
 for(const folder of [source,built])for(const name of ['archived.jpg','local.jpg'])writeFileSync(join(folder,name),bytes);
 return {root,source,built};
}

test('build pruning removes only the verified archived copy and preserves every source and local asset byte',()=>{
 const f=fixture();
 try{
  const catalog={revision:'a'.repeat(40),files:{'archived.jpg':record}};
  assert.deepEqual(pruneArchivedWordPhotos(f.root,catalog),{omittedPhotos:1,omittedBytes:bytes.length});
  assert.equal(existsSync(join(f.built,'archived.jpg')),false);
  for(const path of [join(f.source,'archived.jpg'),join(f.source,'local.jpg'),join(f.built,'local.jpg')])assert.deepEqual(readFileSync(path),bytes);
  assert.deepEqual(pruneArchivedWordPhotos(f.root,catalog),{omittedPhotos:0,omittedBytes:0});
 }finally{rmSync(f.root,{recursive:true,force:true});}
});

test('a missing source or symlinked build directory preserves all source and deployment files',()=>{
 const missing=fixture();
 try{
  unlinkSync(join(missing.source,'local.jpg'));
  assert.throws(()=>pruneArchivedWordPhotos(missing.root,{revision:'a'.repeat(40),files:{'archived.jpg':record,'local.jpg':record}}));
  assert.deepEqual(readFileSync(join(missing.built,'archived.jpg')),bytes);
  assert.deepEqual(readFileSync(join(missing.built,'local.jpg')),bytes);
 }finally{rmSync(missing.root,{recursive:true,force:true});}
 const linked=fixture();
 try{
  renameSync(linked.built,linked.built+'-original');
  symlinkSync(linked.source,linked.built,'dir');
  assert.throws(()=>pruneArchivedWordPhotos(linked.root,{revision:'a'.repeat(40),files:{'archived.jpg':record}}),/path|symlink/i);
  assert.deepEqual(readFileSync(join(linked.source,'archived.jpg')),bytes);
  assert.deepEqual(readFileSync(join(linked.built+'-original','archived.jpg')),bytes);
 }finally{rmSync(linked.root,{recursive:true,force:true});}
});

test('every candidate is validated before pruning, so one altered image leaves the whole build unchanged',()=>{
 const f=fixture();
 try{
  writeFileSync(join(f.built,'local.jpg'),'changed');
  const catalog={revision:'a'.repeat(40),files:{'archived.jpg':record,'local.jpg':record}};
  assert.throws(()=>pruneArchivedWordPhotos(f.root,catalog),/hash|byte|differ/i);
  assert.deepEqual(readFileSync(join(f.built,'archived.jpg')),bytes);
  assert.equal(readFileSync(join(f.built,'local.jpg'),'utf8'),'changed');
 }finally{rmSync(f.root,{recursive:true,force:true});}
});

test('unsafe filenames, branch references and symlinks cannot delete files through a photo manifest',()=>{
 const f=fixture();
 try{
  for(const catalog of [{revision:'main',files:{'archived.jpg':record}},{revision:'a'.repeat(40),files:{'../outside.jpg':record}}])assert.throws(()=>pruneArchivedWordPhotos(f.root,catalog));
  symlinkSync(join(f.source,'archived.jpg'),join(f.built,'linked.jpg'));
  writeFileSync(join(f.source,'linked.jpg'),bytes);
  assert.throws(()=>pruneArchivedWordPhotos(f.root,{revision:'a'.repeat(40),files:{'linked.jpg':record}}),/symlink|path/i);
  assert.deepEqual(readFileSync(join(f.source,'archived.jpg')),bytes);
 }finally{rmSync(f.root,{recursive:true,force:true});}
});
