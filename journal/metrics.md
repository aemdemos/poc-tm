# Project Metrics

## Time
- **Total sessions:** 20 (including backfills)
- **Total agent time:** ~17h 40m
- **Total with user margin (10%):** ~19h 31m
- **Average session length:** ~53m

## Success Rates
- **Actions attempted:** 136
- **First-try success:** 133 (98%)
- **Required retry:** 3 (2%)
- **Failed:** 0 (0%)

## Problems
- **Total encountered:** 15
- **Resolved:** 13 (87%)
- **Unresolved:** 2
- **Most common category:** DA compatibility / content handling

## Problem Categories

| Category | Count | Examples |
|----------|-------|---------|
| DA compatibility | 5 | URL mangling, file reference mismatch, content flattening, image stripping |
| CSS/styling | 3 | Tab truncation (multiple attempts), stylelint false positive, fallback font width |
| Git/environment | 2 | safe.directory error, filesystem access |
| Performance | 1 | Animation load timeout too slow |
| File sync | 1 | HTML variants stale after markdown edit |
| Test harness | 2 | Sync scroll doesn't trigger IO, F-DELAYED false positive |
| Tool permissions | 1 | Subagent Bash/Playwright auto-denied (workaround: use main agent) |

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
| 016 | 2026-03-04 | ~30m | ~33m | 10 | 100% |
| 017 | 2026-03-05 | ~1h 45m | ~1h 56m | 12 | 92% (1 retry) |
| 018 | 2026-03-05 | ~45m | ~50m | 9 | 100% |
| 019 | 2026-03-05 | ~15m | ~17m | 3 | 100% |
