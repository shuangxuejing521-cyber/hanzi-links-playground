export type ArchivedPhoto = {sha256: string; bytes: number};
export type RemoteWordPhotoCatalog = {revision: string | null; files: Record<string, ArchivedPhoto>};
type PhotoFetcher = (input: string, init: RequestInit) => Promise<Response>;

const ARCHIVE = 'https://raw.githubusercontent.com/shuangxuejing521-cyber/hanzi-links-playground';
const FILENAME = /^[a-z0-9][a-z0-9-]{0,149}\.jpg$/;
const MAX_BYTES = 8 * 1024 * 1024;

export function archivedPhotoFilename(url: string, catalog: RemoteWordPhotoCatalog): string | null {
 const pathname = new URL(url).pathname;
 const prefix = '/images/words/';
 if (!pathname.startsWith(prefix)) return null;
 const filename = pathname.slice(prefix.length);
 return FILENAME.test(filename) && Object.hasOwn(catalog.files, filename) ? filename : null;
}

const unavailable = (status: number) => new Response('图片暂不可用', {
 status, headers: {'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8'},
});

function photoHeaders(photo: ArchivedPhoto) {
 return new Headers({
  'Content-Type': 'image/jpeg', 'Content-Length': String(photo.bytes),
  'Cache-Control': 'public, max-age=31536000, immutable',
  'ETag': `"sha256-${photo.sha256}"`, 'X-Content-Type-Options': 'nosniff',
 });
}

async function exactPhotoBody(response: Response, expectedBytes: number): Promise<ArrayBuffer | null> {
 if (!response.body) return null;
 const reader = response.body.getReader();
 const bytes = new Uint8Array(expectedBytes);
 let offset = 0;
 try {
  while (true) {
   const chunk = await reader.read();
   if (chunk.done) return offset === expectedBytes ? bytes.buffer : null;
   if (chunk.value.byteLength > expectedBytes - offset) {
    await reader.cancel().catch(() => {});
    return null;
   }
   bytes.set(chunk.value, offset);
   offset += chunk.value.byteLength;
  }
 } catch {
  await reader.cancel().catch(() => {});
  return null;
 } finally {
  reader.releaseLock();
 }
}

/** Public image bytes only: never pass visitor, connector or founder headers upstream. */
export async function archivedWordPhotoResponse(
 request: Request, filename: string, catalog: RemoteWordPhotoCatalog,
 fetchPhoto: PhotoFetcher = (input, init) => fetch(input, init),
): Promise<Response> {
 const photo = FILENAME.test(filename) && Object.hasOwn(catalog.files, filename) ? catalog.files[filename] : undefined;
 if (!photo) return unavailable(404);
 if (!/^[a-f0-9]{40}$/.test(catalog.revision ?? '') || !/^[a-f0-9]{64}$/.test(photo.sha256)
  || !Number.isSafeInteger(photo.bytes) || photo.bytes < 4 || photo.bytes > MAX_BYTES) return unavailable(503);
 if (request.method !== 'GET' && request.method !== 'HEAD') {
  return new Response(null, {status: 405, headers: {'Allow': 'GET, HEAD', 'Cache-Control': 'no-store'}});
 }
 const headers = photoHeaders(photo);
 const etag = headers.get('ETag')!;
 if (request.headers.get('If-None-Match')?.split(',').some(value => [etag, `W/${etag}`, '*'].includes(value.trim()))) {
  headers.delete('Content-Length');
  return new Response(null, {status: 304, headers});
 }
 if (request.method === 'HEAD') return new Response(null, {headers});
 try {
  const upstream = await fetchPhoto(`${ARCHIVE}/${catalog.revision}/public/images/words/${filename}`, {
   // Workers supports manual/follow; reject redirects through the !ok check.
   method: 'GET', redirect: 'manual', headers: {'Accept': 'image/jpeg'}, signal: AbortSignal.timeout(15_000),
  });
  if (!upstream.ok || upstream.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'image/jpeg') return unavailable(502);
  const declared = upstream.headers.get('Content-Length');
  if (declared !== null && Number(declared) !== photo.bytes) return unavailable(502);
  const buffer = await exactPhotoBody(upstream, photo.bytes);
  if (!buffer) return unavailable(502);
  const bytes = new Uint8Array(buffer);
  if (bytes.length !== photo.bytes || bytes[0] !== 255 || bytes[1] !== 216
   || bytes.at(-2) !== 255 || bytes.at(-1) !== 217) return unavailable(502);
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', buffer)), n => n.toString(16).padStart(2, '0')).join('');
  if (digest !== photo.sha256) return unavailable(502);
  return new Response(buffer, {headers});
 } catch {
  return unavailable(502);
 }
}
