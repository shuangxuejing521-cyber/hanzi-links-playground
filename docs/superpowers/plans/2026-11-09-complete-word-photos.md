# Complete HSK word-photo implementation plan

Goal: supply reviewed word-meaning imagery for every official entry without changing UI or behavior.
Spec: docs/superpowers/specs/2026-11-09-complete-word-photos.md

New photographs with people should predominantly depict Asian people. This applies to future generation; retain photographs already generated, as requested.

- [ ] Audit supplied words and preserve IDs and existing content.
- [ ] For each level: curate missing exact-ID mappings, reuse only appropriate existing photographs, define scene briefs for missing meanings.
- [ ] Generate and visually inspect new photographic assets; save assets inside public/images/words/.
- [ ] Add a failing coverage/invariant test for the tier, then merge mappings and source audit; verify coverage, paths, hashes, captions and unchanged baseline.
- [ ] Run full tests, types, production build and representative visual checks; publish each complete level to the same Site and mirror to existing GitHub.
- [ ] Continue through level 7-9 and verify 11,000/11,000 coverage.

Progress is recorded under ignored work/hsk-word-images, including scene status and hashes, so generation and review can resume without duplication.

- [x] Level 1: 300/300 photographs published in v14 and mirrored to GitHub.
- [x] Level 2: verified/promoted 58 reviewed photographs, completed200/200 mappings, published v15 and mirrored.
- [x] Character sources: incrementally parse all seven attested HanDian stages from the existing cached pages, preserving check dates and old records; mirror safe SVGs with hashes.
- [x] Add all-character source access inside the existing word dialog, retaining original navigation and all main learning flows. Verify rare characters, missing phases, traditional/associated specimens, source-load failure, and 早's seven-stage example.
- [x] Validate all 3,089 source entries and report ancient-image coverage separately from modern regular-script coverage; publish and mirror the verified source extension.

- [x] Preserve original26 sidebar IDs/order; append180 source-indexed groups, complete206-family coverage and scoped word/character access.
- [x] Extend private analytics validation and rankings to206 families with real SQLite regression coverage; preserve owner access.
- [x] Verified desktop/mobile sidebar, original practice, source cards and production publication in v15; mirrored reviewed source/assets to GitHub.
- [x] Level3: verified/promoted107 reviewed photographs, completed500/500 mappings in v15. Official photo coverage1159/11000; remaining9841.
- [x] Level4: complete two500-word curation plans, generate/review140 new scenes, enforce1000/1000 coverage, publish v16 and mirror. Official photo coverage2121/11000; remaining8879.
- [x] Level5: preserve51 original mappings, curate1549 missing links, generate/review221 new scenes, enforce1600/1600 coverage, publish v17 and mirror. Official photo coverage3670/11000; remaining7330.
- [x] Level6: preserve37 original mappings, curate1763 missing links in three600-word parts, generate/review251 new scenes, enforce1800/1800 coverage, publish v18 and mirror. Official photo coverage5433/11000; remaining5567.
- [x] Level7–9: preserve33 original mappings, complete5567 missing exact-ID links across nine parts, generate/review556 new scenes, enforce5600/5600 coverage, publish v19 and mirror. All11000 official words now have meaning photographs; pending0.

v15: Site source bc73ec930468b918e02077cb16b1cfe502e751c2; GitHub source snapshot74e25cabdc0b28f40abb12e4525a9cc250e51e6e.86 Node tests,7 collector tests, types and production build passed; live206-sidebar/早 seven stages/level3西瓜 image checked. Runtime owner-only statistics remain at environment revision2.

v16: Site source ca751ce8467777c13e80a2aad52cee9bf6783a13; GitHub snapshot8e2e26a959e630b19f14088653220f9f96161d1f.87 Node tests, types and production build passed; live level4母子 photo1000×750 and all seven母 source-stage images loaded. All1457 previous mappings preserved. Package with COPYFILE_DISABLE=1 to omit macOS AppleDouble metadata; expanded tar253790208 bytes. Runtime owner-only statistics remain at environment revision2.

v17: Site source9afd565ba5ad44f1830dfafaa2ba87048cbb8ab5; GitHub snapshote2d84c995aa3f193ea3ba37aea8ef18c8b307a97.100 tests, types and production build passed.603 reviewed original JPEGs remain in source and immutable archive63ba3cdd542618f74f9dc39ed7d0f938d25b9e88; remove only verified deployment copies. Live5级旅行社 photo1000×750 and all seven旅 source stages loaded. Original2419 mappings preserved; runtime environment revision2. Expanded tar173583360 bytes.

v18: Site sourced35433cfda4081e5a168879482ab6c643f9a1387; GitHub snapshot1d461ef75f8034d7a0fb64c07eb5e5b46cd3f8aa.101 tests, types and production build passed.854 reviewed originals retained in source and immutable photo archive6b0da07cc787e3340228193b525f22dfa27082cd. All3968 previous mappings preserved. Live6级兰花 and自助 photos1000×750 loaded, all seven自 source stages loaded, founder-only dashboard link retained. Runtime environment revision2; expanded tar176376832 bytes.
