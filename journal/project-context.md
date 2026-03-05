# Project Context — Zelis.com EDS Migration

**Last updated:** 2026-03-05 (Session 021)
**Branch:** `issue-1-style-refinement-2`
**Repository:** https://github.com/aemdemos/poc-tm.git
**Source site:** https://www.zelis.com/ (370 cataloged URLs, WordPress)
**Overall status:** Style refinement complete, URL catalog created, PR #16 open. Ready for let-care-flow re-migration and bulk import.

## What's Done
- Repository initialized and configured (Session 000)
- Initial block set imported: 9+ blocks including hero, cards, header (Session 000)
- Hero Lottie animation working with link-based DA authoring pattern (Session 001)
- Animation migration skill, verification framework (Sessions 001–002)
- All skill files reconciled and merged (Sessions 003–010)
- issue-1-styles-bulk branch merged to main (Session 011, PR #9)
- **Design token extraction** — colors, fonts, spacing in styles.css (Session 012, PR #10)
- **Navigation setup** — header CSS, nav.plain.html (Session 013, PR #11)
- **Block styling with design tokens** — cards, resource-list, search blocks (Session 014, PR #12)
- **Footer implementation** — 3-section footer with DA handling (Session 015, PR #13)
- **Issue #1 style fixes** — awards, carousel, tabs, section spacing, font tokens (Session 017)
- **Style survey** — full computed-style audit, merged comprehensive report (Sessions 018–019)
- **Quick CSS fixes** — body 18px, h3 weight 500, footer h5 19px, footer links 18px (Session 020)
- **Checklist corrections** — h1/h2 weight 500, bright-blue #320FFF (Session 020)
- **PR #16 open** — All Issue #1 style changes on `issue-1-style-refinement-2`
- **URL catalog created** — 370 URLs in 20 batches, 7 templates at `tools/importer/url-catalog.json` (Session 021)

## What's In Progress
- (nothing actively in progress — between sessions)

## What's Pending
- **P0-1** — Re-migrate let-care-flow page (duplicate sections, missing video hero/image slider)
- **P1-4** — Restore careers section on homepage
- **P2-5/P2-6** — Fix award badge images, add "We Are Zelis" images
- **P1-5/P1-6** — Video hero and image slider blocks for let-care-flow
- **P2-7** — Footer featured resource card images
- **P2-8** — Mega-menu navigation
- **Issue #4** — Bulk page migration (370 URLs, catalog ready)
- **W2** — Automated style regression (Playwright screenshot diff)

## Active Blockers
- (none currently)

## Key Files
- `styles/styles.css` — Global styles with design tokens (body 18px, h3 weight 500)
- `blocks/footer/footer.css` — Footer styling (h5 19px, links 18px)
- `docs/style-survey-report.md` — Comprehensive style survey (43 items, 14 categories, 13-step plan)
- `docs/validation-checklist.md` — Page validation checklist (corrected weights and colors)
- `tools/importer/url-catalog.json` — 370 URLs in 20 batches for bulk import
- `tools/importer/bulk-import.js` — Bulk import script (uses url-catalog.json)
- `blocks/hero/hero.js` — Hero block with Lottie link detection
- `blocks/footer/footer.js` — Footer with DOM reconstruction, image injection
- `journal/` — Project journal directory

## Git Notes
- Remote: `https://github.com/aemdemos/poc-tm.git`
- Must use `HOME=/home/node` prefix for git commands
- GitHub PAT provided by user at runtime

## Resume Point
> URL catalog complete (370 URLs, 20 batches). PR #16 open for Issue #1 style fixes. Next per execution plan: Step 4 — re-migrate let-care-flow (P0-1), then Step 5 — homepage content fixes (careers section, missing images). Bulk import (Step 9) is now unblocked.
