---
name: excat-daily-status-checkup
description: Review the project journal, time tracking, and problem reference to build context for a new session or day. Produces a concise status briefing covering where the project stands, what was done recently, what's pending, active problems, and time invested. Invoke when user says "status checkup", "where did we leave off", "catch me up", "what's the status", "daily checkup", "start of day", "resume", or at the start of any new session.
---

# EXECUTION MINDSET

**You are a PROJECT BRIEFER. Your job is to quickly synthesize all project tracking data into a clear, actionable status briefing.**

- DO: Read every data source (journal, context, problems, time, metrics)
- DO: Surface the most recent carry-forward and resume point prominently
- DO: Highlight unresolved problems and active blockers at the top
- DO: Keep the briefing concise — scannable in under 60 seconds
- DO: End with a clear "suggested next step" based on the carry-forward and pending items
- DON'T: Repeat the full journal — summarize, don't transcribe
- DON'T: Include resolved problems unless they're relevant to pending work
- DON'T: Fabricate status — only report what's in the data sources

**Your output should let someone go from "I haven't looked at this project in days" to "I know exactly where we are and what to do next" in one read.**

---

# Daily Status Checkup Skill

## Scope: Context Building Only

This skill focuses **only** on reading and synthesizing existing project data:

- Project state and resume point (from `project-context.md`)
- Recent session activity (from `journal.md`)
- Open problems and prevention checklists (from `problems-reference.md`)
- Time invested (from `time-tracking.md` and `metrics.md`)

It does not modify any files, create new entries, or track time. It is read-only.

## Purpose

Build a status briefing that re-establishes context for a new session or workday. Useful for:

- **Start of day** — "Where did we leave off? What should I work on?"
- **Session resumption** — Context was lost (new conversation, restart, timeout)
- **Stakeholder update** — Quick summary of project status for someone not involved daily
- **Pre-work scanning** — Review known problems before starting a task

## When to Use

- **Automatically** — At the start of every new conversation or session (if journal files exist)
- **On request** — User asks "status", "where are we", "catch me up", "daily checkup", "what did we do last"
- **After a gap** — Any time there's been a break between sessions (hours, days, weeks)

## Rules

1. **Read-only.** This skill reads data sources but never writes to them. No journal entries, no file modifications.

2. **Most recent first.** Lead with the latest carry-forward and resume point — that's what the user needs most urgently.

3. **Highlight blockers.** Unresolved problems and active blockers go at the top of the briefing, before the summary.

4. **Be concise.** The briefing should be scannable in under 60 seconds. Use bullets, not paragraphs. One line per item.

5. **Suggest next steps.** End with 2-3 concrete suggested actions derived from the carry-forward, pending items, and project context.

6. **No fabrication.** Only report what's in the data sources. If a file is missing, note it and skip that section.

## Locations

Data sources (all read-only):

- `journal/project-context.md` — Current state snapshot, resume point, pending items, blockers
- `journal/journal.md` — Full session history (read last 1-2 sessions for recent activity)
- `journal/problems-reference.md` — Known problems, resolutions, prevention checklists
- `journal/time-tracking.md` — Daily time breakdown and cumulative totals
- `journal/metrics.md` — Session count, success rates, problem stats
- `journal/journal-index.md` — One-line summary per session

## Workflow

### Step 1: Read the state snapshot

- Open `journal/project-context.md`
- Extract: overall status, resume point, active blockers, what's in progress, what's pending

### Step 2: Read recent journal activity

- Open `journal/journal-index.md` for the session list
- Open `journal/journal.md` and read the **last 2 sessions** (most recent carry-forward, outcomes, key decisions)
- Note: don't read the entire journal — just the tail

### Step 3: Check for open problems

- Open `journal/problems-reference.md`
- Look for any rows where `Resolved?` is `no` or `workaround`
- Extract active prevention checklists (top of file)
- Note total problems and resolution rate

### Step 4: Check time and metrics

- Open `journal/metrics.md` for cumulative stats (sessions, actions, success rate)
- Open `journal/time-tracking.md` header for project total time
- Note most recent session date to gauge how long since last activity

### Step 5: Build the briefing

Assemble the status checkup using the format in [status-checkup-format.md](status-checkup-format.md). Output directly in the reply (this skill never writes files).

Sections in order:

1. **Blockers & Open Problems** — Only if any exist. If none, skip entirely.
2. **Resume Point** — The carry-forward from the most recent session. This is the single most important line.
3. **Project Status** — Overall status line, what's done (summary count), what's in progress, what's pending.
4. **Recent Activity** — Last 1-2 sessions: session number, title, key outcomes, duration.
5. **Time & Metrics** — Total sessions, total time, success rate.
6. **Prevention Reminders** — Top 2-3 most relevant prevention items from the problems reference (based on what's likely to come up in the pending work).
7. **Suggested Next Steps** — 2-3 concrete actions derived from the resume point, pending items, and project state.

## Output Format

The briefing is always output directly in the reply. It is never written to a file. See [status-checkup-format.md](status-checkup-format.md) for the full template.

Quick outline:

```
## Status Checkup — [Project Name]
**As of:** [date] (Session [NNN])

### Blockers & Open Problems
(only if any exist)

### Resume Point
> [carry-forward from most recent session]

### Project Status
- **Overall:** [status line]
- **Done:** [N] items
- **In Progress:** [list or "none"]
- **Pending:** [top 3-4 items]

### Recent Activity
- **Session NNN** — [Title] ([duration]) — [key outcome]
- **Session NNN** — [Title] ([duration]) — [key outcome]

### Time & Metrics
- **Total:** [N] sessions, [Xh Ym] agent time
- **Success rate:** [N]%
- **Problems:** [N] encountered, [N] resolved

### Prevention Reminders
- [relevant checklist item]
- [relevant checklist item]

### Suggested Next Steps
1. [action]
2. [action]
3. [action]
```

## When to Run

| Trigger | Action |
|---------|--------|
| Start of new conversation/session | Auto-run if journal files exist |
| User asks "status" / "where are we" / "catch me up" | Full briefing |
| User asks "what's next" / "what should we work on" | Abbreviated: resume point + suggested next steps only |
| After context loss (restart, timeout) | Full briefing |

## Integration

**Reads from:**
- `journal/project-context.md`
- `journal/journal.md` (tail only — last 1-2 sessions)
- `journal/journal-index.md`
- `journal/problems-reference.md`
- `journal/time-tracking.md` (header only)
- `journal/metrics.md`

**Writes to:**
- Nothing. This skill is entirely read-only.

**Relationship to other skills:**
- Consumes output from: journaling skill (journal.md, index, context, metrics), problem tracker (problems-reference.md), time tracking (time-tracking.md)
- Does not compete with or duplicate any other skill
- Designed to run *before* any other skill in a session — it builds the context that other skills operate within

## Troubleshooting

**Journal files don't exist yet:**
- This is a new project. Skip the briefing and note that journaling should be initialized first.

**project-context.md is stale:**
- Check journal.md for more recent sessions. The context file may not have been updated after the last session. Note the discrepancy.

**No carry-forward in the last session:**
- Use the last session's outcomes and pending items from project-context.md to suggest next steps.

**Multiple days since last session:**
- Note the gap. Summarize what was happening when work stopped and what the resume point was.

## Additional Resources

- Briefing format: [status-checkup-format.md](status-checkup-format.md)
- Journal schema: `skills/excat-journaling/journal-format.md`
- Problems schema: `skills/excat-problem-tracker/problems-reference-format.md`
- Time report schema: `skills/excat-project-time-tracking/time-report-format.md`

---

*Daily Status Checkup Skill v1.0*
