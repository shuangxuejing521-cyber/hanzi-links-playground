"""Freeze the independently committed image-rich v5 data; never use working data."""
import hashlib
import json
import pathlib
import subprocess

project = pathlib.Path(__file__).resolve().parents[1]
revision = '39e89e45da95a4b9f44817e4d9814ae013a1d80b'


def original(path):
    return subprocess.check_output(['git', 'show', f'{revision}:{path}'], cwd=project)


def digest(data):
    return hashlib.sha256(data).hexdigest()


record_names = ['characters', 'character-evidence', 'image-manifest', 'radicals',
                'root-evidence', 'radical-evolution', 'ancient-forms']
fixture = {'revision': revision, 'records': {}, 'entryHashes': {}, 'imageHashes': {}}
for name in record_names:
    fixture['records'][name] = json.loads(original(f'src/data/{name}.json'))
for name in ['component-evidence', 'glyph-geometry']:
    values = json.loads(original(f'src/data/{name}.json'))
    fixture['entryHashes'][name] = {
        key: digest(json.dumps(value, ensure_ascii=False, sort_keys=True,
                               separators=(',', ':')).encode())
        for key, value in values.items()
    }
paths = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', revision,
                               'public/images/roots', 'public/images/characters',
                               'public/images/evolution'], cwd=project, text=True).splitlines()
for path in paths:
    fixture['imageHashes'][path] = digest(original(path))
assert len(fixture['records']['characters']) == 171
assert len(fixture['records']['radicals']) == 26
(project / 'tests/fixtures/restoration-v5-baseline.json').write_text(
    json.dumps(fixture, ensure_ascii=False, indent=2) + '\n')
print('Frozen v5: 171 character records, 26 roots,', len(paths), 'image hashes')
