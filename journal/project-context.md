# Project Context — Zelis.com EDS Migration

**Last updated:** 2026-03-05 (Session 019)
**Branch:** `issue-1-style-refinement`
**Repository:** https://github.com/aemdemos/poc-tm.git
**Source site:** https://www.zelis.com/ (~789 URLs, WordPress)
**Overall status:** Comprehensive style survey complete (43 items, 14 categories). Homepage ~85% matched. Ready for quick CSS fixes and Issue #1 PR.

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
- **Issue #1 style fixes (Session 017):** awards layout, carousel, tabs, section spacing, serif tokenization, docs
- **Style survey (Session 018):** Comprehensive visual audit of homepage + let-care-flow vs original
- **Merged style survey report (Session 019):** Combined computed-style data with architectural analysis into 43-item comprehensive document

## What's In Progress
- Issue #1 changes on `issue-1-style-refinement` branch (committed as `20fef05`, not yet PR'd)
- Style survey report at `docs/style-survey-report.md`

## What's Pending
- **Quick CSS fixes** — body font-size clamp max 20→18px, h3 weight 600→500, footer h5/link sizes (P1-1, T2, P2-3, P2-4)
- **Checklist corrections** — T1 (h1/h2 weight 500 not 700), L1 (bright-blue #320FFF not #4300FF)
- **Issue #1 PR** — Create PR for all Issue #1 changes
- **P0-1: Re-migrate let-care-flow** — Page has critical duplication issues, needs fresh migration
- **P1-4: Add careers section** — "Find your purpose in ours" missing from homepage
- **P1-5/P1-6: New blocks** — Video hero and image slider for let-care-flow
- **P2-5 to P2-10: Medium priority fixes** — Award images, We Are Zelis images, mega-menu, etc.
- **W1: URL catalog** — Restore/create url-catalog.json for bulk import
- **Issue #4** — Bulk page migration (~789 URLs remain beyond homepage)
- **Issue #7** — Additional page migrations
- **Issue #8** — Verification test harness false-positives (TEST-001, TEST-002)

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
- `docs/style-survey-report.md` — Comprehensive style audit: 43 items, 14 categories, 13-step execution plan
- `docs/validation-checklist.md` — QA checklist for page validation
- `journal/` — Project journal directory

## Git Notes
- Remote: `https://github.com/aemdemos/poc-tm.git`
- Must use `HOME=/home/node` prefix for git commands
- GitHub PAT provided by user at runtime (do not store in committed files)

## Resume Point
> Comprehensive style survey report complete (43 items, 14 categories). Button fixes confirmed already done in Session 017. Next per execution order: (1) quick CSS fixes — P1-1 body font-size, T2 h3 weight, P2-3/P2-4 footer sizes, (2) checklist corrections — T1, L1, (3) create Issue #1 PR, (4) re-migrate let-care-flow (P0-1).
