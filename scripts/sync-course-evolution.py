"""Retain source-attested HanDian ancient specimens for the complete HSK course.

Resume with the same cache. Metadata is collected first; --mirror-images also
retains source SVG bytes locally. Never infer unavailable periods or invent forms.
At most three workers; HTTP 403/429 pauses all workers before a bounded retry.
"""
from __future__ import annotations
import argparse
import copy
import concurrent.futures
from datetime import datetime, timezone
import hashlib
import html
import http.client
import json
from pathlib import Path
import re
import socket
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

PROJECT = Path(__file__).resolve().parents[1]
WORKSPACE = PROJECT.parents[1]
CHECKED = '2026-11-06'
TARGET_STAGES = ('甲骨文', '金文', '楚系简帛', '说文', '秦系简牍', '隶书', '楷书')
HISTORICAL_STAGES = frozenset(TARGET_STAGES) - {'楷书'}
STAGE_FOLDERS = {'jiaguwen': '甲骨文', 'jinwen': '金文', 'chuwenzi': '楚系简帛',
                 'xiaozhuan': '说文', 'qinwenzi': '秦系简牍', 'lishu': '隶书'}
SOURCE = 'https://zdic.net/hans/'
LOCK = threading.Lock()
PAUSED_UNTIL = 0.0
CONNECTIONS = threading.local()
DATA_POLICY = {
    'association': 'Each record contains historical or modern specimens linked by the source dictionary entry, with modern regular script labelled separately. Linkage alone does not establish that a specimen is the modern target character itself, its direct ancestor, or a form belonging to the currently selected vocabulary sense.',
    'display': 'Describe these as related specimens linked by the source entry. Do not label an unreviewed specimen as the target character in a historical script, draw a direct source-specimen-to-modern-target evolution arrow, or use it as an identity quiz answer without separate character-specific evidence.',
    'sourceIndexLabels': 'A non-PUA unified Han codepoint in a Shuowen SVG filename may be shown as the source asset index character. This is an index label, not independent proof of etymological identity. Oracle-bone and bronze PUA filename numbers are resource identifiers, not characters to decode into a modern target.',
    'traditional': 'The traditional field preserves the first value of the source entry variant list. It is not a reviewed one-to-one traditional conversion for the selected HSK word or sense. Simplified character mergers and multiple senses can point to different traditional forms.',
    'counts': 'Historical coverage counts dictionary entries linking to historical specimens and excludes modern regular script. It is not a count of target characters with independently verified direct historical evolution.',
    'ko': '원문 항목에 함께 실린 옛 글자 자료입니다. 학습 글자 자체의 직접적인 변천이나 현재 뜻을 입증하지는 않습니다.',
    'examples': [
        {'target': '拽', 'filenameIndexedCharacter': '曳'},
        {'target': '揍', 'filenameIndexedCharacter': '奏'},
        {'target': '哪', 'filenameIndexedCharacter': '那'},
        {'target': '影', 'filenameIndexedCharacter': '景'},
        {'target': '桌', 'filenameIndexedCharacter': '卓'},
        {'target': '朋', 'filenameIndexedCharacter': '鳳'},
        {'target': '氧', 'filenameIndexedCharacter': '養'},
        {'target': '叶', 'filenameIndexedCharacter': '協'},
        {'target': '术', 'filenameIndexedCharacter': '秫'},
    ],
}


def http_bytes(url: str, headers: dict) -> bytes:
    """Use ordinary verified HTTPS keep-alive, one connection per worker/host."""
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != 'https' or parsed.netloc not in ('zdic.net', 'www.zdic.net', 'img.zdic.net'):
        raise ValueError('unexpected source host')
    connections = getattr(CONNECTIONS, 'hosts', None)
    if connections is None:
        connections = CONNECTIONS.hosts = {}
    connection = connections.get(parsed.netloc)
    if connection is None:
        connection = connections[parsed.netloc] = http.client.HTTPSConnection(parsed.netloc, timeout=30)
    path = parsed.path + ('?' + parsed.query if parsed.query else '')
    try:
        connection.request('GET', path, headers=headers)
        response = connection.getresponse()
        body = response.read()
        if response.status in (301, 302, 303, 307, 308):
            destination = urllib.parse.urljoin(url, response.getheader('Location', ''))
            return http_bytes(destination, headers)
        if response.status >= 400:
            raise urllib.error.HTTPError(url, response.status, response.reason, response.headers, None)
        if response.will_close:
            connection.close()
            connections.pop(parsed.netloc, None)
        return body
    except Exception:
        connection.close()
        connections.pop(parsed.netloc, None)
        raise


def clean(value: str) -> str:
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]*>', '', html.unescape(value))).strip()


def fetch(url: str, referer: str = 'https://zdic.net/') -> bytes:
    global PAUSED_UNTIL
    for attempt in range(3):
        with LOCK:
            delay = max(0.0, PAUSED_UNTIL - time.monotonic())
        if delay:
            time.sleep(delay)
        try:
            data = http_bytes(url, headers={
                'User-Agent': 'Mozilla/5.0', 'Referer': referer,
                'Accept': 'text/html,image/svg+xml;q=0.9,*/*;q=0.5',
            })
            time.sleep(0.15)
            return data
        except urllib.error.HTTPError as error:
            if error.code in (403, 429):
                seconds = max(30 * (attempt + 1), int(error.headers.get('Retry-After', '0')) if error.headers.get('Retry-After', '').isdigit() else 0)
                with LOCK:
                    PAUSED_UNTIL = max(PAUSED_UNTIL, time.monotonic() + seconds)
                print(f'HTTP {error.code}; pausing requests for {seconds}s', flush=True)
            elif error.code == 404:
                raise
            elif attempt == 2:
                raise
            else:
                time.sleep(2 * (attempt + 1))
            if attempt == 2:
                raise
        except (TimeoutError, socket.timeout, urllib.error.URLError, ConnectionError, http.client.HTTPException):
            if attempt == 2:
                raise
            time.sleep(2 * (attempt + 1))
    raise RuntimeError('unreachable')


def sanitized_svg(data: bytes) -> bytes:
    if b'<!DOCTYPE' in data.upper() or b'<!ENTITY' in data.upper():
        raise ValueError('XML external declarations are not accepted')
    root = ET.fromstring(data)
    if root.tag.split('}')[-1].lower() != 'svg':
        raise ValueError('source is not SVG')
    changed = False
    for parent in root.iter():
        for node in list(parent):
            if node.tag.split('}')[-1].lower() in ('script', 'foreignobject', 'iframe', 'object', 'embed'):
                parent.remove(node)
                changed = True
        for key, value in list(parent.attrib.items()):
            local = key.split('}')[-1].lower()
            if local.startswith('on') or (local in ('href', 'src') and not value.startswith('#')) or ('url(' in value.lower() and 'url(#' not in value.lower()):
                del parent.attrib[key]
                changed = True
        if parent.tag.split('}')[-1].lower() == 'style' and ('@import' in (parent.text or '').lower() or 'url(' in (parent.text or '').lower()):
            parent.text = ''
            changed = True
    return ET.tostring(root, encoding='utf-8') if changed else data


def parse_page(char: str, text: str) -> dict:
    url = SOURCE + urllib.parse.quote(char)
    sections = text.split('<h3 class="dict-sub-title">字源演变</h3>', 1)
    section = sections[1].split('<h3', 1)[0] if len(sections) > 1 else ''
    traditional = re.search(r'<span class="meta-badge"[^>]*>繁体</span>\s*<ul class="variant-list">.*?<a[^>]+title="([^"]+)"', text, re.S)
    entry = {'form': char, 'sourceUrl': url, 'checked': CHECKED, 'stages': [], 'availability': 'not-listed'}
    if traditional:
        entry['traditional'] = html.unescape(traditional.group(1))
    # A quoted dictionary label, not a newly verified etymological judgement.
    analysis = re.search(r'>字形分析</span>\s*<span class="meta-value">(.*?)</span>', text, re.S)
    if analysis:
        entry['sourceAnalysis'] = clean(analysis.group(1))
    else:
        # Keep quoted Shuowen text separate from the modern metadata analysis.
        # The page can explicitly refer to a different headword (e.g. 饭 → 飯).
        sw = re.search(r'<section[^>]+id="swjz"[^>]*>(.*?)</section>', text, re.S)
        original = re.search(r'<h3[^>]*>(说文解字·.*?)</h3>\s*<img[^>]+alt="([^"]+)"[^>]*>\s*<p>(.*?)</p>', sw.group(1), re.S) if sw else None
        if original:
            excerpt = clean(original.group(3))
            if excerpt and len(excerpt) <= 240:
                index_form = html.unescape(original.group(2))
                entry['sourceExplanation'] = {
                    'kind': 'shuowen-original', 'text': excerpt,
                    'indexForm': index_form, 'title': clean(original.group(1)),
                    'sourceUrl': url + '#swjz',
                    'attribution': '许慎《说文解字》；汉典条目转录',
                    'association': 'same-headword' if index_form == char else 'dictionary-cross-reference',
                    'note': 'Quoted source text, not a new historical verification or a universal explanation of every modern sense.',
                }
        # Literal origin notes in detailed definitions are another source type.
        # Keep hedges such as 一说; do not manufacture an account from IDS.
        if 'sourceExplanation' not in entry and char != '脸' and 'id="xxjs"' in text:
            detail = text.split('id="xxjs"', 1)[1].split('<section class="dict-section"', 1)[0]
            for value in re.findall(r'<div class="xxjs-item__def">(.*?)</div>', detail, re.S):
                excerpt = clean(value)
                if excerpt.startswith('(') and excerpt.endswith(')') and re.search(r'形声|一说本作|古作', excerpt):
                    entry['sourceExplanation'] = {
                        'kind': 'dictionary-detail-origin', 'text': excerpt[1:-1],
                        'indexForm': char, 'title': '汉典详细解释 · 构形说明',
                        'sourceUrl': url + '#xxjs', 'attribution': '汉典详细解释（页面原文）',
                        'association': 'same-headword',
                        'note': 'An attributed dictionary account, including any uncertainty in its wording; not a newly verified etymological judgement.',
                    }
                    break
        if 'sourceExplanation' not in entry and sw:
            commentary = re.search(r'<h3[^>]*>(说文解字注[^<]*)</h3>(.*?)(?=<div style="clear:)', sw.group(1), re.S)
            if commentary:
                excerpt = clean(commentary.group(2))
                title = clean(commentary.group(1))
                index_form = title.split('·', 1)[1] if '·' in title else char
                if excerpt and len(excerpt) <= 240:
                    entry['sourceExplanation'] = {
                        'kind': 'shuowen-commentary', 'text': excerpt,
                        'indexForm': index_form, 'title': title,
                        'sourceUrl': url + '#swjz',
                        'attribution': '段玉裁《说文解字注》；汉典条目转录',
                        'association': 'same-headword' if index_form == char else 'dictionary-cross-reference',
                        'note': 'Commentary quoted separately from the Shuowen original; an indexed cross-reference is not proof of a direct historical relation to the modern target.',
                    }
    captions = {}
    candidates = {stage: [] for stage in TARGET_STAGES}
    folders = STAGE_FOLDERS
    for figure in re.findall(r'<figure class="glyph-grid__item">(.*?)</figure>', text, re.S):
        image = re.search(r'<img[^>]*src="([^"]+)"', figure)
        caption = re.search(r'<figcaption[^>]*>(.*?)</figcaption>', figure, re.S)
        if image and caption:
            candidate_url = html.unescape(image.group(1))
            captions[candidate_url] = clean(caption.group(1))
            candidate_path = urllib.parse.urlparse(candidate_url)
            source_match = re.fullmatch(r'/zy/(jiaguwen|jinwen|chuwenzi|xiaozhuan|qinwenzi|lishu)/[0-9]+_[0-9A-Fa-f]+\.svg', candidate_path.path)
            if candidate_path.netloc == 'img.zdic.net' and source_match:
                candidates[folders[source_match.group(1)]].append({'url': candidate_url, 'provenanceNote': clean(caption.group(1))})
    for item in re.findall(r'<div class="glyph-evolution__item">(.*?)</div>', section, re.S):
        label = re.search(r'class="glyph-evolution__label">([^<]+)', item)
        image = re.search(r'<img[^>]*src="([^"]+)"', item)
        link = re.search(r'<a href="([^"]+)"', item)
        if not label or not image or clean(label.group(1)) not in TARGET_STAGES:
            continue
        stage, image_url = clean(label.group(1)), html.unescape(image.group(1))
        if urllib.parse.urlparse(image_url).netloc != 'img.zdic.net':
            continue
        path = urllib.parse.urlparse(image_url).path
        if stage == '楷书':
            accepted = bool(re.fullmatch(r'/kai/cn/[0-9A-Fa-f]{4,6}\.svg', path))
        else:
            folder = path.split('/')[2] if path.startswith('/zy/') else ''
            accepted = folders.get(folder) == stage and path.endswith('.svg')
        if not accepted:
            continue
        specimen = {
            'stage': stage,
            'title': '《说文》小篆' if stage == '说文' else stage,
            'url': image_url,
            'galleryUrl': urllib.parse.urljoin(url, link.group(1)) if link else url + '#zyzx',
            'provenanceNote': captions.get(image_url, '汉典字源栏目所选字例；未列单幅出典'),
            'alternatives': [candidate for candidate in candidates[stage] if candidate['url'] != image_url],
            'scriptCategory': 'modern' if stage == '楷书' else 'historical',
        }
        if stage == '楷书':
            specimen['provenanceNote'] = '汉典条目展示的现代楷书字形；不是古文字出土材料。'
        if stage == '说文':
            code = re.search(r'/[0-9]+_([0-9A-Fa-f]{4,6})\.svg$', path)
            if code:
                form = chr(int(code.group(1), 16))
                if form == char or form in entry.get('traditional', ''):
                    specimen['form'] = form
        entry['stages'].append(specimen)
    return entry


def merge_entry(old: dict | None, parsed: dict) -> dict:
    """Add listed stages while retaining reviewed representatives and annotations."""
    if not old:
        return copy.deepcopy(parsed)
    result = copy.deepcopy(old)
    previous = {stage['stage']: stage for stage in result['stages']}
    additions = {stage['stage']: copy.deepcopy(stage) for stage in parsed['stages'] if stage['stage'] not in previous}
    stages = {**previous, **additions}
    result['stages'] = [stages[name] for name in TARGET_STAGES if name in stages]
    result['stages'] += [stage for name, stage in stages.items() if name not in TARGET_STAGES]
    for field in ('sourceAnalysis', 'sourceExplanation'):
        if not result.get(field) and parsed.get(field):
            result[field] = copy.deepcopy(parsed[field])
    result['availability'] = 'found' if result['stages'] else 'not-listed'
    return result


def coverage_for(entries: dict, requested: list[str]) -> dict:
    all_entries = [entries[c] for c in requested if c in entries]
    stages = [stage for entry in all_entries for stage in entry['stages']]
    local = lambda stage: stage.get('storage') == 'local' or stage.get('src', '').startswith('/')
    historical = lambda entry: [s for s in entry['stages'] if s['stage'] in HISTORICAL_STAGES]
    modern = lambda entry: [s for s in entry['stages'] if s['stage'] == '楷书']
    waiting = [entry['form'] for entry in all_entries if historical(entry) and not any(local(s) for s in historical(entry))]
    return {
        'requestedCharacters': len(requested), 'processedCharacters': len(all_entries),
        'charactersWithAnyStage': sum(bool(e['stages']) for e in all_entries),
        'charactersWithAncientSpecimens': sum(bool(historical(e)) for e in all_entries),
        'charactersWithLocalAncientSpecimens': sum(any(local(s) for s in historical(e)) for e in all_entries),
        'charactersWithModernSpecimens': sum(bool(modern(e)) for e in all_entries),
        'charactersWithLocalModernSpecimens': sum(any(local(s) for s in modern(e)) for e in all_entries),
        'modernOnlyCharacters': sum(bool(modern(e)) and not historical(e) for e in all_entries),
        'notListedCharacters': sum(not e['stages'] and e['availability'] != 'fetch-error' for e in all_entries),
        'withoutHistoricalSpecimens': sum(not historical(e) for e in all_entries),
        'fetchErrorCharacters': sum(e['availability'] == 'fetch-error' for e in all_entries),
        'expansionErrorCharacters': sum(bool(e.get('stageExpansionError')) for e in all_entries),
        'specimenCount': len(stages), 'historicalSpecimenCount': sum(s['stage'] in HISTORICAL_STAGES for s in stages),
        'modernSpecimenCount': sum(s['stage'] == '楷书' for s in stages),
        'localSpecimenCount': sum(local(s) for s in stages),
        'remoteSpecimenCount': sum(not local(s) for s in stages),
        'charactersWithoutReachableAncientSpecimens': waiting,
        'firstImageMirroringComplete': not waiting,
        'allStageMirroringComplete': all(local(s) for s in stages),
        'mirrorProcessingComplete': all(local(s) or bool(s.get('mirrorError')) for s in stages),
        'complete': len(all_entries) == len(requested) and all(e['availability'] != 'fetch-error' and not e.get('stageExpansionError') for e in all_entries),
        'byStage': {name: {'characters': sum(any(s['stage'] == name for s in e['stages']) for e in all_entries),
                          'localRecords': sum(s['stage'] == name and local(s) for s in stages),
                          'remoteRecords': sum(s['stage'] == name and not local(s) for s in stages)} for name in TARGET_STAGES},
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--cache-dir', type=Path, default=Path('/private/tmp/hanzi-course-zdic'))
    parser.add_argument('--workers', type=int, default=3)
    parser.add_argument('--limit', type=int)
    parser.add_argument('--mirror-images', action='store_true')
    parser.add_argument('--offline', action='store_true', help='Use receipts and SVG cache without network requests')
    parser.add_argument('--output', type=Path, default=PROJECT / 'public/sources/course-evolution.json')
    args = parser.parse_args()
    cache = args.cache_dir
    (cache / 'html').mkdir(parents=True, exist_ok=True)
    (cache / 'svg').mkdir(parents=True, exist_ok=True)
    output = args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    images = PROJECT / 'public/images/course-evolution'
    images.mkdir(parents=True, exist_ok=True)
    vocabulary = json.loads((PROJECT / 'src/data/hsk-official.json').read_text())
    chars = list(dict.fromkeys('安器赢爱练' + ''.join(row['hanzi'] for row in vocabulary) + '桔'))
    chars = [char for char in chars if '\u3400' <= char <= '\u9fff' or 0x20000 <= ord(char) <= 0x323af]
    selected = chars[:args.limit] if args.limit else chars
    manifest = json.loads(output.read_text()) if output.exists() else {'version': 1, 'characters': {}}
    manifest.setdefault('sources', {'site': 'https://zdic.net/', 'terms': 'https://zdic.net/terms/',
                                   'license': 'CC0-1.0', 'checked': CHECKED})
    processed_on = datetime.now(timezone.utc).date().isoformat()
    # Legacy validation is retained as the original three-stage audit receipt.
    if manifest.get('validation') and 'previousSelectedStageValidation' not in manifest:
        manifest['previousSelectedStageValidation'] = copy.deepcopy(manifest['validation'])
    manifest['dataPolicy'] = {**DATA_POLICY,
        'modern': '楷书 is a separately labelled modern regular-script reference. It is never counted as an ancient specimen or used to fill an absent historical period.',
        'sequence': '楚系简帛 and 秦系简牍 are distinct source/material traditions, not a universal linear chronological chain.',
        'sourceExplanation': 'Quoted Shuowen original text is stored separately from sourceAnalysis. Its indexed headword and dictionary cross-reference status do not establish a one-to-one relation to the current vocabulary sense.',
    }
    manifest['sources'].update({
        'selection': 'One representative for each actually listed stage: oracle bone, bronze, Chu slips/silk, Shuowen small seal, Qin slips, clerical script, and separately labelled modern regular script. Absent stages are omitted.',
        'storagePolicy': 'Cached source-page receipts retain their original checked date and page hash; expansion processing is not a new network check. New local SVG files carry source and sanitized byte hashes. Remote failures remain links.',
        'displayPolicy': 'Display locally retained SVGs only. Every stage remains a source-entry association unless independently reviewed. Modern regular script is not ancient writing.',
        'expansionProcessed': processed_on,
    })
    counters = {'newLocalFiles': 0, 'networkImages': 0, 'failedImageAttempts': 0}
    original_stages = {(char, stage['stage']): copy.deepcopy(stage)
                       for char, entry in manifest['characters'].items() for stage in entry['stages']}

    def save() -> None:
        manifest['coverage'] = coverage_for(manifest['characters'], chars)
        stages = [stage for entry in manifest['characters'].values() for stage in entry['stages']]
        paths = {stage['src'] for stage in stages if stage.get('src', '').startswith('/')}
        manifest['validation'] = {
            'scope': 'Source-page receipt membership, preserved reviewed representatives, source captions, SVG safety and byte hashes; not an independent historical interpretation review.',
            'checked': manifest['sources'].get('checked', CHECKED), 'expanded': processed_on,
            'checkedCharacters': len(manifest['characters']), 'officialCharacters': len(chars) - 1,
            'localSpecimenRecords': sum(stage.get('src', '').startswith('/') for stage in stages),
            'uniqueLocalFiles': len(paths), 'unavailableSourceStageRecords': sum(not stage.get('src', '').startswith('/') for stage in stages),
            'unexplainedDifferences': sum(bool(entry.get('stageExpansionError')) for entry in manifest['characters'].values()),
        }
        temporary = output.with_suffix('.tmp')
        temporary.write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + '\n')
        temporary.replace(output)

    def mirror_stage(stage: dict, page: str) -> dict:
        # Complete old local records are immutable, including reviewed annotations.
        if stage.get('src', '').startswith('/'):
            asset = PROJECT / ('public' + stage['src'])
            if not asset.is_file() or hashlib.sha256(asset.read_bytes()).hexdigest() != stage['sha256']:
                raise ValueError('existing local record failed byte verification: ' + stage['src'])
            return stage
        remote = stage['url']
        parsed_url = urllib.parse.urlparse(remote)
        suffix = '/'.join(parsed_url.path.split('/')[-2:]).replace('/', '-')
        if parsed_url.path.startswith('/kai/cn/'):
            suffix = 'kaishu-' + suffix
        raw_cache = cache / 'svg' / suffix
        asset = images / suffix
        stage = {**stage, 'src': remote, 'storage': 'remote', 'sha256': None, 'sourceSha256': None,
                 'license': 'CC0-1.0', 'licenseSource': 'https://zdic.net/terms/'}
        try:
            if remote.rsplit('/', 1)[-1] == '.svg':
                return stage
            if not raw_cache.exists() and args.mirror_images and not args.offline:
                raw = fetch(remote, page)
                temporary = raw_cache.with_name(raw_cache.name + f'.{threading.get_ident()}.tmp')
                temporary.write_bytes(raw)
                temporary.replace(raw_cache)
                with LOCK:
                    counters['networkImages'] += 1
            if raw_cache.exists():
                raw = raw_cache.read_bytes()
                safe = sanitized_svg(raw)
                if asset.exists():
                    if asset.read_bytes() != safe:
                        raise ValueError('refusing to change existing local SVG: ' + asset.name)
                else:
                    temporary = asset.with_name(asset.name + f'.{threading.get_ident()}.tmp')
                    temporary.write_bytes(safe)
                    temporary.replace(asset)
                    with LOCK:
                        counters['newLocalFiles'] += 1
                stage.update({'src': '/images/course-evolution/' + asset.name, 'storage': 'local',
                              'sha256': hashlib.sha256(safe).hexdigest(),
                              'sourceSha256': hashlib.sha256(raw).hexdigest()})
                stage.pop('mirrorError', None)
        except Exception as error:
            with LOCK:
                counters['failedImageAttempts'] += 1
            # Preserve old unresolved records exactly. New failures are provenance
            # links with explicit failure notes, never placeholder local images.
            stage['mirrorError'] = {'error': f'{type(error).__name__}: {error}', 'attempted': processed_on}
        return stage

    def collect(char: str) -> tuple[str, dict]:
        old = manifest['characters'].get(char)
        url = SOURCE + urllib.parse.quote(char)
        receipt = cache / 'html' / f'{ord(char):x}.html'
        fetched_now = False
        try:
            if not receipt.exists():
                if args.offline:
                    raise ValueError('source-page receipt absent in offline mode')
                receipt.write_bytes(fetch(url))
                fetched_now = True
            body = receipt.read_bytes()
            text = body.decode('utf-8')
            if f'content="U+{ord(char):X}"' not in text:
                raise ValueError('response lacks expected character term code; not accepted as absence')
            parsed = parse_page(char, text)
            parsed['checked'] = processed_on if fetched_now else old.get('checked') if old else None
            parsed['pageSha256'] = hashlib.sha256(body).hexdigest()
            result = merge_entry(old, parsed)
            result['stageExpansion'] = {'processed': processed_on, 'receipt': 'network' if fetched_now else 'cache',
                'sourcePageChecked': parsed['checked'], 'sourcePageSha256': parsed['pageSha256']}
            if old and not fetched_now and old.get('pageSha256') != parsed['pageSha256']:
                raise ValueError('cached page hash differs from the prior source receipt')
            result.pop('stageExpansionError', None)
            for index, stage in enumerate(result['stages']):
                previous = original_stages.get((char, stage['stage']))
                mirrored = mirror_stage(stage, url)
                if previous and 'scriptCategory' not in previous and not mirrored.get('src', '').startswith('/'):
                    result['stages'][index] = copy.deepcopy(previous)
                else:
                    result['stages'][index] = mirrored
            result['imageAvailability'] = 'local' if any(s.get('src', '').startswith('/') for s in result['stages']) else 'source-unavailable' if result['stages'] else 'not-listed'
            return char, result
        except Exception as error:
            if old:
                result = copy.deepcopy(old)
                result['stageExpansionError'] = f'{type(error).__name__}: {error}'
                return char, result
            return char, {'form': char, 'sourceUrl': url, 'checked': processed_on if fetched_now else CHECKED,
                          'stages': [], 'availability': 'fetch-error', 'error': f'{type(error).__name__}: {error}'}

    started = time.monotonic()
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, min(3, args.workers))) as pool:
        for index, (char, entry) in enumerate(pool.map(collect, selected), 1):
            manifest['characters'][char] = entry
            if index <= 5 or index % 20 == 0:
                save()
                print(json.dumps({'processedThisRun': index, 'char': char,
                    'seconds': round(time.monotonic() - started), **counters,
                    'specimenCount': manifest['coverage']['specimenCount'],
                    'localSpecimenCount': manifest['coverage']['localSpecimenCount']}, ensure_ascii=False), flush=True)
    save()
    print(json.dumps({**manifest['coverage'], **counters}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
