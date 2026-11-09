#!/usr/bin/env python3
"""Build source-traceable modern structure diagrams, never inferred etymologies.

Inputs are fixed local copies of CJKVI IDS and Make Me a Hanzi. The existing
reviewed modern structures take precedence. Generated SVGs contain actual
licensed modern strokes, not generated ancient glyphs or semantic photographs.
"""
import argparse
import hashlib
import html
import json
import re
from collections import Counter
from pathlib import Path

HAN = re.compile(r'[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\U00020000-\U0003FFFF]')
REGION = re.compile(r'\[[^]]*\]')
OPERATORS = dict.fromkeys('⿰⿱⿴⿵⿶⿷⿸⿹⿺⿻', 2) | {'⿲': 3, '⿳': 3}
UNENCODED = {chr(0x2460 + n - 1): n for n in range(2, 9)}
IDS_URL = 'https://github.com/cjkvi/cjkvi-ids/blob/86b4d16159f0079437870408f0ca186e529015db/ids.txt'
MMH_BASE = 'https://github.com/skishore/makemeahanzi/blob/bddc96d41bef78427ed0e034e9f7e31d71fd1b92/'
HASHES = {
 'work/source_research/cjkvi_ids.txt': 'bfc70a8c09f9f5616ebf0543bd6681e67314e9f7ae2307e5ae8c6f15bdc5c6a6',
 'work/source_research/makemeahanzi_dictionary.txt': '744bb05d5b0742e9ee35c37791f94d56a173349b3367569e7ca11e510364d203',
 'work/radical-audit/graphics.txt': 'a28c478b5178e98f67f510b2d52fde08a69dc664654ef43498253b9b764d46ee',
}

def sha(data):
 return hashlib.sha256(data).hexdigest()

def read_json(path):
 return json.loads(path.read_text())

def dump(path, data, compact=False):
 path.parent.mkdir(parents=True, exist_ok=True)
 path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':') if compact else None, indent=None if compact else 2) + '\n')

def parse_ids(value, context=''):
 chars = list(value)
 def take(index, path):
  assert index < len(chars), 'Incomplete IDS: ' + value
  char = chars[index]
  if char in OPERATORS:
   children = []
   cursor = index + 1
   for child in range(OPERATORS[char]):
    node, cursor = take(cursor, path + (child,))
    children.append(node)
   return {'type': 'layout', 'operator': char, 'children': children}, cursor
  node = {'type': 'leaf', 'form': char}
  if char in UNENCODED:
   node |= {'componentKind': 'unencoded', 'label': f'미부호 부품 · {UNENCODED[char]}획', 'context': context + '@' + '.'.join(map(str, path))}
  return node, index + 1
 tree, end = take(0, ())
 assert end == len(chars), 'Trailing IDS: ' + value
 return tree

def serialize(tree):
 return tree['form'] if tree['type'] == 'leaf' else tree['operator'] + ''.join(map(serialize, tree['children']))

def leaves(tree, path=()):
 if tree['type'] == 'leaf':
  yield path, tree
 else:
  for i, child in enumerate(tree['children']):
   yield from leaves(child, path + (i,))

def same_structure(selected, mmh):
 if selected['type'] != mmh['type']:
  return False
 if selected['type'] == 'leaf':
  return selected['form'] == mmh['form'] or (selected['form'] in UNENCODED and mmh['form'] == '？')
 return selected['operator'] == mmh['operator'] and all(same_structure(a, b) for a, b in zip(selected['children'], mmh['children']))

def mapped_leaves(selected, mmh, variants, path=()):
 """Map a selected leaf to a strictly equivalent MMH subtree, or reject all."""
 if selected['type'] == 'leaf':
  if selected['form'] in UNENCODED:
   return None
  if mmh['type'] == 'leaf' and selected['form'] == mmh['form']:
   return [(selected['form'], path)]
  candidates = variants.get(selected['form'], [])
  raw = next((v for v in candidates if re.search(r'\[[A-Z]*G[A-Z]*\]', v)), candidates[0] if candidates else '')
  if raw and REGION.sub('', raw) == serialize(mmh) and '？' not in serialize(mmh):
   return [(selected['form'], path)]
  return None
 if mmh['type'] != 'layout' or selected['operator'] != mmh['operator']:
  return None
 result = []
 for i, (a, b) in enumerate(zip(selected['children'], mmh['children'])):
  mapped = mapped_leaves(a, b, variants, path + (i,))
  if mapped is None:
   return None
  result += mapped
 return result

def svg(form, strokes, medians=None, fitted=False):
 view = '0 0 1024 1024'
 if fitted and medians:
  points = [p for line in medians for p in line]
  xs, ys = [p[0] for p in points], [900-p[1] for p in points]
  view = f'{min(xs)-80} {min(ys)-80} {max(xs)-min(xs)+160} {max(ys)-min(ys)+160}'
 paths = ''.join('<path d="' + html.escape(path, quote=True) + '"/>' for path in strokes)
 return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + view + '" role="img">'
         '<title>' + html.escape(form) + ' · 현대 필획</title>'
         '<g transform="scale(1,-1) translate(0,-900)" fill="#b6314b">' + paths + '</g></svg>\n')

def main():
 parser = argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--project', type=Path, default=Path(__file__).resolve().parents[1])
 parser.add_argument('--workspace', type=Path)
 parser.add_argument('--sample', help='Generate an explicit small Hanzi sample before the full build')
 args = parser.parse_args()
 project = args.project
 workspace = args.workspace or project.parents[1]
 for filename, expected in HASHES.items():
  assert sha((workspace/filename).read_bytes()) == expected, 'Frozen source hash mismatch: ' + filename
 dictionary = {r['character']: r for r in map(json.loads, (workspace/'work/source_research/makemeahanzi_dictionary.txt').open())}
 graphics = {r['character']: r for r in map(json.loads, (workspace/'work/radical-audit/graphics.txt').open())}
 variants = {}
 for line in (workspace/'work/source_research/cjkvi_ids.txt').read_text().splitlines():
  fields = line.split('\t')
  if len(fields) >= 3 and not line.startswith('#'):
   variants[fields[1]] = fields[2:]
 official = read_json(project/'src/data/hsk-official.json')
 legacy = read_json(project/'src/data/lexicon.json')
 official_chars = {c for word in official for c in word['hanzi'] if HAN.fullmatch(c)}
 legacy_chars = {c for word in legacy for c in word['hanzi'] if HAN.fullmatch(c)}
 targets = official_chars | legacy_chars
 if args.sample:
  targets = set(args.sample)
 reviewed = {r['hanzi']: r for r in read_json(project/'src/data/characters.json')}
 component_evidence = read_json(project/'src/data/component-evidence.json')
 existing_geometry = read_json(project/'src/data/glyph-geometry.json')
 radical_assignments = read_json(project/'src/data/dictionary-radicals.json')['characterRadicals']
 # Full source properties cover components that do not occur as vocabulary
 # characters, e.g. 宀. Keep these actual assignments rather than infer by form.
 full_radicals = dict(radical_assignments)
 radical_export = project/'public/sources/unicode18/Unihan_kRSUnicode.txt'
 radical_provenance = read_json(project/'public/sources/unicode18/provenance.json')
 assert sha(radical_export.read_bytes()) == radical_provenance['sources']['unihan']['exportSha256'], 'Unihan component classification export changed'
 for line in radical_export.read_text().splitlines():
  if not line.startswith('U+'):
   continue
  code, field, values = line.split('\t')
  full_radicals[chr(int(code[2:], 16))] = sorted({re.match(r'\d+', value).group() for value in values.split()}, key=int)
 original_korean = read_json(workspace/'work/character-korean.json')
 official_single = {}
 for word in official:
  if len(word['hanzi']) == 1:
   official_single.setdefault(word['hanzi'], []).append(word)
 glyph_dir = project/'public/images/course-glyphs'
 glyph_dir.mkdir(parents=True, exist_ok=True)
 glyphs, glyph_audit, entries, audits = {}, {}, {}, {}
 leaf_forms, marker_records = set(), []
 extracted_markers = []

 def add_glyph(form, record, source, key=None, fitted=False):
  key = key or form
  filename = '-'.join(f'{ord(c):x}' for c in key) + '.svg'
  content = svg(form, record['strokes'], record.get('medians'), fitted)
  (glyph_dir/filename).write_text(content)
  src = '/images/course-glyphs/' + filename
  glyphs[key] = {'src': src, 'source': source}
  glyph_audit[key] = {'src': src, 'source': source, 'strokeCount': len(record['strokes']), 'sha256': sha(content.encode())}
  return src

 for char in sorted(targets, key=ord):
  assert char in dictionary and char in graphics and char in variants, 'Missing source character: ' + char
  selected_raw = next((v for v in variants[char] if re.search(r'\[[A-Z]*G[A-Z]*\]', v)), variants[char][0])
  clean = REGION.sub('', selected_raw)
  choice = 'cjkvi-G' if re.search(r'\[[A-Z]*G[A-Z]*\]', selected_raw) else 'cjkvi-first'
  if char in reviewed:
   clean, choice = reviewed[char]['ids'], 'existing-reviewed-modern-structure'
  tree = parse_ids(clean, char)
  assert serialize(tree) == clean
  for _, leaf in leaves(tree):
   leaf_forms.add(leaf['form'])
  data = dictionary[char]
  if char in original_korean:
   korean = original_korean[char]
   korean_source = {'kind': 'existing-editorial-character-gloss', 'path': 'work/character-korean.json'}
  elif char in official_single:
   korean = '; '.join(dict.fromkeys(word['korean'] for word in official_single[char]))
   korean_source = {'kind': 'independent-korean-word-definition', 'officialEntryIds': [word['id'] for word in official_single[char]], 'notice': '/sources/hsk-official-source.json'}
  else:
   korean, korean_source = None, None
  src = add_glyph(char, graphics[char], MMH_BASE + 'graphics.txt')
  entries[char] = {'hanzi': char, 'pinyin': data['pinyin'], 'definition': data['definition'], 'korean': korean,
   'ids': clean, 'tree': tree, 'parts': [serialize(c) for c in tree.get('children', [])],
   'radicalIds': radical_assignments[char], 'glyph': src, 'strokeCount': len(graphics[char]['strokes']), 'sourceChoice': choice}
  marked = [(path, leaf) for path, leaf in leaves(tree) if leaf.get('componentKind') == 'unencoded']
  audit = {'rawIDS': variants[char], 'selectedSourceIDS': selected_raw, 'ids': clean, 'sourceChoice': choice,
   'mmhModernDecomposition': data['decomposition'], 'koreanSource': korean_source,
   'containsUnencodedStrokeCountMarkers': bool(marked)}
  if choice == 'existing-reviewed-modern-structure':
   audit['reviewedSource'] = reviewed[char]['source']
  if marked:
   marker_records.append(char)
   mmh_tree = parse_ids(data['decomposition'])
   if same_structure(tree, mmh_tree):
    matches = data['matches']
    known_paths = [path for path, leaf in leaves(tree) if leaf['form'] not in UNENCODED]
    for path, leaf in marked:
     ix = [i for i, match in enumerate(matches) if match is not None and tuple(match[:len(path)]) == path]
     if len(marked) == 1 and all(any(match is not None and tuple(match[:len(p)]) == p for match in matches) for p in known_paths):
      ix += [i for i, match in enumerate(matches) if match is None]
     ix = sorted(set(ix))
     if len(ix) != UNENCODED[leaf['form']]:
      continue
     context = leaf['context']
     add_glyph(leaf['label'], {'strokes': [graphics[char]['strokes'][i] for i in ix], 'medians': [graphics[char]['medians'][i] for i in ix]}, MMH_BASE+'graphics.txt', context, True)
     glyph_audit[context] |= {'extractedFrom': char, 'strokeIndexes': ix, 'mmhPath': list(path), 'policy': 'Matching full IDS layout; known siblings explicitly mapped; stroke count agrees with source marker.'}
     extracted_markers.append(context)
  audits[char] = audit

 # Continue through the component trees so newly exposed encoded leaves also
 # have independent dictionary records. Circled source markers never become
 # interchangeable component entries.
 components, component_audit = {}, {}
 queue = sorted(leaf_forms - UNENCODED.keys(), key=ord)
 for form in queue:
  if form in components:
   continue
  source_data = dictionary.get(form, {})
  curated = component_evidence.get(form, {})
  if form in entries:
   component_ids, component_choice = entries[form]['ids'], entries[form]['sourceChoice']
  elif form in variants:
   raw = next((v for v in variants[form] if re.search(r'\[[A-Z]*G[A-Z]*\]', v)), variants[form][0])
   component_ids = REGION.sub('', raw)
   component_choice = 'cjkvi-G' if re.search(r'\[[A-Z]*G[A-Z]*\]', raw) else 'cjkvi-first'
  else:
   component_ids, component_choice = form, 'encoded-component-shape-only'
  component_tree = parse_ids(component_ids, form)
  added = {leaf['form'] for _, leaf in leaves(component_tree)}
  for other in sorted(added - leaf_forms - UNENCODED.keys(), key=ord):
   queue.append(other)
  leaf_forms |= added
  if curated.get('korean'):
   component_korean, korean_source = curated['korean'], 'existing-reviewed-component-evidence'
  elif form in original_korean:
   component_korean, korean_source = original_korean[form], 'existing-editorial-character-gloss'
  elif form in official_single:
   component_korean = '; '.join(dict.fromkeys(word['korean'] for word in official_single[form]))
   korean_source = 'independent-korean-word-definition'
  else:
   component_korean, korean_source = None, None
  component_definition = curated.get('meaningZh') or source_data.get('definition', '')
  if curated.get('pinyin'):
   pronunciation = re.sub(r'（[^）]*）|\([^)]*\)', '', curated['pinyin'])
   component_pinyin = [] if HAN.search(pronunciation) else [s.strip() for s in re.split(r'\s*/\s*|\s*,\s*', pronunciation) if s.strip()]
  else:
   component_pinyin = source_data.get('pinyin', [])
  components[form] = {'hanzi': form, 'pinyin': component_pinyin, 'definition': component_definition, 'korean': component_korean,
   'ids': component_ids, 'tree': component_tree, 'parts': [serialize(c) for c in component_tree.get('children', [])],
   'radicalIds': full_radicals.get(form, []), 'glyph': None, 'strokeCount': len(graphics.get(form, existing_geometry.get(form, {})).get('strokes', [])),
   'sourceChoice': component_choice}
  component_audit[form] = {'rawIDS': variants.get(form, []), 'ids': component_ids, 'sourceChoice': component_choice,
   'definitionSource': 'existing-reviewed-component-evidence' if curated.get('meaningZh') else 'makemeahanzi-dictionary' if source_data.get('definition') else None,
   'definitionLanguage': 'zh' if curated.get('meaningZh') else 'en' if source_data.get('definition') else None,
   'koreanSource': korean_source, 'independentDefinitionAvailable': bool(component_definition)}

 for form in sorted(leaf_forms, key=ord):
  if form in glyphs or form in UNENCODED:
   continue
  if form in existing_geometry and existing_geometry[form].get('extractedFrom'):
   add_glyph(form, existing_geometry[form], '/sources/glyph-geometry.json', fitted=True)
   glyph_audit[form]['extractedFrom'] = existing_geometry[form]['extractedFrom']
  elif form in graphics:
   add_glyph(form, graphics[form], MMH_BASE+'graphics.txt')
 # Example: 吅 has no independent MMH outline, but CJKVI 吅=⿰口口 exactly
 # equals the mapped top subtree of 器. No coordinates or etymology are guessed.
 for char, entry in entries.items():
  matches = dictionary[char]['matches']
  if any(match is None for match in matches):
   continue
  mapped = mapped_leaves(entry['tree'], parse_ids(dictionary[char]['decomposition']), variants)
  if mapped is None:
   continue
  for form, path in mapped:
   if form in glyphs or form in UNENCODED:
    continue
   ix = [i for i, match in enumerate(matches) if tuple(match[:len(path)]) == path]
   if not ix:
    continue
   add_glyph(form, {'strokes': [graphics[char]['strokes'][i] for i in ix], 'medians': [graphics[char]['medians'][i] for i in ix]}, MMH_BASE+'graphics.txt', fitted=True)
   glyph_audit[form] |= {'extractedFrom': char, 'strokeIndexes': ix, 'mmhPath': list(path), 'policy': 'Every parent stroke explicitly mapped; full IDS trees equivalent, allowing a CJKVI leaf to equal the corresponding expanded MMH subtree.'}
 for form, component in components.items():
  component['glyph'] = glyphs.get(form, {}).get('src')
  if form in glyph_audit:
   component['strokeCount'] = glyph_audit[form]['strokeCount']
 missing_components = sorted(leaf_forms - glyphs.keys(), key=ord)
 missing_characters = sorted(targets - glyphs.keys(), key=ord)
 opaque = sorted([c for c, e in entries.items() if e['tree']['type'] == 'leaf'], key=ord)
 distribution = dict(sorted(Counter(e['tree'].get('operator', 'standalone') for e in entries.values()).items()))
 coverage = {'officialEntries': len(official), 'legacyEntries': len(legacy), 'officialCharacters': len(official_chars),
  'coveredOfficialCharacters': len(official_chars & entries.keys()), 'totalCharacters': len(entries), 'sample': bool(args.sample),
  'modernStructureCharacters': len(entries), 'realCharacterGlyphs': len(targets & glyphs.keys()), 'glyphCount': len(glyphs),
  'koreanCharacterGlosses': sum(e['korean'] is not None for e in entries.values()), 'missingKoreanCharacterGlosses': [c for c,e in entries.items() if e['korean'] is None],
  'missingCharacterGlyphs': missing_characters, 'missingComponentGlyphs': missing_components,
  'unencodedMarkerCharacters': marker_records, 'extractedUnencodedContextGlyphs': extracted_markers,
  'standaloneOrOpaqueCharacters': opaque, 'structureDistribution': distribution,
  'componentRecords': len(components), 'componentKoreanGlosses': sum(c['korean'] is not None for c in components.values()),
  'missingComponentDictionaryDefinitions': [form for form,c in components.items() if not c['definition']],
  'reviewedModernStructuresPreserved': sum(e['sourceChoice'] == 'existing-reviewed-modern-structure' for e in entries.values())}
 sources = {
  'cjkvi': {'url': IDS_URL, 'sha256': HASHES['work/source_research/cjkvi_ids.txt'], 'license': 'GPL-2.0-or-later', 'licenseUrl': '/sources/GPL-2.0.txt'},
  'dictionary': {'url': MMH_BASE+'dictionary.txt', 'sha256': HASHES['work/source_research/makemeahanzi_dictionary.txt'], 'license': 'LGPL-3.0-or-later', 'licenseUrl': '/sources/makemeahanzi_LGPL.txt'},
  'graphics': {'url': MMH_BASE+'graphics.txt', 'sha256': HASHES['work/radical-audit/graphics.txt'], 'license': 'Arphic Public License', 'licenseUrl': '/sources/licenses/ARPHIC-ARPHICPL.TXT'},
  'radicals': {'url': '/sources/unicode18/provenance.json', 'sha256': sha((project/'src/data/dictionary-radicals.json').read_bytes())},
  'korean': {'existingEditorialSha256': sha((workspace/'work/character-korean.json').read_bytes()), 'officialDefinitionsSha256': sha((project/'src/data/hsk-official.json').read_bytes()), 'license': 'CC BY-SA 4.0', 'licenseUrl': 'https://creativecommons.org/licenses/by-sa/4.0/', 'notice': '/sources/hsk-official-source.json'},
  'reviewedStructures': {'url': '/sources/characters.json', 'sha256': sha((project/'src/data/characters.json').read_bytes())}}
 sources['reviewedComponents'] = {'url': '/sources/component-evidence.json', 'sha256': sha((project/'src/data/component-evidence.json').read_bytes())}
 result = {'version': '2026-11-06-modern-structure-v1', 'sources': sources, 'coverage': coverage, 'characters': entries, 'components': components, 'glyphs': glyphs}
 dump(project/'src/data/course-characters.json', result, True)
 dump(project/'public/sources/course-characters.json', result, True)
 dump(project/'public/sources/course-characters-audit.json', {'version': result['version'], 'characters': audits, 'components': component_audit, 'glyphs': glyph_audit})
 dump(project/'public/sources/course-characters-provenance.json', {'version': result['version'], 'sources': sources, 'coverage': coverage,
  'policies': ['Modern graphic structures only; no automatic etymology, semantic/phonetic roles, ancient specimens, or scene photographs are inferred.',
   'Existing reviewed structures override CJKVI; otherwise prefer an explicit mainland G candidate, then source order.',
   'Unencoded circled stroke-count placeholders are context-specific unknown components, never interchangeable character leaves.',
   'Context component glyphs are extracted only when full selected/MMH trees match, known sibling strokes are explicit, and extracted stroke counts agree.',
   'Missing component SVGs remain missing; no font substitution or invented pseudo-ancient diagram is generated.',
   'English character definitions come from the source dictionary. Korean character definitions are independent editorial/reference definitions and may be absent; whole-word Korean remains in the vocabulary.'],
   'inputHashes': {str(path.relative_to(project)): sha(path.read_bytes()) for path in [project/'src/data/hsk-official.json', project/'src/data/lexicon.json', project/'src/data/characters.json', project/'src/data/glyph-geometry.json']}})
 missing_korean = []
 for form in sorted(entries.keys() | components.keys(), key=ord):
  row = entries.get(form) or components[form]
  if row['korean'] is not None:
   continue
  examples = [word for word in official if form in word['hanzi']][:3]
  missing_korean.append({'form': form, 'pinyin': row['pinyin'], 'definition': row['definition'], 'isOfficialCharacter': form in official_chars,
   'isComponent': form in components, 'examples': [{k: word[k] for k in ['id','hanzi','pinyin','korean','level']} for word in examples]})
 dump(Path('/private/tmp/hanzi-course-korean-missing.json'), missing_korean)
 assert not missing_characters
 print(json.dumps({'characters': len(entries), 'glyphs': len(glyphs), 'missingComponentGlyphs': len(missing_components), 'unencodedMarkerCharacters': len(marker_records), 'extractedContextGlyphs': len(extracted_markers), 'structureDistribution': distribution}, ensure_ascii=False))

if __name__ == '__main__':
 main()
