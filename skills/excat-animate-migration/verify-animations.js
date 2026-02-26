/**
 * Animation Migration Verification Script
 * ========================================
 * Run via Playwright browser_evaluate on an EDS page AFTER:
 *   1. Waiting 2+ seconds (so delayed.js has loaded Lottie)
 *   2. Scrolling the full page (so IntersectionObservers have fired)
 *
 * Returns a structured JSON report with PASS/FAIL/WARN per check.
 *
 * Usage (Playwright):
 *   await page.goto('http://localhost:3000/content/index');
 *   await page.waitForTimeout(2500);
 *   await page.evaluate(() => {
 *     const h = document.body.scrollHeight;
 *     for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); }
 *   });
 *   await page.waitForTimeout(1000);
 *   const report = await page.evaluate(verifyAnimationsScript);
 *
 * Usage (browser_evaluate MCP tool):
 *   Paste this entire IIFE into the function field.
 */
(() => {
  const report = {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    checks: [],
  };

  function add(id, name, status, details) {
    report.checks.push({ id, name, status, ...(details && { details }) });
  }

  // ── V1: Animation Inventory ──────────────────────────────────
  const lotties = document.querySelectorAll('[data-lottie-path]');
  const reveals = document.querySelectorAll('.scroll-reveal');
  const counters = document.querySelectorAll('.counter-animate');
  add('V1', 'Animation Inventory', 'INFO', {
    lottie: lotties.length,
    scrollReveal: reveals.length,
    counters: counters.length,
    total: lotties.length + reveals.length + counters.length,
  });

  // ── V3.1: Scroll-reveal triggered ───────────────────────────
  const visibleReveals = [...reveals].filter((el) => el.classList.contains('is-visible'));
  add('V3.1', 'Scroll Reveal Triggered',
    reveals.length === 0 ? 'PASS' : visibleReveals.length === reveals.length ? 'PASS' : 'WARN',
    { total: reveals.length, triggered: visibleReveals.length });

  // ── V3.2: Counter final values ──────────────────────────────
  const counterValues = [...counters].map((el) => el.textContent.trim());
  const countersOk = counterValues.every((v) => /^\d/.test(v) && !v.startsWith('0'));
  add('V3.2', 'Counter Final Values',
    counters.length === 0 ? 'PASS' : countersOk ? 'PASS' : 'FAIL',
    { values: counterValues });

  // ── V3.3: Lottie rendered ───────────────────────────────────
  const lottieDetails = [...lotties].map((c) => {
    const svg = c.querySelector('svg');
    const rect = c.getBoundingClientRect();
    return {
      path: c.dataset.lottiePath,
      hasSvg: !!svg,
      svgChildCount: svg ? svg.children.length : 0,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      ok: !!(svg && svg.children.length > 0 && rect.width > 0 && rect.height > 0),
    };
  });
  const allLottieOk = lottieDetails.every((d) => d.ok);
  add('V3.3', 'Lottie Rendered',
    lotties.length === 0 ? 'PASS' : allLottieOk ? 'PASS' : 'FAIL',
    { containers: lottieDetails });

  // ── V4.1: First section clean (no scroll-reveal on LCP) ────
  const firstSection = document.querySelector('main > .section');
  const firstHasReveal = firstSection && firstSection.classList.contains('scroll-reveal');
  add('V4.1', 'First Section No Reveal',
    firstSection ? (firstHasReveal ? 'FAIL' : 'PASS') : 'WARN',
    { firstSectionClasses: firstSection ? [...firstSection.classList] : [] });

  // ── V4.3: Lottie loaded via delayed.js (not in <head>) ─────
  const allScripts = [...document.querySelectorAll('script[src]')];
  const lottieScript = allScripts.find((s) => s.src.includes('lottie'));
  const lottieInHead = lottieScript && lottieScript.closest('head');
  add('V4.3', 'Lottie Load Phase',
    !lottieScript ? 'PASS' : lottieInHead ? 'FAIL' : 'PASS',
    { loaded: !!lottieScript, inHead: !!lottieInHead, src: lottieScript?.src || 'none' });

  // ── V4.4: No banned animation libraries ─────────────────────
  const banned = ['gsap', 'greensock', 'anime.min', 'aos.js', 'scrollmagic', 'waypoints', 'scrollreveal'];
  const scriptSrcs = allScripts.map((s) => s.src.toLowerCase());
  const bannedFound = banned.filter((lib) => scriptSrcs.some((src) => src.includes(lib)));
  add('V4.4', 'No Banned Libraries',
    bannedFound.length === 0 ? 'PASS' : 'FAIL',
    { bannedFound });

  // ── V5.3: Only compositor-friendly properties animated ──────
  const layoutProps = ['width', 'height', 'top', 'left', 'right', 'bottom', 'margin', 'padding'];
  const layoutViolations = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.style?.transitionProperty) {
          const props = rule.style.transitionProperty.split(',').map((p) => p.trim());
          const bad = props.filter((p) => layoutProps.some((lp) => p.includes(lp)));
          if (bad.length) layoutViolations.push({ selector: rule.selectorText, properties: bad });
        }
      }
    } catch (e) { /* cross-origin */ }
  }
  add('V5.3', 'Compositor-Only Properties',
    layoutViolations.length === 0 ? 'PASS' : 'WARN',
    { violations: layoutViolations });

  // ── V5.5: Lottie light build ────────────────────────────────
  const isLight = !lottieScript || lottieScript.src.includes('lottie_light');
  add('V5.5', 'Lottie Light Build',
    isLight ? 'PASS' : 'WARN',
    { src: lottieScript?.src || 'none' });

  // ── V6.1: Reduced-motion CSS rules exist ────────────────────
  const animatedSelectors = ['.scroll-reveal', '.animate-in', '.counter-animate'];
  const coveredByReducedMotion = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule instanceof CSSMediaRule && rule.conditionText?.includes('prefers-reduced-motion')) {
          [...rule.cssRules].forEach((inner) => {
            animatedSelectors.forEach((sel) => {
              if (inner.selectorText?.includes(sel.replace('.', ''))) {
                coveredByReducedMotion.push(sel);
              }
            });
          });
        }
      }
    } catch (e) { /* cross-origin */ }
  }
  const missingReducedMotion = animatedSelectors.filter((s) => !coveredByReducedMotion.includes(s));
  add('V6.1', 'Reduced Motion CSS',
    missingReducedMotion.length === 0 ? 'PASS' : 'WARN',
    { covered: [...new Set(coveredByReducedMotion)], missing: missingReducedMotion });

  // ── V6.6: Progressive enhancement (no permanently hidden) ──
  const permanentlyHidden = [];
  reveals.forEach((el) => {
    const style = getComputedStyle(el);
    if (style.opacity === '0' && style.transitionDuration === '0s') {
      permanentlyHidden.push(`${el.tagName}.${[...el.classList].join('.')}`);
    }
  });
  add('V6.6', 'Progressive Enhancement',
    permanentlyHidden.length === 0 ? 'PASS' : 'FAIL',
    { permanentlyHidden });

  // ── V7.1: DA Lottie link integrity (remote only) ───────────
  const heroBlocks = document.querySelectorAll('.hero');
  heroBlocks.forEach((hero) => {
    const imageCol = hero.querySelector(':scope > div > div:nth-child(2)');
    if (!imageCol) return;
    const lottieContainer = imageCol.querySelector('[data-lottie-path]');
    if (lottieContainer) {
      add('V7.1', 'DA Lottie Link Integrity', 'PASS',
        { path: lottieContainer.dataset.lottiePath });
    } else {
      const links = imageCol.querySelectorAll('a');
      const jsonLink = [...links].find((a) => a.textContent.trim().endsWith('.json'));
      add('V7.1', 'DA Lottie Link Integrity',
        jsonLink ? 'WARN' : 'FAIL',
        { linkFound: !!jsonLink, imageColPreview: imageCol.innerHTML.substring(0, 200) });
    }
  });

  // ── Summary ─────────────────────────────────────────────────
  const passed = report.checks.filter((c) => c.status === 'PASS').length;
  const failed = report.checks.filter((c) => c.status === 'FAIL').length;
  const warned = report.checks.filter((c) => c.status === 'WARN').length;
  const info = report.checks.filter((c) => c.status === 'INFO').length;

  report.summary = {
    total: report.checks.length,
    passed,
    failed,
    warned,
    info,
    overallStatus: failed > 0 ? 'FAIL' : warned > 0 ? 'WARN' : 'PASS',
  };

  return report;
})();
