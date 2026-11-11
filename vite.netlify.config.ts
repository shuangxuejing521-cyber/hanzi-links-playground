import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {defineConfig,type Plugin} from 'vite';
import react from '@vitejs/plugin-react';

const projectRoot=fileURLToPath(new URL('.',import.meta.url));
const adapters=new Map([
 ['src/analytics/client','src/analytics/netlify-client.ts'],
 ['src/analytics/AnalyticsNotice','src/analytics/NetlifyAnalyticsNotice.tsx'],
 ['src/analytics/FounderAccess','src/analytics/NetlifyFounderAccess.tsx'],
].map(([original,replacement])=>[resolve(projectRoot,original),resolve(projectRoot,replacement)]));

/** Resolve only these three local modules; never alias an unrelated "client". */
const netlifyAnalytics:Plugin={
 name:'netlify-analytics-adapters',
 enforce:'pre',
 resolveId(source,importer){
  if(!importer||!source.startsWith('.'))return null;
  const absolute=resolve(dirname(importer.split('?')[0]),source).replace(/\.tsx?$/,'');
  return adapters.get(absolute)??null;
 },
};

export default defineConfig({
 root:resolve(projectRoot,'netlify'),
 publicDir:resolve(projectRoot,'public'),
 plugins:[netlifyAnalytics,react()],
 define:{'import.meta.env.VITE_NETLIFY_SITE':JSON.stringify('1')},
 build:{
  outDir:resolve(projectRoot,'dist-netlify'),
  emptyOutDir:true,
  copyPublicDir:true,
  rolldownOptions:{
   output:{
    // Keep the complete learning data while staying below Netlify's per-file
    // upload limit. These remain ordinary, eagerly imported ESM dependencies.
    manualChunks(id){
     const data=id.match(/\/src\/data\/(word-image-links|hsk-official|course-characters|glyph-geometry)\.json(?:\?.*)?$/);
     return data?`data-${data[1]}`:undefined;
    },
   },
  },
 },
});
