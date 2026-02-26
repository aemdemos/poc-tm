# Problem Knowledge Base

> Derived from journal.md problem tables. Rebuilt each time the skill runs.
> Last updated: 2026-02-26 (after Session 004)

## Quick Reference — Prevention Checklists

### DA Compatibility
- [ ] Match DA links by `a.textContent`, never by `a.href` — DA mangles dots to hyphens in href attributes (DA-001)
- [ ] Verify file references point to actual filenames — DA and file watchers may auto-generate variant names that don't match source (DA-002)

### Git / Environment
- [ ] Set `HOME=/home/node` before first git command in container environments (GIT-001)
- [ ] Commit and push files to git when workspace filesystem is not directly accessible to the user (GIT-002)

### Performance
- [ ] Set `delayed.js` timeout to 1.5s — the 3s default is too slow for perceived animation load (PERF-001)

### File Sync
- [ ] After editing `.md` files, let the file watcher auto-regenerate `.html` variants — do not manually write them (SYNC-001)

## Recurring Patterns

| Pattern | Category | Occurrences | Sessions | Status |
|---------|----------|-------------|----------|--------|
| Content platform transforms file references | DA compatibility / File sync | 3 | 001, 003 | Mitigated — workarounds established |

### Pattern: Content platform transforms file references

**Category:** DA compatibility / File sync
**Occurrences:** 3 across Sessions 001, 003
**Problem IDs:** DA-001, DA-002, SYNC-001
**Root cause:** Content authoring platforms (Document Authoring, file watchers) automatically transform file paths, URLs, and references in ways that break explicit filename dependencies. DA normalizes dots to hyphens in hrefs; file watchers regenerate HTML from markdown, invalidating manual writes; and skill references can point to filenames that don't match the actual generated files.
**General resolution:** Never depend on auto-generated attributes or filenames. Use content-based matching (text content, not href) and let automated systems handle their own outputs.
**Prevention:** Always verify file references against actual filesystem contents. For DA content, match by text content. For auto-generated files, let the generator own the output — don't manually write files the watcher manages.
**Severity trend:** `blocker` on first encounter (DA-001), declining to `minor` as workarounds became known (SYNC-001)
**Status:** Mitigated — workarounds established, prevention strategies documented

## All Problems

### DA Compatibility

#### DA-001: DA converts dots to hyphens in href attributes
- **Severity:** blocker
- **First seen:** Session 001 (Action #2)
- **Occurrences:** 1 (Session 001)
- **Root cause:** Document Authoring's URL normalization replaces dots with hyphens in `href` attributes, turning `.json` into `-json` and breaking Lottie animation file path detection.
- **Resolution:** Match Lottie links by `a.textContent.trim().endsWith('.json')` instead of checking `a.href`.
- **Prevention:** Never rely on `href` attribute values for file-type detection in DA-authored content. Always use `a.textContent` for path matching.
- **Related:** DA-002

#### DA-002: SKILL.md referenced non-existent file
- **Severity:** major
- **First seen:** Session 003 (Action #2)
- **Occurrences:** 1 (Session 003)
- **Root cause:** Phase 5 of the animation migration SKILL.md referenced `animation-verification-criteria.md`, but the actual file was named `animation-verification.md`. The mismatch likely originated from a name change during development that wasn't propagated to all references.
- **Resolution:** Updated the reference in SKILL.md to point to the actual filename `animation-verification.md`.
- **Prevention:** After creating or renaming files, grep for all references to the old name across the project. Verify cross-references in skill files point to actual filenames on disk.
- **Related:** DA-001 (both involve file reference mismatches)

### Git / Environment

#### GIT-001: Git safe.directory error on first git operation
- **Severity:** minor
- **First seen:** Session 002 (Action #5)
- **Occurrences:** 1 (Session 002)
- **Root cause:** Git's ownership check fails in container environments where the workspace directory is owned by a different user than the one running git commands.
- **Resolution:** Set `HOME=/home/node` environment variable prefix for git commands and added safe.directory config.
- **Prevention:** In container environments, always set `HOME=/home/node` before git commands. Add this to the project's Git Notes in `project-context.md`.

#### GIT-002: User couldn't access workspace filesystem to view skill files
- **Severity:** minor
- **First seen:** Session 002 (Action #5)
- **Occurrences:** 1 (Session 002)
- **Root cause:** The workspace filesystem is only accessible to the agent within the container — the user cannot browse it directly.
- **Resolution:** Committed and pushed files to git so the user could view them via GitHub.
- **Prevention:** When creating files the user needs to review, commit and push them immediately rather than assuming the user can see the workspace filesystem.

### Performance

#### PERF-001: Lottie animation loading too slowly
- **Severity:** minor
- **First seen:** Session 001 (Action #6)
- **Occurrences:** 1 (Session 001)
- **Root cause:** The `delayed.js` timeout was set to 3000ms (3 seconds), which made Lottie animations appear sluggish even though the delay was intentional for performance.
- **Resolution:** Reduced `delayed.js` timeout from 3000ms to 1500ms.
- **Prevention:** When configuring animation load delays, use 1.5s as the baseline — long enough to protect LCP but short enough to feel responsive.

### File Sync

#### SYNC-001: SKILL.html write failed — file modified by linter since last read
- **Severity:** minor
- **First seen:** Session 003 (Action #3)
- **Occurrences:** 1 (Session 003)
- **Root cause:** The project file watcher auto-regenerates `.html` and `.plain.html` files when the corresponding `.md` file is edited. Attempting to manually write the HTML file after editing the markdown caused a conflict because the watcher had already regenerated it.
- **Resolution:** Stopped manually writing HTML variants — let the file watcher handle auto-regeneration.
- **Prevention:** Never manually write `.html` or `.plain.html` files that have a `.md` source. The file watcher owns these outputs. After editing markdown, verify the HTML was auto-regenerated by checking timestamps.

## Statistics

- **Total problems tracked:** 6
- **Resolved:** 6 (100%)
- **Unresolved:** 0
- **Patterns identified:** 1 (content platform transforms file references)
- **Categories:** 4 (DA compatibility, Git/environment, Performance, File sync)
- **Most problematic category:** DA compatibility (2 problems, highest severity: blocker)
