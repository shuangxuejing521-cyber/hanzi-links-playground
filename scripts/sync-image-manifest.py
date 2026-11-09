"""Publish only available reviewed images; no broken-image placeholders."""
import json,pathlib
project=pathlib.Path(__file__).resolve().parents[1];work=project.parents[1]/'work/radical-audit'
characters=json.loads((project/'src/data/characters.json').read_text());manifest={};metadata={}
for name in ['thread-images.json','character-images-a.json','character-images-b.json','character-images-c.json']:
 p=work/name
 if p.exists():
  items=json.loads(p.read_text())
  if isinstance(items,dict):items=items.get('images',items.get('assets',list(items.values())))
  for item in items:
   if isinstance(item,dict) and item.get('hanzi'):metadata[item['hanzi']]=item
for c in characters:
 h=c['hanzi'];asset=f'/images/characters/{ord(h):x}.webp'
 if (project/'public'/asset[1:]).is_file():
  info=metadata.get(h,{})
  manifest[h]={'src':asset,'caption':info.get('meaningCaption',f"实物 / 用法示意：{c['meaningZh']}"),'alt':info.get('alt',f"{h}：{c['meaningZh']}的物体或动作参考"),'kind':'AI生成实物或动作示意'}
manifest['织']['caption']='把纬线穿过经线，交织成布；看清织机、梭子和正在形成的布。'
for dest in ['src/data/image-manifest.json','public/sources/image-manifest.json']:(project/dest).write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('Available character photographs:',len(manifest),'/',len(characters))
