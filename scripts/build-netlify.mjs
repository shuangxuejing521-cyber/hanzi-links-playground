import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,readdir,stat,writeFile} from 'node:fs/promises';
import {dirname,join,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=join(root,'dist-netlify');
const publicRoot=join(root,'public');
const fail=message=>{throw new Error(`Netlify build verification: ${message}`);};
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async path=>JSON.parse(await readFile(join(root,path),'utf8'));
const localPath=src=>{
 if(typeof src!=='string'||!src.startsWith('/')||src.includes('?')||src.includes('#'))fail(`invalid local asset ${src}`);
 const path=resolve(output,src.slice(1));
 if(!path.startsWith(output+sep))fail(`asset outside publish directory ${src}`);
 return path;
};
async function *files(directory){
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const path=join(directory,entry.name);
  if(entry.isSymbolicLink())fail(`symlink in public assets: ${relative(publicRoot,path)}`);
  if(entry.isDirectory())yield*files(path);
  else if(entry.isFile())yield path;
 }
}

const build=spawnSync(process.execPath,[join(root,'node_modules/vite/bin/vite.js'),'build','--config',join(root,'vite.netlify.config.ts')],{
 cwd:root,stdio:'inherit',env:{...process.env,VITE_NETLIFY_SITE:'1'},
});
if(build.error)throw build.error;
if(build.status!==0)process.exit(build.status??1);

// A manual upload must behave like the Git-linked build as well. Static files
// retain precedence over the final SPA fallback (no forced 200 rewrite).
await writeFile(join(output,'_redirects'),[
 '/admin https://hanzi-links-playground.jazzybay4.chatgpt.site/admin 302',
 '/admin/* https://hanzi-links-playground.jazzybay4.chatgpt.site/admin/:splat 302',
 '/* /index.html 200',
 '',
].join('\n'));

let publicFiles=0,publicBytes=0;
for await(const path of files(publicRoot)){
 const source=await readFile(path);
 const target=await readFile(join(output,relative(publicRoot,path)));
 if(!source.equals(target))fail(`changed or missing public asset: ${relative(publicRoot,path)}`);
 publicFiles++;publicBytes+=source.length;
}

const words=await json('src/data/hsk-official.json');
const links=await json('src/data/word-image-links.json');
if(words.length!==11000)fail(`expected 11,000 official words, got ${words.length}`);
for(const word of words){
 const photo=links[word.id];
 if(!photo?.src)fail(`missing photograph for ${word.id}`);
 if(!(await stat(localPath(photo.src))).isFile())fail(`photograph is not a file: ${photo.src}`);
}
const archived=await json('src/data/remote-word-photos.json');
let archivedPhotos=0;
for(const [name,photo] of Object.entries(archived.files)){
 const bytes=await readFile(localPath(`/images/words/${name}`));
 if(bytes.length!==photo.bytes||digest(bytes)!==photo.sha256)fail(`archived photograph changed: ${name}`);
 archivedPhotos++;
}
const evolution=await json('public/sources/course-evolution.json');
const entries=Object.values(evolution.characters);
if(entries.length!==3089)fail(`expected 3,089 character-origin entries, got ${entries.length}`);
let localSpecimens=0;
for(const entry of entries){
 for(const stage of entry.stages??[]){
  if(!stage.src?.startsWith('/'))continue;
  const bytes=await readFile(localPath(stage.src));
  if(stage.sha256&&digest(bytes)!==stage.sha256)fail(`changed etymology specimen: ${stage.src}`);
  localSpecimens++;
 }
}
const index=await readFile(join(output,'index.html'),'utf8');
if(!index.includes('https://ziyouyisi.goatcounter.com/count'))fail('missing GoatCounter endpoint');
if(index.includes('src="/main.tsx"'))fail('unbuilt application entry');
console.log('Verified Netlify static package:',JSON.stringify({publicFiles,publicBytes,officialWords:words.length,archivedPhotos,characterOrigins:entries.length,localSpecimens}));
