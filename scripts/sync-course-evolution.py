"""Retain source-attested HanDian ancient specimens for the complete HSK course.

Resume with the same cache. Metadata is collected first; --mirror-images also
retains source SVG bytes locally. Never infer unavailable periods or invent forms.
At most three workers; HTTP 403/429 pauses all workers before a bounded retry.
"""
from __future__ import annotations
import argparse
import concurrent.futures
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
TARGET_STAGES = ('甲骨文', '金文', '说文')
SOURCE = 'https://zdic.net/hans/'
LOCK = threading.Lock()
PAUSED_UNTIL = 0.0
CONNECTIONS = threading.local()
DATA_POLICY = {
    'association': 'Each record contains ancient specimens linked by the source dictionary entry. Linkage alone does not establish that the specimen is the modern target character itself, its direct ancestor, or a form belonging to the currently selected vocabulary sense.',
    'display': 'Describe these as related specimens linked by the source entry. Do not label an unreviewed specimen as the target character in a historical script, draw a direct source-specimen-to-modern-target evolution arrow, or use it as an identity quiz answer without separate character-specific evidence.',
    'sourceIndexLabels': 'A non-PUA unified Han codepoint in a Shuowen SVG filename may be shown as the source asset index character. This is an index label, not independent proof of etymological identity. Oracle-bone and bronze PUA filename numbers are resource identifiers, not characters to decode into a modern target.',
    'traditional': 'The traditional field preserves the first value of the source entry variant list. It is not a reviewed one-to-one traditional conversion for the selected HSK word or sense. Simplified character mergers and multiple senses can point to different traditional forms.',
    'counts': 'Coverage counts dictionary entries that link to ancient specimens, not a count of target characters with independently verified direct historical evolution.',
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
    captions = {}
    candidates = {stage: [] for stage in TARGET_STAGES}
    folders = {'jiaguwen': '甲骨文', 'jinwen': '金文', 'xiaozhuan': '说文'}
    for figure in re.findall(r'<figure class="glyph-grid__item">(.*?)</figure>', text, re.S):
        image = re.search(r'<img[^>]*src="([^"]+)"', figure)
        caption = re.search(r'<figcaption[^>]*>(.*?)</figcaption>', figure, re.S)
        if image and caption:
            candidate_url = html.unescape(image.group(1))
            captions[candidate_url] = clean(caption.group(1))
            candidate_path = urllib.parse.urlparse(candidate_url)
            source_match = re.fullmatch(r'/zy/(jiaguwen|jinwen|xiaozhuan)/[0-9]+_[0-9A-Fa-f]+\.svg', candidate_path.path)
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
        if not path.startswith('/zy/') or not path.endswith('.svg'):
            continue
        specimen = {
            'stage': stage,
            'title': '《说文》小篆' if stage == '说文' else stage,
            'url': image_url,
            'galleryUrl': urllib.parse.urljoin(url, link.group(1)) if link else url + '#zyzx',
            'provenanceNote': captions.get(image_url, '汉典字源栏目所选字例；未列单幅出典'),
            'alternatives': [candidate for candidate in candidates[stage] if candidate['url'] != image_url],
        }
        if stage == '说文':
            code = re.search(r'/[0-9]+_([0-9A-Fa-f]{4,6})\.svg$', path)
            if code:
                form = chr(int(code.group(1), 16))
                if form == char or form in entry.get('traditional', ''):
                    specimen['form'] = form
        entry['stages'].append(specimen)
    return entry


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--cache-dir', type=Path, default=Path('/private/tmp/hanzi-course-zdic'))
    parser.add_argument('--workers', type=int, default=3)
    parser.add_argument('--limit', type=int)
    parser.add_argument('--mirror-images', action='store_true')
    args = parser.parse_args()
    cache = args.cache_dir
    (cache / 'html').mkdir(parents=True, exist_ok=True)
    (cache / 'svg').mkdir(parents=True, exist_ok=True)
    output = PROJECT / 'public/sources/course-evolution.json'
    output.parent.mkdir(parents=True, exist_ok=True)
    images = PROJECT / 'public/images/course-evolution'
    images.mkdir(parents=True, exist_ok=True)
    vocabulary = json.loads((PROJECT / 'src/data/hsk-official.json').read_text())
    chars = list(dict.fromkeys('安器赢爱练' + ''.join(row['hanzi'] for row in vocabulary) + '桔'))
    chars = [char for char in chars if '\u3400' <= char <= '\u9fff' or 0x20000 <= ord(char) <= 0x323af]
    selected = chars[:args.limit] if args.limit else chars
    manifest = json.loads(output.read_text()) if output.exists() else {'version': 1, 'characters': {}}
    manifest['dataPolicy'] = DATA_POLICY
    manifest['sources'] = {
        'site': 'https://zdic.net/', 'terms': 'https://zdic.net/terms/',
        'license': 'CC0-1.0 (per HanDian current terms, section 四)',
        'selection': 'One source representative each of oracle bone, bronze and Shuowen small seal when listed; absent stages are omitted.',
        'interpretation': 'Source-labelled specimens are not a universal chronological chain. Traditional source forms and modern simplified forms are distinguished. Dictionary sourceAnalysis is attributed wording, not an independent historical verification.',
        'storagePolicy': 'Page metadata is checked for every character. Local specimens carry byte hashes; remote specimens use only URLs actually discovered on the checked source page and have null hashes. Remote images are not claimed to be locally audited.',
        'checked': CHECKED,
    }

    def save() -> None:
        entries = manifest['characters']
        all_entries = [entries[c] for c in chars if c in entries]
        manifest['coverage'] = {
            'requestedCharacters': len(chars), 'processedCharacters': len(all_entries),
            'charactersWithAncientSpecimens': sum(bool(e['stages']) for e in all_entries),
            'notListedCharacters': sum(e['availability'] == 'not-listed' for e in all_entries),
            'fetchErrorCharacters': sum(e['availability'] == 'fetch-error' for e in all_entries),
            'specimenCount': sum(len(e['stages']) for e in all_entries),
            'localSpecimenCount': sum(s.get('storage') == 'local' or s['src'].startswith('/') for e in all_entries for s in e['stages']),
            'remoteSpecimenCount': sum(s.get('storage') == 'remote' or s['src'].startswith('https://') for e in all_entries for s in e['stages']),
            'complete': len(all_entries) == len(chars) and all(e['availability'] != 'fetch-error' for e in all_entries),
        }
        temporary = output.with_suffix('.tmp')
        temporary.write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + '\n')
        temporary.replace(output)

    def collect(char: str) -> tuple[str, dict]:
        old = manifest['characters'].get(char)
        if old and old['availability'] != 'fetch-error' and all(
            (s['src'].startswith('/') and (PROJECT / ('public' + s['src'])).exists()) or
            (not args.mirror_images and s.get('storage') == 'remote' and s['src'] == s['url'])
            for s in old['stages']
        ):
            for stage in old['stages']:
                stage.setdefault('storage', 'local')
            return char, old
        url = SOURCE + urllib.parse.quote(char)
        receipt = cache / 'html' / f'{ord(char):x}.html'
        result = {'form': char, 'sourceUrl': url, 'checked': CHECKED, 'stages': [], 'availability': 'fetch-error'}
        try:
            if not receipt.exists():
                for directory in (Path('/private/tmp/hanzi-course-zdic-samples'), WORKSPACE / 'work/radical-audit/zdic-html'):
                    sample = directory / receipt.name
                    if sample.exists():
                        receipt.write_bytes(sample.read_bytes())
                        break
            if not receipt.exists():
                receipt.write_bytes(fetch(url))
            body = receipt.read_bytes()
            text = body.decode('utf-8')
            if f'content="U+{ord(char):X}"' not in text:
                raise ValueError('response lacks expected character term code; not accepted as absence')
            result = parse_page(char, text)
            result['pageSha256'] = hashlib.sha256(body).hexdigest()
            specimens = result.pop('stages')
            result['stages'] = []
            for specimen in specimens:
                remote = specimen['url']
                suffix = '/'.join(urllib.parse.urlparse(remote).path.split('/')[-2:]).replace('/', '-')
                asset = images / suffix
                raw_cache = cache / 'svg' / suffix
                if not raw_cache.exists() and args.mirror_images:
                    sample = Path('/private/tmp/hanzi-course-zdic-samples') / (f'{ord(char):x}-' + remote.rsplit('/', 1)[-1])
                    raw_cache.write_bytes(sample.read_bytes() if sample.exists() else fetch(remote, url))
                if raw_cache.exists():
                    raw = raw_cache.read_bytes()
                    safe = sanitized_svg(raw)
                    asset.write_bytes(safe)
                    result['stages'].append({**specimen, 'src': '/images/course-evolution/' + asset.name,
                        'storage': 'local', 'sha256': hashlib.sha256(safe).hexdigest(), 'sourceSha256': hashlib.sha256(raw).hexdigest(),
                        'license': 'CC0-1.0', 'licenseSource': 'https://zdic.net/terms/'})
                else:
                    result['stages'].append({**specimen, 'src': remote, 'storage': 'remote',
                        'sha256': None, 'sourceSha256': None,
                        'license': 'CC0-1.0', 'licenseSource': 'https://zdic.net/terms/'})
            result['availability'] = 'found' if result['stages'] else 'not-listed'
        except Exception as error:
            result['availability'] = 'fetch-error'
            result['error'] = f'{type(error).__name__}: {error}'
        return char, result

    save()
    started = time.monotonic()
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, min(3, args.workers))) as pool:
        for index, (char, entry) in enumerate(pool.map(collect, selected), 1):
            manifest['characters'][char] = entry
            if index <= 5 or index % 20 == 0:
                save()
                print(json.dumps({'processedThisRun': index, 'char': char, 'seconds': round(time.monotonic() - started), **manifest['coverage']}, ensure_ascii=False), flush=True)
    save()
    print(json.dumps(manifest['coverage'], ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
