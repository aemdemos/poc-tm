import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  getMetadata,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Moves all the attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function autolinkModals(doc) {
  doc.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');
    if (origin && origin.href && origin.href.includes('/modals/')) {
      e.preventDefault();
      const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
      openModal(origin.href);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function a11yLinks(main) {
  const links = main.querySelectorAll('a');
  links.forEach((link) => {
    let label = link.textContent;
    if (!label && link.querySelector('span.icon')) {
      const icon = link.querySelector('span.icon');
      label = icon ? icon.classList[1]?.split('-')[1] : label;
    }
    link.setAttribute('aria-label', label);
  });
}

/**
 * Fix broken images served as about:error from CDN cache.
 * Fetches the local .plain.html source to recover original image URLs.
 */
async function fixBrokenImages(main) {
  const broken = main.querySelectorAll('img[src="about:error"]');
  if (!broken.length) return;
  try {
    const path = window.location.pathname.replace(/\/$/, '');
    const localPath = `/content${path}.plain.html`;
    const resp = await fetch(localPath);
    if (!resp.ok) return;
    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const localImgs = doc.querySelectorAll('img');
    const localSrcs = [...localImgs]
      .map((img) => img.getAttribute('src'))
      .filter((src) => src && src.startsWith('http'));
    const servedImgs = main.querySelectorAll('img');
    let srcIdx = 0;
    servedImgs.forEach((img) => {
      if (img.src === 'about:error' && srcIdx < localSrcs.length) {
        img.src = localSrcs[srcIdx];
        img.style.display = '';
        srcIdx += 1;
      } else if (img.src !== 'about:error') {
        srcIdx += 1;
      }
    });
  } catch (e) {
    // silently fail if local content not available
  }
}

/**
 * Convert standalone Lottie JSON links (outside of blocks) into animation containers.
 * Links inside blocks (e.g., columns) are handled by their own decorators.
 * @param {Element} main The main element
 */
function decorateLottieLinks(main) {
  main.querySelectorAll('a[href*="/lottie/"]').forEach((link) => {
    // Skip links already inside a decorated block
    if (link.closest('.block')) return;
    const href = link.getAttribute('href') || '';
    // AEM mangles .json → -json (e.g., /lottie/Hero9-Main.json → /lottie/hero9-main-json)
    // Match either the original .json extension or the mangled -json suffix
    if (!href.endsWith('.json') && !href.match(/-json$/)) return;
    // Reconstruct the actual .json path from the link text if available
    const text = link.textContent.trim();
    const lottiePath = text.endsWith('.json') ? text : href;
    const container = document.createElement('div');
    container.dataset.lottiePath = lottiePath;
    container.dataset.lottieLoop = 'true';
    container.classList.add('lottie-section-bg');
    const wrapper = link.closest('p') || link;
    wrapper.replaceWith(container);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  // convert standalone Lottie JSON links into animation containers
  decorateLottieLinks(main);
  // add aria-label to links
  a11yLinks(main);
  // fix CDN cached broken images
  fixBrokenImages(main);
}

/**
 * Extract metadata from the metadata block table in the DOM before decoration.
 * This ensures template/theme meta tags are available for decorateTemplateAndTheme().
 */
function extractMetadataFromDOM() {
  const metadataBlock = document.querySelector('main .metadata');
  if (!metadataBlock) return;
  metadataBlock.querySelectorAll(':scope > div').forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();
      if (key && value && !document.querySelector(`meta[name="${key}"]`)) {
        if (key === 'title') {
          document.title = value;
        } else {
          const tag = document.createElement('meta');
          tag.setAttribute('name', key);
          tag.setAttribute('content', value);
          document.head.appendChild(tag);
        }
      }
    }
  });
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  extractMetadataFromDOM();
  decorateTemplateAndTheme();
  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    doc.body.dataset.breadcrumbs = true;
  }
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Initializes scroll-reveal animations on sections below the fold.
 * Sections fade in as they enter the viewport. First section is skipped
 * since it's above-fold and already visible.
 * @param {Element} main The main element
 */
function initScrollReveal(main) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sections = main.querySelectorAll('.section');
  sections.forEach((section, i) => {
    if (i === 0) return; // skip first section (above-fold)
    section.classList.add('scroll-reveal');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  main.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  initScrollReveal(main);
  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 1500);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
