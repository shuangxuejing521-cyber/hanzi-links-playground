"""Extract licensed modern outlines. Does not infer character origins."""
import json,pathlib,sys,re
project=pathlib.Path(__file__).resolve().parents[1]
workspace=project.parents[1]
raw=workspace/'work/radical-audit/graphics.txt'
g={r['character']:r for r in map(json.loads,raw.open())}
d={r['character']:r for r in map(json.loads,(workspace/'work/source_research/makemeahanzi_dictionary.txt').open())}
characters=json.loads((project/'src/data/characters.json').read_text())
used=set(c['hanzi'] for c in characters)|set(c['firstPart'] for c in characters)|set(c['secondPart'] for c in characters)|set('水人手言心糸肉玉金食犬衣示車馬見門')
used|=set(r['baseForm'] for r in json.loads((project/'src/data/root-evidence.json').read_text()))
audit=json.loads((project/'src/data/character-evidence.json').read_text())
for e in audit.values():
 used.add(e['traditional'])
 for part in e['semanticParts']+[e.get('phoneticPart') or '']:
  h=re.sub(r'（[^）]*）|\([^)]*\)','',part).strip()
  if len(h)==1:used.add(h)
result={}
for h in used:
 if h not in g: continue
 result[h]={'strokes':g[h]['strokes'],'medians':g[h]['medians']}
for c in characters:
 h=c['hanzi'];r=result[h];matches=d[h]['matches']
 r['sides']=[m[0] if m and m[0] in [0,1] else (0 if sum(p[0] for p in median)/len(median)<500 else 1) for m,median in zip(matches,r['medians'])]
 assert len(r['sides'])==len(r['strokes']) and set(r['sides'])=={0,1},h
for part,parent in [('𫠣','练'),('𢀖','经')]:
 r=result[parent];ix=[i for i,side in enumerate(r['sides']) if side==1]
 result[part]={'strokes':[r['strokes'][i] for i in ix],'medians':[r['medians'][i] for i in ix],'extractedFrom':parent}
# Store fitted bounds for component diagrams, keeping proportions unchanged.
for h,r in result.items():
 points=[p for stroke in r['medians'] for p in stroke]
 xs=[p[0] for p in points];ys=[900-p[1] for p in points]
 r['bounds']=[min(xs)-80,min(ys)-80,max(xs)-min(xs)+160,max(ys)-min(ys)+160]
(project/'src/data/glyph-geometry.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')))
print('Extracted',len(result),'glyphs,',sum(len(r['strokes']) for r in result.values()),'real strokes; rare parts from actual parent glyphs.')
