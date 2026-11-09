# Complete HSK word-photo implementation plan

Goal: supply reviewed word-meaning imagery for every official entry without changing UI or behavior.
Spec: docs/superpowers/specs/2026-11-09-complete-word-photos.md

- [ ] Audit supplied words and preserve IDs and existing content.
- [ ] For each level: curate missing exact-ID mappings, reuse only appropriate existing photographs, define scene briefs for missing meanings.
- [ ] Generate and visually inspect new photographic assets; save assets inside public/images/words/.
- [ ] Add a failing coverage/invariant test for the tier, then merge mappings and source audit; verify coverage, paths, hashes, captions and unchanged baseline.
- [ ] Run full tests, types, production build and representative visual checks; publish each complete level to the same Site and mirror to existing GitHub.
- [ ] Continue through level 7-9 and verify 11,000/11,000 coverage.

Progress is recorded under ignored work/hsk-word-images, including scene status and hashes, so generation and review can resume without duplication.

- [x] Level 1: 300/300 photographs published in v14 and mirrored to GitHub.
- [ ] Level 2: verify/promote 58 reviewed staged photographs, complete 200/200 mappings, publish and mirror.
- [x] Character sources: incrementally parse all seven attested HanDian stages from the existing cached pages, preserving check dates and old records; mirror safe SVGs with hashes.
- [x] Add all-character source access inside the existing word dialog, retaining original navigation and all main learning flows. Verify rare characters, missing phases, traditional/associated specimens, source-load failure, and 早's seven-stage example.
- [ ] Validate all 3,089 source entries and report ancient-image coverage separately from modern regular-script coverage; publish and mirror the verified source extension.

- [x] Preserve original26 sidebar IDs/order; append180 source-indexed groups, complete206-family coverage and scoped word/character access.
- [x] Extend private analytics validation and rankings to206 families with real SQLite regression coverage; preserve owner access.
- [ ] Verify desktop/mobile sidebar, original practice, source cards, and production publication; mirror reviewed source/assets to GitHub.
