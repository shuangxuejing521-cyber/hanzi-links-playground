import {createHash} from 'node:crypto';
import {existsSync,lstatSync,readFileSync,realpathSync,unlinkSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const filenamePattern=/^[a-z0-9][a-z0-9-]{0,149}\.jpg$/;
function checkFile(path,photo){
 const info=lstatSync(path);
 if(info.isSymbolicLink()||!info.isFile()||realpathSync(path)!==path)throw Error('Unsafe photo path or symlink');
 const bytes=readFileSync(path);
 if(bytes.length!==photo.bytes||createHash('sha256').update(bytes).digest('hex')!==photo.sha256)throw Error('Archived photo bytes or hash differ');
 if(bytes[0]!==255||bytes[1]!==216||bytes.at(-2)!==255||bytes.at(-1)!==217)throw Error('Archived photo is not a JPEG');
 return bytes.length;
}

/** Remove deployment copies only after the entire immutable catalogue validates. */
export function pruneArchivedWordPhotos(projectRoot,catalogOverride){
 const root=realpathSync(projectRoot);
 const catalog=catalogOverride??JSON.parse(readFileSync(resolve(root,'src/data/remote-word-photos.json'),'utf8'));
 if(!catalog||!catalog.files||Array.isArray(catalog.files)||typeof catalog.files!=='object')throw Error('Invalid photo catalogue');
 const entries=Object.entries(catalog.files);
 if(!entries.length)return {omittedPhotos:0,omittedBytes:0};
 if(!/^[a-f0-9]{40}$/.test(catalog.revision??''))throw Error('Photo archive requires an immutable commit');
 const remove=[];
 for(const [filename,photo]of entries){
  if(!filenamePattern.test(filename))throw Error('Unsafe photo filename');
  if(!photo||!/^[a-f0-9]{64}$/.test(photo.sha256??'')||!Number.isSafeInteger(photo.bytes)||photo.bytes<4||photo.bytes>8*1024*1024)throw Error('Invalid photo digest or byte count');
  checkFile(resolve(root,'public/images/words',filename),photo);
  const built=resolve(root,'dist/client/images/words',filename);
  const info=lstatSync(built,{throwIfNoEntry:false});
  if(info){checkFile(built,photo);remove.push({path:built,bytes:photo.bytes});}
 }
 for(const file of remove)unlinkSync(file.path);
 return {omittedPhotos:remove.length,omittedBytes:remove.reduce((sum,file)=>sum+file.bytes,0)};
}

if(process.argv[1]&&existsSync(process.argv[1])&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 console.log(JSON.stringify(pruneArchivedWordPhotos(process.argv[2]??process.cwd())));
}
