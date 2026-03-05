# Project Context — Zelis.com EDS Migration

**Last updated:** 2026-03-05 (Session 024)
**Branch:** `issue-17-addtl-blocks`
**Repository:** https://github.com/aemdemos/poc-tm.git
**Source site:** https://www.zelis.com/ (370 cataloged URLs, WordPress)
**Overall status:** Execution plan Steps 1–6 complete. Video hero and image slider blocks implemented. Needs push to remote.

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
- **P1-5 resolved: Video hero block** — `blocks/video-hero/` with Vimeo/YouTube iframe injection, poster+gradient, expanded modal (Session 024)
- **P1-6 resolved: Image slider block** — `blocks/image-slider/` with CSS scroll-snap, 5s autoplay, prev/next arrows, IntersectionObserver (Session 024)
- **Step 6 plan documented** — `docs/step-6-new-blocks-plan.md` with content models, implementation details, acceptance criteria (Session 024)

## What's In Progress
- **Push pending** — `issue-17-addtl-blocks` branch has 2 commits (`b672a47`, `8233149`) that need manual push (no GitHub credentials in env)

## What's Pending
- **P2-6** — Add animated SVG icons to "We Are Zelis" feature cards (needs custom block development)
- **P2-7** — Footer featured resource card images
- **P2-8** — Mega-menu navigation
- **P2-9** — Gold mark highlight for "Care" in let-care-flow headings
- **P2-10** — Case study card + two-column CTA layout for let-care-flow
- **Issue #4** — Bulk page migration (370 URLs, catalog ready)
- **W2** — Automated style regression (Playwright screenshot diff)
- **Columns Lottie support** — Careers section right column needs Lottie rendering (future enhancement)
- **PR for issue-17-addtl-blocks** — Create PR after push

## Active Blockers
- **Git push** — No GitHub credentials in current environment; user must push manually

## Key Files
- `content/index.md` — Homepage with 9 sections including Careers (not in git — content excluded)
- `content/let-care-flow.md` — Updated with Video Hero + Image Slider blocks (not in git)
- `content/let-care-flow.html` — Manually written EDS block HTML (not in git)
- `blocks/video-hero/video-hero.js` — Two-column video hero with Vimeo/YouTube iframe injection
- `blocks/video-hero/video-hero.css` — Dark purple bg, gradient overlay, expanded modal, responsive
- `blocks/image-slider/image-slider.js` — Scroll-snap slider with autoplay, arrows, IntersectionObserver
- `blocks/image-slider/image-slider.css` — Full-width slides, arrow styling, responsive
- `docs/step-6-new-blocks-plan.md` — Implementation plan for both blocks
- `styles/styles.css` — Global styles with design tokens (body 18px, h3 weight 500)
- `blocks/footer/footer.css` — Footer styling (h5 19px, links 18px)
- `docs/style-survey-report.md` — Comprehensive style survey (43 items, 14 categories, 13-step plan)
- `tools/importer/url-catalog.json` — 370 URLs in 20 batches for bulk import
- `journal/` — Project journal directory

## Critical Warning
- **NEVER use `convert-all-md.js`** for EDS content files — it corrupts block HTML by rendering grid tables as literal text. Always write HTML manually or use the MCP convert tool.

## Git Notes
- Remote: `https://github.com/aemdemos/poc-tm.git`
- Must use `HOME=/home/node` prefix for git commands
- GitHub PAT provided by user at runtime
- `content/` directory excluded from git (`.git/info/exclude`)

## Resume Point
> Step 6 complete on `issue-17-addtl-blocks` branch (commits `b672a47`, `8233149`). Needs manual `git push origin issue-17-addtl-blocks`, then create PR. Next priorities: P2-9 (gold mark highlight), P2-10 (case study card layout), P2-6 (animated SVG icons). Bulk import (Step 9) still ready via URL catalog.
