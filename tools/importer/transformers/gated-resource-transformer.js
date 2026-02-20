/**
 * Gated Resource Transformer
 * Transforms raw WordPress HTML content for gated resource pages into clean content.
 *
 * Handles:
 * - WordPress block markup cleanup
 * - HubSpot form ID extraction
 * - Description text extraction from nested spans
 * - Bullet list normalization
 * - Image URL resolution
 */

const SOURCE_DOMAIN = 'https://www.zelis.com';

/**
 * Clean hero section HTML and extract structured content
 * @param {Element} heroElement - The .block--resource-hero DOM element
 * @returns {object} Structured hero content
 */
export function extractHeroContent(heroElement) {
  const result = {
    title: '',
    subtitle: '',
    paragraphs: [],
    bulletPoints: [],
    formId: '',
    formHeading: 'Read now',
  };

  if (!heroElement) return result;

  // Extract title
  const h1 = heroElement.querySelector('h1.post-title');
  result.title = h1?.textContent.trim() || '';

  // Extract subtitle from h3 > b > span
  const subtitle = heroElement.querySelector('h3 b span');
  result.subtitle = subtitle?.textContent.trim() || '';

  // Extract description paragraphs
  const leftCol = heroElement.querySelector('.col-12.col-lg-6:first-child');
  if (leftCol) {
    leftCol.querySelectorAll('p').forEach((p) => {
      const text = cleanSpanText(p);
      if (text) result.paragraphs.push(text);
    });

    // Extract bullet points
    leftCol.querySelectorAll('ul li').forEach((li) => {
      const text = cleanSpanText(li);
      if (text) result.bulletPoints.push(text);
    });
  }

  // Extract HubSpot form ID
  const formDiv = heroElement.querySelector('.hbspt-form');
  if (formDiv && formDiv.id) {
    result.formId = formDiv.id.replace('hbspt-form-', '');
  }

  const formHeading = heroElement.querySelector('.gated-wrapper h2');
  if (formHeading) {
    result.formHeading = formHeading.textContent.trim();
  }

  return result;
}

/**
 * Clean text from WordPress span-wrapped content
 * Removes nbsp entities and extra whitespace
 * @param {Element} element - DOM element containing spans
 * @returns {string} Cleaned text
 */
function cleanSpanText(element) {
  return element.textContent
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract related posts from the related-posts section
 * @param {Element} relatedSection - The .related-posts DOM element
 * @returns {Array} Array of post objects
 */
export function extractRelatedPosts(relatedSection) {
  const posts = [];
  if (!relatedSection) return posts;

  relatedSection.querySelectorAll('.resource').forEach((card) => {
    const post = {};
    const leader = card.querySelector('.leader');
    post.category = leader?.textContent.trim().replace(/\s+/g, ' ') || '';

    const img = card.querySelector('.wp-post-image');
    post.image = img?.getAttribute('src') || '';
    if (post.image.startsWith('/')) {
      post.image = `${SOURCE_DOMAIN}${post.image}`;
    }

    post.title = card.querySelector('h3')?.textContent.trim() || '';

    const desc = card.querySelector('p:not(.leader)');
    post.description = desc?.textContent.trim() || '';

    const cta = card.querySelector('a.mt-auto');
    post.ctaText = cta?.textContent.trim() || '';
    post.ctaUrl = cta?.getAttribute('href') || '';
    if (post.ctaUrl.startsWith('/')) {
      post.ctaUrl = `${SOURCE_DOMAIN}${post.ctaUrl}`;
    }

    if (post.title) posts.push(post);
  });

  return posts;
}

/**
 * Extract tags from the resource-tags section
 * @param {Element} tagSection - The .resource-tags DOM element
 * @returns {Array<string>} Array of tag strings
 */
export function extractTags(tagSection) {
  const tags = [];
  if (!tagSection) return tags;

  tagSection.querySelectorAll('.tag a').forEach((a) => {
    const tag = a.textContent.trim();
    if (tag) tags.push(tag);
  });

  return tags;
}

/**
 * Extract share links from the share-post section
 * @param {Element} shareSection - The .share-post DOM element
 * @returns {Array<{label: string, href: string}>}
 */
export function extractShareLinks(shareSection) {
  const links = [];
  if (!shareSection) return links;

  shareSection.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    const label = a.querySelector('.visually-hidden')?.textContent.trim()
      || a.textContent.trim();
    if (href && label) {
      links.push({ label, href });
    }
  });

  return links;
}
