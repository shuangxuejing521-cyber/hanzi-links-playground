# Automatic Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox syntax for tracking.

**Goal:** Add automatic anonymous usage statistics and a founder-only dashboard to the existing public site.
**Architecture:** Preserve the React student app and all public assets inside the supported Sites Vinext server skeleton. D1 persists validated events; server-side ChatGPT identity plus ADMIN_USER_IDS protects analytics and exports.
**Tech Stack:** Existing React/TypeScript, Sites Vinext/Worker/D1, plain responsive dashboard and CSV.
**Spec:** docs/superpowers/specs/2026-11-07-automatic-analytics.md

## Global Constraints
- Same project_id/public URL/public audience; no student registration, research codes, PII or fabricated old data.
- Preserve current student layout, CSS, media, 26 families, 183 photo characters, games, Korean guidance and removed explanatory blocks.
- Do not turn click counts into claims of learning or cross-device unique students.
- Use shared contracts; event IDs dedupe, own-session attribution, first attempts separate; uncollected is not invalid Hanzi.

## Review Focus
- Spoofed visitor/session IDs, arbitrary event text, unauthenticated export and founder bootstrap races.
- Default/grade-driven selection accidentally counted as active clicks; duplicate remounts/retries.
- Hidden or idle tabs, image loading and composition retries corrupt timing/first-attempt denominators.
- Framework migration changes public resource URLs, hydration, CSS or local progress.
- Date/grade filters and raw CSV disagree with aggregates; no data produces misleading charts.

### Task 1: Preserve application in full-stack hosting
Files: app/page.tsx, app/layout.tsx, app/StudentApp.tsx, package/scripts/vite config, .openai/hosting.json.
- [ ] Open source through Sites helper, prepare official full-stack skeleton separately and port existing src/public without replacing App.
- [ ] Install supported skeleton dependencies once; retain tsx and original corpus tests.
- [ ] Configure DB binding and preserve exact Site identity/public audience.
- [ ] Typecheck/build and exercise original student flows and local progress.

### Task 2: Durable validated collection and protected APIs
Files: src/analytics/contracts.ts; lib/analytics-server.ts; db/schema.ts; app/api/analytics/{session,events,optout}/route.ts; app/api/admin/{me,summary,export}/route.ts; tests/analytics-server.test.ts.
Interfaces: client sends AnalyticsEvent[], session endpoint returns {sessionId,enabled}; dashboard consumes AnalyticsSummary.
- [ ] Write tests for sanitization/deduplication/filtering/auth/first-attempt and observe failure.
- [ ] Implement parameterized D1 storage, safe cookies, explicit session ownership, bounded upload and server authorization.
- [ ] Implement filtered aggregates and CSV matching shared DTO; initial founder list empty always denies data.
- [ ] Generate schema-only Drizzle migration; test green locally with real D1 migration.

### Task 3: Automatic client telemetry without student friction
Files: src/analytics/client.ts; src/analytics/AnalyticsNotice.tsx; src/App.tsx; RootEvolution/ComponentEvidencePanel/PandaRain hooks as appropriate; tests/analytics-client.test.ts.
Interfaces: track(name, partial AnalyticsEvent); startAnalytics(); use existing component IDs/corpus selections.
- [ ] Test foreground/idle timing, retained pending events, duplicate event IDs and session attribution.
- [ ] Instrument explicit choices vs automatic views; real visible radical impressions; trial IDs/attempt counters; loaded activity timing.
- [ ] Add compact Korean notice/optout and keep original local progress independent of upload success.
- [ ] Verify user flows and no raw search values leave the client.

### Task 4: Founder dashboard and exports
Files: app/admin/page.tsx; src/analytics/AdminDashboard.tsx; src/analytics/admin.css.
Interfaces: GET /api/admin/me, /api/admin/summary?from&to&level&mode, /api/admin/export?kind=events|radicals|daily&same filters.
- [ ] Implement signed-out/login/unauthorized/setup and founder states, no data in public shell.
- [ ] Implement date/HSK/mode filters, metric cards, radical ranking, daily trend, heat lists, paths, attempt results and honest empty/error states.
- [ ] Provide CSV downloads and data dictionary/automatic-browser identity limits.
- [ ] Verify tablet/mobile and forbidden users cannot access server data.

### Task 5: Review and same-site publication
- [ ] Run corpus regressions plus analytics tests, typecheck, build and browser QA with isolated local database.
- [ ] Fresh security and requirements review; fix important issues with meaningful regressions.
- [ ] Package/push/save/deploy through Sites, retaining public audience; bind actual owner login with server env ADMIN_USER_IDS and apply deployment.
- [ ] Verify public learning, protected dashboard, persistent events and CSV, save proof screenshot, stop preview.

## Implementation evidence
- Tasks1–4 completed: sameSite full-stack migration, D1 schema, automatic instrumentation, founder dashboard.
- 60 tests pass; full TypeScript and diff checks pass. Original171lessons/26rootmaterials/368imagebytes baseline retained plus existing12 additions.
- Review findings fixed with regressions: expired24h sessions, scoped exposure dedupe, complete server-checked practice payload, separate old/new corpus filters.
- Real localD1 API verification:8 unique events uploaded twice remain8; incorrect first answer spoofed ascorrect is storedincorrect; retries andfreecomposition separated; anonymous summary401. CSV downloaded8rows; no personal fields. Local data is isolated, not a production seed.
- Production publication/actualowner binding pending.
