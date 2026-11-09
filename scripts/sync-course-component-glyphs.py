"""Find and retain modern component outlines explicitly shown by HanDian pages.

This adds no component meanings or historical claims. Kai and Song source fonts
are labelled separately. Missing pages and failed source images remain explicit.
"""
from __future__ import annotations
import argparse
import concurrent.futures
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import time
import urllib.parse

PROJECT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('course_evolution_collector', Path(__file__).with_name('sync-course-evolution.py'))
collector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(collector)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--cache-dir', type=Path, default=Path('/private/tmp/hanzi-course-zdic/components'))
    args = parser.parse_args()
    args.cache_dir.mkdir(parents=True, exist_ok=True)
    output = PROJECT / 'public/sources/course-component-glyphs.json'
    previous = json.loads(output.read_text()) if output.exists() else {'characters': {}}
    course = json.loads((PROJECT / 'public/sources/course-characters.json').read_text())
    requested = list(dict.fromkeys(course['coverage']['missingComponentGlyphs'] + list(previous['characters'])))
    skipped = [char for char in requested if len(char) != 1 or 0x2460 <= ord(char) <= 0x2473]
    selected = [char for char in requested if char not in skipped]
    destination = PROJECT / 'public/images/course-evolution/components'
    destination.mkdir(parents=True, exist_ok=True)

    def collect(char: str) -> tuple[str, dict]:
        page = 'https://zdic.net/hans/' + urllib.parse.quote(char)
        entry = {'form': char, 'sourceUrl': page, 'checked': collector.CHECKED}
        receipt = args.cache_dir / f'{ord(char):x}.html'
        try:
            if not receipt.exists():
                receipt.write_bytes(collector.fetch(page))
            page_bytes = receipt.read_bytes()
            text = page_bytes.decode('utf-8')
            if f'content="U+{ord(char):X}"' not in text:
                return char, {**entry, 'availability': 'not-listed', 'reason': 'Source response has no exact character term code'}
            figure = re.search(r'<figure class="char-glyph">(.*?)</figure>', text, re.S)
            image = re.search(r'<img[^>]+src="([^"]+)"', figure.group(1)) if figure else None
            if not image:
                return char, {**entry, 'availability': 'not-listed', 'reason': 'Source page has no modern glyph figure'}
            url = image.group(1)
            if not (url.startswith('https://img.zdic.net/kai/') or url.startswith('https://img.zdic.net/song/')):
                return char, {**entry, 'availability': 'not-listed', 'reason': 'Modern source figure is outside approved source font directories'}
            font = 'kai' if '/kai/' in url else 'song'
            raw_cache = args.cache_dir / f'{ord(char):x}-{font}.svg'
            if not raw_cache.exists():
                raw_cache.write_bytes(collector.fetch(url, page))
            raw = raw_cache.read_bytes()
            safe = collector.sanitized_svg(raw)
            if b'<path' not in safe and b':path' not in safe:
                raise ValueError('Source SVG has no self-contained outline paths')
            target = destination / f'{ord(char):x}.svg'
            target.write_bytes(safe)
            return char, {**entry, 'availability': 'local', 'src': '/images/course-evolution/components/' + target.name,
                'url': url, 'font': font, 'pageSha256': hashlib.sha256(page_bytes).hexdigest(),
                'sha256': hashlib.sha256(safe).hexdigest(), 'sourceSha256': hashlib.sha256(raw).hexdigest(),
                'license': 'CC0-1.0', 'licenseSource': 'https://zdic.net/terms/'}
        except Exception as error:
            return char, {**entry, 'availability': 'fetch-error', 'error': f'{type(error).__name__}: {error}'}

    result = {'version': 1, 'sources': {'site': 'https://zdic.net/', 'terms': 'https://zdic.net/terms/',
        'policy': 'Modern outline images only, discovered on exact character pages; font variants are retained. No etymological or semantic inference.',
        'checked': collector.CHECKED}, 'characters': {}, 'skippedSymbols': skipped}
    started = time.monotonic()
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for index, (char, entry) in enumerate(pool.map(collect, selected), 1):
            result['characters'][char] = entry
            if index % 20 == 0:
                print(index, 'of', len(selected), 'seconds', round(time.monotonic() - started), flush=True)
    entries = list(result['characters'].values())
    result['coverage'] = {'requested': len(selected), 'localGlyphs': sum(e['availability'] == 'local' for e in entries),
        'notListed': sum(e['availability'] == 'not-listed' for e in entries), 'errors': sum(e['availability'] == 'fetch-error' for e in entries),
        'skippedSymbols': len(skipped)}
    output.write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(json.dumps(result['coverage'], ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
