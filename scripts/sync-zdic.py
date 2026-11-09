"""Retain selected CC0 HanDian evolution glyphs and exact specimen provenance."""
import json,pathlib,urllib.request,concurrent.futures,hashlib,time,sys
project=pathlib.Path(__file__).resolve().parents[1];work=project.parents[1]/'work/radical-audit'
source=next(work/n for n in ['zdic-roots.json','zdic-roots-canonical.json','zdic-roots-partial.json'] if (work/n).exists())
entries=json.loads(source.read_text());manifest={}
for rid,r in entries.items():
 manifest[rid]={k:r[k] for k in ['baseForm','sourceUrl','stageNames','availability','checked','evolutionNote','shapeFocus','sequenceNote','license','termsTitle'] if k in r};manifest[rid]['stages']=[]
 for i,s in enumerate(r.get('stageImages',[])):
  dest=f'/images/evolution/{rid}/{i:02d}.svg';p=project/'public'/dest[1:];p.parent.mkdir(parents=True,exist_ok=True)
  manifest[rid]['stages'].append({**s,'src':dest,'license':'CC0 1.0','licenseSource':'https://zdic.net/terms/'})
jobs=[(rid,s) for rid,r in manifest.items() for s in r['stages']]
def download(item):
 rid,s=item;p=project/'public'/s['src'][1:]
 if not p.exists():
  req=urllib.request.Request(s['url'],headers={'User-Agent':'Mozilla/5.0','Referer':manifest[rid]['sourceUrl'],'Accept':'image/svg+xml,image/*;q=0.8,*/*;q=0.5'})
  for attempt in range(3):
   try:data=urllib.request.urlopen(req,timeout=30).read();break
   except Exception:
    if attempt==2:raise
    time.sleep(2)
  assert b'<svg' in data and b'<script' not in data and b'<foreignObject' not in data,s['url']
  p.write_bytes(data);time.sleep(.3)
 data=p.read_bytes();s['sha256']=hashlib.sha256(data).hexdigest();return rid
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for _ in pool.map(download,jobs):pass
for dest in ['src/data/radical-evolution.json','public/sources/radical-evolution.json']:(project/dest).write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('Saved',len(manifest),'root timelines,',len(jobs),'source glyph specimens (CC0).')
