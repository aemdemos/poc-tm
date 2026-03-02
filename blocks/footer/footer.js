import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
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
}
