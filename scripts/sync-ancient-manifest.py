"""Publish only downloaded, public-domain drawings with their actual source metadata."""
import json,pathlib,hashlib
project=pathlib.Path(__file__).resolve().parents[1];work=project.parents[1]/'work/radical-audit';roots=json.loads((project/'src/data/root-evidence.json').read_text());records={}
for name in ['ancient-commons-metadata.json','ancient-commons-bronze.json']:
 for page in json.loads((work/name).read_text())['query']['pages'].values():
  if not page.get('imageinfo'):continue
  info=page['imageinfo'][0];meta=info.get('extmetadata',{});assert meta.get('LicenseShortName',{}).get('value')=='Public domain'
  form=page['title'][5:].split('-')[0];r=next(r for r in roots if r['baseForm']==form);src=f"/images/ancient/{r['radicalId']}.svg";p=project/'public'/src[1:]
  if p.exists():records[r['radicalId']]={'form':form,'label':'甲骨文字形摹写' if '-oracle.' in page['title'] else '金文字形摹写','src':src,'sourceTitle':page['title'],'sourceUrl':info['descriptionurl'],'license':'Public domain (CC0 / PD ancient script)','licenseUrl':'https://creativecommons.org/publicdomain/zero/1.0/','checked':'2026-11-05','sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
for dest in ['src/data/ancient-forms.json','public/sources/ancient-forms.json']:(project/dest).write_text(json.dumps(records,ensure_ascii=False,indent=2))
print('Available ancient redrawings:',len(records))
