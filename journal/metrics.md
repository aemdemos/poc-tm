# Project Metrics

## Time
- **Total sessions:** 71 (including backfills)
- **Total agent time:** ~47h 15m
- **Total with user margin (10%):** ~52h 4m
- **Average session length:** ~40m

## Success Rates
- **Actions attempted:** 621
- **First-try success:** 600 (97%)
- **Required retry:** 15 (2%)
- **Failed:** 6 (1%)

## Problems
- **Total encountered:** 82
- **Resolved:** 63 (77%)
- **Workarounds:** 13
- **Unresolved:** 5
- **Most common category:** CSS/styling

## Problem Categories

| Category | Count | Examples |
|----------|-------|---------|
| DA compatibility | 5 | URL mangling, file reference mismatch, content flattening, image stripping |
| CSS/styling | 17 | Tab truncation, stylelint false positive, fallback font width, body font-size mismatch, mega-panel positioning, announcement bar layout, CTA button decoration, scroll-reveal invisible in screenshots, mobile paragraph spacing too large, page height padding penalty, grid-row -1 implicit rows, author bio grid on wrong page, results.json accumulation, blanket max-width broke wide-layout blog pages, lavender scoped to case-study only, accordion grid targeting wrong wrapper |
| Git/environment | 5 | safe.directory error, filesystem access, push rejected (rebase needed), push failed (no credentials) x2 |
| Tooling | 3 | convert-all-md.js corrupts EDS block HTML, subagent Bash/Playwright auto-denied, pixelmatch v7 ESM default export |
| Test infra | 3 | results.json overwritten between Playwright projects (module re-initialization), results.json accumulates across test runs, scroll-reveal opacity:0 hides content in screenshots |
| Lint | 3 | no-use-before-define in image-slider.js, no-descending-specificity in image-slider.css, 7x no-descending-specificity in solutions-page CSS |
| Performance | 1 | Animation load timeout too slow |
| File sync | 1 | HTML variants stale after markdown edit |
| Test harness | 2 | Sync scroll doesn't trigger IO, F-DELAYED false positive |
| Source site | 2 | 3 URLs returned 404 during bulk import, tpa-eliminated case study 404 |
| Block runtime | 1 | Accordion block JS error on solutions pages |
| Local preview | 3 | `aem up` proxies from remote CDN; let-care-flow .plain.html broken (pipe-table parsing); CDN content sparse for case studies; `/content/` prefix required for local file serving |
| Animation/CORS | 3 | CORS error loading external Lottie JSON on localhost; counter regex doesn't match `$` prefix; CORS blocking Lottie on aem.page domain |
| Content structure | 3 | Simpler case study pages lack quote/lavender/CTA sections; import script designed for newer format (resolved: rewritten with section classifier) |
| Import/scraping | 3 | Bundle script flag syntax; save-51k key-takeaways 3-col flattened; browser caching returned wrong page content for 2 agents |
| Import pipeline | 3 | import-case-study.js changes had no effect (bulk-import.js uses own parser); .plain.html CDN-served and immutable; esbuild strips comments from bundle |
| Content generation | 7 | `<p><div>` nesting from double-wrapping in tablesToDivs(); quote block single-row instead of 2-row; CTA missing dark section-metadata; batches object access TypeError; accordion product image not captured; CTA image not captured (media-callout); testimonials Lottie not extracted |

## Session Timeline

| Session | Date | Agent Time | With Margin | Actions | Success Rate |
|---------|------|------------|-------------|---------|-------------|
| 000 | 2026-02-18–25 | ~3h 0m | ~3h 18m | 8 | 100% |
| 001 | 2026-02-26 | ~1h 30m | ~1h 39m | 6 | 100% |
| 002 | 2026-02-26 | ~2h 15m | ~2h 29m | 9 | 89% (1 retry) |
| 003 | 2026-02-26 | ~1h 15m | ~1h 23m | 11 | 100% |
| 004 | 2026-02-26 | ~25m | ~28m | 8 | 100% |
| 005 | 2026-02-26 | ~30m | ~33m | 6 | 100% |
| 006 | 2026-02-26 | ~25m | ~28m | 7 | 100% |
| 007 | 2026-02-26 | ~20m | ~22m | 5 | 100% |
| 008 | 2026-02-26 | ~15m | ~17m | 5 | 100% |
| 009 | 2026-02-26 | ~25m | ~28m | 6 | 100% |
| 010 | 2026-02-26 | ~20m | ~22m | 8 | 100% |
| 011 | 2026-02-27 | ~30m | ~33m | 5 | 100% |
| 012 | 2026-03-02 | ~20m | ~22m | 2 | 100% |
| 013 | 2026-03-02 | ~25m | ~28m | 2 | 100% |
| 014 | 2026-03-02 | ~20m | ~22m | 4 | 100% |
| 015 | 2026-03-02–03 | ~2h 30m | ~2h 45m | 10 | 100% |
| 016 | 2026-03-04 | ~30m | ~33m | 5 | 100% |
| 017 | 2026-03-05 | ~1h 45m | ~1h 56m | 10 | 90% (1 retry) |
| 018 | 2026-03-05 | ~45m | ~50m | 8 | 100% |
| 019 | 2026-03-05 | ~15m | ~17m | 2 | 100% |
| 020 | 2026-03-05 | ~20m | ~22m | 8 | 100% |
| 021 | 2026-03-05 | ~30m | ~33m | 12 | 100% |
| 022 | 2026-03-05 | ~35m | ~39m | 10 | 100% |
| 023 | 2026-03-05 | ~30m | ~33m | 10 | 100% |
| 024 | 2026-03-05 | ~1h 25m | ~1h 34m | 16 | 94% (1 fail) |
| 025 | 2026-03-05 | ~45m | ~50m | 13 | 92% (1 fail) |
| 026 | 2026-03-06 | ~25m | ~28m | 9 | 100% |
| 027 | 2026-03-06 | ~30m | ~33m | 11 | 100% |
| 028 | 2026-03-06 | ~20m | ~22m | 7 | 100% |
| 029 | 2026-03-06 | ~35m | ~39m | 12 | 100% |
| 030 | 2026-03-06 | ~20m | ~22m | 5 | 100% |
| 031 | 2026-03-07 | ~30m | ~33m | 12 | 100% |
| 032 | 2026-03-06 | ~25m | ~28m | 8 | 100% |
| 033 | 2026-03-06 | ~45m | ~50m | 12 | 100% |
| 034 | 2026-03-06 | ~15m | ~17m | 8 | 100% |
| 035 | 2026-03-06 | ~35m | ~39m | 14 | 93% (1 retry) |
| 036 | 2026-03-06 | ~40m | ~44m | 8 | 100% |
| 037 | 2026-03-06 | ~25m | ~28m | 8 | 100% |
| 038 | 2026-03-06 | ~20m | ~22m | 7 | 100% |
| 039 | 2026-03-06 | ~20m | ~22m | 6 | 100% |
| 040 | 2026-03-09 | ~35m | ~39m | 14 | 100% |
| 041 | 2026-03-09 | ~10m | ~11m | 7 | 100% |
| 042 | 2026-03-09 | ~2h 15m | ~2h 29m | 14 | 86% (2 retries) |
| 043 | 2026-03-09 | ~45m | ~50m | 10 | 90% (1 retry) |
| 044 | 2026-03-09 | ~25m | ~28m | 8 | 100% |
| 045 | 2026-03-09 | ~30m | ~33m | 12 | 92% (1 retry) |
| 046 | 2026-03-09 | ~35m | ~39m | 9 | 100% |
| 047 | 2026-03-09 | ~30m | ~33m | 11 | 100% |
| 048–050 | 2026-03-09 | ~40m | ~42m | 11 | 91% (1 fail) |
| 051 | 2026-03-10 | ~15m | ~16m | 7 | 100% |
| 055 | 2026-03-10 | ~30m | ~33m | 9 | 100% |
| 056 | 2026-03-10 | ~15m | ~17m | 7 | 100% |
| 057 | 2026-03-10 | ~25m | ~29m | 8 | 75% (2 fail) |
| 058 | 2026-03-10 | ~30m | ~33m | 10 | 100% |
| 059 | 2026-03-10 | ~40m | ~44m | 16 | 94% (1 fail) |
| 060 | 2026-03-10 | ~35m | ~39m | 17 | 94% (1 fail) |
| 061 | 2026-03-10 | ~35m | ~39m | 16 | 94% (1 fail) |
| 062 | 2026-03-10 | ~35m | ~39m | 10 | 100% |
| 063 | 2026-03-10 | ~40m | ~44m | 7 | 100% |
| 064 | 2026-03-10 | ~45m | ~50m | 9 | 100% |
| 065 | 2026-03-11 | ~5m | ~5m | 4 | 100% |
| 066 | 2026-03-11 | ~1h 30m | ~1h 39m | 11 | 100% |
| 067 | 2026-03-11 | ~10m | ~11m | 5 | 100% |
| 068 | 2026-03-11 | ~15m | ~17m | 6 | 100% |
| 069 | 2026-03-11 | ~25m | ~28m | 9 | 89% (1 fail) |
| 070 | 2026-03-11 | ~5m | ~5m | 4 | 100% |
| 071 | 2026-03-11 | ~15m | ~17m | 6 | 100% |
| 072 | 2026-03-11 | ~10m | ~11m | 5 | 100% |
| 073 | 2026-03-11 | ~30m | ~33m | 10 | 100% |
| 074 | 2026-03-11 | ~2h 15m | ~2h 29m | 13 | 100% |
| 075 | 2026-03-12 | ~1h 45m | ~1h 56m | 14 | 100% |
