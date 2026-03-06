# Project Context — Zelis.com EDS Migration

**Last updated:** 2026-03-06 (Session 035)
**Branch:** `issue-34`
**Repository:** https://github.com/aemdemos/poc-tm.git
**Source site:** https://www.zelis.com/ (370 cataloged URLs, WordPress)
**Overall status:** Style regression test infrastructure implemented. PR #35 open for review.

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
- **PR #16 open** — All Issue #1 style changes on `issue-1-style-refinement-2`
- **URL catalog created** — 370 URLs in 20 batches, 7 templates (Session 021)
- **P0-1 resolved: let-care-flow re-migrated** — Hero, Carousel, Cards, Columns blocks (Session 022)
- **P1-4 resolved: Careers section added** — Columns block, 2 CTAs, Lottie placeholder (Session 023)
- **P2-5 resolved: Award badges updated** — 4 images switched to 2025 URLs (Session 023)
- **P1-5 resolved: Video hero block** — `blocks/video-hero/` with Vimeo/YouTube iframe injection (Session 024)
- **P1-6 resolved: Image slider block** — `blocks/image-slider/` with CSS scroll-snap, 5s autoplay (Session 024)
- **Issue #19: Bulk site import** — 365 pages imported across 20 batches with HTML pipeline (Session 025)
- **P2-9 resolved: Gold highlight** — `main h1/h2/h3 em` styled gold `#FFBE00` in styles.css (Session 026, Issue #21)
- **P2-10 resolved: Case study card + HR** — Single-card :only-child horizontal layout with purple border, HR styling (Session 027, Issue #23)
- **P2-6 resolved: Animated SVG icons** — 3 inline SVGs with stroke-draw animation via IntersectionObserver in cards block (Session 029, Issue #25, PR #26)
- **P2-7 resolved: Footer featured resource card images** — Added Forrester Wave slug to FEATURED_THUMBNAILS map (Session 031, Issue #27, PR #28)
- **P2-8 resolved: Mega-menu navigation** — Full-width panels, announcement bar, hover/accordion, 5 panel layouts (Session 033, Issue #29, PR #30)
- **W2 resolved: Style regression tests** — Playwright screenshot diff, pixelmatch, 8 templates × 2 viewports (Session 035, Issue #34, PR #35)

## What's In Progress
(nothing active)

## What's Pending
- **Issue #31** — Accordion block JS error on solutions pages
- **Issue #32** — Add Lottie animation support to Columns block
- **Issue #33** — let-care-flow page blocks not rendering (CDN pipe-table parsing)

## Active Blockers
(none)

## Key Files
- `styles/styles.css` — Global styles with design tokens + gold highlight + HR styling
- `blocks/header/header.js` — Mega-menu: panel builder, hover/accordion, announcement bar detection
- `blocks/header/header.css` — Mega-menu: panels-container, solutions grid, categories, mobile accordion, overlay
- `nav.plain.html` — Enriched navigation with intro descriptions, solution cards, category groups
- `blocks/cards/cards.css` — Card grid with single-card case study variant (:only-child) + icon-cards animated SVGs
- `blocks/columns/columns.css` — Flexible columns with 58/42 desktop split
- `tools/importer/bulk-import.js` — Bulk import script with markdownToEdsHtml() HTML pipeline
- `tools/importer/url-catalog.json` — 370 URLs in 20 batches
- `playwright.config.js` — Style regression test config (desktop 1440px, mobile 375px)
- `tests/style-regression/` — Screenshot diff test suite, compare helper, report generator
- `content/` — 367 .md + 369 .html files (excluded from git)
- `journal/` — Project journal directory

## Critical Warning
- **NEVER use `convert-all-md.js`** for EDS content files — it corrupts block HTML
- **`aem up` proxies content from remote CDN** — local content files in `content/` are NOT used for preview

## Git Notes
- Remote: `https://github.com/aemdemos/poc-tm.git`
- Must use `HOME=/home/node` prefix for git commands
- GitHub PAT provided by user at runtime
- `content/` directory excluded from git (`.git/info/exclude`)

## Resume Point
> PR #35 open for Issue #34 (W2 style regression). Remaining issues: #31 accordion block fix, #32 Columns Lottie, #33 let-care-flow CDN content.
