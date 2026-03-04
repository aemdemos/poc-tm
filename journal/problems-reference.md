# Problems Reference — Zelis EDS Migration

> Referential index of problems encountered (from the project journal), their
> resolutions, and how to avoid them. Updated by the problem tracker skill.

**Source:** `journal/journal.md`
**Last review:** 2026-03-04 (after Session 015 backfill)

---

## Quick Reference — Prevention Checklists

### DA / URL and Path Mangling
- [ ] Match DA links by `a.textContent`, never by `a.href` — DA mangles dots to hyphens in href attributes (DA-001)
- [ ] After renaming files, grep for all references to the old name across the project (DA-002)
- [ ] DA strips `<picture>`, external `<img>` URLs, nested `<div>`s, and `<span class="icon">` — reconstruct in JS (DA-003)
- [ ] DA strips even plain `<img>` tags with external URLs — use JS-based image injection with slug lookup (DA-004)

### DA / Icon and SVG Handling
- [ ] Only call `decorateIcons()` when new icon spans are actually added — avoid duplicate SVG injection (DA-005)

### Git / Environment
- [ ] Set `HOME=/home/node` before first git command in container environments (GIT-001)
- [ ] Commit and push files immediately when the user needs to review them — don't assume workspace filesystem access (GIT-002)

### Performance / Loading
- [ ] Set `delayed.js` timeout to 1.5s — the 3s default is too slow for perceived animation load (PERF-001)

### File Sync / Auto-Generation
- [ ] Never manually write `.html` or `.plain.html` files that have a `.md` source — let the file watcher own them (SYNC-001)

### Test Harness / Verification
- [ ] Use async scroll with pauses (200-400ms per step) when testing IO-dependent animations — sync loops don't trigger observers (TEST-001)
- [ ] Verify script load phase by timing or source attribution, not by DOM parent element (TEST-002)

---

## DA / URL and Path Mangling

| Problem | ID | Cause | Resolution | How to avoid | Sessions | Severity | Resolved? |
|---------|----|-------|------------|--------------|----------|----------|-----------|
| DA converts dots to hyphens in hrefs (`.json` → `-json`) | DA-001 | DA rewrites URLs; dots in hrefs normalized to hyphens | Match links by `a.textContent.trim().endsWith('.json')`, never by `a.href` | For any link whose display text is a file path: always use `a.textContent.trim()` to detect file type. Never use `a.getAttribute('href')` for paths in DA-authored content. | 001 | blocker | yes |
| SKILL.md referenced non-existent file (`animation-verification-criteria.md`) | DA-002 | File renamed during development (`animation-verification.md`); reference in SKILL.md not updated | Updated reference to point to actual filename `animation-verification.md` | After creating or renaming files, grep for all references to the old name across the project. Verify cross-references in skill files point to actual filenames on disk. | 003 | major | yes |

| DA flattens footer HTML — strips images, icons, nested divs | DA-003 | DA content pipeline simplifies HTML; removes `<picture>`, external `<img>`, nested `<div>`, `<span class="icon">` | Rewrote footer.js to reconstruct DOM from flat content using wrapGroups() delimiter-based grouping | When building blocks that rely on complex HTML structure, assume DA will flatten it. Design JS to reconstruct structure from flat content (headings as delimiters, text labels as markers). | 015 | blocker | yes |
| DA strips even plain `<img>` tags with external URLs | DA-004 | DA content pipeline removes `<img>` tags referencing external domains | Implemented injectFeaturedImages() with FEATURED_THUMBNAILS slug→URL map in footer.js | For images that DA will strip, use JS-based injection with a slug or identifier lookup. Key images by a stable identifier (e.g., article slug from link href) rather than position. | 015 | major | yes |
| decorateIcons called twice causing duplicate SVG images | DA-005 | Fragment loader pipeline calls decorateIcons internally; explicit call in footer.js doubled the SVGs | Track whether new icons were added (return value from decorateBottomBar); only call decorateIcons when iconsAdded is true | When injecting `.icon` spans dynamically, check if decorateIcons will be called by the loading pipeline. Only call it explicitly when your code adds new icon spans that the pipeline hasn't seen. | 015 | minor | yes |

**Recurring:** Yes — DA content handling is a recurring theme (DA-001, DA-003, DA-004 all involve DA transforming content)
**Notes:** DA-001 documented in `skills/excat-animate-migration/SKILL.md`. DA-003/004/005 documented in footer.js implementation. Core pattern: DA simplifies HTML aggressively — always plan for JS-based reconstruction.

---

## Git / Environment

| Problem | ID | Cause | Resolution | How to avoid | Sessions | Severity | Resolved? |
|---------|----|-------|------------|--------------|----------|----------|-----------|
| Git `safe.directory` error on first git operation | GIT-001 | Git ownership check fails in container environments where workspace is owned by a different user | Set `HOME=/home/node` env prefix for git commands; added safe.directory config | Always set `HOME=/home/node` before git commands in container environments. Add this to project Git Notes in `project-context.md`. | 002 | minor | yes |
| User couldn't access workspace filesystem to view skill files | GIT-002 | Workspace filesystem only accessible to agent within container; user cannot browse it directly | Committed and pushed files to git so user could view via GitHub | When creating files the user needs to review, commit and push immediately rather than assuming workspace access. | 002 | minor | yes |

**Recurring:** No
**Notes:** Both relate to the container environment's access constraints. GIT-001 fix is documented in `project-context.md` Git Notes.

---

## Performance / Loading

| Problem | ID | Cause | Resolution | How to avoid | Sessions | Severity | Resolved? |
|---------|----|-------|------------|--------------|----------|----------|-----------|
| Lottie animation loading too slowly (3s delay) | PERF-001 | `delayed.js` timeout set to 3000ms — perceptibly sluggish even though delay was intentional for LCP protection | Reduced `delayed.js` timeout from 3000ms to 1500ms | When configuring animation load delays, use 1.5s as baseline — long enough to protect LCP but short enough to feel responsive. Ensure container has dimensions so layout doesn't shift when SVG injects. | 001 | minor | yes |

**Recurring:** No
**Notes:** Fix applied in `scripts/delayed.js`.

---

## File Sync / Auto-Generation

| Problem | ID | Cause | Resolution | How to avoid | Sessions | Severity | Resolved? |
|---------|----|-------|------------|--------------|----------|----------|-----------|
| SKILL.html write failed — file modified by linter since last read | SYNC-001 | Project file watcher auto-regenerates `.html` and `.plain.html` when `.md` is edited; manual write conflicted with watcher | Stopped manually writing HTML variants; let file watcher handle auto-regeneration | Never manually write `.html` or `.plain.html` files that have a `.md` source. The file watcher owns these outputs. After editing markdown, verify HTML was auto-regenerated by checking timestamps. | 003 | minor | yes |

**Recurring:** No
**Notes:** File watcher behavior documented in Session 003, Key Decisions.

---

## Test Harness / Verification

| Problem | ID | Cause | Resolution | How to avoid | Sessions | Severity | Resolved? |
|---------|----|-------|------------|--------------|----------|----------|-----------|
| Verification sync scroll doesn't trigger IntersectionObservers | TEST-001 | Synchronous `for` loop scroll doesn't give IO callbacks time to fire; elements never receive `.is-visible` | (unresolved) — needs async scrolling with `await page.waitForTimeout()` between steps | Use async scroll with pauses (200-400ms per step) when testing IO-dependent animations. Never use synchronous scroll loops for verification. | 009 | minor | no |
| F-DELAYED check false positive — dynamic scripts placed in `<head>` | TEST-002 | Check uses `lottieScript.closest('head')` but browsers may place dynamically injected `<script>` tags in `<head>` regardless of injection method | (unresolved) — should verify load timing or check `delayed.js` source, not DOM placement | When checking script load phase, verify by load timing or source attribution, not by DOM parent element. | 009 | minor | no |

**Recurring:** No
**Notes:** Both relate to the animation verification test harness (verify-animations.js). The underlying animations work correctly — these are false positives in the detection logic.
