# Full HSK teaching implementation plan

**Goal:** Every one of the 11,000 official entries leads into character structure, sourced glyphs, component interaction and related words, using the existing peach/mint site and grade controls.

**Architecture:** Keep the 171 editorially reviewed characters intact. Add a general character model for the 3,088 official Hanzi (plus legacy 桔), supporting nested IDS layouts and source-linked modern SVGs. Each word opens the same general teaching card; official exploration uses the existing three-column pattern with all dictionary groups. Historical specimens, modern structure, reviewed etymology and meaning photographs remain separately identified.

**Constraints:** Do not call dictionary radicals semantic/phonetic components. Do not manufacture an ancient specimen or an object etymology. Traditional specimens must name the traditional form. Unencoded IDS fragments are contextual shapes, never independent characters. Preserve homographs, grade scopes, old progress, panda rain and old free combinations.

## Tasks

- [x] Build reproducible complete modern character/part SVG dataset from pinned CJKVI and Make Me a Hanzi caches; prefer mainland structure and existing manual corrections. Test all word characters, layouts, safe SVGs and rare modern parts.
- [x] Retrieve source-attested HanDian specimens, maximum one each for oracle/bronze/Shuowen seal; preserve source/provenance, distinguish fetch errors from no listed evidence, and record coverage.
- [x] Implement course helpers and tests for all-word access, correct grade filtering, repeated components, homographs, source IDs and exact valid combinations.
- [x] Implement reusable character card with nested structure pictures, source-specific meaning/evidence, available ancient specimens, source links, component exercise and character/word connections.
- [x] Integrate every word modal and official three-column explorer. Use the existing HSK control to select grades; preserve the original reviewed material and legacy game.
- [x] Verify desktop/mobile, new higher-level words, upper/lower/enclosing/repeated structures, rare simplified components, missing historical stages and unknown combinations. Run full tests, types and production build, publish same public Site and show evidence.

## Coverage reporting

Report word access, modern structure/SVGs, available historical specimens, independent Korean character glosses and reviewed meaning photographs separately. The existing 171 meaning photographs cannot be claimed to cover the full course. New modern SVGs are structure illustrations, not photographs of objects or ancient artifacts.
