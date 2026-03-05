# Page Validation Checklist

Use this checklist after migrating or modifying pages to verify visual and functional correctness.

## Global Checks

- [ ] Page loads without JavaScript errors (check browser console)
- [ ] All fonts load (Avenir Next LT Pro: 400, 500, 600, 700)
- [ ] `head.html` is current (all preloads, scripts, stylesheets present)
- [ ] Scroll-reveal animations trigger on scroll (sections fade in)

## Section Styling

- [ ] Dark sections have ink-blue-100 background (#23004B)
- [ ] Light sections have ink-blue-5 background (#F7F6FF)
- [ ] Accent sections have gold background (#FFBE00)
- [ ] Section padding matches: 100px top / 48px bottom (default), 100/100 (dark), 48/48 (accent)
- [ ] Text colors correct per section variant (white on dark, ink-blue on accent)

## Typography

- [ ] Headings use Avenir Next LT Pro (weight 700 for h1/h2, 600 for h3)
- [ ] Body text uses Avenir Next LT Pro Regular (400)
- [ ] Eyebrow text uses serif font (Georgia) via `var(--serif-font-family)` token
- [ ] Link colors: bright-blue (#4300FF) default, gold (#FFBE00) on dark sections

## Block-Specific Checks

### Hero
- [ ] Two-column layout on desktop (text left, image/animation right)
- [ ] Buttons render: primary (solid) and secondary (outline)
- [ ] Stacks to single column on mobile

### Tabs
- [ ] All tab labels fully visible at 1440px (no truncation)
- [ ] Tabs scroll horizontally on mobile
- [ ] Active tab has underline indicator
- [ ] Dark section: gold underline, white text

### Cards
- [ ] Three-column grid on desktop, stacked on mobile
- [ ] Counter animation fires on scroll (750+, 850k+, 120M)
- [ ] Stat numbers animate with ease-out cubic easing

### Carousel
- [ ] Navigation arrows and dot indicators visible
- [ ] Slides transition smoothly
- [ ] Text is readable at all breakpoints

### Columns
- [ ] 58/42 split on desktop for 2-column layouts
- [ ] Equal columns for 3+ column layouts
- [ ] Stacks on mobile with image first

### Awards (Accent Section)
- [ ] Badge images display in horizontal row on desktop
- [ ] Images wrapped with `display: inline` on parent `<p>` elements
- [ ] Each badge approximately 220px wide

## Responsive Breakpoints

### Desktop (1440px)
- [ ] Content max-width: 1200px, centered
- [ ] Two-column layouts side by side
- [ ] Full navigation visible in header

### Tablet (768px)
- [ ] Columns stack appropriately
- [ ] Tabs horizontally scrollable
- [ ] Images scale proportionally
- [ ] Touch targets at least 44px

### Mobile (375px)
- [ ] All content single column
- [ ] Text readable without horizontal scroll
- [ ] Buttons full-width or adequately sized
- [ ] Images don't overflow viewport

## Performance

- [ ] No layout shift on page load (CLS)
- [ ] Images have width/height attributes
- [ ] Fonts preloaded in head.html
- [ ] Critical CSS loads synchronously (styles.css)
- [ ] Block CSS loads on demand (per-block loading)
