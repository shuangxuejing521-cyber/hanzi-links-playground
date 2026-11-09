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
- [ ] Level5: preserve51 original mappings, curate1549 missing links, generate/review221 new scenes, enforce1600/1600 coverage, publish and mirror.

v15: Site source bc73ec930468b918e02077cb16b1cfe502e751c2; GitHub source snapshot74e25cabdc0b28f40abb12e4525a9cc250e51e6e.86 Node tests,7 collector tests, types and production build passed; live206-sidebar/早 seven stages/level3西瓜 image checked. Runtime owner-only statistics remain at environment revision2.

v16: Site source ca751ce8467777c13e80a2aad52cee9bf6783a13; GitHub snapshot8e2e26a959e630b19f14088653220f9f96161d1f.87 Node tests, types and production build passed; live level4母子 photo1000×750 and all seven母 source-stage images loaded. All1457 previous mappings preserved. Package with COPYFILE_DISABLE=1 to omit macOS AppleDouble metadata; expanded tar253790208 bytes. Runtime owner-only statistics remain at environment revision2.
