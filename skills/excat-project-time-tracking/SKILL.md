---
name: excat-project-time-tracking
description: Review the project journal to compile daily time reports — actions taken, time per action, session totals, daily totals, and cumulative project time. Invoke when user says "time report", "how much time today", "daily summary", "time tracking", "what did we work on today", "project hours", or when closing out a day's work.
---

# EXECUTION MINDSET

**You are a TIME ANALYST. Your job is to compile clear, accurate daily time reports from journal session data.**

- DO: Read every session entry and extract action-level time estimates
- DO: Group sessions by date and calculate accurate totals
- DO: Include the user overhead margin in all totals
- DO: Show both agent time and total time (with margin) for transparency
- DON'T: Invent time data — only report what's in the journal
- DON'T: Include problem details, key decisions, or other non-time content — the problem tracker handles that
- DON'T: Round aggressively — preserve the granularity from the journal

**Your output should let someone answer "how much time did we spend on this project today?" in under 10 seconds.**

---

# Project Time Tracking Skill

## Scope: Time Only

This skill focuses **only** on time data:

- Session dates and durations
- Action-level time estimates
- User overhead margins
- Daily and cumulative totals

It does not track problems (that's the problem tracker), context (that's project-context.md), or detailed outcomes (that's the journal itself).

## Purpose

Compile daily time reports from the project journal. Useful for:

- **Daily standup/reporting** — "What did we work on and how long?"
- **Project accounting** — Track cumulative hours invested
- **Estimation calibration** — Compare estimated vs. actual time patterns
- **Billing/invoicing** — Break down time by date with action-level detail

## When to Use

- **End of day** — Compile the day's time report
- **On request** — User asks "how much time today?", "daily summary", "time report", "project hours"
- **Weekly/periodic review** — Compile multi-day summaries
- **Start of session** — Quick glance at cumulative time invested

## Rules

1. **Source of truth is journal.md.** Time data is extracted from session entries. If the report and journal conflict, journal.md wins.

2. **Overwrite, don't append.** `time-tracking.md` is regenerated each run. It's a derived report, not an independent record.

3. **Include margins.** Every session total includes the user overhead margin from the journal. Show both agent time and total-with-margin.

4. **Action-level detail.** Break out individual actions with their time estimates — don't just show session totals.

5. **Do not fabricate.** Only report time that appears in journal.md. If a session has no time estimates, note it rather than guessing.

## Locations

- **Journal source:** Same as journaling skill. Default: `journal/journal.md`.
- **Report output:** Same directory as the journal. Default: `journal/time-tracking.md`.
- **Schema template:** `skills/excat-project-time-tracking/time-report-format.md`

## Workflow

### Step 1: Read the journal

- Open `journal/journal.md`
- For each session, extract:
  - Session number, date, title
  - Duration line: agent time, margin percentage, total with margin
  - Each action's time estimate from the Actions table or bullet list
  - Session goal (for context on what the time was spent on)

### Step 2: Group by date

- Group sessions by their date (from the session header: `## Session NNN — YYYY-MM-DD`)
- Sessions spanning multiple dates (like Session 000: "2026-02-18 to 2026-02-25") should be listed under their start date with a note

### Step 3: Calculate totals

For each date:
- **Actions:** List each action with its time estimate
- **Session total:** Sum of action times (agent time) + margin = total
- **Daily total:** Sum of all session totals for that date

Cumulative:
- **Project total:** Sum of all daily totals across the entire journal

### Step 4: Generate the report

Write `journal/time-tracking.md` using the schema in [time-report-format.md](time-report-format.md):

1. **Header** with last-updated timestamp and cumulative project total
2. **Daily sections** in reverse chronological order (most recent first) — each with:
   - Date heading and daily total
   - Per-session breakdown with action-level detail
3. **Cumulative summary** at the bottom with total sessions, total time, average session length

## Output File Structure

```markdown
# Time Tracking — [Project Name]

> Daily time reports compiled from journal.md session data.
> Last updated: [YYYY-MM-DD] (after Session [NNN])

**Project total:** [Xh Ym] (agent) / [Xh Ym] (with margin)

---

## [YYYY-MM-DD] — [Xh Ym] total

### Session [NNN] — [Title] ([Xm] agent + [N]% = [Xm])

| # | Action | Time |
|---|--------|------|
| 1 | [Action description] | [Xm] |
| 2 | [Action description] | [Xm] |
| **Total** | | **[Xm]** |

### Session [NNN] — [Title] ([Xm] agent + [N]% = [Xm])
...

**Daily total:** [Xh Ym] (agent) / [Xh Ym] (with margin)

---

## Cumulative Summary

| Date | Sessions | Agent Time | With Margin | Actions |
|------|----------|------------|-------------|---------|
| [YYYY-MM-DD] | [N] | [Xh Ym] | [Xh Ym] | [N] |
| ...  | ...      | ...        | ...         | ...     |
| **Total** | **[N]** | **[Xh Ym]** | **[Xh Ym]** | **[N]** |
```

## When to Run

| Trigger | Action |
|---------|--------|
| User asks "time report" / "how much time today?" / "daily summary" | Full run (steps 1–4) |
| End of day / closing out work | Full run (steps 1–4) |
| User asks "how much total time?" | Read-only: check header of existing report or metrics.md |
| Session close | Optional — run if user wants up-to-date time tracking |

## Integration

**Reads from:**
- `journal.md` — Session headers (date, duration) and action time estimates

**Writes to:**
- `time-tracking.md` only

**Relationship to metrics.md:** The journaling skill maintains `metrics.md` with cumulative time stats. This skill provides the **daily breakdown** that metrics.md summarizes. They complement each other — metrics.md gives the totals, time-tracking.md shows the detail.

## Parsing Notes

### Duration line formats

The journal uses this format in session headers:
```
**Duration:** ~Xm (agent) + N% user overhead = ~Xm total
**Duration:** ~Xh Ym (agent) + N% user overhead = ~Xh Ym total
```

Extract: agent time, margin percentage, total with margin.

### Action time formats

**Table format:**
```
| 1 | [Action description] | new | 1 | pass | Xm |
```
The last column is the time estimate.

**Bullet format:**
```
- [x] Action description (~Xm) — pass
```
Time is in parentheses with `~` prefix.

### Backfill sessions

Session 000 may span multiple dates. List it under its start date and note the date range in the output.

## Troubleshooting

**Report seems out of date:**
- Re-run the skill. It regenerates from journal.md each time.

**Times don't match metrics.md:**
- Both are derived from journal.md. If they disagree, recheck the journal. Small rounding differences are expected.

**Session has no time estimates:**
- Note "no time data" for that session. Do not estimate or fabricate.

**Backfill session spans multiple dates:**
- List under the start date with a note about the date range. Do not split across dates.

## Additional Resources

- Report file schema: [time-report-format.md](time-report-format.md)
- Journal schema (for parsing): `skills/excat-journaling/journal-format.md`
- Time estimation guide: `skills/excat-journaling/SKILL.md` (Time Tracking section)

---

*Project Time Tracking Skill v1.0*
