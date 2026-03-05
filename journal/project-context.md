# Project Context — Zelis.com EDS Migration

**Last updated:** 2026-03-05 (Session 020)
**Branch:** `issue-1-style-refinement-2`
**Repository:** https://github.com/aemdemos/poc-tm.git
**Source site:** https://www.zelis.com/ (~789 URLs, WordPress)
**Overall status:** Style plan Steps 1–3 complete. Quick CSS fixes applied, checklist corrected, PR #16 open. Ready for let-care-flow re-migration.

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
- **Quick CSS fixes + PR (Session 020):** body 18px, h3 weight 500, footer h5 19px, footer links 18px, checklist corrections, PR #16

## What's In Progress
- PR #16 open on `issue-1-style-refinement-2` — awaiting review/merge

## What's Pending
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
- `styles/styles.css` — Global styles with design tokens, section variants
- `blocks/footer/footer.css` — Footer with corrected h5/link font sizes
- `blocks/tabs/tabs.css` — Tab button sizing (auto-width, no truncation)
- `blocks/columns/columns.css` — Testimonial image constraint
- `blocks/hero/hero.css` — Hero block with eyebrow serif font token
- `blocks/cards/cards.js` — Counter animation (750+, 850k+, 120M)
- `blocks/footer/footer.js` — Footer with DOM reconstruction
- `docs/style-survey-report.md` — Comprehensive style audit: 43 items, 14 categories, 13-step execution plan
- `docs/validation-checklist.md` — QA checklist (corrected: h1/h2 500, bright-blue #320FFF)
- `journal/` — Project journal directory

## Git Notes
- Remote: `https://github.com/aemdemos/poc-tm.git`
- Must use `HOME=/home/node` prefix for git commands
- GitHub PAT provided by user at runtime (do not store in committed files)

## Resume Point
> Steps 1–3 of execution plan complete. PR #16 open. Next: Step 4 — re-migrate let-care-flow page (P0-1), then Step 5 — homepage content fixes (P1-4 careers section, P2-5/P2-6 missing images).
