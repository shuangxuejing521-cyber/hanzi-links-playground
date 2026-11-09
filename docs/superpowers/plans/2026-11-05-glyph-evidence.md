# 部件图解修订 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace loose scene mnemonics with source-backed component explanations and exact glyph-linked illustrations throughout the existing public site.

**Architecture:** Separate component records, per-character historical audits and actual stroke geometry. A component diagram connects supported roots to modern shapes; construction cards explain the two contextual roles. Keep existing combination/word/progress behavior.

**Tech Stack:** React19, TypeScript, Vite, SVG, existing node tests.

**Spec:** docs/superpowers/specs/2026-11-05-glyph-evidence-design.md

## Global Constraints
- Keep current public Site ID, 26 categories,171 combinations,2500 word records and local progress key.
- All152 selectable parts get an individual record, shape and source; all171 characters get an evidence entry.
- Actual stroke outlines, never an unrelated default picture. Historical uncertainty remains explicit.
- No full dictionary/transcript reproduction; concise paraphrases with links.

## Review Focus
- Modern lookalikes (细/练/经/脏) cannot inherit incorrect historical meanings.
- Moon/meat same form is contextual; a standalone 月 record must explain both.
- Reused roots may repeat intentionally; whole glyph constructions must be distinct.
- Rare components use extracted real strokes, never incorrect substitutes.
- Mobile diagrams/part details readable; invalid pairs must not show stale character evidence.

### Task1: Evidence and geometry
- [ ] Add failing coverage and regression tests for all152parts/171glyphs and historical corrections.
- [ ] Research in three independent batches; combine source receipts and uncertainty statements.
- [ ] Extract only used modern glyph paths/components from licensed graphics and add APL notice.
- [ ] Run meaningful tests for coverage, source presence, role correctness and unique glyph paths.

### Task2: Educational diagrams
- [ ] Draw26 distinct supported root diagrams and actual-base/radical contour comparison.
- [ ] Add selectable component details, contextual left/right roles and source disclosure.
- [ ] Show unique colored glyph constructions in family cards and main image, retain modern meaning scene as subordinate.
- [ ] Correct method and video lesson copy to distinguish mnemonic from history.

### Task3: Review, check, publish
- [ ] Run node tests, TypeScript and production build.
- [ ] Verify desktop and390px flows: roots, details, rare shapes, modern historical contrasts, combinations, source links and persistent progress.
- [ ] Independent final review and resolve material defects.
- [ ] Package current source with Sites helper; save and deploy existing public Site, return sameURL.
