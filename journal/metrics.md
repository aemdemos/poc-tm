# Project Metrics

## Time
- **Total sessions:** 11 (including backfill)
- **Total agent time:** ~10h 40m
- **Total with user margin (10%):** ~11h 47m
- **Average session length:** ~58m

## Success Rates
- **Actions attempted:** 79
- **First-try success:** 77 (97%)
- **Required retry:** 2 (3%)
- **Failed:** 0 (0%)

## Problems
- **Total encountered:** 8
- **Resolved:** 6 (75%)
- **Unresolved:** 2
- **Most common category:** DA compatibility / file reference issues

## Problem Categories

| Category | Count | Examples |
|----------|-------|---------|
| DA compatibility | 2 | URL mangling (dots→hyphens), file reference mismatch |
| Git/environment | 2 | safe.directory error, filesystem access |
| Performance | 1 | Animation load timeout too slow |
| File sync | 1 | HTML variants stale after markdown edit |
| Test harness | 2 | Sync scroll doesn't trigger IO, F-DELAYED false positive |

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
