# Status Checkup — Format

> Portable template for the daily status checkup briefing. See `SKILL.md` for full rules and workflow.

The briefing is always output directly in the reply. It is never written to a file.

---

## Template

```markdown
## Status Checkup — [Project Name]
**As of:** [YYYY-MM-DD] (Session [NNN])
**Branch:** `[branch-name]`

---

### Blockers & Open Problems

> Skip this section entirely if there are no blockers or unresolved problems.

- **[BLOCKER]** [description] — [status/impact]
- **[PROBLEM-ID]** [title] — [severity], unresolved since Session [NNN]

---

### Resume Point

> [Carry-forward from the most recent session — copy verbatim from journal.md]

---

### Project Status

- **Overall:** [one-line status from project-context.md]
- **Done:** [N items completed] — [brief summary of major milestones]
- **In progress:** [current work items, or "none — between sessions"]
- **Pending:** [top 3-4 items from project-context.md pending list]

---

### Recent Activity

- **Session [NNN]** — [Title] ([duration]) — [1-line outcome summary]
- **Session [NNN]** — [Title] ([duration]) — [1-line outcome summary]

---

### Time & Metrics

- **Sessions:** [N] total ([N] today)
- **Time invested:** [Xh Ym] agent / [Xh Ym] with margin
- **Success rate:** [N]% first-try ([N] actions total)
- **Problems:** [N] encountered, [N] resolved, [N] open

---

### Prevention Reminders

> Include the 2-3 most relevant items from the prevention checklists in
> problems-reference.md — pick items related to the pending work.

- [checklist item] ([PROBLEM-ID])
- [checklist item] ([PROBLEM-ID])

---

### Suggested Next Steps

1. [Concrete action derived from resume point and pending items]
2. [Second priority action]
3. [Third priority action or optional stretch goal]
```

---

## Section Rules

- **Blockers & Open Problems:** Only shown when problems exist with `Resolved? = no` or `workaround`, or when `project-context.md` has active blockers. Otherwise skip entirely — don't show an empty section.
- **Resume Point:** Copy the carry-forward verbatim. This is the single most important line in the briefing.
- **Project Status:** Keep the pending list to 3-4 items maximum. If there are more, pick the highest priority.
- **Recent Activity:** Show last 1-2 sessions only. More than that is noise.
- **Time & Metrics:** One line per metric. Pull from `metrics.md` and `time-tracking.md` header.
- **Prevention Reminders:** Pick items relevant to what's coming next, not the full checklist.
- **Suggested Next Steps:** Be specific. "Continue migration" is too vague. "Extract design tokens from zelis.com and populate styles/styles.css" is actionable.

---

## Example

```markdown
## Status Checkup — Zelis EDS Migration
**As of:** 2026-02-26 (Session 008)
**Branch:** `issue-1-styles-bulk`

---

### Resume Point

> Time tracking skill v1.1 complete. All three supporting skills operational.
> Next priorities: design token extraction from zelis.com, navigation structure
> setup, or begin bulk page migration.

---

### Project Status

- **Overall:** Early migration — homepage blocks functional, animation skill built, tooling refined
- **Done:** 11 items — repo setup, block imports, hero Lottie, animation skill, journaling, problem tracker, time tracking
- **In progress:** none — between sessions
- **Pending:**
  - Design token extraction (colors, fonts, spacing → `styles/styles.css`)
  - Navigation setup (nav.md/nav.html from zelis.com structure)
  - Block styling refinement (CSS doesn't match source site)
  - Additional page migrations (~789 URLs remain)

---

### Recent Activity

- **Session 008** — Refine time tracking skill v1.1 (~17m) — Merged 6 improvements from external skill
- **Session 007** — Create time tracking skill (~22m) — Skill + initial report + format schema

---

### Time & Metrics

- **Sessions:** 9 total (8 today)
- **Time invested:** ~9h 55m agent / ~10h 57m with margin
- **Success rate:** 97% first-try (65 actions)
- **Problems:** 6 encountered, 6 resolved, 0 open

---

### Prevention Reminders

- Match DA links by `a.textContent`, never by `a.href` (DA-001)
- Set `HOME=/home/node` before git commands in container (GIT-001)
- Never manually write `.html` files that have a `.md` source (SYNC-001)

---

### Suggested Next Steps

1. Extract design tokens from zelis.com — populate `styles/styles.css` with colors, fonts, spacing
2. Set up navigation structure — build nav.md/nav.html from zelis.com site map
3. Begin bulk page migration — set up page templates and import scripts for remaining ~789 URLs
```

---

Use the same format in any project; only the project name and data change.
