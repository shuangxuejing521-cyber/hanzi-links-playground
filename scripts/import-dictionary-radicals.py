#!/usr/bin/env python3
"""Build a dictionary lookup index from frozen official Unicode source files.

No etymologies, semantic hints, or arbitrary character decompositions are inferred.
Download Unihan.zip, CJKRadicals.txt, RSIndex.txt and Unicode-LICENSE.txt into
--source-dir first, using the upstream URLs recorded in provenance.json.
The archive may move kRSUnicode between files, so discover its containing file.
"""

import argparse
import hashlib
import json
import re
import zipfile
from collections import defaultdict
from pathlib import Path


VERSION = '18.0.0'
SOURCE_HASHES = {
    'Unihan.zip': '4c93ea9c1f636451729a840978f1667a53886af37ba854fdcce109721c63d43e',
    'CJKRadicals.txt': '689e2e5852699e7115823dc0b6d3e615eb767c7f477b615678f4f989d1f06105',
    'RSIndex.txt': '57430287e03c56b3fdc8ad0c3324490b6688abf330c988ff43dd772df3eac128',
    'Unicode-LICENSE.txt': 'e7a93b009565cfce55919a381437ac4db883e9da2126fa28b91d12732bc53d96',
}
ILLUSTRATED_NUMBERS = [9, 15, 30, 32, 38, 61, 64, 72, 75, 85, 86, 94, 96,
                       109, 112, 113, 119, 120, 130, 142, 145, 149, 157, 159, 167, 184]
VALUE_PATTERN = re.compile(r"^([1-9]\d{0,2})('{0,3})\.(-?\d{1,2})$")
HAN_PATTERN = re.compile(r'[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\U00020000-\U0003FFFF]')


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def dump(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=Path, required=True)
    parser.add_argument('--project', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root, source = args.project, args.source_dir
    for filename, expected_hash in SOURCE_HASHES.items():
        assert sha256((source / filename).read_bytes()) == expected_hash, filename + ': source hash differs'
    official = json.loads((root / 'src/data/hsk-official.json').read_text())
    legacy = json.loads((root / 'src/data/lexicon.json').read_text())
    official_chars = {c for word in official for c in word['hanzi'] if HAN_PATTERN.fullmatch(c)}
    legacy_chars = {c for word in legacy for c in word['hanzi'] if HAN_PATTERN.fullmatch(c)}
    target_chars = official_chars | legacy_chars

    radical_data = (source / 'CJKRadicals.txt').read_bytes()
    radical_text = radical_data.decode('utf-8')
    assert radical_text.startswith(f'# CJKRadicals-{VERSION}.txt')
    radical_forms = {}
    for line in radical_text.splitlines():
        content = line.split('#', 1)[0].strip()
        if not content:
            continue
        key, symbol, unified = [field.strip() for field in content.split(';')]
        radical_forms[key] = {
            'number': int(key.rstrip("'")),
            'variant': len(key) - len(key.rstrip("'")),
            'symbol': chr(int(symbol, 16)) if symbol else None,
            'form': chr(int(unified, 16)),
        }

    archive_data = (source / 'Unihan.zip').read_bytes()
    archive = zipfile.ZipFile(source / 'Unihan.zip')
    irg_filename, irg_data = None, None
    for filename in archive.namelist():
        candidate = archive.read(filename)
        if b'\tkRSUnicode\t' in candidate:
            assert irg_filename is None, 'kRSUnicode found in multiple source files'
            irg_filename, irg_data = filename, candidate
    assert irg_filename is not None, 'kRSUnicode is missing from source archive'
    irg_text = irg_data.decode('utf-8')
    assert f'# Unicode Version {VERSION}' in irg_text
    raw_lines = [line for line in irg_text.splitlines() if '\tkRSUnicode\t' in line]
    raw_values = {}
    for line in raw_lines:
        codepoint, field, value = line.split('\t')
        assert field == 'kRSUnicode'
        raw_values[chr(int(codepoint[2:], 16))] = value.split(' ')

    missing = sorted(target_chars - raw_values.keys(), key=ord)
    assert not missing, f'Missing characters: {missing}'
    members = defaultdict(set)
    active_keys = defaultdict(set)
    character_radicals, character_audit = {}, {}
    for character in sorted(target_chars, key=ord):
        values = []
        for raw in raw_values[character]:
            parsed = VALUE_PATTERN.fullmatch(raw)
            assert parsed, f'Unsupported kRSUnicode value: {raw}'
            number, apostrophes, residual = parsed.groups()
            key = number + apostrophes
            assert key in radical_forms, f'Missing CJKRadicals form: {key}'
            number = int(number)
            assert 1 <= number <= 214
            members[number].add(character)
            active_keys[number].add(key)
            values.append({
                'raw': raw, 'radicalKey': key, 'number': number,
                'variant': len(apostrophes), 'residualStrokes': int(residual),
                'form': radical_forms[key]['form'],
                'baseForm': radical_forms[str(number)]['form'],
            })
        numbers = sorted({value['number'] for value in values})
        character_radicals[character] = [str(number) for number in numbers]
        character_audit[character] = {
            'codePoint': f'U+{ord(character):04X}',
            'kRSUnicode': raw_values[character],
            'values': values,
            'inOfficial': character in official_chars,
            'inLegacy': character in legacy_chars,
        }

    # Independent Unicode chart export: preserve simplified-form columns and
    # account for the documented collation rule that clamps negative residues.
    rs_index_data = (source / 'RSIndex.txt').read_bytes()
    index_values = defaultdict(set)
    for line in rs_index_data.decode('utf-8').splitlines():
        fields = line.split('#', 1)[0].strip().split(';')
        if len(fields) != 5:
            continue
        number, strokes = fields[0].strip().split('.')
        for variant, column in enumerate(fields[1:]):
            value = number + "'" * variant + '.' + strokes
            for codepoint in re.findall(r'U\+([0-9A-F]+)', column):
                index_values[chr(int(codepoint, 16))].add(value)
    for character in target_chars:
        normalized = {value.split('.')[0] + '.' + str(max(0, int(value.split('.')[1])))
                      for value in raw_values[character]}
        assert normalized == index_values[character], 'RSIndex mismatch: ' + character

    groups = []
    for number in sorted(members):
        base = radical_forms[str(number)]['form']
        # A single apostrophe is the Chinese simplified radical in Unicode.
        # Prefer it only where it actually occurs in the indexed vocabulary.
        simplified_key = str(number) + "'"
        display_key = simplified_key if simplified_key in active_keys[number] else str(number)
        keys = [str(number)] + sorted(active_keys[number] - {str(number)})
        forms = list(dict.fromkeys(radical_forms[key]['form'] for key in keys))
        groups.append({
            'id': str(number), 'number': number,
            'form': radical_forms[display_key]['form'],
            'baseForm': base, 'nameZh': base + '部', 'forms': forms,
            'characters': sorted(members[number], key=ord),
        })

    def word_group_ids(word):
        return {key for character in word['hanzi'] for key in character_radicals.get(character, [])}

    level_stats = []
    for level in range(1, 8):
        words = [word for word in official if word['level'] == level]
        chars = {c for word in words for c in word['hanzi']}
        group_ids = {key for c in chars for key in character_radicals[c]}
        level_stats.append({'level': level, 'entries': len(words),
                            'characters': len(chars), 'groupCount': len(group_ids)})
    coverage = {
        'officialEntries': len(official),
        'officialCharacters': len(official_chars),
        'coveredCharacters': len(official_chars & raw_values.keys()),
        'missing': sorted(official_chars - raw_values.keys()),
        'indexedOfficialEntries': sum(bool(word_group_ids(word)) for word in official),
        'groupCount': len(groups),
        'multipleRadicalCharacters': sum(len(character_radicals[c]) > 1 for c in official_chars),
        'simplifiedRadicalVariantCount': len({key for c in official_chars
                                            for key in (v.split('.')[0] for v in raw_values[c])
                                            if "'" in key}),
        'legacyEntries': len(legacy),
        'legacyCharacters': len(legacy_chars),
        'legacyCoveredCharacters': len(legacy_chars & raw_values.keys()),
        'legacyOnlyCharacters': sorted(legacy_chars - official_chars, key=ord),
        'allCharacters': len(target_chars),
        'allCoveredCharacters': len(target_chars & raw_values.keys()),
        'illustratedFamilies': len(ILLUSTRATED_NUMBERS),
        'additionalDictionaryGroups': len(set(members) - set(ILLUSTRATED_NUMBERS)),
        'illustratedRadicalNumbers': ILLUSTRATED_NUMBERS,
        'unusedKangxiRadicalNumbers': sorted(set(range(1, 215)) - set(members)),
        'officialLevelStats': level_stats,
    }
    assert len(official) == 11000
    assert coverage['officialCharacters'] == 3088
    assert coverage['groupCount'] == 206
    assert coverage['indexedOfficialEntries'] == 11000
    assert len(set(ILLUSTRATED_NUMBERS) - set(members)) == 0

    public = root / 'public/sources/unicode18'
    public.mkdir(parents=True, exist_ok=True)
    license_data = (source / 'Unicode-LICENSE.txt').read_bytes()
    (public / 'Unicode-LICENSE.txt').write_bytes(license_data)
    (public / 'CJKRadicals.txt').write_bytes(radical_data)
    # Redistribute only the used property, with the original source header and
    # exact unmodified property lines. The complete archive remains upstream.
    source_header = []
    for line in irg_text.splitlines():
        if line.startswith('U+'):
            break
        source_header.append(line)
    export_text = '\n'.join(source_header + [
        '# Export: all kRSUnicode lines from the original file; other properties omitted.',
        f'# Original archive: https://www.unicode.org/Public/{VERSION}/ucd/Unihan.zip',
        '# This export does not modify any kRSUnicode value.', '',
    ] + raw_lines) + '\n'
    export_data = export_text.encode('utf-8')
    (public / 'Unihan_kRSUnicode.txt').write_bytes(export_data)
    sources = {
        'unihan': {
            'title': 'Unicode 18.0.0 Unihan kRSUnicode',
            'url': f'https://www.unicode.org/Public/{VERSION}/ucd/Unihan.zip',
            'archiveSha256': sha256(archive_data),
            'archiveBytes': len(archive_data),
            'archiveMember': irg_filename,
            'memberSha256': sha256(irg_data),
            'memberBytes': len(irg_data),
            'property': 'kRSUnicode',
            'exportPath': '/sources/unicode18/Unihan_kRSUnicode.txt',
            'exportSha256': sha256(export_data),
            'exportRows': len(raw_lines),
        },
        'cjkRadicals': {
            'title': 'Unicode 18.0.0 CJKRadicals.txt',
            'url': f'https://www.unicode.org/Public/{VERSION}/ucd/CJKRadicals.txt',
            'sha256': sha256(radical_data), 'bytes': len(radical_data),
            'localPath': '/sources/unicode18/CJKRadicals.txt',
        },
        'documentation': {
            'title': 'UAX #38, Unicode Han Database (Unihan), Revision 41',
            'url': 'https://www.unicode.org/reports/tr38/tr38-41.html',
        },
        'crossCheck': {
            'title': 'Unicode 18.0.0 Radical-Stroke Index Collation Data',
            'url': f'https://www.unicode.org/Public/{VERSION}/charts/RSIndex.txt',
            'sha256': sha256(rs_index_data), 'bytes': len(rs_index_data),
            'policy': 'All indexed character values cross-checked; negative residues normalized to zero only for the collation comparison, as documented in UAX #38 section 2.1.2.',
        },
        'license': {
            'title': 'Unicode License V3', 'url': 'https://www.unicode.org/license.txt',
            'sha256': sha256(license_data),
            'localPath': '/sources/unicode18/Unicode-LICENSE.txt',
        },
    }
    data = {
        'system': 'Unicode Unihan kRSUnicode / Kangxi 214 radical numbering',
        'version': VERSION, 'sources': sources, 'groups': groups,
        'characterRadicals': character_radicals, 'coverage': coverage,
    }
    dump(root / 'src/data/dictionary-radicals.json', data)
    dump(root / 'public/sources/dictionary-radicals.json', data)
    dump(public / 'character-radicals-audit.json', {
        'system': data['system'], 'version': VERSION, 'sources': sources,
        'coverage': coverage, 'characters': character_audit,
    })
    dump(public / 'provenance.json', {
        'version': VERSION, 'sources': sources,
        'inputs': {
            'officialVocabularySha256': sha256((root / 'src/data/hsk-official.json').read_bytes()),
            'legacyVocabularySha256': sha256((root / 'src/data/lexicon.json').read_bytes()),
        },
        'classification': 'Kangxi 214 numbering; not a Chinese national-standard 201-radical list',
        'groupPolicy': 'Group by base radical number, retaining all kRSUnicode assignments and source variant values in the audit.',
        'wordPolicy': 'A word is indexed under each dictionary radical assigned to any of its characters. Cross-group overlap is intentional.',
        'formPolicy': 'Chinese simplified standalone form is displayed only when the source variant occurs in the indexed vocabulary; otherwise the CJKRadicals base form is used.',
        'noInference': 'Dictionary lookup classification is not proof of etymology, semantic role, phonetic role, or a valid component-combination game rule.',
        'coverage': coverage,
    })
    dump(public / 'validation.json', {
        'sourceHashesPinned': True,
        'independentRSIndexCheckedCharacters': len(target_chars),
        'independentRSIndexUnexplainedDifferences': 0,
        'negativeResidualValuesPreserved': {
            c: raw_values[c] for c in sorted(target_chars, key=ord)
            if any('.-' in value for value in raw_values[c])
        },
        'allOfficialEntriesIndexed': coverage['indexedOfficialEntries'] == len(official),
        'missingOfficialCharacters': coverage['missing'],
        'existingIllustratedFamiliesAltered': False,
    })
    (public / 'NOTICE.txt').write_text(
        'Unicode 18.0.0 dictionary radical index\n'
        'Copyright © 2026 Unicode, Inc.\n'
        'Unicode and the Unicode Logo are registered trademarks of Unicode, Inc.\n'
        'Distributed under the Unicode License V3. See Unicode-LICENSE.txt.\n\n'
        'CJKRadicals.txt is copied verbatim from the official Unicode 18.0.0 UCD.\n'
        'Unihan_kRSUnicode.txt preserves the source header and every kRSUnicode line\n'
        'from Unihan_IRGSources.txt, with other property lines omitted.\n'
        'character-radicals-audit.json is the relevant vocabulary subset with all\n'
        'original kRSUnicode values, including simplified variants and multiple\n'
        'classifications. See provenance.json for source URLs and SHA-256 hashes.\n\n'
        'This is a dictionary lookup index using Kangxi 214 radical numbering.\n'
        'It is not an etymological analysis or the modern Chinese 201-radical standard.\n'
        '月 (74) and 肉 (130), and 阜 (170) and 邑 (163), remain distinct.\n'
        'All source lookup assignments are retained; no historical images, semantic\n'
        'functions, phonetics, or component-combination rules are inferred.\n'
        'Existing illustrated families and combination cards are not altered.\n\n'
        '사전 부수는 한자를 찾기 위한 분류입니다. 글자의 뜻이나 자원 풀이와 다를 수 있어요.\n'
    )
    print(json.dumps(coverage, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
