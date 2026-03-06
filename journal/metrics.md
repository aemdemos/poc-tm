# Project Metrics

## Time
- **Total sessions:** 40 (including backfills)
- **Total agent time:** ~28h 10m
- **Total with user margin (10%):** ~31h 6m
- **Average session length:** ~42m

## Success Rates
- **Actions attempted:** 334
- **First-try success:** 327 (98%)
- **Required retry:** 6 (2%)
- **Failed:** 1 (<1%)

## Problems
- **Total encountered:** 35
- **Resolved:** 28 (80%)
- **Workarounds:** 7
- **Unresolved:** 0
- **Most common category:** DA compatibility / content handling

## Problem Categories

| Category | Count | Examples |
|----------|-------|---------|
| DA compatibility | 5 | URL mangling, file reference mismatch, content flattening, image stripping |
| CSS/styling | 7 | Tab truncation (multiple attempts), stylelint false positive, fallback font width, body font-size mismatch, mega-panel positioning, announcement bar layout, CTA button decoration |
| Git/environment | 5 | safe.directory error, filesystem access, push rejected (rebase needed), push failed (no credentials) x2 |
| Tooling | 3 | convert-all-md.js corrupts EDS block HTML, subagent Bash/Playwright auto-denied, pixelmatch v7 ESM default export |
| Test infra | 1 | results.json overwritten between Playwright projects (module re-initialization) |
| Lint | 2 | no-use-before-define in image-slider.js, no-descending-specificity in image-slider.css |
| Performance | 1 | Animation load timeout too slow |
| File sync | 1 | HTML variants stale after markdown edit |
| Test harness | 2 | Sync scroll doesn't trigger IO, F-DELAYED false positive |
| Source site | 1 | 3 URLs returned 404 during bulk import |
| Block runtime | 1 | Accordion block JS error on solutions pages |
| Local preview | 1 | `aem up` proxies from remote CDN; let-care-flow .plain.html broken (pipe-table parsing) |

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
