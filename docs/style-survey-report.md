# Style Survey Report — Zelis.com EDS Migration

**Date:** 2026-03-05 (Session 018–019)
**Branch:** `issue-1-style-refinement`
**Scope:** Original site (zelis.com) vs current EDS migration — comprehensive visual, structural, and architectural audit.

---

## 1. Methodology

### 1.1 What Was Done

- **Computed-style extraction** via Playwright at 1440px viewport: body, headings, buttons, sections, footer, tabs, eyebrows, counters — extracted from both zelis.com and localhost:3000 EDS pages.
- **Full-page screenshots** of both original and EDS pages for homepage and let-care-flow.
- **Codebase review** of `styles/styles.css` (60+ design tokens), block CSS files, section variants, and validation checklist.
- **Page-type classification** across ~789 URLs into 7 template categories.

### 1.2 Limitations

- **url-catalog.json** is not present in the repo (referenced by `bulk-import.js`). No per-URL automated comparison was possible.
- **Content directory** contains homepage (`content/index`) and let-care-flow only; other page types not yet migrated.
- **Automated screenshot diff** not yet implemented; comparison was manual via Playwright.

### 1.3 Representative URL Set

| Page Type | Template | Example Live URL |
|-----------|----------|------------------|
| Homepage | homepage | https://www.zelis.com/ |
| Blog article | blog-article | https://www.zelis.com/blog/accelerating-progress-in-healthcare-finance-a-call-to-action/ |
| Solutions | solutions-page | https://www.zelis.com/solutions/ |
| Gated resource | gated-resource | white-papers, webinars, playbooks, analyst-report |
| Case study | case-study | case-studies/ |
| Built-for | built-for-audience | built-for/, providers/ |
| Company/utility | company-utility | company/, root-level |

### 1.4 Design Token Baseline

Tokens in `styles/styles.css` were extracted from the live site in Session 012, refined in Sessions 014 and 017. The token values below are the **authoritative computed values** from zelis.com, captured via Playwright `getComputedStyle()`:

```
Body:           18px / 400 / line-height 29.25px (1.625em) / "Avenir LT Pro Regular"
Body color:     rgb(35, 0, 75) = #23004B
H1:             55px / 500 / 64.9px line-height / "Avenir LT Pro Bold"
H2:             44px / 500 / 54.12px line-height / "Avenir LT Pro Medium"
H3 (content):   20px / 500 / 27.8px line-height / "Avenir LT Pro Demi"
H3 (stats):     68px / 500 / 94.52px line-height / "Avenir LT Pro Bold"
Eyebrow:        19px / 400 / Georgia, serif
Primary btn:    18px / 400 / padding 13px 33px / bg #320FFF / border 2px solid #320FFF / radius 3px
Secondary btn:  18px / 400 / padding 13px 33px / bg transparent / border 2px solid #320FFF / radius 3px
Section dark:   bg #23004B / padding 100px 0 100px 0
Section light:  bg #F7F6FF / padding 100px 0 48px 0
Section accent: bg #FFBE00 / padding 48px 0
Footer h5:      19px / 700 / "Avenir LT Pro Medium"
Footer links:   18px / "Avenir LT Pro Demi"
```

---

## 2. Executive Summary

The homepage (index) is **~85% style-matched** — section backgrounds, heading sizes, heading weights, layout proportions, eyebrow serif font, counter animations, and tab layout are all correct. Remaining issues are refinements: body font-size, button padding/weight, and footer font sizes.

The let-care-flow page has **critical structural issues** — duplicate sections, missing video hero, missing image slider — and needs complete re-migration rather than style fixes.

**Total items cataloged:** 46 across 9 categories (no code changes made in this report).

---

## 3. Homepage Comparison (Computed Styles)

### 3.1 Typography

| Property | Original (Computed) | EDS (Computed) | Status | ID |
|----------|---------------------|----------------|--------|----|
| Body font-size | 18px | 20px (clamp 18–20) | **MISMATCH** — EDS renders 20px at 1440px | P1-1 |
| Body font-family | "Avenir LT Pro Regular" | "Avenir Next LT Pro" | Acceptable variant (same typeface family) | — |
| Body line-height | 29.25px (1.625em) | 32.5px (1.625em) | Proportional match (tracks font-size) | — |
| Body color | #23004B | #23004B | Match | — |
| H1 font-size | 55px | 55px | Match | — |
| H1 font-weight | 500 | 500 | Match | — |
| H2 font-size | 44px | 44px | Match | — |
| H2 font-weight | 500 | 500 | Match | — |
| H2 line-height | 54.12px | 54.12px | Match | — |
| H3 (content) | 20px / weight 500 | 20px / weight 600 | **MISMATCH** — EDS uses 600, original uses 500 | T2 |
| H3 (stats/counter) | 68px / weight 500 | 68px / weight 500 | Match | — |
| Eyebrow (serif) | Georgia 19px 400 | Georgia 19px 400 | Match | — |
| Counter numbers | 68px "Avenir LT Pro Bold" | 68px "Avenir Next LT Pro" 500 | Match (weight naming differs between font files) | — |

**Typography open question (T1):** The validation checklist says h1/h2 should be weight 700, but Playwright computed styles show the original site uses 500. Our CSS already uses 500 (correct per computed styles). The checklist should be updated, not the CSS.

### 3.2 Buttons

| Property | Original (Computed) | EDS (Current CSS) | Status | ID |
|----------|---------------------|-------------------|--------|----|
| Primary bg | rgb(50,15,255) / #320FFF | #320FFF | Match | — |
| Primary padding | 13px 33px | 13px 33px (token) | **Match** (fixed in Session 017) | — |
| Primary border | 2px solid #320FFF | 2px solid #320FFF (token) | **Match** (fixed in Session 017) | — |
| Primary font-weight | 400 | 400 | **Match** (fixed in Session 017) | — |
| Primary font-size | 18px | 18px | Match | — |
| Primary border-radius | 3px | 3px | Match | — |
| Primary font-family | "Avenir LT Pro Medium" | "Avenir Next LT Pro" | Acceptable variant | — |
| Secondary bg | transparent | transparent | Match | — |
| Secondary border | 2px solid #320FFF | 2px solid #320FFF | Match | — |
| Secondary padding | 13px 33px | 13px 33px | Match | — |

**Note:** Button tokens were aligned in Session 017. The computed-style extraction in Session 018 captured values before the Session 017 commit was applied to the preview. Current CSS tokens are correct.

### 3.3 Section Backgrounds & Spacing

| Section | Orig Background | EDS Background | Orig Padding | EDS Padding | Status | ID |
|---------|----------------|----------------|-------------|-------------|--------|----|
| Hero | transparent | transparent | 100px 0 0 0 | 100px 0 48px 0 | **Extra 48px bottom** | P3-1 |
| Dark (Tabs) | #23004B | #23004B | 100px 0 100px 0 | 100px 0 100px 0 | Match | — |
| Stats/Counter | transparent | transparent | 100px 0 48px 0 | 100px 0 48px 0 | Match | — |
| Testimonials | transparent | transparent | 48px 0 | 48px 0 | Match | — |
| Light (CTA) | #F7F6FF | #F7F6FF | 100px 0 48px 0 | 100px 0 48px 0 | Match | — |
| We Are Zelis | transparent | transparent | 100px 0 48px 0 | 100px 0 48px 0 | Match | — |
| Awards (Accent) | #FFBE00 | #FFBE00 | 48px 0 | 48px 0 | Match | — |
| Careers | white | transparent | 100px 0 | — | **Missing content** | P1-4 |

**Section mapping (S1):** Original uses WordPress classes (`has-ink-blue-5-background-color`, `block--section-wrapper`). EDS uses Section Metadata (`style | dark`, `style | light`, etc.) mapped to `.section.dark`, `.section.light`, `.section.accent`, `.section.dark-alt`. Mapping is correct for homepage; parsers should emit Section Metadata for future page types.

### 3.4 Footer

| Property | Original (Computed) | EDS (Computed) | Status | ID |
|----------|---------------------|----------------|--------|----|
| Footer h5 font-size | 19px | 16px | **MISMATCH** | P2-3 |
| Footer h5 font-weight | 700 | 700 | Match | — |
| Footer link font-size | 18px | 14px | **MISMATCH** | P2-4 |
| Footer link font-family | "Avenir LT Pro Demi" | "Avenir Next LT Pro" | Acceptable | — |
| Featured Resource cards | h3 with images/thumbnails | h3 text-only | **Missing card images** | P2-7 |
| Social icons | SVG icons with labels | Text links | Needs verification | P3-6 |

### 3.5 Header/Navigation

| Property | Original | EDS | Status | ID |
|----------|----------|-----|--------|-----|
| Announcement bar | "Introducing ZAPP Edge" | Not present | **Missing** | P3-3 |
| Nav font | "Avenir LT Pro Regular" | "Avenir Next LT Pro" | Acceptable | — |
| Mega menu | Full dropdowns with descriptions/icons | Not implemented | **Missing** | P2-8 |
| Search icon | Present | Not visible | **Missing** | P3-4 |
| "For Payers/Providers" links | Present | Present | Match | — |
| "Connect with us" button | Present | Present | Match | — |

### 3.6 Missing Content / Structural Issues

| Issue | Description | ID |
|-------|-------------|-----|
| Missing Careers section | "Find your purpose in ours." with Lottie animation — section is empty | P1-4 |
| Missing scroll-down arrow | Original has a chevron between hero and tabs section | P3-2 |
| Awards badges not rendering | Award badge images not loading in preview (external URL issue) | P2-5 |
| "We Are Zelis" missing images | Three feature cards (Technology, Partnership, Visibility) show text but no Lottie/images | P2-6 |

---

## 4. Let-Care-Flow Page Comparison

### 4.1 Critical Structural Issues (P0 — Must Re-migrate)

| Issue | Description | ID |
|-------|-------------|-----|
| Duplicate sections | "Bridging Gaps in the Financial System" appears TWICE | P0-1 |
| Duplicate CTA | "Let's talk about your business." appears TWICE | P0-1 |
| Multiple hero text blocks | 4 text-only sections at top instead of one video hero | P0-1 |
| Missing video hero | Original has video background with Play button overlay | P1-5 |
| Missing image slider | Original has full-width branded image carousel with prev/next | P1-6 |
| Missing branding | Original uses `<mark>` to highlight "Care" in gold | P2-9 |
| Missing case study card | Original has proper card with image, heading, description, link | P2-10 |
| Missing two-column CTA layout | Original has image left + text right; EDS is text-only | P2-10 |
| Different header | Original uses simplified header (logo only); EDS shows full nav | P3-5 |

### 4.2 Recommendation

This page needs complete re-migration with:
1. Video hero block (or hero with video background)
2. Image slider/carousel block
3. Proper case study cards block
4. Two-column CTA layout
5. Deduplicated content
6. Simplified header variant

---

## 5. Typography Decisions

| # | Question | Live Site (Computed) | Our CSS | Validation Checklist | Resolution |
|---|----------|---------------------|---------|---------------------|------------|
| T1 | h1/h2 font-weight | **500** (confirmed via Playwright) | 500 | Says 700 | **CSS is correct (500)**. Update checklist to match live computed values. |
| T2 | h3 font-weight (global vs block) | **500** for content h3s | 600 globally; blocks override to 500 | Says 600 | **Change global h3 to 500** to match live. Blocks already use 500; removing the override simplifies CSS. |

---

## 6. Breakpoint Analysis

| # | Topic | Original Site | Our Implementation | Action |
|---|-------|---------------|-------------------|--------|
| B1 | Main breakpoint | WordPress uses Bootstrap `col-lg-*` at **992px** | We use **900px** everywhere | Deferred from Issue #1. Revisit when aligning responsive layouts with live site. Impact: column stacking occurs 92px earlier on EDS. |
| B2 | Validation breakpoints | Checklist specifies 1440px, 768px, 375px | No 1440px-specific rules; 768px used in places; 900px is primary | Document 900 vs 992 vs 768 for QA. No code change needed yet — 900px works well visually. |

---

## 7. Section & Layout Mapping

| # | Topic | Original | EDS | Action |
|---|-------|----------|-----|--------|
| S1 | Section class mapping | WordPress classes (`has-ink-blue-5-background-color`, `pt-8 pb-5`) | Section Metadata → `.section.light`, `.section.dark`, `.section.accent`, `.section.dark-alt` | Mapping is correct for homepage. Ensure import parsers emit Section Metadata for all page types. |
| S2 | Narrow / angled sections | Some sections use narrower inner width | `.section.angled` exists; `.section.narrow` not defined | Add `.section.narrow` variant if needed for specific page types. Not required for homepage. |

---

## 8. Links & Buttons

| # | Topic | Original / Checklist | Our Implementation | Action |
|---|-------|---------------------|-------------------|--------|
| L1 | Bright blue hex | Checklist says `#4300FF` | Token `--color-bright-blue: #320fff` | **Computed style confirms #320FFF** (rgb 50,15,255). Checklist value `#4300FF` is incorrect — update checklist. |
| L2 | Link color in dark sections | Gold (#FFBE00) for links on dark backgrounds | `var(--color-gold)` for `.section.dark a:any-link:not(.button)` | Correct. Verify applies consistently across page types. |
| L3 | Secondary button styling | Outline style with #320FFF border | Implemented with matching tokens | Match confirmed via computed styles. |

---

## 9. Block-Level Components (Future Page Types)

These items require verification once their respective page types are migrated. They are not actionable until content exists.

| # | Page Type | Key Blocks to Verify | Notes |
|---|-----------|---------------------|-------|
| C1 | Blog article | Hero (date, title, featured image), author block, body typography, related posts (dark section cards) | Blog-specific layout and section styling not yet verified. |
| C2 | Solutions | "I am a / looking to" selector, "By the Numbers" stats, "Bold Approach" cards, meeting CTA, featured partners | Parsers extract sections/accordion; verify selector UI styling. |
| C3 | Gated resource | Hero, HubSpot form, related resources | Form block styling may be placeholder only (Session 000). |
| C4 | Case study | Hero, challenge/solution columns, gold stats section, narrative, related | Gold section = `.section.accent`; verify stats and narrative columns. |
| C5 | Resource list / hub | Filter pills, topic dropdown, search, pagination | Resource-list block with dark section support exists; compare filter bar and card grid. |

---

## 10. Development Plan — Prioritized

### P0 — Blockers

| ID | Task | Files | Effort |
|----|------|-------|--------|
| P0-1 | Re-migrate let-care-flow page from scratch | `content/let-care-flow.md`, `.html` | Medium |

### P1 — High Priority (Visible style mismatches, CSS-only fixes first)

| ID | Task | Files | Effort |
|----|------|-------|--------|
| P1-1 | Fix body font-size: change clamp max from 20px to 18px (or set flat 18px) | `styles/styles.css` | Small |
| P1-4 | Add/restore Careers section ("Find your purpose in ours.") | `content/index.md`, `.html` | Medium |
| P1-5 | Implement video hero block for let-care-flow | `blocks/video-hero/` | Large |
| P1-6 | Implement image slider block for let-care-flow | `blocks/image-slider/` | Large |

### P2 — Medium Priority (Noticeable differences)

| ID | Task | Files | Effort |
|----|------|-------|--------|
| P2-3 | Fix footer h5 font-size from 16px to 19px | `blocks/footer/footer.css` | Small |
| P2-4 | Fix footer link font-size from 14px to 18px | `blocks/footer/footer.css` | Small |
| P2-5 | Fix award badge image loading (external URL rendering) | Investigation needed | Small–Medium |
| P2-6 | Add images to "We Are Zelis" feature cards | `content/index.md` | Medium |
| P2-7 | Add thumbnail images to footer Featured Resource cards | `blocks/footer/` | Medium |
| P2-8 | Implement mega-menu navigation dropdowns | `blocks/header/`, `nav.md` | Large |
| P2-9 | "Let Care Flow" `<mark>` text highlight styling | `styles/styles.css`, content | Small |
| P2-10 | Case study card + two-column CTA for let-care-flow | `content/let-care-flow.md` | Medium |

### P3 — Low Priority (Minor / Deferred)

| ID | Task | Files | Effort |
|----|------|-------|--------|
| P3-1 | Hero section extra 48px bottom padding vs original 0px | `styles/styles.css` | Small |
| P3-2 | Add scroll-down arrow between hero and tabs | `blocks/hero/` or content | Small |
| P3-3 | Navigation announcement bar ("Introducing ZAPP Edge") | `blocks/header/` | Medium |
| P3-4 | Search icon in navigation | `blocks/header/` | Medium |
| P3-5 | Simplified header variant for branded pages (let-care-flow) | `blocks/header/` | Medium |
| P3-6 | Footer social icons (SVG vs text) | `blocks/footer/` | Small |

### Typography & Alignment (Confirm-and-fix)

| ID | Task | Files | Effort |
|----|------|-------|--------|
| T1 | Update validation checklist: h1/h2 weight is 500 (not 700) | `docs/validation-checklist.md` | Small |
| T2 | Change global h3 font-weight from 600 to 500 | `styles/styles.css` | Small |
| B1 | Breakpoint alignment 900px vs 992px (deferred) | `styles/styles.css`, block CSS | Medium |
| S2 | Add `.section.narrow` variant if needed | `styles/styles.css` | Small |

### Tooling & Process

| ID | Task | Notes | Effort |
|----|------|-------|--------|
| W1 | Restore/create `url-catalog.json` from sitemaps | Required for bulk import and per-URL comparison | Medium |
| W2 | Implement automated style regression (Playwright screenshot diff) | Compare migrated pages to live via browser automation | Large |
| W3 | Re-run design token extraction if live site changes | Spot-check token values periodically | Small |

---

## 11. Page-Type Coverage Plan

These verify styling alignment per page type after bulk migration. Each requires sample URLs to be migrated first.

| # | Page Type | Sample Count | Key Checks |
|---|-----------|-------------|------------|
| P-HP | Homepage | 1 (done) | Reference — reuse patterns for other types |
| P-BL | Blog / news / podcasts / legislative / infographics | 2–3 per sub-type (~315 URLs) | Hero, author block, body typography, related cards in dark section |
| P-GR | White papers, webinars, playbooks, analyst reports | 2–3 | Form + related section styling |
| P-CS | Case studies, videos | 2–3 | Gold stats, two-column narrative |
| P-SL | Solutions (with subdirs) | 2–3 | Accordion, "By the Numbers" stats, selector UI |
| P-BF | Built-for, providers | 2–3 | Section sequence, audience selector |
| P-CU | Company and utility | 2–3 | Mixed layouts; spot-check company, careers, legal, thank-you |

---

## 12. Summary Table

| Category | Count | Key Items |
|----------|-------|-----------|
| Homepage typography | 2 | P1-1 (body 20→18px), T2 (h3 600→500) |
| Homepage buttons | 0 | All match after Session 017 fixes |
| Homepage sections | 2 | P1-4 (missing careers), P3-1 (hero padding) |
| Homepage footer | 4 | P2-3, P2-4 (font sizes), P2-7 (card images), P3-6 (social icons) |
| Homepage header/nav | 3 | P2-8 (mega-menu), P3-3 (announcement), P3-4 (search) |
| Homepage content | 2 | P2-5 (awards images), P2-6 (We Are Zelis images) |
| Let-care-flow | 6 | P0-1 (re-migrate), P1-5/P1-6 (new blocks), P2-9/P2-10 (styling), P3-5 (header) |
| Typography decisions | 2 | T1 (checklist correction), T2 (h3 weight) |
| Breakpoints | 2 | B1 (900 vs 992), B2 (validation widths) |
| Section/layout | 2 | S1 (class mapping — done), S2 (narrow variant) |
| Links/buttons | 3 | L1 (checklist hex fix), L2 (dark section links), L3 (secondary) |
| Block components | 5 | C1–C5 (verify per page type after migration) |
| Page-type coverage | 7 | P-HP through P-CU (sample after bulk import) |
| Tooling | 3 | W1 (URL catalog), W2 (regression automation), W3 (token re-extraction) |
| **Total** | **43** | |

---

## 13. Recommended Execution Order

1. **Quick CSS fixes (30 min)** — P1-1 (body font-size), T2 (h3 weight), P2-3/P2-4 (footer sizes). Pure CSS, no content changes.
2. **Checklist corrections** — T1 (h1/h2 weight), L1 (bright-blue hex). Documentation-only.
3. **Create Issue #1 PR** — All Session 017 + quick fixes on `issue-1-style-refinement` branch.
4. **Re-migrate let-care-flow (P0-1)** — Fresh migration with proper block mapping.
5. **Homepage content** — P1-4 (careers section), P2-5/P2-6 (missing images).
6. **New blocks** — P1-5 (video hero), P1-6 (image slider) for let-care-flow.
7. **Footer refinement** — P2-7 (featured resource cards).
8. **Tooling** — W1 (URL catalog), then W2 (automated regression).
9. **Bulk import** — Issue #4 (~789 URLs), using URL catalog and import parsers.
10. **Page-type validation** — Sample 2–3 URLs per template type, compare to live.
11. **Navigation** — P2-8 (mega-menu), P3-3/P3-4 (announcement bar, search).
12. **Low-priority polish** — P3-1 through P3-6 and remaining items.
