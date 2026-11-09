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
