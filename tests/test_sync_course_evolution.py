"""Collector behavior against exact cached HanDian HTML excerpts and merge boundaries."""
import copy
import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('collector', ROOT / 'scripts/sync-course-evolution.py')
collector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(collector)

class CourseEvolutionCollectorTests(unittest.TestCase):
    def test_zao_actual_html_keeps_seven_listed_stages_and_modern_url(self):
        text = (ROOT / 'tests/fixtures/zdic-zao-excerpt.html').read_text()
        entry = collector.parse_page('早', text)
        self.assertEqual([s['stage'] for s in entry['stages']],
                         ['甲骨文', '金文', '楚系简帛', '说文', '秦系简牍', '隶书', '楷书'])
        self.assertEqual(entry['stages'][2]['url'], 'https://img.zdic.net/zy/chuwenzi/56_EF65.svg')
        self.assertEqual(entry['stages'][4]['url'], 'https://img.zdic.net/zy/qinwenzi/71_E6F7.svg')
        self.assertEqual(entry['stages'][5]['url'], 'https://img.zdic.net/zy/lishu/71_E6F7.svg')
        self.assertEqual(entry['stages'][6]['url'], 'https://img.zdic.net/kai/cn/65E9.svg')
        self.assertEqual(entry['stages'][6]['scriptCategory'], 'modern')

    def test_absent_stages_and_untrusted_images_are_not_invented(self):
        text = '<h3 class="dict-sub-title">字源演变</h3><div class="glyph-evolution__item"><img src="https://evil.example/zy/jinwen/1_4E00.svg"><span class="glyph-evolution__label">金文</span></div>'
        self.assertEqual(collector.parse_page('一', text)['stages'], [])

    def test_incremental_merge_retains_reviewed_representative_and_cache_date(self):
        self.assertTrue(hasattr(collector, 'merge_entry'), 'incremental merge is required')
        prior_stage = {'stage': '金文', 'url': 'https://img.zdic.net/zy/jinwen/32_ED10.svg',
                       'src': '/images/course-evolution/kept.svg', 'sha256': 'kept-local-sha',
                       'sourceSha256': 'kept-source-sha', 'reviewed': {'association': 'related'},
                       'listedRepresentativeUrl': 'https://img.zdic.net/zy/jinwen/.svg',
                       'replacementReason': 'Source page listed alternate'}
        old = {'form': '赢', 'checked': '2026-11-06', 'pageSha256': 'old-page-sha',
               'availability': 'found', 'reviewedAssociation': 'preserve', 'stages': [prior_stage]}
        original = copy.deepcopy(old)
        parsed = {'form': '赢', 'checked': '2026-11-09', 'pageSha256': 'same-cache-sha',
                  'stages': [{'stage': '金文', 'url': 'https://img.zdic.net/zy/jinwen/.svg'},
                             {'stage': '楷书', 'url': 'https://img.zdic.net/kai/cn/8D62.svg'}]}
        merged = collector.merge_entry(old, parsed)
        self.assertEqual(old, original)
        self.assertEqual(merged['stages'][0], prior_stage)
        self.assertEqual(merged['checked'], '2026-11-06')
        self.assertEqual(merged['pageSha256'], 'old-page-sha')
        self.assertEqual(merged['reviewedAssociation'], 'preserve')
        self.assertEqual([s['stage'] for s in merged['stages']], ['金文', '楷书'])

    def test_shuowen_cross_reference_is_attributed_without_filling_modern_analysis(self):
        text = (ROOT / 'tests/fixtures/zdic-fan-excerpt.html').read_text()
        entry = collector.parse_page('饭', text)
        self.assertIn('sourceExplanation', entry, 'literal Shuowen text is available in this receipt')
        self.assertEqual(entry['sourceExplanation']['indexForm'], '飯')
        self.assertEqual(entry['sourceExplanation']['text'], '食也。从食反聲。符萬切')
        self.assertEqual(entry['sourceExplanation']['kind'], 'shuowen-original')
        self.assertEqual(entry['sourceExplanation']['association'], 'dictionary-cross-reference')
        self.assertNotIn('sourceAnalysis', entry)

    def test_modern_only_glyph_is_never_counted_as_ancient(self):
        self.assertTrue(hasattr(collector, 'coverage_for'), 'stage-aware coverage is required')
        entries = {'爸': {'availability': 'found', 'stages': [{'stage': '楷书', 'src': '/kai.svg', 'storage': 'local'}]},
                   '早': {'availability': 'found', 'stages': [{'stage': '甲骨文', 'src': '/old.svg', 'storage': 'local'}]}}
        coverage = collector.coverage_for(entries, ['爸', '早'])
        self.assertEqual(coverage['charactersWithAncientSpecimens'], 1)
        self.assertEqual(coverage['charactersWithLocalAncientSpecimens'], 1)
        self.assertEqual(coverage['charactersWithModernSpecimens'], 1)
        self.assertEqual(coverage['modernOnlyCharacters'], 1)

    def test_dictionary_detail_origin_is_attributed_separately_from_shuowen(self):
        text = (ROOT / 'tests/fixtures/zdic-zhang-excerpt.html').read_text()
        entry = collector.parse_page('账', text)
        self.assertIn('sourceExplanation', entry)
        self.assertEqual(entry['sourceExplanation']['kind'], 'dictionary-detail-origin')
        self.assertEqual(entry['sourceExplanation']['text'], '古作“帐”。形声。从贝，长声。从贝，表明与财富有关。本义:账目，关于银钱财物出入的记载')
        self.assertTrue(entry['sourceExplanation']['sourceUrl'].endswith('#xxjs'))
        self.assertNotIn('sourceAnalysis', entry)

    def test_commentary_is_not_mislabeled_as_shuowen_original_or_same_headword(self):
        text = (ROOT / 'tests/fixtures/zdic-tun-excerpt.html').read_text()
        entry = collector.parse_page('臀', text)
        self.assertIn('sourceExplanation', entry)
        self.assertEqual(entry['sourceExplanation']['kind'], 'shuowen-commentary')
        self.assertEqual(entry['sourceExplanation']['indexForm'], '𩪡')
        self.assertEqual(entry['sourceExplanation']['association'], 'dictionary-cross-reference')
        self.assertIn('段玉裁', entry['sourceExplanation']['attribution'])

if __name__ == '__main__':
    unittest.main()
