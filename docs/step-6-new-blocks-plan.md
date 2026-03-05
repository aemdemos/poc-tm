# Step 6 — New Blocks Plan

**Branch:** `issue-17-addtl-blocks`
**Scope:** P1-5 (video hero) and P1-6 (image slider) for let-care-flow
**Effort estimate:** Large (2 new block implementations)

---

## Context

The let-care-flow page (`/let-care-flow/`) was re-migrated in Session 022 with standard Hero and Carousel blocks as stand-ins. The original zelis.com page has two custom components that need dedicated EDS blocks:

1. **Video hero** — A full-width hero with a background poster image, gradient overlay, text content, and a Vimeo video that plays in an expanded modal on click.
2. **Image slider** — A full-width image-only carousel on a gold background with prev/next arrows, autoplay, and swipe support.

---

## Existing Assets to Leverage

| Asset | Path | What it provides |
|-------|------|------------------|
| Hero block | `blocks/hero/` | Two-column layout, Lottie detection, dark section support, responsive CSS |
| Video block | `blocks/video/` | YouTube/Vimeo embed, poster placeholder, play button, lazy loading, reduced motion |
| Carousel block | `blocks/carousel/` | Scroll-snap slides, prev/next arrows, dot indicators, IntersectionObserver, ARIA |
| delayed.js | `scripts/delayed.js` | Lottie loader, reduced-motion detection |

---

## Block 1: Video Hero (`blocks/video-hero/`)

### Original Behavior (zelis.com)

- **Poster:** Background image with left-to-right gradient overlay (`linear-gradient(90deg, #26004F 0.72%, rgba(115,115,115,0) 63.25%)`)
- **Video:** Vimeo embed (`vimeo.com/944224426`), loaded on-demand when play button is clicked
- **Play button:** White circle (90% opacity) with purple play triangle (#321478), centered over poster
- **Expand behavior:** Clicking play → `.expanded` class toggled → video div CSS-translates to viewport center → dark backdrop (rgba(0,0,0,0.8)) → Vimeo iframe injected with `?autoplay=1`
- **Close:** Click backdrop or close button → transform resets → iframe removed → scroll restored
- **Content overlay:** H1 ("Let Care Flow."), paragraph, CTA button — positioned on left side over the gradient
- **Responsive:** CTA hidden on tablet/mobile; content column 50% at md+

### EDS Content Model

```
+---------------------------------------------------------------------------------+
| Video Hero                                                                      |
+---------------------------------------------+-----------------------------------+
| # Let *Care* Flow.                          | ![poster image][image-hero]       |
|                                             | https://vimeo.com/944224426       |
| Transforming an experience full of...       |                                   |
|                                             |                                   |
| **[See how we're helping](...)**            |                                   |
+---------------------------------------------+-----------------------------------+
```

**Column 1 (text):** Heading, paragraph, CTA button(s)
**Column 2 (media):** Poster image (`<picture>`) + video URL (plain `<a>` link to Vimeo)

### Implementation Plan

**`video-hero.js`:**
1. Detect the two-column structure (text left, media right)
2. In media column: find `<picture>` (poster) and `<a>` (video URL)
3. Parse video URL → extract provider (vimeo/youtube) and ID
4. Build poster container with gradient overlay and background image
5. Add play button (SVG circle + triangle, matching original design)
6. On play click:
   - Add `.expanded` class to block
   - Show backdrop overlay (fixed, full-screen, dark)
   - Inject iframe with `?autoplay=1`
   - Lock body scroll
7. On close/backdrop click:
   - Remove `.expanded` class
   - Remove iframe
   - Restore body scroll
8. Respect `prefers-reduced-motion` (skip autoplay)

**`video-hero.css`:**
1. Full-width container (break out of content-width)
2. Dark purple background (`#280A5F`) as fallback
3. Poster image positioned as background-cover with gradient overlay
4. Content overlay positioned on left (50% width at desktop)
5. Play button centered on poster area
6. `.expanded` state: translate to viewport center, z-index above backdrop
7. Backdrop: fixed position, black 80% opacity
8. Close button styling
9. Responsive: stack on mobile, side-by-side at 900px+
10. White text for heading, paragraph, CTA

### Files to Create

- `blocks/video-hero/video-hero.js`
- `blocks/video-hero/video-hero.css`

### Content Update

Update `content/let-care-flow.md` to use `Video Hero` block name instead of `Hero`.

---

## Block 2: Image Slider (`blocks/image-slider/`)

### Original Behavior (zelis.com)

- **Library:** Slick Slider (we'll reimplement with vanilla JS + CSS scroll-snap, matching our carousel pattern)
- **Slides:** 5 full-width images (1920x1080), image-only (text is baked into the image creative)
- **Background:** Gold (`#FFBE00`) section
- **Navigation:** Prev/next arrows (white, positioned at 50% vertical), hidden below 768px
- **Dots:** Disabled
- **Autoplay:** 5-second interval
- **Transition:** Slide (horizontal translate), 500ms ease
- **Infinite loop:** Yes
- **Swipe/drag:** Enabled
- **CTA below:** "See our platform" button (centered, below carousel)

### EDS Content Model

```
+----------------------------------------------+
| Image Slider                                 |
+------------------------------------------+---+
| ![Alt text for slide 1][image-slide-1]   |   |
+------------------------------------------+---+
| ![Alt text for slide 2][image-slide-2]   |   |
+------------------------------------------+---+
| ![Alt text for slide 3][image-slide-3]   |   |
+------------------------------------------+---+
| ![Alt text for slide 4][image-slide-4]   |   |
+------------------------------------------+---+
| ![Alt text for slide 5][image-slide-5]   |   |
+------------------------------------------+---+
```

Each row = one slide, containing a `<picture>` element. The second column is empty (EDS table pattern).

### Implementation Plan

**`image-slider.js`:**
1. Extract slides from block rows (each row's first column contains a `<picture>`)
2. Build slider container with `<ul>` of `<li>` slides
3. Each slide: full-width image, aspect-ratio 16:9
4. Add prev/next arrow buttons (SVG chevrons, white)
5. Implement CSS scroll-snap sliding (reuse carousel pattern)
6. Add autoplay timer (5-second interval):
   - Start when block enters viewport (IntersectionObserver)
   - Pause on hover/focus
   - Resume on mouse leave
7. Support swipe/touch via native scroll-snap
8. Infinite loop: clone first/last slides for seamless wrap (or use JS scroll reset)
9. ARIA: `role="region"`, `aria-roledescription="Image Slider"`, `aria-hidden` on inactive slides
10. Respect `prefers-reduced-motion` (disable autoplay)

**`image-slider.css`:**
1. Full-width container (break out of content-width if needed)
2. Slides container: `overflow: hidden`, `scroll-snap-type: x mandatory`
3. Each slide: `scroll-snap-align: start`, `flex-shrink: 0`, `width: 100%`
4. Images: `width: 100%`, `height: auto`, `object-fit: cover`
5. Arrow buttons: absolute positioned, vertically centered, white SVG chevrons
6. Arrows hidden below 768px (responsive)
7. Transition: `scroll-behavior: smooth` (500ms)
8. No dot indicators (match original)

### Files to Create

- `blocks/image-slider/image-slider.js`
- `blocks/image-slider/image-slider.css`

### Content Update

Update `content/let-care-flow.md` to use `Image Slider` block name instead of `Carousel`.

---

## Execution Order

| # | Task | Est. Time | Dependencies |
|---|------|-----------|--------------|
| 1 | Create `blocks/video-hero/video-hero.js` | 20m | — |
| 2 | Create `blocks/video-hero/video-hero.css` | 15m | — |
| 3 | Update `content/let-care-flow.md` hero block to Video Hero | 5m | #1-2 |
| 4 | Preview and verify video hero | 10m | #3 |
| 5 | Create `blocks/image-slider/image-slider.js` | 20m | — |
| 6 | Create `blocks/image-slider/image-slider.css` | 15m | — |
| 7 | Update `content/let-care-flow.md` carousel to Image Slider | 5m | #5-6 |
| 8 | Preview and verify image slider | 10m | #7 |
| 9 | Full page preview — verify all sections together | 10m | #4, #8 |
| 10 | Commit and push to branch | 5m | #9 |

**Total estimate:** ~2 hours

---

## Acceptance Criteria

### Video Hero
- [ ] Poster image renders full-width with gradient overlay
- [ ] Play button visible and clickable
- [ ] Clicking play opens Vimeo video in expanded overlay
- [ ] Close button / backdrop click dismisses video
- [ ] Text content (heading, paragraph, CTA) overlays the left side
- [ ] Responsive: stacks on mobile, side-by-side at 900px+
- [ ] Respects `prefers-reduced-motion`

### Image Slider
- [ ] All 5 slides render as full-width images
- [ ] Prev/next arrows navigate between slides
- [ ] Autoplay advances slides every 5 seconds
- [ ] Autoplay pauses on hover
- [ ] Swipe/touch navigation works on mobile
- [ ] Arrows hidden on mobile (<768px)
- [ ] Respects `prefers-reduced-motion` (no autoplay)

### Integration
- [ ] let-care-flow page renders with Video Hero replacing generic Hero
- [ ] let-care-flow page renders with Image Slider replacing generic Carousel
- [ ] All other sections (text, cards, columns) unaffected
- [ ] No console errors
