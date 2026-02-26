---
name: excat-problem-tracker
description: Review project journal problem tables and build a knowledge base of problems encountered, root causes, resolutions, and prevention strategies. Identifies recurring patterns and generates actionable prevention checklists. Invoke when user says "update problem tracker", "analyze problems", "what problems have we seen", "check knowledge base", "problem patterns", or when closing a session that had problems.
---

# EXECUTION MINDSET

**You are an ANALYST. Your job is to extract patterns from raw problem data and produce a scannable, actionable knowledge base that prevents the team from repeating mistakes.**

- DO: Read every problem table in journal.md — do not skip sessions
- DO: Identify root causes, not just symptoms
- DO: Write prevention advice that is specific and actionable ("use `a.textContent`" not "be careful with links")
- DO: Preserve existing problem IDs when regenerating the knowledge base
- DON'T: Invent problems that are not in the journal — only track what actually happened
- DON'T: Write vague prevention advice — if you cannot name the specific technique, the advice is not useful
- DON'T: Duplicate the journal — the knowledge base is analysis and synthesis, not a copy

**Your output should be a single file that a developer can search in 10 seconds to find "have we seen this before? how did we fix it?"**

---

# Problem Tracker Skill

## Rules

1. **Source of truth is journal.md.** The knowledge base is derived. If they conflict, journal.md wins. Never modify journal.md from this skill.

2. **Stable IDs.** Once a problem gets an ID (e.g., `DA-001`), it keeps that ID forever. When regenerating the knowledge base, read the existing `problem-kb.md` first to preserve IDs.

3. **Overwrite, don't append.** `problem-kb.md` is regenerated from scratch each run (like `project-context.md` and `metrics.md`). The structure may change as new problems are added.

4. **Prevention must be actionable.** Every problem entry and every checklist item must contain a specific technique, value, or command — not generic advice.

5. **Do not fabricate.** Only track problems that appear in journal.md problem tables or `project-context.md` active blockers. Do not speculate about potential problems.

## Purpose

Build and maintain a knowledge base of problems encountered during the project, organized for quick lookup. The knowledge base answers three questions:

1. **"Have we seen this problem before?"** — Search All Problems by category or keyword
2. **"How did we fix it last time?"** — Read the Resolution field
3. **"How do we avoid this in the future?"** — Scan the Prevention Checklists at the top

## Output

The skill produces one file:

```
/workspace/journal/problem-kb.md
```

This file is regenerated (overwritten) each time the skill runs. It is a derived view of problem data from `journal.md`, not an independent record.

## Problem Entry Schema

Each unique problem gets an entry with these fields:

| Field | Required | Source | Example |
|-------|----------|--------|---------|
| **ID** | yes | Generated: `{PREFIX}-{NNN}` | `DA-001` |
| **Title** | yes | Derived from journal problem description | DA converts dots to hyphens in href attributes |
| **Category** | yes | From `metrics.md` categories or inferred | DA compatibility |
| **Severity** | yes | From journal: `blocker` / `major` / `minor` | `blocker` |
| **First seen** | yes | Session number + action number | Session 001, Action #2 |
| **Occurrences** | yes | Count + session list | 1 (Session 001) |
| **Root cause** | yes | Analysis of why it happened | DA's URL normalization replaces dots with hyphens |
| **Resolution** | yes (if resolved) | From journal resolution column | Match by `textContent` instead of `href` |
| **Status** | yes | `resolved` / `unresolved` / `workaround` | `resolved` |
| **Prevention** | yes | Actionable advice to avoid recurrence | Never rely on `href` values in DA content; use link text |
| **Related** | no | Cross-references to other problem IDs | `DA-002` |

## Category Prefixes

| Category | Prefix |
|----------|--------|
| DA compatibility | `DA` |
| Git / environment | `GIT` |
| Performance | `PERF` |
| File sync | `SYNC` |
| Build / deployment | `BUILD` |
| Content authoring | `AUTH` |
| Block rendering | `BLOCK` |
| (new categories) | Short uppercase prefix assigned on first encounter |

IDs are stable — once assigned, a problem keeps its ID even if the category list changes.

## Pattern Detection

A **pattern** is identified when any of these conditions are met:

1. **Same category + similar root cause** — Two problems in the same category caused by the same underlying issue
2. **Recurrence across sessions** — The same problem appearing in 2+ sessions
3. **Same root cause, different symptoms** — Problems in different categories that trace to one underlying cause

**Pattern threshold:** 2+ occurrences = pattern. Deliberately low to catch issues early.

**Pattern record structure:**

```markdown
### Pattern: [Descriptive Name]
**Category:** [primary category]
**Occurrences:** [N] across sessions [list]
**Problem IDs:** [ID-001, ID-002, ...]
**Root cause:** [The underlying reason this keeps happening]
**General resolution:** [The proven approach that works]
**Prevention:** [Steps to avoid ever hitting this again]
**Severity trend:** [e.g., "blocker on first occurrence, now minor — workaround well-known"]
**Status:** [Active | Resolved | Mitigated]
```

## Workflow

### Phase 1: Scan

**Goal:** Extract all problem data from journal files.

1. **Read `journal.md`** — Extract all `### Problems Encountered` tables:
   - For each session, parse: problem description, severity, resolved status, resolution, related action #
   - Note the session number for each problem
   - Skip sessions with `(none)` in the problems section

2. **Read `metrics.md`** — Extract `## Problem Categories` table:
   - Use as the starting category taxonomy

3. **Read `project-context.md`** — Extract `## Active Blockers`:
   - Any blockers not yet in the knowledge base become new unresolved problems

4. **If `problem-kb.md` already exists**, read it to:
   - Preserve existing problem IDs
   - Preserve existing pattern groupings
   - Identify what is new since last run

### Phase 2: Analyze

**Goal:** Classify, deduplicate, and find patterns.

1. **Deduplicate** — Merge identical or near-identical problems into single entries with occurrence counts
2. **Assign IDs** — Preserve existing IDs, assign new IDs to new problems using `{PREFIX}-{NNN}` format
3. **Classify** — Assign each problem to a category; create new categories if needed
4. **Root-cause analysis** — For each problem, determine the underlying reason from resolution text and session context
5. **Pattern detection** — Group problems by the three axes described above
6. **Prevention generation** — Write one specific, actionable prevention statement per problem

### Phase 3: Generate

**Goal:** Write `problem-kb.md`.

Write the file with these sections in order:

1. **Header** — Title, last-updated timestamp, session reference
2. **Quick Reference — Prevention Checklists** — One subsection per category, checkbox format. Each item starts with a verb, includes the specific technique, and references the problem ID.
3. **Recurring Patterns** — Table summary + detailed entries (only for 2+ occurrence patterns). Omit section if no patterns detected.
4. **All Problems** — Grouped by category. Each problem uses the full entry schema.
5. **Unresolved Problems** — Only if any exist. Omit section if all problems are resolved.
6. **Statistics** — Total problems, resolution rate, category distribution, pattern count.

## When to Run

| Trigger | Action |
|---------|--------|
| User says "update problem tracker" / "analyze problems" / "check knowledge base" | Full run (all 3 phases) |
| Session close that had problems | Full run (all 3 phases) |
| Session close with no problems | Skip — no new data to process |
| Encountering a new problem mid-session | Read-only: consult existing `problem-kb.md` before attempting a fix |
| User asks "have we seen this before?" | Read-only: search `problem-kb.md` |

## Integration with Journaling Skill

**Reads from:**
- `journal.md` — `### Problems Encountered` tables (columns: Problem, Severity, Resolved?, Resolution, Related Action #)
- `metrics.md` — `## Problem Categories` table (columns: Category, Count, Examples)
- `project-context.md` — `## Active Blockers` section

**Writes to:**
- `problem-kb.md` only

**No circular dependency.** The problem tracker reads from journal files but does not write to them. The journaling skill does not need to know this skill exists. They share a data directory and operate independently.

**Invocation sequence at session close:**
1. Journaling skill finalizes session entry in `journal.md`
2. Journaling skill updates `metrics.md` and `project-context.md`
3. (If session had problems) Problem tracker runs, reads updated journal files, regenerates `problem-kb.md`

## Output File Structure

```markdown
# Problem Knowledge Base

> Derived from journal.md problem tables. Rebuilt each time the skill runs.
> Last updated: [YYYY-MM-DD] (after Session [NNN])

## Quick Reference — Prevention Checklists

### [Category Name]
- [ ] [Verb] [specific technique/value] — [brief context] ([ID])
- [ ] ...

## Recurring Patterns

| Pattern | Category | Occurrences | Sessions | Status |
|---------|----------|-------------|----------|--------|
| [Name] | [Category] | [N] | [list] | [Active/Resolved/Mitigated] |

### Pattern: [Name]
...

## All Problems

### [Category Name]

#### [ID]: [Title]
- **Severity:** [blocker/major/minor]
- **First seen:** Session [NNN] (Action #[N])
- **Occurrences:** [N] (Sessions [list])
- **Root cause:** [Why it happened]
- **Resolution:** [How it was fixed]
- **Prevention:** [How to avoid it]
- **Related:** [other IDs, if any]

## Unresolved Problems
(only if any exist)

## Statistics
- **Total problems tracked:** [N]
- **Resolved:** [N] ([%])
- **Unresolved:** [N]
- **Patterns identified:** [N]
- **Categories:** [N] ([list])
- **Most problematic category:** [name] ([count] occurrences)
```

## Troubleshooting

**problem-kb.md seems out of date:**
- Re-run the skill. It regenerates from journal.md each time.
- If journal.md has been updated but problem-kb.md has not, the skill simply has not been invoked since the last session.

**Problem IDs changed between runs:**
- This should not happen if the skill reads existing problem-kb.md before generating. Verify Phase 1 step 4 is being followed.

**Category does not match metrics.md:**
- The knowledge base may create more granular categories than metrics.md uses. This is acceptable — metrics.md is maintained by the journaling skill, not this skill.

**No problems to track:**
- If journal.md has no problems, the knowledge base will have empty sections. This is expected — it means the project is running smoothly.

---

*Problem Tracker Skill v1.0*
