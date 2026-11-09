# HSK official levels implementation plan

> Preserve the existing three-column learning workspace, peach/mint theme, navigation and panda interaction. Add one compact level/practice panel below search.

**Goal:** add the official 2025/2026 HSK 11,000-record vocabulary, selectable levels 1–6 and combined 7–9, while retaining legacy cumulative HSK5 2,500.

**Architecture:** keep `lexicon.json` and its indexes unchanged; store official records separately with original serials/pages and translation provenance. `lib/hsk.ts` defines course selection, cumulative/new-only scopes, search and eligible character pools. The new `HskLevelPanel` provides selection, paginated word browsing and reveal/next vocabulary practice; App uses the same scope for search, linked words and picture-challenge targets.

**Data contract:** official records extend existing Word with `officialIndex:number`, `sourcePage:number`, `definitionSource:string`. IDs `hsk3-00001` through `hsk3-11000`; level 7 denotes combined 7–9. Official serial boundaries 300/500/1000/2000/3600/5400/11000. Do not infer independent 7/8/9 buckets or rename legacy2500 as newHSK5.

- [x] Extract and validate all official records and boundary counts. Preserve exact official spelling/pinyin/levels and source PDF hash. Attribute Korean meanings separately.
- [x] Implement course/scope helpers and meaningful tests for counts, version separation, search and character filtering.
- [x] Implement compact Korean-guided selector, browse pagination, reveal/next practice and source link.
- [x] Integrate scoped global search, related-word list and image challenge. Free combination remains unrestricted and still validates collected combinations.
- [ ] Typecheck, run existing/new tests, build and verify desktop/mobile: legacy2500, newlevel1, newlevel5, advanced-only5600, all11000, word modal and practice reset.
- [ ] Package and publish on the same public Site; hand off and stop preview server.
