// Animation libraries loaded after page is interactive (3s delay).
// Content is visible without these — animations are progressive enhancement.

import { loadScript } from './aem.js';

async function initLottie() {
  await loadScript('https://cdn.jsdelivr.net/npm/lottie-web@5/build/player/lottie_light.min.js');

  document.querySelectorAll('[data-lottie-path]').forEach((container) => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fallbackImg = container.querySelector('img');

    const anim = window.lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: container.dataset.lottieLoop !== 'false',
      autoplay: !reducedMotion,
      path: container.dataset.lottiePath,
    });

    // Remove fallback image once Lottie renders
    anim.addEventListener('DOMLoaded', () => {
      if (fallbackImg) fallbackImg.style.display = 'none';
    });

    // If reduced motion, show first frame only
    if (reducedMotion) {
      anim.addEventListener('DOMLoaded', () => {
        anim.goToAndStop(0, true);
      });
    }
  });

  window.dispatchEvent(new CustomEvent('lottie-ready'));
}

initLottie();
