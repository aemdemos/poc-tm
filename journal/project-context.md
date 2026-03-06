# Project Context — Zelis.com EDS Migration

**Last updated:** 2026-03-06 (Session 030)
**Branch:** `issue-25`
**Repository:** https://github.com/aemdemos/poc-tm.git
**Source site:** https://www.zelis.com/ (370 cataloged URLs, WordPress)
**Overall status:** Bulk import complete (365 pages). Issue #25 (P2-6 animated SVG icons) — PR #26 open.

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
- **Issue #19 pushed** — `issue-19-reimports` branch pushed to remote (Session 026)
- **P2-9 resolved: Gold highlight** — `main h1/h2/h3 em` styled gold `#FFBE00` in styles.css (Session 026, Issue #21)
- **P2-10 resolved: Case study card + HR** — Single-card :only-child horizontal layout with purple border, HR styling (Session 027, Issue #23)
- **P2-6 researched** — Full problem statement written: 3 inline SVGs with stroke-drawing animation, IntersectionObserver trigger (Session 028)
- **P2-6 resolved: Animated SVG icons** — 3 inline SVGs with stroke-draw animation via IntersectionObserver in cards block (Session 029, Issue #25)

## What's In Progress
(nothing active)

## What's Pending
- **PR #26 merge** — Merge PR for Issue #25 (animated SVG icons)
- **P2-7** — Footer featured resource card images
- **P2-8** — Mega-menu navigation
- **W2** — Automated style regression (Playwright screenshot diff)
- **Columns Lottie support** — Careers section right column needs Lottie rendering
- **Accordion block fix** — JS error on solutions pages (pre-existing)
- **let-care-flow remote content fix** — Remote CDN .plain.html has broken pipe-table parsing; blocks don't render

## Active Blockers
(none)

## Key Files
- `styles/styles.css` — Global styles with design tokens + gold highlight + HR styling
- `blocks/cards/cards.css` — Card grid with single-card case study variant (:only-child) + icon-cards animated SVGs
- `blocks/columns/columns.css` — Flexible columns with 58/42 desktop split
- `tools/importer/bulk-import.js` — Bulk import script with markdownToEdsHtml() HTML pipeline
- `tools/importer/url-catalog.json` — 370 URLs in 20 batches
- `content/` — 367 .md + 369 .html files (excluded from git)
- `blocks/video-hero/` — Video hero block (Vimeo/YouTube iframe injection)
- `blocks/image-slider/` — Image slider block (CSS scroll-snap, autoplay)
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
> PR #26 open for Issue #25 (animated SVG icons) on `issue-25` branch. All work pushed. Next: merge PR #26, then continue with P2-7 (footer images), P2-8 (mega-menu), accordion block fix, or other backlog items.
