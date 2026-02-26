# Project Context — Zelis.com EDS Migration

**Last updated:** 2026-02-26 (Session 004)
**Branch:** `issue-1-styles-bulk`
**Repository:** https://github.com/aemdemos/poc-tm.git
**Source site:** https://www.zelis.com/ (~789 URLs, WordPress)
**Overall status:** Early migration — homepage blocks functional, animation skill built, tooling refined

## What's Done
- Repository initialized and configured (Session 000)
- Initial block set imported: 9+ blocks including hero, cards, header (Session 000)
- Hero Lottie animation working with link-based DA authoring pattern (Session 001)
- DA URL mangling workaround: match by text content, not href (Session 001)
- Animation load time optimized: delayed.js at 1.5s (Session 001)
- Animation migration skill: 5-phase workflow, Pattern A-G, decision tree (Session 002)
- Animation verification framework: 45 criteria, automated check script (Session 002)
- All skill files reconciled — .md, .html, .plain.html in sync (Session 003)
- Journaling skill created and project journal initialized (Session 003)
- Journaling skill v1.1: merged best practices, added rules, examples, portable template (Session 004)

## What's In Progress
- (nothing actively in progress — between sessions)

## What's Pending
- **Design token extraction** — Extract colors, fonts, spacing from zelis.com and apply to `styles/styles.css`
- **Navigation setup** — Build nav.md/nav.html from zelis.com site structure
- **Additional page migrations** — Only homepage is migrated; ~789 URLs remain
- **Block styling refinement** — Blocks exist but CSS doesn't match source site
- **Footer implementation** — footer.html was created in a prior session
- **Bulk import workflow** — Set up page templates and import scripts for remaining pages

## Active Blockers
- (none currently)

## Key Files
- `blocks/hero/hero.js` — Hero block with Lottie link detection
- `scripts/delayed.js` — Lottie loader (1.5s timeout)
- `scripts/scripts.js` — Main scripts including scroll-reveal init
- `styles/lazy-styles.css` — Scroll-reveal and animation CSS
- `styles/styles.css` — Global styles (needs design token population)
- `skills/excat-animate-migration/SKILL.md` — Animation migration skill
- `skills/excat-animate-migration/animation-verification.md` — Verification criteria
- `skills/excat-journaling/SKILL.md` — Journaling skill (v1.1)
- `skills/excat-journaling/journal-format.md` — Portable quick-reference template
- `journal/` — Project journal directory

## Git Notes
- Remote: `https://github.com/aemdemos/poc-tm.git`
- Must use `HOME=/home/node` prefix for git commands
- GitHub PAT provided by user at runtime (do not store in committed files)

## Resume Point
> Journaling skill v1.1 complete. Next priorities: design token extraction from zelis.com, navigation structure setup, or begin bulk page migration. User should indicate preferred next task.
