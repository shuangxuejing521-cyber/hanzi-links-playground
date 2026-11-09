"""Mirror source-attested ancient specimens while page metadata is collected.

First provide one specimen per character, then finish every selected stage. The
mirror has an independent cache and merges the public manifest only after the
metadata collector completes. Source-404 representatives may be replaced only
with another specimen of the same stage explicitly listed on that same page.
"""
from __future__ import annotations
import argparse
import concurrent.futures
import hashlib
import importlib.util
import json
from pathlib import Path
import threading
import time
import urllib.error
import urllib.parse

PROJECT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('course_evolution_collector', Path(__file__).with_name('sync-course-evolution.py'))
collector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(collector)


def atomic_bytes(path: Path, data: bytes) -> None:
    temporary = path.with_name(path.name + f'.{threading.get_ident()}.tmp')
    temporary.write_bytes(data)
    temporary.replace(path)


def image_key(page: str, stage: dict) -> str:
    # Empty placeholders can be shared by different characters. Their fallback
    # identity must include the character's actual source page and stage.
    return page + '|' + stage['stage'] + '|' + stage['url']


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--cache-dir', type=Path, default=Path('/private/tmp/hanzi-course-zdic'))
    parser.add_argument('--workers', type=int, default=3)
    parser.add_argument('--once', action='store_true')
    args = parser.parse_args()
    cache = args.cache_dir
    (cache / 'svg').mkdir(parents=True, exist_ok=True)
    output = PROJECT / 'public/sources/course-evolution.json'
    images = PROJECT / 'public/images/course-evolution'
    images.mkdir(parents=True, exist_ok=True)
    receipt = cache / 'mirror-results.json'
    results = json.loads(receipt.read_text()) if receipt.exists() else {'formatVersion': 2, 'images': {}, 'errors': {}}
    if results.get('formatVersion') != 2:
        manifest = json.loads(output.read_text())
        old = results['images']
        results = {'formatVersion': 2, 'images': {
            image_key(entry['sourceUrl'], stage): old[stage['url']]
            for entry in manifest['characters'].values() for stage in entry['stages']
            if stage['url'] in old
        }, 'errors': {}}
    stages_order = {stage: index for index, stage in enumerate(collector.TARGET_STAGES)}

    def save_results() -> None:
        atomic_bytes(receipt, (json.dumps(results, ensure_ascii=False, separators=(',', ':')) + '\n').encode())

    def mirror(item: tuple[str, dict]) -> tuple[str, dict | None, dict | None]:
        page, stage = item
        key = image_key(page, stage)
        char = urllib.parse.unquote(urllib.parse.urlparse(page).path.split('/')[-1])
        choices = [{'url': stage['url'], 'provenanceNote': stage['provenanceNote']}]
        # Older metadata may lack candidates; the exact page receipt is cached.
        receipt_path = cache / 'html' / f'{ord(char):x}.html'
        if receipt_path.exists():
            parsed = collector.parse_page(char, receipt_path.read_text())
            match = next((s for s in parsed['stages'] if s['stage'] == stage['stage']), None)
            if match:
                choices += match.get('alternatives', [])
        else:
            choices += stage.get('alternatives', [])
        choices = list({candidate['url']: candidate for candidate in choices}.values())
        failed = []
        for candidate in choices:
            remote = candidate['url']
            try:
                if not remote.rsplit('/', 1)[-1].strip('.svg'):
                    failed.append({'url': remote, 'error': 'Source page listed an empty image placeholder', 'status': 404})
                    continue
                suffix = '/'.join(urllib.parse.urlparse(remote).path.split('/')[-2:]).replace('/', '-')
                if urllib.parse.urlparse(remote).path.startswith('/kai/cn/'):
                    suffix = 'kaishu-' + suffix
                asset = images / suffix
                raw_cache = cache / 'svg' / suffix
                if not raw_cache.exists():
                    atomic_bytes(raw_cache, collector.fetch(remote, page))
                raw = raw_cache.read_bytes()
                safe = collector.sanitized_svg(raw)
                atomic_bytes(asset, safe)
                image = {'src': '/images/course-evolution/' + asset.name, 'storage': 'local',
                    'sha256': hashlib.sha256(safe).hexdigest(), 'sourceSha256': hashlib.sha256(raw).hexdigest()}
                if remote != stage['url']:
                    image.update({'url': remote, 'listedRepresentativeUrl': stage['url'],
                        'provenanceNote': candidate['provenanceNote'], 'replacementReason': 'Source representative was unavailable; alternate explicitly listed in the same source-page stage gallery.',
                        'unavailableRepresentatives': failed})
                return key, image, None
            except urllib.error.HTTPError as error:
                failed.append({'url': remote, 'error': str(error), 'status': error.code})
                if error.code != 404:
                    return key, None, {'attempted': failed, 'retryable': True}
            except Exception as error:
                failed.append({'url': remote, 'error': f'{type(error).__name__}: {error}'})
                return key, None, {'attempted': failed, 'retryable': True}
        return key, None, {'attempted': failed, 'retryable': False}

    def already_local(entry: dict, stage: dict) -> bool:
        return image_key(entry['sourceUrl'], stage) in results['images'] or (
            stage.get('storage') == 'local' and (PROJECT / ('public' + stage['src'])).exists())

    def eligible(entry: dict, stage: dict) -> bool:
        if already_local(entry, stage):
            return False
        error = results['errors'].get(image_key(entry['sourceUrl'], stage))
        if not error:
            return True
        return error.get('retryable', True) and error['attempts'] < 3 and time.time() - error['lastAttempt'] >= 20

    started = time.monotonic()
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, min(3, args.workers))) as pool:
        while True:
            if not output.exists():
                time.sleep(2)
                continue
            manifest = json.loads(output.read_text())
            first_jobs, other_jobs = {}, {}
            entries = list(manifest['characters'].values())
            for entry in entries:
                if entry['availability'] != 'found':
                    continue
                stages = sorted(entry['stages'], key=lambda s: stages_order[s['stage']])
                available = [stage for stage in stages if eligible(entry, stage)]
                if not any(already_local(entry, stage) for stage in stages) and available:
                    first_jobs[image_key(entry['sourceUrl'], available[0])] = (entry['sourceUrl'], available[0])
                for stage in available:
                    other_jobs[image_key(entry['sourceUrl'], stage)] = (entry['sourceUrl'], stage)
            jobs = {**first_jobs, **other_jobs}
            # Refresh frequently so secondary stages cannot stall first pictures.
            batch = list(jobs.values())[:60]
            for key, image, error in pool.map(mirror, batch):
                if image:
                    results['images'][key] = image
                    results['errors'].pop(key, None)
                else:
                    previous = results['errors'].get(key, {})
                    results['errors'][key] = {**error, 'attempts': previous.get('attempts', 0) + 1, 'lastAttempt': time.time()}
                if (len(results['images']) + len(results['errors'])) % 20 == 0:
                    save_results()
            save_results()
            manifest = json.loads(output.read_text())
            entries = list(manifest['characters'].values())
            waiting = [entry['form'] for entry in entries if entry['availability'] == 'found' and not any(already_local(entry, stage) for stage in entry['stages'])]
            unresolved = [(entry, stage) for entry in entries for stage in entry['stages'] if not already_local(entry, stage)]
            pending_retries = [(entry, stage) for entry, stage in unresolved if (
                image_key(entry['sourceUrl'], stage) not in results['errors'] or
                (results['errors'][image_key(entry['sourceUrl'], stage)].get('retryable', True) and results['errors'][image_key(entry['sourceUrl'], stage)]['attempts'] < 3))]
            print(json.dumps({'elapsedSeconds': round(time.monotonic() - started),
                'metadataProcessed': len(entries), 'mirroredImagesThisPipeline': len(results['images']),
                'charactersAwaitingFirstLocalImage': len(waiting), 'stagesAwaitingLocalImage': len(unresolved),
                'imageErrors': len(results['errors'])}, ensure_ascii=False), flush=True)
            if manifest['coverage']['complete'] and not pending_retries:
                for entry in entries:
                    for stage in entry['stages']:
                        # Existing reviewed/local records are immutable. Resume
                        # receipts may fill unresolved records only.
                        if stage.get('storage') == 'local':
                            continue
                        key = image_key(entry['sourceUrl'], stage)
                        if key in results['images']:
                            stage.update(results['images'][key])
                        elif key in results['errors']:
                            stage['mirrorError'] = results['errors'][key]
                    if entry['availability'] == 'found':
                        entry['imageAvailability'] = 'local' if any(s.get('storage') == 'local' for s in entry['stages']) else 'source-unavailable'
                all_stages = [stage for entry in entries for stage in entry['stages']]
                manifest['coverage'] = collector.coverage_for(manifest['characters'], list(manifest['characters']))
                manifest['sources']['displayPolicy'] = 'Display only storage=local image elements. Remote records are provenance links, not ready-to-display images (CDN blocks external hotlinks). Failed URLs are separate from absent historical records.'
                atomic_bytes(output, (json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + '\n').encode())
                print('Merged complete page metadata with all usable locally mirrored selected-stage specimens.', flush=True)
                break
            if args.once:
                break
            time.sleep(2)


if __name__ == '__main__':
    main()
