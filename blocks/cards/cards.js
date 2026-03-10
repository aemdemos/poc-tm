import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/* ---- Icon Cards: SVG data for "We Are Zelis" feature cards ---- */
const ICON_SVGS = {
  'Technology built by healthcare experts.': '<svg viewBox="0 0 70 88" fill="none" aria-hidden="true"><g clip-path="url(#ic-tech)"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.057 73.282L6.02 68.347L20.557 82.997L13.884 86.238L1.057 73.282Z" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:54 56;stroke-dashoffset:55"/><path d="M6.02 68.347s4.018-5.026 8.471-5.705c4.454-.68 7.985 0 7.985 0l21.097 2.382s3.081.68 3.081 4.428c0 3.749-4.618 3.92-4.618 3.92l-16.254-.68" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:69 71;stroke-dashoffset:70"/><path d="M20.557 82.997l21.644.597s4.273.851 8.037-3.748L68.028 62.126s2.736-2.852 0-6.025c-2.736-3.174-6.297-.732-6.297-.732L46.639 69.452" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:91 93;stroke-dashoffset:92"/><path d="M62.248 55.078s-3.112-2.494-6.193.403L45.065 65.8" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:22 24;stroke-dashoffset:23"/><path d="M55.854 55.667s-2.707-1.725-5.443.15L40.86 64.71" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:19 21;stroke-dashoffset:20"/><path d="M6.356 74.313a1.372 1.372 0 100-2.733 1.372 1.372 0 000 2.733z" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:9 11;stroke-dashoffset:10"/><path d="M50.538 25.605c0-9.035-7.355-16.353-16.419-16.353S17.693 16.57 17.693 25.605c0 5.861 3.097 10.999 7.745 13.889v12.753h17.355V39.494c4.649-2.89 7.745-8.027 7.745-13.889z" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:128 130;stroke-dashoffset:129"/><path d="M22.686 43.048h22.858" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:23 25;stroke-dashoffset:24"/><path d="M22.686 47.834h22.858" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:23 25;stroke-dashoffset:24"/><path d="M38.753 56.369h-9.274l-1.297-4.129h11.868l-1.297 4.13z" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:30 32;stroke-dashoffset:31"/><path d="M34.111 0v5.175" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:6 8;stroke-dashoffset:7"/><path d="M12.279 13.889l3.846 1.926" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:5 7;stroke-dashoffset:6"/><path d="M20.385 5.735l1.679 2.337" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:3 5;stroke-dashoffset:4"/><path d="M55.95 13.889l-4.34 2.18" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:5 7;stroke-dashoffset:6"/><path d="M47.846 5.735l-1.86 2.583" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:4 6;stroke-dashoffset:5"/></g><defs><clipPath id="ic-tech"><rect width="70" height="88" fill="white"/></clipPath></defs></svg>',

  'Partnership that evolves with you.': '<svg viewBox="0 0 70 88" fill="none" aria-hidden="true"><g clip-path="url(#ic-partner)"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.057 73.072L6.02 68.066L20.557 82.926L13.884 86.213L1.057 73.072Z" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:54 56;stroke-dashoffset:55"/><path d="M6.02 68.066s4.018-5.097 8.471-5.787c4.454-.69 7.985 0 7.985 0l21.097 2.416s3.081.69 3.081 4.505c0 3.803-4.618 3.977-4.618 3.977l-16.254-.685" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:69 71;stroke-dashoffset:70"/><path d="M20.557 82.926l21.644.605s4.273.864 8.037-3.803L68.028 61.757s2.736-2.893 0-6.113c-2.736-3.22-.297-.732-6.297.757L46.639 69.187" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:91 93;stroke-dashoffset:92"/><path d="M62.248 54.607s-3.112-2.53-6.193.409L45.065 65.483" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:22 24;stroke-dashoffset:23"/><path d="M55.853 55.205s-2.707-1.752-5.443.152L40.858 64.377" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:19 21;stroke-dashoffset:20"/><path d="M6.357 74.117a1.386 1.386 0 100-2.772 1.386 1.386 0 000 2.772z" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:9 11;stroke-dashoffset:10"/><path fill-rule="evenodd" clip-rule="evenodd" d="M33.647 13.436l-5.331 12.11 5.331 5.378-5.331 13.163 13.42-15.33-5.428-4.559 6.665-10.762h-9.326z" stroke="#23004B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:85 87;stroke-dashoffset:86"/><path d="M49.353 48.525c7.205-4.794 11.958-13.042 11.958-22.41 0-11.8-7.542-21.82-18.03-25.403" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:60 62;stroke-dashoffset:61"/><path d="M19.777 3.991c-6.972 4.832-11.546 12.936-11.546 22.123 0 12.035 7.842 22.214 18.645 25.607" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:60 62;stroke-dashoffset:61"/><path d="M14.717 3.257h5.495l-.12 5.43" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:11 13;stroke-dashoffset:12"/><path d="M54.45 49.457h-5.495l.12-5.43" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:11 13;stroke-dashoffset:12"/></g><defs><clipPath id="ic-partner"><rect width="70" height="88" fill="white"/></clipPath></defs></svg>',

  'Visibility that unlocks value.': '<svg viewBox="0 0 70 85" fill="none" aria-hidden="true"><g clip-path="url(#ic-visibility)"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.057 70.161L6.02 65.177L20.557 79.948L13.884 83.216L1.057 70.161Z" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:54 56;stroke-dashoffset:55"/><path d="M6.02 65.177s4.018-5.067 8.471-5.752c4.454-.686 7.985 0 7.985 0l21.097 2.402s3.081.685 3.081 4.466c0 3.78-4.618 3.953-4.618 3.953l-16.254-.685" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:69 71;stroke-dashoffset:70"/><path d="M20.557 79.948l21.644.602s4.273.858 8.037-3.777L68.028 58.905s2.736-2.876 0-6.076c-2.736-3.2-6.297-.738-6.297-.738L46.639 66.291" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:91 93;stroke-dashoffset:92"/><path d="M62.248 51.798s-3.112-2.515-6.193.407L45.065 62.61" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:22 24;stroke-dashoffset:23"/><path d="M55.853 52.393s-2.707-1.74-5.443.15L40.858 61.51" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:19 21;stroke-dashoffset:20"/><path d="M6.357 71.192a1.378 1.378 0 100-2.756 1.378 1.378 0 000 2.756z" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:9 11;stroke-dashoffset:10"/><path d="M13.412 1.973c1.86-.783 3.838-1.205 5.825-1.22 5.248-.053 10.361 2.741 13.832 7.988.277.023.795-.173 1.095-.587 4.918-7.017 12.617-8.952 19.215-6.181 6.237 2.628 11.485 9.75 9.139 19.756-2.19 9.343-9.611 17.166-16.992 22.398-5.99 4.901-11.635 7.988-12.67 8.56a1.1 1.1 0 01-.315.12c-.112.03-.218.046-.315.038-.727-.392-6.553-3.501-12.79-8.575-6.432-5.24-13.952-13.115-16.163-22.534C5.927 11.722 11.175 4.6 13.412 1.973z" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:181 183;stroke-dashoffset:182"/><path d="M9.776 22.805a38.7 38.7 0 01-.6-2.056c-1.807-7.702 2.234-13.19 7.04-15.208" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:21 23;stroke-dashoffset:22"/><path d="M11.044 25.756a16.88 16.88 0 01-.938-2.071" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:3 5;stroke-dashoffset:4"/><path d="M12.82 28.768a17.67 17.67 0 01-1.222-1.966" stroke="#23004B" stroke-width="2" stroke-miterlimit="10" style="stroke-dasharray:3 5;stroke-dashoffset:4"/></g><defs><clipPath id="ic-visibility"><rect width="70" height="85" fill="white"/></clipPath></defs></svg>',
};

function initIconCards(block) {
  const section = block.closest('.section');
  if (!section) return;

  const eyebrow = section.querySelector('.default-content-wrapper p');
  if (!eyebrow || eyebrow.textContent.trim() !== 'We Are Zelis') return;

  block.classList.add('icon-cards');

  /* Inject SVG icons into each card */
  block.querySelectorAll('ul > li').forEach((li) => {
    const body = li.querySelector('.cards-card-body');
    const strong = body?.querySelector('strong');
    if (!strong) return;

    const heading = strong.textContent.trim();
    const svgMarkup = ICON_SVGS[heading];
    if (!svgMarkup) return;

    /* Remove empty second cards-card-body div */
    const emptyDiv = [...li.querySelectorAll('.cards-card-body')].find((d) => !d.textContent.trim());
    if (emptyDiv) emptyDiv.remove();

    /* Insert icon div before the body */
    const iconDiv = document.createElement('div');
    iconDiv.className = 'cards-card-icon';
    iconDiv.innerHTML = svgMarkup;
    li.prepend(iconDiv);
  });

  /* Animate stroke-draw on scroll into view */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    block.classList.add('animated');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        block.classList.add('animated');
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  observer.observe(block);
}

function animateCounter(el, target, prefix, suffix, duration = 2000) {
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - (1 - progress) ** 3; // ease-out cubic
    const current = Math.round(eased * target);
    el.textContent = `${prefix}${current}${suffix}`;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initStatsCounters(block) {
  const statElements = block.querySelectorAll('strong');
  const parsed = [];

  statElements.forEach((el) => {
    const text = el.textContent.trim();
    const match = text.match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)/);
    if (match) {
      const prefix = match[1];
      const target = parseFloat(match[2]);
      const suffix = match[3];
      parsed.push({
        el, target, prefix, suffix,
      });
      el.textContent = `${prefix}0${suffix}`;
      el.classList.add('counter-animate');
    }
  });

  if (!parsed.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    parsed.forEach(({
      el, target, prefix, suffix,
    }) => { el.textContent = `${prefix}${target}${suffix}`; });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        parsed.forEach(({
          el, target, prefix, suffix,
        }, i) => {
          setTimeout(() => animateCounter(el, target, prefix, suffix), i * 150);
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

  /* Animated SVG icons for "We Are Zelis" feature cards */
  initIconCards(block);
}
