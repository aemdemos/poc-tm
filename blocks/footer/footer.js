import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Groups flat child elements into wrapper divs, starting a new group
 * each time the delimiter function returns true for a child.
 * @param {Element} container Parent element with flat children
 * @param {Function} isDelimiter Returns true for elements that begin a new group
 */
function wrapGroups(container, isDelimiter) {
  const children = [...container.children];
  if (!children.length) return;
  container.replaceChildren();
  let group = null;
  children.forEach((child) => {
    if (isDelimiter(child)) {
      if (group) container.append(group);
      group = document.createElement('div');
    }
    if (!group) group = document.createElement('div');
    group.append(child);
  });
  if (group) container.append(group);
}

/* Featured resource thumbnail URLs keyed by slug from the "Read more" link. */
const FEATURED_THUMBNAILS = {
  'zelis-named-a-strong-performer-in-the-forrester-wave-customer-experience-platforms-for-healthcare-q1-2026': 'https://www.zelis.com/wp-content/uploads/2026/03/Forrester-Wave-Report_FWR-Option-3_Forrester-Wave-Report-ZHUB-1920x1200-v3-300x300.png',
  'accelerating-progress-in-healthcare-finance-a-call-to-action': 'https://www.zelis.com/wp-content/uploads/2025/05/2025_forum_0400-300x200.jpg',
  'cms-price-transparency-proposed-rule-payer': 'https://www.zelis.com/wp-content/uploads/2025/09/Zoom-Into-Price-Transparency_Thumbnail-300x170.jpg',
  'advancing-the-healthcare-financial-experience': 'https://www.zelis.com/wp-content/uploads/2026/01/Resource-Page-Image-SOTFE-300x200.png',
};

/**
 * Injects thumbnail images into featured resource cards when DA strips them.
 * @param {Element} section Featured resources section
 */
function injectFeaturedImages(section) {
  section.querySelectorAll(':scope > div').forEach((card) => {
    if (card.querySelector('img, picture')) return; // already has an image
    const link = card.querySelector('a');
    if (!link) return;
    const slug = link.getAttribute('href')?.split('/').filter(Boolean).pop();
    const src = FEATURED_THUMBNAILS[slug];
    if (!src) {
      // eslint-disable-next-line no-console
      console.warn(`[footer] No thumbnail mapped for featured resource slug: "${slug}"`);
      return;
    }
    const p = document.createElement('p');
    p.classList.add('featured-image');
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';
    p.append(img);
    card.prepend(p);
  });
}

/**
 * Restores the logo image and adds social-media icon links to the bottom bar.
 * @param {Element} section Bottom bar section element
 */
function decorateBottomBar(section) {
  // Convert plain-text logo link into an image link
  const logoLink = section.querySelector('a[href="/"]');
  if (logoLink && !logoLink.querySelector('img')) {
    const img = document.createElement('img');
    img.src = '/icons/zelis-logo.svg';
    img.alt = 'Zelis';
    img.loading = 'lazy';
    logoLink.replaceChildren(img);
    logoLink.classList.remove('button');
    logoLink.parentElement?.classList.remove('button-container');
  }

  // Inject social-media icon links when missing
  const firstP = section.querySelector('p');
  if (firstP && !section.querySelector('.icon')) {
    const socials = [
      { href: 'https://www.facebook.com/zelishealthcare', label: 'Facebook', icon: 'facebook' },
      { href: 'https://twitter.com/ZelisHealthcare', label: 'X (Twitter)', icon: 'x-twitter' },
      { href: 'https://www.linkedin.com/company/zelis', label: 'LinkedIn', icon: 'linkedin' },
      { href: 'https://www.youtube.com/channel/UCm8HoCo4_ZWSSIoIXGTTYcg', label: 'YouTube', icon: 'youtube' },
    ];
    socials.forEach(({ href, label, icon }) => {
      const a = document.createElement('a');
      a.href = href;
      a.setAttribute('aria-label', label);
      const span = document.createElement('span');
      span.className = `icon icon-${icon}`;
      a.append(span);
      firstP.append(a);
    });
    return true; // signal that new icons were added
  }
  return false;
}

/**
 * Loads and decorates the footer.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';

  // Unwrap section wrappers so footer CSS selectors work correctly.
  // Fragment loading wraps each top-level div in .section > .default-content-wrapper.
  // We need: .footer > div (featured) + div (links) + div (bottom bar)
  const sections = fragment.querySelectorAll('.section');
  sections.forEach((section) => {
    const wrapper = section.querySelector('.default-content-wrapper');
    if (wrapper) {
      const div = document.createElement('div');
      while (wrapper.firstElementChild) {
        div.append(wrapper.firstElementChild);
      }
      block.append(div);
    }
  });

  // Featured resources (first section): group flat elements into card divs.
  // DA flattens the div structure. Cards start with an image (if present)
  // or the "Featured Resource" label (if images were stripped).
  const featured = block.children[0];
  if (featured && !featured.querySelector(':scope > div')) {
    const hasImages = featured.querySelector('img, picture');
    if (hasImages) {
      wrapGroups(featured, (el) => el.tagName === 'P' && !!el.querySelector('img, picture'));
    } else {
      wrapGroups(featured, (el) => el.tagName === 'P' && el.textContent.trim() === 'Featured Resource');
    }
  }

  // Inject thumbnail images when DA has stripped them
  if (featured) {
    injectFeaturedImages(featured);
  }

  // Add helper classes for CSS targeting (works with or without images)
  if (featured) {
    featured.querySelectorAll(':scope > div > p').forEach((p) => {
      if (p.textContent.trim() === 'Featured Resource') {
        p.classList.add('featured-label');
      }
      if (p.querySelector('img, picture')) {
        p.classList.add('featured-image');
      }
    });
  }

  // Link columns (second section): group flat elements into column divs.
  // Split on each <h5> heading.
  const links = block.children[1];
  if (links && !links.querySelector(':scope > div')) {
    wrapGroups(links, (el) => el.tagName === 'H5');
  }

  // Bottom bar (third section): restore logo image and add social icons.
  const bottom = block.children[2];
  let iconsAdded = false;
  if (bottom) {
    iconsAdded = decorateBottomBar(bottom);
  }

  // Load SVGs into dynamically added icon spans (only if we added new ones)
  if (iconsAdded) {
    decorateIcons(block);
  }
}
