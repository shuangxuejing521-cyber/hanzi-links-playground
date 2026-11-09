#!/usr/bin/env python3
"""Import the official 2025 HSK exam vocabulary, preserving all 11,000 entries.

Requires pypdf. The PDF and Korean CSV are explicit inputs, downloaded separately.
Example:
  python3 scripts/import-hsk-official.py --pdf /path/hsk3-1219.pdf \
    --korean-csv /path/second-language-ko-all.csv [--check]
Membership, order, pronunciation and POS come from the official PDF. Korean
definitions are independent CC BY-SA adaptations, not an official translation.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import csv
import hashlib
import json
from pathlib import Path
import re
import unicodedata

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OFFICIAL_PAGE = 'https://www.chinesetest.cn/syllabus'
OFFICIAL_PDF = 'https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf'
PDF_SHA256 = 'd8b6646599bc9a0c9616a4cb06d4b37461f8792f70a3171016d00fcd8eda09ad'
KOREAN_PAGE = 'https://second-language.app/ko/tools/hsk-vocabulary'
KOREAN_CSV = 'https://second-language.app/downloads/hsk/ko/hsk-3-0-all-levels.csv'
KOREAN_SHA256 = '2e4599bce993c079bb59f8f84feb1588654c16d2b47cf9cf28c7544125bd387d'
EXPECTED = {1: 300, 2: 200, 3: 500, 4: 1000, 5: 1600, 6: 1800, 7: 5600}

# Explicitly reviewed Korean CSV record numbers, header counted as record 1.
# Official sense indices and POS distinguish same-spelling/same-reading entries.
KOREAN_SELECTION = {
    10: 11, 33: 34, 78: 79, 82: 83, 111: 112, 218: 219,
    311: 312, 327: 328, 334: 335, 336: 337, 350: 351,
    357: 358, 358: 359, 403: 404, 486: 487, 544: 545,
    635: 636, 660: 661, 683: 684, 966: 967, 1081: 1079,
    1147: 1148, 1473: 1474, 1646: 1647, 1647: 1648,
    1650: 1651, 1771: 1772, 1938: 1939, 1972: 1973,
    1993: 1997, 2040: 2041, 2066: 2067, 2083: 2084,
    2132: 2133, 2133: 2134, 2141: 2144, 2284: 2285,
    2373: 2370, 2767: 2768, 2779: 2780, 2825: 2826,
    2826: 2827, 2859: 2860, 2989: 2990, 2998: 2999,
    3098: 3099, 3183: 3185, 3198: 3196, 3499: 3500,
    3766: 3758, 4009: 4008, 4013: 4014, 4147: 4149,
    4341: 4342, 4342: 4343, 4450: 4451, 4451: 4452,
    4469: 4464, 4769: 4770, 4854: 4855, 5253: 5254,
    5295: 5295, 5890: 5895, 6114: 6115, 6299: 6299,
    6568: 6569, 6569: 6570, 7030: 7019, 7060: 7059,
    8086: 8082, 8119: 8120, 8120: 8121, 8129: 8127,
    8130: 8128, 8252: 8253, 8616: 8603, 10523: 10524,
    10674: 10675, 10729: 10732, 10730: 10733,
    10844: 10845, 10913: 10914, 10914: 10915, 10992: 10995,
}

# Narrow broad glosses to the official sense, or correct a mismatched homophone.
KOREAN_EDITS = {
    1081: '타다 (교통수단)',
    1993: '~로 삼다; ~로서',
    2373: '벌; 쌍 (안경·장갑 등을 세는 양사)',
    4147: '가로의; 가로놓다; 가로줄',
    4469: '드러나다; 드러내다',
    5253: '그러면; 반면에 (접속사)',
    7060: '난폭하다; 무리하다; 불합리하다',
    10992: '성과; 업적; 일을 해내다',
}

# Retain official pinyin even when the independent dictionary differs.
PINYIN_VARIANTS = {6693: 'syllable separator differs',
                   7452: 'official ta4; dictionary ta1',
                   8825: 'official ren4; dictionary ren2'}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def normalize_pinyin(value: str) -> str:
    value = unicodedata.normalize('NFC', value).lower()
    return re.sub(r"[\s’‘'·-]", '', value)


def extract(pdf: Path) -> list[dict]:
    assert digest(pdf) == PDF_SHA256, 'Official PDF changed; review before importing.'
    reader = PdfReader(pdf)
    assert len(reader.pages) == 406
    pattern = re.compile(r'^(\d{1,5})\s+([1-6]|7-9)((?:（[^）]*）)*)\s+(\S+)\s+(.+)$')
    rows = []
    for page_index in range(79, 354):
        for line in reader.pages[page_index].extract_text().splitlines():
            match = pattern.match(line.strip())
            if not match:
                continue
            ordinal, level, annotations, written, tail = match.groups()
            # Pinyin can contain spaces; Chinese starts the optional POS column.
            pinyin, pos = re.match(r'^(.+?)(?:\s+([\u3400-\u9fff（].*))?$', tail).groups()
            sense = re.search(r'(\d+)$', written)
            rows.append({'officialIndex': int(ordinal), 'level': 7 if level == '7-9' else int(level),
                         'hanzi': re.sub(r'\d+$', '', written) if sense else written,
                         'displayHanzi': written, 'senseNumber': int(sense[1]) if sense else None,
                         'pinyin': pinyin, 'pos': pos or '', 'levelRaw': level + annotations,
                         'sourcePage': page_index + 1})
    rows.sort(key=lambda row: row['officialIndex'])
    assert [row['officialIndex'] for row in rows] == list(range(1, 11001))
    assert dict(Counter(row['level'] for row in rows)) == EXPECTED
    assert not any(re.search(r'[\u3400-\u9fff]', row['pinyin']) for row in rows)
    return rows


def build(pdf: Path, korean_csv: Path) -> dict[Path, object]:
    official = extract(pdf)
    assert digest(korean_csv) == KOREAN_SHA256, 'Korean source changed; review before importing.'
    with korean_csv.open(encoding='utf-8-sig', newline='') as handle:
        korean = list(csv.DictReader(handle))
    assert len(korean) == 11000
    candidates = defaultdict(list)
    for index, row in enumerate(korean, 2):
        candidates[row['simplified']].append({'csvRow': index, **row})
    words, audit = [], []
    for row in official:
        ordinal = row['officialIndex']
        possible = candidates[row['hanzi']]
        exact = [item for item in possible if normalize_pinyin(item['pinyin']) == normalize_pinyin(row['pinyin'])]
        if ordinal in KOREAN_SELECTION:
            selected = next(item for item in possible if item['csvRow'] == KOREAN_SELECTION[ordinal])
            reason = 'explicit sense/POS adjudication'
        elif len(exact) == 1:
            selected, reason = exact[0], 'exact spelling and pinyin'
        else:
            assert ordinal in PINYIN_VARIANTS and len(possible) == 1, row
            selected, reason = possible[0], PINYIN_VARIANTS[ordinal]
        definition = KOREAN_EDITS.get(ordinal, selected['meaning'])
        assert definition.strip() and re.search(r'[가-힣]', definition), row
        word = {'id': f'hsk3-{ordinal:05}', **row, 'korean': definition,
                'definitionSource': 'project-editorial' if ordinal in KOREAN_EDITS else 'second-language-ko'}
        words.append(word)
        if ordinal in KOREAN_SELECTION or ordinal in PINYIN_VARIANTS or ordinal in KOREAN_EDITS:
            audit.append({'officialIndex': ordinal, 'hanzi': row['displayHanzi'], 'pos': row['pos'],
                          'officialPinyin': row['pinyin'], 'koreanCsvRow': selected['csvRow'],
                          'dictionaryPinyin': selected['pinyin'], 'sourceMeaning': selected['meaning'],
                          'korean': definition, 'decision': reason})
    metadata = {
        'title': 'HSK 考试大纲（2025年11月发布，2026年7月实施）词汇大纲',
        'publisher': '中外语言交流合作中心', 'officialPage': OFFICIAL_PAGE, 'officialPdf': OFFICIAL_PDF,
        'published': '2025-11', 'effective': '2026-07', 'retrieved': '2026-11-06', 'pdfSha256': PDF_SHA256,
        'entries': len(words), 'distinctWrittenForms': len({row['hanzi'] for row in official}),
        'levelGroups': ['1', '2', '3', '4', '5', '6', '7-9'],
        'newEntries': [300, 200, 500, 1000, 1600, 1800, 5600],
        'cumulativeEntries': [300, 500, 1000, 2000, 3600, 5400, 11000],
        'counting': 'Official numbered entries 1–11000, preserving homographs and sense indices. Parenthesized levels mark later POS requirements, not additional vocabulary entries. Official 7–9 is a combined group.',
        'extraction': {'method': 'pypdf text extraction; physical PDF pages 80–354', 'contiguousOfficialIndices': True,
                       'pageCount': 406, 'levelAnnotationsPreserved': 102, 'blankPosInOriginal': 496},
        'koreanDefinitions': {'publisher': 'Second Language / CC-CEDICT', 'page': KOREAN_PAGE,
                              'download': KOREAN_CSV, 'sha256': KOREAN_SHA256,
                              'license': 'CC BY-SA 4.0', 'licenseUrl': 'https://creativecommons.org/licenses/by-sa/4.0/',
                              'attribution': 'Korean meanings adapted from Second Language (https://second-language.app/ko/tools/hsk-vocabulary), which adapts CC-CEDICT (https://www.mdbg.net/chinese/dictionary?page=cedict), CC BY-SA 4.0.',
                              'officialTranslation': False, 'nativeKoreanTeacherReviewed': False,
                              'definitionNote': 'Dictionary glosses are independent teaching support. Official membership, level, spelling, pinyin and POS come only from the official syllabus.',
                              'explicitHomographAdjudications': len(KOREAN_SELECTION),
                              'editorialCorrections': len(KOREAN_EDITS), 'audit': audit},
    }
    return {ROOT / 'src/data/hsk-official.json': words,
            ROOT / 'public/sources/hsk-official.json': {'source': OFFICIAL_PDF, 'pdfSha256': PDF_SHA256, 'rows': official},
            ROOT / 'public/sources/hsk-official-source.json': metadata}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pdf', type=Path, required=True)
    parser.add_argument('--korean-csv', type=Path, required=True)
    parser.add_argument('--check', action='store_true')
    arguments = parser.parse_args()
    for path, value in build(arguments.pdf, arguments.korean_csv).items():
        output = json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n'
        if arguments.check:
            assert path.read_text() == output, f'{path} differs from reproducible import'
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(output)
        print(f'{path.relative_to(ROOT)}: {len(output.encode())} bytes')


if __name__ == '__main__':
    main()
