# Animation Migration Verification Framework

## Purpose

Structured criteria and automated checks to verify that animations migrated from a source website render correctly in Adobe Edge Delivery Services. Every check produces a **PASS / FAIL / WARN** result with evidence.

Run verifications against both the **source page** and the **EDS page** (local preview at `http://localhost:3000` or remote at `https://{branch}--{repo}--{owner}.aem.page/`).

---

## Verification Categories

| # | Category | What It Proves |
|---|----------|----------------|
| V1 | Animation Inventory Match | Every source animation has an EDS counterpart |
| V2 | Visual Fidelity | EDS animation looks like the source |
| V3 | Trigger & Timing | Animation fires at the right moment with correct duration/easing |
| V4 | EDS Load-Phase Compliance | Code lives in the correct load phase |
| V5 | Performance | No layout shift, jank, or LCP regression |
| V6 | Accessibility | `prefers-reduced-motion` and `:focus-visible` handled |
| V7 | DA Authoring Integrity | Content round-trips through Document Authoring without breaking |
| V8 | Cross-Environment | Works on local preview, `.aem.page`, and `.aem.live` |
| V9 | Console Health | No JS errors related to animation code |

---

## V1: Animation Inventory Match

**Goal:** Confirm every animation detected on the source page has a corresponding implementation in EDS.

### Criteria

| ID | Check | PASS | FAIL |
|----|-------|------|------|
| V1.1 | Source animation count matches EDS animation count | Counts match or EDS has documented reason for omission | Missing animations with no documented reason |
| V1.2 | Each animation type is accounted for (Lottie, scroll-reveal, counter, hover, etc.) | All types present in EDS | A type category is entirely missing |
| V1.3 | Animation inventory JSON from source matches EDS implementation list | 1:1 mapping exists | Unmapped animations remain |

### Automated Check — Run on Source Page

```javascript
// browser_evaluate on SOURCE page — produces animation inventory
(() => {
  const inv = { lottie: 0, scrollReveal: 0, counters: 0, cssAnimations: 0, cssTransitions: 0, parallax: 0, hover: 0, video: 0 };

  // Lottie
  inv.lottie += document.querySelectorAll('lottie-player, [data-animation-path], [data-bm-renderer]').length;
  if (window.lottie || window.bodymovin) inv.lottie = Math.max(inv.lottie, 1);

  // Scroll-triggered
  inv.scrollReveal += document.querySelectorAll('[data-aos], [data-scroll], .wow, .aos-init').length;
  document.querySelectorAll('section, [class*="animate"], [class*="reveal"], [class*="fade"]').forEach(el => {
    if (getComputedStyle(el).opacity === '0') inv.scrollReveal++;
  });

  // Counters
  document.querySelectorAll('strong, .counter, .stat, [class*="count"]').forEach(el => {
    if (/^\d/.test(el.textContent.trim())) inv.counters++;
  });

  // CSS keyframes
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule instanceof CSSKeyframesRule) inv.cssAnimations++;
      }
    } catch(e) {}
  }

  // CSS transitions (non-trivial)
  document.querySelectorAll('*').forEach(el => {
    const s = getComputedStyle(el);
    if (s.transitionProperty !== 'all' && s.transitionProperty !== 'none' && s.transitionDuration !== '0s') inv.cssTransitions++;
  });

  // Video backgrounds
  inv.video = document.querySelectorAll('video[autoplay], video[data-autoplay]').length;

  return { source: 'original', inventory: inv, timestamp: new Date().toISOString() };
})()
```

### Automated Check — Run on EDS Page

```javascript
// browser_evaluate on EDS page — produces animation inventory
(() => {
  const inv = { lottie: 0, scrollReveal: 0, counters: 0, cssAnimations: 0, cssTransitions: 0, parallax: 0, hover: 0, video: 0 };

  // Lottie containers (created by block JS)
  inv.lottie = document.querySelectorAll('[data-lottie-path]').length;

  // Scroll-reveal sections
  inv.scrollReveal = document.querySelectorAll('.scroll-reveal').length;

  // Counter elements
  inv.counters = document.querySelectorAll('.counter-animate').length;

  // CSS keyframes in project stylesheets
  for (const sheet of document.styleSheets) {
    try {
      if (!sheet.href || sheet.href.includes(window.location.origin)) {
        for (const rule of sheet.cssRules) {
          if (rule instanceof CSSKeyframesRule) inv.cssAnimations++;
        }
      }
    } catch(e) {}
  }

  // Video backgrounds
  inv.video = document.querySelectorAll('video[autoplay]').length;

  return { source: 'eds', inventory: inv, timestamp: new Date().toISOString() };
})()
```

### Comparison Logic

```javascript
// Compare two inventory objects — returns pass/fail per category
function compareInventories(source, eds) {
  const results = [];
  for (const key of Object.keys(source.inventory)) {
    const s = source.inventory[key];
    const e = eds.inventory[key];
    results.push({
      type: key,
      source: s,
      eds: e,
      status: e >= s ? 'PASS' : s > 0 && e === 0 ? 'FAIL' : 'WARN',
      note: e >= s ? 'Matched' : `Source has ${s}, EDS has ${e}`,
    });
  }
  return results;
}
```

---

## V2: Visual Fidelity

**Goal:** The EDS animation looks visually equivalent to the source.

### Criteria

| ID | Check | PASS | FAIL |
|----|-------|------|------|
| V2.1 | Animation start state matches source (before trigger) | Element position, opacity, scale match within tolerance | Visible difference in initial state |
| V2.2 | Animation end state matches source (after trigger) | Final visual state matches source | Different final position, opacity, or layout |
| V2.3 | Animation motion path is equivalent | Same direction (fade-up, slide-left, scale, etc.) | Different motion direction or effect type |
| V2.4 | Lottie SVG renders identically to source | SVG content visible, correct aspect ratio, animating | Empty container, wrong aspect ratio, or static |

### Verification Process

1. **Screenshot source page** at key scroll positions (top, 25%, 50%, 75%, 100%)
2. **Screenshot EDS page** at matching positions
3. **Compare pairs** — check:
   - Same elements are visible/hidden at each position
   - Animation effects match (fade vs slide vs scale)
   - Color, size, and position are comparable
   - Lottie SVGs show same visual content

### Automated Screenshot Script

```javascript
// Run on both source and EDS pages to capture scroll-position screenshots
// Use with Playwright browser_evaluate + browser_take_screenshot
async (page) => {
  const positions = [0, 25, 50, 75, 100];
  const totalHeight = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);

  for (const pct of positions) {
    const y = Math.round((pct / 100) * totalHeight);
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(600); // allow animations to trigger and settle
    await page.screenshot({ path: `verify-${pct}pct.png` });
  }
}
```

---

## V3: Trigger & Timing

**Goal:** Each animation triggers at the right moment and runs with correct duration and easing.

### Criteria

| ID | Check | PASS | FAIL |
|----|-------|------|------|
| V3.1 | Scroll-reveal triggers when section enters viewport | `.is-visible` class added on intersection | Class never added or added too early/late |
| V3.2 | Counter starts at 0 and reaches target value | Final text matches source value (e.g., `750+`) | Wrong final value or doesn't animate |
| V3.3 | Lottie starts playing after delayed.js loads | SVG animating within 2s of `delayed.js` import | Static SVG or no SVG rendered |
| V3.4 | Hover effects trigger on mouse interaction | `:hover` styles apply on hover | No visual change on hover |
| V3.5 | Animation duration is within ±50% of source | Measured duration comparable | Noticeably faster or slower than source |
| V3.6 | Easing curve is perceptually similar | Motion feel matches (snappy vs smooth vs bouncy) | Jarring difference in motion character |

### Automated Checks

```javascript
// V3.1 — Verify scroll-reveal triggers
// Run on EDS page after scrolling
(() => {
  const sections = document.querySelectorAll('.scroll-reveal');
  const results = [];
  sections.forEach((section, i) => {
    results.push({
      section: i,
      hasIsVisible: section.classList.contains('is-visible'),
      opacity: getComputedStyle(section).opacity,
      transform: getComputedStyle(section).transform,
    });
  });
  return {
    check: 'V3.1',
    total: sections.length,
    triggered: results.filter(r => r.hasIsVisible).length,
    status: results.every(r => r.hasIsVisible) ? 'PASS' : 'WARN',
    details: results,
  };
})()
```

```javascript
// V3.2 — Verify counter final values
(() => {
  const counters = document.querySelectorAll('.counter-animate');
  const results = [];
  counters.forEach(el => {
    const text = el.textContent.trim();
    const isNumeric = /^\d/.test(text);
    const isZero = text.startsWith('0');
    results.push({
      value: text,
      status: isNumeric && !isZero ? 'PASS' : isZero ? 'FAIL-still-zero' : 'WARN',
    });
  });
  return {
    check: 'V3.2',
    total: counters.length,
    status: results.every(r => r.status === 'PASS') ? 'PASS' : 'FAIL',
    details: results,
  };
})()
```

```javascript
// V3.3 — Verify Lottie rendered
(() => {
  const containers = document.querySelectorAll('[data-lottie-path]');
  const results = [];
  containers.forEach(c => {
    const svg = c.querySelector('svg');
    const hasContent = svg && svg.children.length > 0;
    const dims = c.getBoundingClientRect();
    results.push({
      path: c.dataset.lottiePath,
      hasSvg: !!svg,
      svgHasContent: hasContent,
      width: dims.width,
      height: dims.height,
      status: hasContent && dims.width > 0 && dims.height > 0 ? 'PASS' : 'FAIL',
    });
  });
  return {
    check: 'V3.3',
    total: containers.length,
    status: results.every(r => r.status === 'PASS') ? 'PASS' : 'FAIL',
    details: results,
  };
})()
```

---

## V4: EDS Load-Phase Compliance

**Goal:** Animation code is placed in the correct EDS load phase and doesn't block LCP.

### Criteria

| ID | Check | PASS | FAIL |
|----|-------|------|------|
| V4.1 | No animation classes on first section during `loadEager` | First `.section` has no `.scroll-reveal` | First section has scroll-reveal applied |
| V4.2 | `initScrollReveal()` called in `loadLazy()` | Function invoked after `loadSections` | Called in `loadEager` or missing entirely |
| V4.3 | Lottie loaded via `delayed.js` only | `lottie-web` script tag appears after 1.5s delay | Lottie loaded in eager or lazy phase |
| V4.4 | No external animation libraries loaded synchronously | No `<script>` for GSAP, anime.js, AOS, etc. | Third-party animation library in `<head>` |
| V4.5 | Block JS only creates containers, doesn't load libraries | `hero.js` creates `data-lottie-path` div, doesn't import lottie-web | Block JS imports heavy animation libraries |

### Automated Checks

```javascript
// V4.1 — First section should NOT have scroll-reveal
(() => {
  const first = document.querySelector('main > .section');
  if (!first) return { check: 'V4.1', status: 'WARN', note: 'No sections found' };
  const hasReveal = first.classList.contains('scroll-reveal');
  return {
    check: 'V4.1',
    status: hasReveal ? 'FAIL' : 'PASS',
    note: hasReveal ? 'First section has scroll-reveal — will cause LCP flash' : 'First section clean',
  };
})()
```

```javascript
// V4.3 — Lottie should load after delay, not eagerly
(() => {
  const scripts = [...document.querySelectorAll('script[src]')];
  const lottieScript = scripts.find(s => s.src.includes('lottie'));
  const inHead = lottieScript && lottieScript.closest('head');
  return {
    check: 'V4.3',
    lottieLoaded: !!lottieScript,
    inHead: !!inHead,
    status: lottieScript && !inHead ? 'PASS' : inHead ? 'FAIL' : 'WARN',
    note: inHead ? 'Lottie loaded in <head> — blocks rendering' : lottieScript ? 'Lottie loaded via delayed.js' : 'No lottie script found',
  };
})()
```

```javascript
// V4.4 — No banned animation libraries
(() => {
  const banned = ['gsap', 'greensock', 'anime.min', 'aos.js', 'scrollmagic', 'waypoints', 'scrollreveal'];
  const scripts = [...document.querySelectorAll('script[src]')].map(s => s.src.toLowerCase());
  const found = banned.filter(lib => scripts.some(src => src.includes(lib)));
  return {
    check: 'V4.4',
    status: found.length === 0 ? 'PASS' : 'FAIL',
    bannedLibraries: found,
    note: found.length === 0 ? 'No banned animation libraries' : `Found: ${found.join(', ')}`,
  };
})()
```

---

## V5: Performance

**Goal:** Animations don't degrade page performance.

### Criteria

| ID | Check | PASS | FAIL |
|----|-------|------|------|
| V5.1 | No Cumulative Layout Shift (CLS) from animations | CLS < 0.1 | CLS >= 0.1 |
| V5.2 | LCP not delayed by animation code | LCP within 2.5s | LCP > 2.5s due to animation blocking |
| V5.3 | Only `transform` and `opacity` animated | No `width`, `height`, `top`, `left`, `margin`, `padding` in transitions | Layout-triggering properties animated |
| V5.4 | No forced synchronous layout in animation loops | `requestAnimationFrame` used for JS animations | `setInterval` or layout reads inside animation loop |
| V5.5 | Lottie uses `lottie_light.min.js` (not full build) | Light build loaded from CDN | Full `lottie.min.js` (3x larger) loaded |

### Automated Checks

```javascript
// V5.3 — Check that only compositor-friendly properties are animated
(() => {
  const layoutProperties = ['width', 'height', 'top', 'left', 'right', 'bottom', 'margin', 'padding', 'border-width', 'font-size'];
  const violations = [];

  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.style && rule.style.transitionProperty) {
          const props = rule.style.transitionProperty.split(',').map(p => p.trim());
          const bad = props.filter(p => layoutProperties.some(lp => p.includes(lp)));
          if (bad.length) {
            violations.push({ selector: rule.selectorText, properties: bad });
          }
        }
      }
    } catch(e) {}
  }

  return {
    check: 'V5.3',
    status: violations.length === 0 ? 'PASS' : 'WARN',
    violations,
    note: violations.length === 0
      ? 'Only transform/opacity animated'
      : `${violations.length} rule(s) animate layout properties`,
  };
})()
```

```javascript
// V5.5 — Verify lottie light build
(() => {
  const scripts = [...document.querySelectorAll('script[src]')];
  const lottieScript = scripts.find(s => s.src.includes('lottie'));
  if (!lottieScript) return { check: 'V5.5', status: 'PASS', note: 'No lottie loaded' };
  const isLight = lottieScript.src.includes('lottie_light');
  return {
    check: 'V5.5',
    status: isLight ? 'PASS' : 'WARN',
    src: lottieScript.src,
    note: isLight ? 'Using lottie_light.min.js' : 'Using full lottie build — consider switching to lottie_light',
  };
})()
```

---

## V6: Accessibility

**Goal:** Animations respect user motion preferences and don't impair usability.

### Criteria

| ID | Check | PASS | FAIL |
|----|-------|------|------|
| V6.1 | `prefers-reduced-motion: reduce` disables all decorative animations | With reduced motion: no transitions, no CSS animations, opacity/transform at final state | Animations still play with reduced motion |
| V6.2 | Lottie shows first frame (not blank) with reduced motion | SVG visible, frozen at frame 0 | Empty container or still animating |
| V6.3 | Counters show final value immediately with reduced motion | Text shows `750+` (not `0+`) | Stuck at zero or still counting |
| V6.4 | `:focus-visible` transitions preserved with reduced motion | Outline transition still works when tabbing | Focus indicator disabled by reduced-motion override |
| V6.5 | No `animation: none` applied to `:focus-visible` styles | Reduced-motion media query doesn't target focus indicators | Focus transitions removed |
| V6.6 | Content is readable without any animations (progressive enhancement) | All text, images, links visible even if animations never fire | Content hidden behind `opacity: 0` with no fallback |

### Automated Checks

```javascript
// V6.1 — Verify reduced-motion CSS exists for all animated classes
(() => {
  const animatedClasses = ['.scroll-reveal', '.animate-in', '.counter-animate', '[data-lottie-path]'];
  const hasReducedMotionRule = [];

  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule instanceof CSSMediaRule && rule.conditionText?.includes('prefers-reduced-motion')) {
          const innerSelectors = [...rule.cssRules].map(r => r.selectorText);
          animatedClasses.forEach(cls => {
            if (innerSelectors.some(sel => sel?.includes(cls.replace('.', '').replace('[', '')))) {
              hasReducedMotionRule.push(cls);
            }
          });
        }
      }
    } catch(e) {}
  }

  const missing = animatedClasses.filter(c => !hasReducedMotionRule.includes(c));
  return {
    check: 'V6.1',
    status: missing.length === 0 ? 'PASS' : 'WARN',
    covered: hasReducedMotionRule,
    missing,
    note: missing.length === 0
      ? 'All animated classes have reduced-motion overrides'
      : `Missing reduced-motion rules for: ${missing.join(', ')}`,
  };
})()
```

```javascript
// V6.6 — Progressive enhancement: content visible without animations
(() => {
  const hiddenElements = [];
  document.querySelectorAll('.scroll-reveal').forEach(el => {
    const style = getComputedStyle(el);
    // If opacity is 0 AND no transition is defined, content is permanently hidden
    if (style.opacity === '0' && style.transitionDuration === '0s') {
      hiddenElements.push({
        element: el.tagName + '.' + [...el.classList].join('.'),
        issue: 'opacity:0 with no transition — content permanently hidden',
      });
    }
  });
  return {
    check: 'V6.6',
    status: hiddenElements.length === 0 ? 'PASS' : 'FAIL',
    hiddenElements,
    note: hiddenElements.length === 0
      ? 'All content visible or has transitions to reveal'
      : `${hiddenElements.length} element(s) permanently hidden`,
  };
})()
```

---

## V7: DA Authoring Integrity

**Goal:** Animation triggers authored in Document Authoring survive DA's content processing.

### Criteria

| ID | Check | PASS | FAIL |
|----|-------|------|------|
| V7.1 | Lottie link text preserved after DA round-trip | Link text still ends in `.json` | DA stripped or mangled the link text |
| V7.2 | Lottie link renders as anchor tag (not plain text) | `<a>` element exists in hero image column | Link removed or converted to plain text |
| V7.3 | Block JS matches link by text content (not href) | `a.textContent.trim().endsWith('.json')` pattern used | Code uses `a[href$=".json"]` which breaks in DA |
| V7.4 | Counter values preserved as `<strong>` after DA | `<strong>` tags with numeric values present | DA removed bold formatting or changed values |
| V7.5 | Section metadata preserved | `.section.center` class applied correctly | Section style metadata lost |

### Automated Check — Run on Remote (`.aem.page`)

```javascript
// V7.1 + V7.2 — Verify Lottie links survived DA
(() => {
  const results = [];
  document.querySelectorAll('.hero').forEach(hero => {
    const imageCol = hero.querySelector(':scope > div > div:nth-child(2)');
    if (!imageCol) return;

    // Check for lottie container (already processed by hero.js)
    const lottieContainer = imageCol.querySelector('[data-lottie-path]');
    if (lottieContainer) {
      results.push({
        check: 'V7.1',
        status: 'PASS',
        path: lottieContainer.dataset.lottiePath,
        note: 'Lottie container created successfully — link text was preserved',
      });
      return;
    }

    // If no container, check if link exists but wasn't detected
    const links = imageCol.querySelectorAll('a');
    const jsonLink = [...links].find(a => a.textContent.trim().endsWith('.json'));
    if (jsonLink) {
      results.push({
        check: 'V7.1',
        status: 'WARN',
        note: 'Link exists but hero.js did not convert it to a container',
        href: jsonLink.href,
        text: jsonLink.textContent,
      });
    } else {
      results.push({
        check: 'V7.1',
        status: 'FAIL',
        note: 'No .json link found in hero image column — DA may have stripped it',
        imageColHTML: imageCol.innerHTML.substring(0, 200),
      });
    }
  });
  return results;
})()
```

```javascript
// V7.4 — Counter values preserved as <strong>
(() => {
  const cards = document.querySelectorAll('.cards.block');
  const results = [];
  cards.forEach(block => {
    const strongs = block.querySelectorAll('strong');
    strongs.forEach(el => {
      const text = el.textContent.trim();
      const isNumeric = /^\d/.test(text);
      results.push({
        value: text,
        isNumeric,
        status: isNumeric ? 'PASS' : 'WARN',
      });
    });
  });
  return {
    check: 'V7.4',
    total: results.length,
    status: results.length > 0 && results.some(r => r.isNumeric) ? 'PASS' : 'WARN',
    details: results,
  };
})()
```

---

## V8: Cross-Environment

**Goal:** Animations work consistently across local preview, `.aem.page` (preview), and `.aem.live` (production).

### Criteria

| ID | Check | PASS | FAIL |
|----|-------|------|------|
| V8.1 | Animation renders on `localhost:3000` | All animations visible and functional | Broken or missing locally |
| V8.2 | Animation renders on `.aem.page` (preview) | All animations visible and functional after push | Works locally but not on preview |
| V8.3 | Animation renders on `.aem.live` (production CDN) | All animations visible after publish | Works on preview but not production |
| V8.4 | Lottie JSON accessible at expected path on remote | HTTP 200 for `/animations/*.json` | 404 or CORS error |
| V8.5 | No CORS issues with CDN-loaded libraries | `lottie-web` loads from jsDelivr without error | CORS or CSP blocks the library |

### Automated Check

```javascript
// V8.4 — Verify Lottie JSON files are accessible
(async () => {
  const containers = document.querySelectorAll('[data-lottie-path]');
  const results = [];
  for (const c of containers) {
    const path = c.dataset.lottiePath;
    const url = new URL(path, window.location.origin).href;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      results.push({
        path,
        url,
        status: res.ok ? 'PASS' : 'FAIL',
        httpStatus: res.status,
      });
    } catch (e) {
      results.push({ path, url, status: 'FAIL', error: e.message });
    }
  }
  return { check: 'V8.4', results };
})()
```

---

## V9: Console Health

**Goal:** No JavaScript errors related to animation code.

### Criteria

| ID | Check | PASS | FAIL |
|----|-------|------|------|
| V9.1 | No errors from `scripts.js` | Console clean | TypeError, ReferenceError from scripts.js |
| V9.2 | No errors from `delayed.js` | Console clean | Lottie load failure or path error |
| V9.3 | No errors from block JS | Console clean | Block decoration errors |
| V9.4 | No 404s for animation assets | Network tab clean | Missing `.json`, `.svg`, or image files |

### Verification via Playwright

```javascript
// Collect console errors during page load + scroll
// Use with Playwright browser_console_messages
// Filter for animation-related errors
(messages) => {
  const animationKeywords = ['lottie', 'animation', 'scroll-reveal', 'counter', 'IntersectionObserver', 'delayed.js', 'hero.js', 'cards.js'];
  const errors = messages
    .filter(m => m.type === 'error')
    .filter(m => animationKeywords.some(kw => m.text.toLowerCase().includes(kw)));
  return {
    check: 'V9',
    totalErrors: errors.length,
    status: errors.length === 0 ? 'PASS' : 'FAIL',
    errors: errors.map(e => ({ text: e.text, location: e.location })),
  };
}
```

---

## Full Verification Script

Run this single script on the EDS page to execute all automated checks at once. Returns a structured JSON report.

```javascript
// FULL ANIMATION VERIFICATION — run via browser_evaluate on EDS page
// Wait for delayed.js (2s+) and scroll to trigger all animations before running
(() => {
  const report = {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    checks: [],
  };

  function addCheck(id, name, status, details) {
    report.checks.push({ id, name, status, details });
  }

  // V1 — Animation inventory
  const lottieCount = document.querySelectorAll('[data-lottie-path]').length;
  const revealCount = document.querySelectorAll('.scroll-reveal').length;
  const counterCount = document.querySelectorAll('.counter-animate').length;
  addCheck('V1', 'Animation Inventory', 'INFO', {
    lottie: lottieCount,
    scrollReveal: revealCount,
    counters: counterCount,
    total: lottieCount + revealCount + counterCount,
  });

  // V3.1 — Scroll-reveal triggered
  const reveals = document.querySelectorAll('.scroll-reveal');
  const allRevealed = [...reveals].every(el => el.classList.contains('is-visible'));
  addCheck('V3.1', 'Scroll Reveal Triggered', allRevealed ? 'PASS' : 'WARN', {
    total: reveals.length,
    visible: [...reveals].filter(el => el.classList.contains('is-visible')).length,
  });

  // V3.2 — Counter final values
  const counters = document.querySelectorAll('.counter-animate');
  const countersOk = [...counters].every(el => {
    const text = el.textContent.trim();
    return /^\d/.test(text) && !text.startsWith('0');
  });
  addCheck('V3.2', 'Counter Values', counters.length === 0 ? 'PASS' : countersOk ? 'PASS' : 'FAIL', {
    total: counters.length,
    values: [...counters].map(el => el.textContent.trim()),
  });

  // V3.3 — Lottie rendered
  const lottieContainers = document.querySelectorAll('[data-lottie-path]');
  const lottiePassed = [...lottieContainers].every(c => {
    const svg = c.querySelector('svg');
    return svg && svg.children.length > 0 && c.getBoundingClientRect().width > 0;
  });
  addCheck('V3.3', 'Lottie Rendered', lottieContainers.length === 0 ? 'PASS' : lottiePassed ? 'PASS' : 'FAIL', {
    total: lottieContainers.length,
    details: [...lottieContainers].map(c => ({
      path: c.dataset.lottiePath,
      hasSvg: !!c.querySelector('svg'),
      width: c.getBoundingClientRect().width,
    })),
  });

  // V4.1 — First section clean
  const firstSection = document.querySelector('main > .section');
  const firstClean = firstSection && !firstSection.classList.contains('scroll-reveal');
  addCheck('V4.1', 'First Section No Reveal', firstClean ? 'PASS' : 'FAIL', {
    classes: firstSection ? [...firstSection.classList] : [],
  });

  // V4.4 — No banned libraries
  const banned = ['gsap', 'greensock', 'anime.min', 'aos.js', 'scrollmagic', 'waypoints'];
  const scripts = [...document.querySelectorAll('script[src]')].map(s => s.src.toLowerCase());
  const bannedFound = banned.filter(lib => scripts.some(src => src.includes(lib)));
  addCheck('V4.4', 'No Banned Libraries', bannedFound.length === 0 ? 'PASS' : 'FAIL', {
    found: bannedFound,
  });

  // V5.3 — Compositor-only properties
  const layoutProps = ['width', 'height', 'top', 'left', 'right', 'bottom', 'margin', 'padding'];
  const layoutViolations = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.style?.transitionProperty) {
          const props = rule.style.transitionProperty.split(',').map(p => p.trim());
          const bad = props.filter(p => layoutProps.some(lp => p.includes(lp)));
          if (bad.length) layoutViolations.push({ selector: rule.selectorText, properties: bad });
        }
      }
    } catch(e) {}
  }
  addCheck('V5.3', 'Compositor-Only Animation', layoutViolations.length === 0 ? 'PASS' : 'WARN', {
    violations: layoutViolations,
  });

  // V5.5 — Lottie light build
  const lottieScript = scripts.find(s => s.includes('lottie'));
  const isLight = !lottieScript || lottieScript.includes('lottie_light');
  addCheck('V5.5', 'Lottie Light Build', isLight ? 'PASS' : 'WARN', {
    src: lottieScript || 'none',
  });

  // V6.6 — Progressive enhancement
  const permanentlyHidden = [];
  document.querySelectorAll('.scroll-reveal').forEach(el => {
    const style = getComputedStyle(el);
    if (style.opacity === '0' && style.transitionDuration === '0s') {
      permanentlyHidden.push(el.tagName + '.' + [...el.classList].join('.'));
    }
  });
  addCheck('V6.6', 'Progressive Enhancement', permanentlyHidden.length === 0 ? 'PASS' : 'FAIL', {
    permanentlyHidden,
  });

  // Summary
  const passed = report.checks.filter(c => c.status === 'PASS').length;
  const failed = report.checks.filter(c => c.status === 'FAIL').length;
  const warned = report.checks.filter(c => c.status === 'WARN').length;
  report.summary = {
    total: report.checks.length,
    passed,
    failed,
    warned,
    overallStatus: failed > 0 ? 'FAIL' : warned > 0 ? 'WARN' : 'PASS',
  };

  return report;
})()
```

---

## Verification Workflow

### Step-by-Step Execution Order

1. **Navigate to source page** → run V1 source inventory script → save result
2. **Navigate to EDS page** (`localhost:3000` or `.aem.page`)
3. **Wait 2 seconds** (for `delayed.js` to load Lottie)
4. **Scroll full page** incrementally (400px steps, 200ms pause) to trigger all animations
5. **Run full verification script** → save JSON report
6. **Compare V1 inventories** (source vs EDS)
7. **Take comparison screenshots** at 0%, 25%, 50%, 75%, 100% scroll
8. **Check console messages** via `browser_console_messages` for errors
9. **If on remote**: run V7 DA authoring checks and V8.4 asset accessibility check
10. **Compile final report** with all results

### Interpreting Results

| Overall Status | Meaning | Action |
|----------------|---------|--------|
| **PASS** | All checks green | Animation migration verified — ready for review |
| **WARN** | Minor issues detected | Review warnings — may be acceptable trade-offs |
| **FAIL** | Critical issues found | Fix failures before considering migration complete |

### Required Evidence for Sign-Off

- [ ] Source page screenshots at 5 scroll positions
- [ ] EDS page screenshots at matching 5 scroll positions
- [ ] Full verification JSON report with all checks PASS
- [ ] Console error log showing zero animation-related errors
- [ ] Reduced-motion test confirming animations disabled
- [ ] Confirmation on both local and remote environments
