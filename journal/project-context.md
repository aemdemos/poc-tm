# Project Context — Zelis.com EDS Migration

**Last updated:** 2026-03-11 (Session 073)
**Branch:** `main`
**Repository:** https://github.com/aemdemos/poc-tm.git
**Source site:** https://www.zelis.com/ (370 cataloged URLs, WordPress)
**Overall status:** PRs #44, #56, #57 all merged to main. 4 template CSS issues complete (#49 company-utility, #52 built-for-audience, #50 gated-resource, #53 case-study). 1 remaining: #51 solutions-page (41 pages, 49.6% desktop). Fresh regression data: avg 58.76% across all templates.

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
- **Issue #42 merged: Blog-article CSS** — Hero grid, author bio, body text, Related Posts. Desktop 85.4% (Session 042–050, PR #44 merged)
- **Issue #52 merged: Built-for-audience template CSS** — Eyebrow text, hero text width, section spacing (Session 055–061, PR #56 merged)
- **Issue #50 merged: Gated-resource template CSS** — Hero text 50% with cover image, dark cards, gold CTA links (Session 058, PR #56 merged)
- **Issue #53 merged: Case-study template CSS** — Quote blocks, decorative elements, gold CTA, import script rewrite. 95.8% section-level similarity (Sessions 062–070, PR #57 merged)
- **Regression re-run on main** — Fresh 16-test regression suite, avg 58.76% (Session 071)

## What's In Progress
- **Issue #51: Solutions-page template** — Analysis complete. 49.6% score is content gap, not CSS. Awaiting user decision on approach (CSS-only vs content re-import). Branch: `issue-51`

## What's Pending
- **CSS fixes for remaining template:** solutions-page (#51, 41 pages, 49.6% desktop / 18.7% mobile)
- **DA content update for /built-for** — Requires Adobe IMS authentication via da.live editor
- **Content authoring fixes:** Cookie Preferences + FDIC notice missing from CDN footer, category badges for Related Posts cards
- **Import 2 missing URLs** (2 news articles returned 404 during bulk import)
- **Per-page regression testing** (currently template-level only)
- **Investigate header/footer contribution to regression scores** — All templates depressed by shared component differences

## Active Blockers
- **DA content for /built-for needs block structure** — Current DA content is flat HTML without blocks. Requires Adobe IMS authentication to update via DA editor.

## Regression Scores (2026-03-11, main branch)

| Template | Desktop | Mobile | Avg |
|----------|---------|--------|-----|
| blog-article | 85.4% | 79.2% | 82.3% |
| built-for-audience | 57.7% | 84.9% | 71.3% |
| case-study | 57.3% | 70.2% | 63.8% |
| company-utility | 66.6% | 50.2% | 58.4% |
| branded-landing | 58.5% | 68.2% | 63.3% |
| homepage | 62.9% | 58.5% | 60.7% |
| gated-resource | 40.8% | 31.5% | 36.2% |
| solutions-page | 49.6% | 18.7% | 34.2% |

*Note: Full-page regression includes header/footer/scroll-reveal. Section-level comparisons (e.g. case-study 95.8%) are more accurate for CSS quality.*

## Key Files
- `customer-preview-urls.md` — Customer-facing URL list: 367 pages grouped by template
- `readiness-tracker.json` / `readiness-tracker.md` — Migration readiness dashboard (370 pages)
- `styles/styles.css` — Global styles with design tokens + all template CSS
- `blocks/cards/cards.js` — Card grid + counter animation with prefix support
- `blocks/header/header.js` / `header.css` — Mega-menu navigation
- `scripts/delayed.js` — Lottie loader with data-loaded-by attribution
- `tools/importer/import-case-study.js` — Import script with content-based section classifier
- `journal/` — Project journal directory

## Critical Warning
- **NEVER use `convert-all-md.js`** for EDS content files — it corrupts block HTML
- **`aem up` proxies content from remote CDN** — local content files in `content/` are NOT used for preview
- **Scroll-reveal hides content in screenshots** — Override `.scroll-reveal { opacity: 1; transform: none; }` before capturing full-page screenshots
- **Full-page regression ≠ CSS quality** — Header/footer/animation timing depress scores. Use section-level comparison for accurate template CSS assessment.

## Git Notes
- Remote: `https://github.com/aemdemos/poc-tm.git`
- Must use `HOME=/home/node` prefix for git commands
- GitHub PAT provided by user at runtime
- `content/` directory excluded from git (`.git/info/exclude`)

## Resume Point
> Session 073 completed. Issue #51 deep analysis done. The 49.6% regression score is a content import gap, not CSS. Bulk import stripped interactive WordPress components (Solution Finder widget, Lottie animations, accordions, carousels). CSS already matches for existing content. Awaiting user decision: (1) CSS-only (+5-10%), (2) content re-import with dedicated import script (expected 80%+), or (3) change regression test URL. Branch: `issue-51`.
