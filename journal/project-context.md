# Project Context — Zelis.com EDS Migration

**Last updated:** 2026-03-04 (Session 016)
**Branch:** `main`
**Repository:** https://github.com/aemdemos/poc-tm.git
**Source site:** https://www.zelis.com/ (~789 URLs, WordPress)
**Overall status:** Mid migration — homepage complete with design tokens, nav, footer, and block styling. Bulk page migration pending.

## What's Done
- Repository initialized and configured (Session 000)
- Initial block set imported: 9+ blocks including hero, cards, header (Session 000)
- Hero Lottie animation working with link-based DA authoring pattern (Session 001)
- DA URL mangling workaround: match by text content, not href (Session 001)
- Animation load time optimized: delayed.js at 1.5s (Session 001)
- Animation migration skill: 5-phase workflow, Pattern A-G, decision tree (Session 002)
- Animation verification framework: 45 criteria, automated check script (Session 002)
- All skill files reconciled — .md, .html, .plain.html in sync (Session 003)
- Journaling skill v1.1, problem tracker v2.0, time tracking v1.1, status checkup v1.2 (Sessions 003-010)
- issue-1-styles-bulk branch merged to main with skill imports (Session 011, PR #9)
- **Design token extraction** — colors, fonts, spacing extracted and applied to styles.css (Session 012, PR #10)
- **Navigation setup** — header CSS refined, nav.plain.html rebuilt with zelis.com structure (Session 013, PR #11)
- **Block styling with design tokens** — hardcoded values replaced across cards, resource-list, search blocks (Session 014, PR #12)
- **Footer implementation** — full 3-section footer with DA content handling, image injection, social icons (Session 015, PR #13)
- Journal backfill (Sessions 011-015) and journal reminder Stop hook (Session 016)

## What's In Progress
- (nothing actively in progress — between sessions)

## What's Pending
- **Issue #1** — Bulk import of page styles
- **Issue #4** — Bulk page migration (~789 URLs remain beyond homepage)
- **Issue #7** — Additional page migrations
- **Issue #8** — Verification test harness false-positives (TEST-001, TEST-002)

## Active Blockers
- (none currently)

## Key Files
- `blocks/hero/hero.js` — Hero block with Lottie link detection
- `blocks/footer/footer.js` — Footer with DOM reconstruction, image injection, social icons
- `blocks/footer/footer.css` — Footer styling with class-based selectors
- `blocks/header/header.css` — Navigation styling
- `scripts/delayed.js` — Lottie loader (1.5s timeout)
- `scripts/scripts.js` — Main scripts including scroll-reveal init
- `styles/styles.css` — Global styles with design tokens
- `styles/lazy-styles.css` — Scroll-reveal and animation CSS
- `nav.plain.html` — Navigation structure
- `journal/` — Project journal directory
- `journal/problems-reference.md` — Problems reference (11 problems, 6 categories)
- `.claude/skills/hooks/journal-reminder.js` — Stop hook for journal reminders
- `.claude/settings.json` — Project-level hook registration

## Git Notes
- Remote: `https://github.com/aemdemos/poc-tm.git`
- Must use `HOME=/home/node` prefix for git commands
- GitHub PAT provided by user at runtime (do not store in committed files)

## Resume Point
> Journal fully caught up through Session 016. Journal reminder hook active. Four open issues remain: #1 (bulk page styles), #4 (bulk page migration), #7 (additional page migrations), #8 (test harness false-positives). Next: pick which open issue to tackle.
