# Project Context — Zelis.com EDS Migration

**Last updated:** 2026-03-05 (Session 017)
**Branch:** `issue-1-style-refinement`
**Repository:** https://github.com/aemdemos/poc-tm.git
**Source site:** https://www.zelis.com/ (~789 URLs, WordPress)
**Overall status:** Homepage styling complete — all sections match original. Bulk page migration pending.

## What's Done
- Repository initialized and configured (Session 000)
- Initial block set imported: 9+ blocks including hero, cards, header (Session 000)
- Hero Lottie animation working with link-based DA authoring pattern (Session 001)
- DA URL mangling workaround: match by text content, not href (Session 001)
- Animation migration skill, verification framework (Session 002)
- All skill files reconciled (Session 003)
- Journaling skill v1.1, problem tracker v2.0, time tracking v1.1, status checkup v1.2 (Sessions 003-010)
- issue-1-styles-bulk branch merged to main (Session 011, PR #9)
- **Design token extraction** — colors, fonts, spacing (Session 012, PR #10)
- **Navigation setup** — header CSS, nav.plain.html (Session 013, PR #11)
- **Block styling with design tokens** (Session 014, PR #12)
- **Footer implementation** — 3-section footer (Session 015, PR #13)
- Journal backfill and reminder hook (Session 016)
- **Issue #1 style fixes (Session 017):**
  - Infrastructure: `convert-all-md.js` reads `head.html` as single source of truth
  - Awards section: horizontal badge layout using `:has(> picture)` selector
  - Carousel/testimonials: image constrained to `max-height: 600px`
  - Tab buttons: auto-sized with `flex: 0 0 auto`, no truncation at 1440px
  - Section spacing: asymmetric padding (100px top / 48px bottom) matching original
  - Serif font: all 5 hardcoded references tokenized to `var(--serif-font-family)`
  - Documentation: head-contract.md, post-bulk-import.md, validation-checklist.md
  - Visual verification passed at 1440px, 768px, 375px

## What's In Progress
- Issue #1 changes on `issue-1-style-refinement` branch (not yet committed/PR'd)

## What's Pending
- **Issue #1 cleanup** — Commit changes, create PR
- **Issue #4** — Bulk page migration (~789 URLs remain beyond homepage)
- **Issue #7** — Additional page migrations
- **Issue #8** — Verification test harness false-positives (TEST-001, TEST-002)
- **Deferred from Issue #1:** P3 breakpoint alignment (900px vs 992px), h3 font-weight verification

## Active Blockers
- (none currently)

## Key Files
- `styles/styles.css` — Global styles with design tokens, section variants, awards layout
- `blocks/tabs/tabs.css` — Tab button sizing (auto-width, no truncation)
- `blocks/columns/columns.css` — Testimonial image constraint
- `blocks/hero/hero.css` — Hero block with eyebrow serif font token
- `blocks/cards/cards.js` — Counter animation (750+, 850k+, 120M)
- `blocks/footer/footer.js` — Footer with DOM reconstruction
- `tools/importer/convert-all-md.js` — Batch MD→HTML converter (reads head.html)
- `head.html` — Single source of truth for `<head>` content
- `docs/head-contract.md` — Documents the head.html contract
- `docs/post-bulk-import.md` — Post-import workflow
- `docs/validation-checklist.md` — QA checklist for page validation
- `scripts/scripts.js` — Main scripts including scroll-reveal init
- `journal/` — Project journal directory

## Git Notes
- Remote: `https://github.com/aemdemos/poc-tm.git`
- Must use `HOME=/home/node` prefix for git commands
- GitHub PAT provided by user at runtime (do not store in committed files)

## Resume Point
> Issue #1 style fixes complete on `issue-1-style-refinement` branch but not yet committed. Next: commit all changes, create PR for Issue #1, then move to Issue #4 (bulk page migration).
