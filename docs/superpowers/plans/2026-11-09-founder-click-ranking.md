# Founder click ranking implementation plan

**Goal:** Make learning-stage and radical popularity directly comparable in the existing private dashboard.
**Architecture:** Extend existing event contracts and D1 aggregation without a schema migration; preserve the hosted identity boundary and all secrets.
**Tech stack:** React, Vinext, Cloudflare D1, Node test runner.
**Spec:** docs/superpowers/specs/2026-11-09-founder-click-ranking.md

## Global constraints
- Preserve public learning access and existing founder-only query/export authorization.
- Do not display the owner's name or expose credentials.
- Count destination-mode clicks separately from initial/programmatic views.
- Do not fabricate or backfill historical clicks.

## Tasks
- [ ] Backend: write failing validation and real SQLite aggregation tests for mode_click (required destination, deduplication, sort, zero history); extend EVENT_NAMES and modes summary with clicks; preserve existing fields.
- [ ] Frontend: instrument all existing user-triggered setMode paths with a destination-only helper that does not change learning-state resets; add stage clicks/share and radical click share with explicit labels; add founder-only backend link.
- [ ] Verify full tests, type checking, production build and anonymous/owner backend behavior, review changes, then package and deploy to existing Site.

## Review focus
- Wrong destination attribution; direct mode setters bypassing events.
- Anonymous/non-founder access denied at the API.
- Empty denominators; old data without new click events.
- Existing learning state and course filters unchanged.
- No owner name or secret in browser/source output.

Execution: continue authorized work in this isolated Sites checkout, with backend implementation and frontend work in parallel; inspect test/build results before publication.
