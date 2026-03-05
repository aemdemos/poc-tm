# Project Context — Zelis.com EDS Migration

**Last updated:** 2026-03-05 (Session 023)
**Branch:** `main`
**Repository:** https://github.com/aemdemos/poc-tm.git
**Source site:** https://www.zelis.com/ (370 cataloged URLs, WordPress)
**Overall status:** Execution plan Steps 1–5 complete. PR #16 open. Homepage has Careers section, updated awards. Ready for new block development (Step 6).

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
- **P0-1 resolved: let-care-flow re-migrated** — Hero, Carousel (5 slides), Cards, Columns blocks; no duplicate sections (Session 022)
- **P1-4 resolved: Careers section added** — "Find your purpose in ours." with Columns block, 2 CTAs, Lottie placeholder (Session 023)
- **P2-5 resolved: Award badges updated** — 4 images switched to 2025 zelis.com URLs, subtitle corrected (Session 023)

## What's In Progress
- (nothing actively in progress — between sessions)

## What's Pending
- **P2-6** — Add animated SVG icons to "We Are Zelis" feature cards (needs custom block development)
- **P1-5/P1-6** — Video hero and image slider blocks for let-care-flow
- **P2-7** — Footer featured resource card images
- **P2-8** — Mega-menu navigation
- **P2-9** — Gold mark highlight for "Care" in let-care-flow headings
- **P2-10** — Case study card + two-column CTA layout for let-care-flow
- **Issue #4** — Bulk page migration (370 URLs, catalog ready)
- **W2** — Automated style regression (Playwright screenshot diff)
- **Columns Lottie support** — Careers section right column needs Lottie rendering (future enhancement)

## Active Blockers
- (none currently)

## Key Files
- `content/index.md` — Homepage with 9 sections including Careers (not in git — content excluded)
- `content/let-care-flow.md` — Re-migrated page with Hero, Carousel, Cards, Columns blocks (not in git)
- `styles/styles.css` — Global styles with design tokens (body 18px, h3 weight 500)
- `blocks/footer/footer.css` — Footer styling (h5 19px, links 18px)
- `docs/style-survey-report.md` — Comprehensive style survey (43 items, 14 categories, 13-step plan)
- `docs/validation-checklist.md` — Page validation checklist (corrected weights and colors)
- `tools/importer/url-catalog.json` — 370 URLs in 20 batches for bulk import
- `tools/importer/bulk-import.js` — Bulk import script (uses url-catalog.json)
- `blocks/hero/hero.js` — Hero block with Lottie link detection
- `blocks/carousel/carousel.js` — Carousel block with slide navigation
- `blocks/footer/footer.js` — Footer with DOM reconstruction, image injection
- `journal/` — Project journal directory

## Git Notes
- Remote: `https://github.com/aemdemos/poc-tm.git`
- Must use `HOME=/home/node` prefix for git commands
- GitHub PAT provided by user at runtime
- `content/` directory excluded from git (`.git/info/exclude`)

## Resume Point
> Execution plan Steps 1–5 complete. P1-4 (Careers), P2-5 (award badges) resolved in Session 023. P2-6 (We Are Zelis animated SVG icons) deferred — needs custom block. Next: Step 6 — new blocks (P1-5 video hero, P1-6 image slider for let-care-flow). PR #16 still open. Bulk import (Step 9) unblocked by URL catalog.
