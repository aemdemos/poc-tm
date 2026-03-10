# Project Context — Zelis.com EDS Migration

**Last updated:** 2026-03-10 (Session 061)
**Branch:** `issue-52-2`
**Repository:** https://github.com/aemdemos/poc-tm.git
**Source site:** https://www.zelis.com/ (370 cataloged URLs, WordPress)
**Overall status:** 4 template CSS issues: 3 complete (#49 company-utility, #52 built-for-audience, #50 gated-resource), 1 remaining (#51 solutions-page), plus #53 case-study. PR #56 open for Issues #52 + #50. Built-for page fully animated (Lottie hero + counter stats). DA sync still blocked on Adobe IMS auth.

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
- **Issue #33 resolved: let-care-flow blocks rendering** — ASCII border table parsing in bulk-import.js, regenerate-plain-html.js utility (Session 036, PR #36)
- **Issue #31 resolved: Accordion block JS crash** — Defensive guard for malformed rows with < 2 children (Session 037, PR #37)
- **Issue #32 resolved: Columns Lottie support** — .json link detection, href-based path, p-wrapper replacement (Session 038, PR #38)
- **Issue #8 resolved: Verification test harness false-positives** — Async scroll for IO, data-loaded-by attribute for F-DELAYED (Session 039, PR #39)
- **Page readiness tracker** — JSON + Markdown dual-format dashboard, 370 pages tracked (Session 040)
- **Issue #42 resolved: Blog-article CSS** — Hero grid, author bio, body text, Related Posts, scroll-reveal test fix. Desktop 70.5% → 85.2% (Session 042, PR #44)
- **Blog-article CSS refinement** — Multiple sessions improving diagonal stripes, author bio, spacing (Sessions 043–047, PR #44)
- **Issue #52 resolved: Built-for-audience template CSS** — Eyebrow text, hero text width, section spacing, metadata hiding (Session 055, PR #56)
- **Issue #50 resolved: Gated-resource template CSS** — Hero text 50% with cover image, dark cards, gold CTA links (Session 058, PR #56)
- **Issue #52 CSS refinement** — 4 computed-style fixes: audience padding, card body size, stats weight/padding (Session 059, PR #56)
- **Built-for content re-authored** — Import script debugged: Slick carousel timing, H2 br handling (Session 060)
- **Built-for animations** — Lottie hero (local JSON) + counter stats ($100M+, $229B+, $27B+) with prefix regex fix in cards.js (Session 061)

## What's In Progress
- PR #44 open for Issue #42 (blog-article CSS fixes) — needs `extractMetadataFromDOM()` re-applied before merge
- PR #56 open for Issues #52 + #50 (built-for-audience + gated-resource template CSS) — CSS complete, DA content blocked

## What's Pending
- **Commit animation changes** — cards.js counter prefix fix + animations/built-for-hero.json not yet committed
- **DA content update for /built-for** — Requires Adobe IMS authentication via da.live editor
- **Re-apply `extractMetadataFromDOM()` to scripts.js** — critical JS fix lost from external commits on issue-42
- **Reconcile author bio font** — external commits set 14px, original target was 12px
- **Merge PR #44 to main** — blog-article CSS work complete once JS fix re-applied
- **Refresh readiness tracker** after PR #44 merge
- **Content authoring fixes:** Cookie Preferences + FDIC notice missing from CDN footer, category badges for Related Posts cards
- **CSS fixes for remaining templates:** solutions-page (#51, 41 pages), case-study (#53, 7 pages)
- **Import 3 missing URLs** (2 news articles, 1 case study returned 404 during bulk import)
- **Per-page regression testing** (currently template-level only)

## Active Blockers
- **DA content for /built-for needs block structure** — Current DA content is flat HTML without blocks. Requires Adobe IMS authentication to update via DA editor. Correct block structure exists in both `content/built-for.html` and `content/built-for.plain.html`.

## Key Files
- `customer-preview-urls.md` — Customer-facing URL list: 367 pages grouped by template
- `readiness-tracker.json` / `readiness-tracker.md` — Migration readiness dashboard (370 pages)
- `styles/styles.css` — Global styles with design tokens + template CSS
- `blocks/cards/cards.js` — Card grid + counter animation with prefix support (`$` prefix, easeOutCubic)
- `blocks/cards/cards.css` — Card grid with single-card case study variant + icon-cards animated SVGs
- `blocks/columns/columns.js` — Lottie .json link detection + container creation
- `blocks/header/header.js` / `header.css` — Mega-menu navigation
- `scripts/delayed.js` — Lottie loader with data-loaded-by attribution
- `animations/built-for-hero.json` — 1.1MB Lottie JSON for built-for hero section
- `content/built-for.html` — Reference content with correct block structure + local Lottie path
- `tools/importer/import-built-for-audience.js` — Import script for /built-for hub page
- `journal/` — Project journal directory

## Critical Warning
- **NEVER use `convert-all-md.js`** for EDS content files — it corrupts block HTML
- **`aem up` proxies content from remote CDN** — local content files in `content/` are NOT used for preview
- **Scroll-reveal hides content in screenshots** — Override `.scroll-reveal { opacity: 1; transform: none; }` before capturing full-page screenshots

## Git Notes
- Remote: `https://github.com/aemdemos/poc-tm.git`
- Must use `HOME=/home/node` prefix for git commands
- GitHub PAT provided by user at runtime
- `content/` directory excluded from git (`.git/info/exclude`)

## Resume Point
> Both animations working on built-for page (Session 061). Lottie hero renders via delayed.js + columns.js, counter stats animate via updated cards.js regex with prefix support. Changes to cards.js and animations/built-for-hero.json should be committed to branch issue-52-2. Next priorities: commit animation changes, then #51 (solutions-page CSS, 41 pages), #53 (case-study CSS, 7 pages). Also pending: re-apply extractMetadataFromDOM() JS fix before merging PR #44.
