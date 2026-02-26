import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';


function animateCounter(el, target, suffix, duration = 2000) {
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - (1 - progress) ** 3; // ease-out cubic
    const current = Math.round(eased * target);
    el.textContent = `${current}${suffix}`;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initStatsCounters(block) {
  const statElements = block.querySelectorAll('strong');
  const parsed = [];

  statElements.forEach((el) => {
    const text = el.textContent.trim();
    const match = text.match(/^(\d+(?:\.\d+)?)(.*)/);
    if (match) {
      const target = parseFloat(match[1]);
      const suffix = match[2];
      parsed.push({ el, target, suffix });
      el.textContent = `0${suffix}`;
      el.classList.add('counter-animate');
    }
  });

  if (!parsed.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    parsed.forEach(({ el, target, suffix }) => { el.textContent = `${target}${suffix}`; });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        parsed.forEach(({ el, target, suffix }, i) => {
          setTimeout(() => animateCounter(el, target, suffix), i * 150);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(block);
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  /* Stats counter animation for center-aligned cards */
  if (block.closest('.section.center')) {
    initStatsCounters(block);
  }
}
