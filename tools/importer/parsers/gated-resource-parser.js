/**
 * Gated Resource Parser
 * Extracts structured content from gated resource pages (white papers, webinars, etc.)
 *
 * Expected DOM structure:
 * - .block--resource-hero (two-column: description + HubSpot form)
 * - .resource-tags (category tags)
 * - .share-post (social sharing links)
 * - .related-posts (3-card grid)
 */

const SOURCE_DOMAIN = 'https://www.zelis.com';

/**
 * Parse a gated resource page DOM into structured content
 * @param {Document} document - The page DOM
 * @param {string} url - The source URL
 * @returns {object} Parsed page content
 */
export function parse(document, url) {
  const result = {
    url,
    template: 'gated-resource',
    hero: {},
    tags: [],
    shareLinks: [],
    relatedPosts: [],
    metadata: {},
  };

  // Parse hero section
  const heroSection = document.querySelector('.block--resource-hero');
  if (heroSection) {
    result.hero.title = heroSection.querySelector('h1.post-title')?.textContent.trim() || '';

    const subtitle = heroSection.querySelector('h3 b span');
    result.hero.subtitle = subtitle?.textContent.trim() || '';

    // Extract description paragraphs from left column
    const leftCol = heroSection.querySelector('.col-12.col-lg-6:first-child');
    if (leftCol) {
      result.hero.paragraphs = [];
      leftCol.querySelectorAll('p').forEach((p) => {
        const text = p.textContent.trim().replace(/\u00A0/g, ' ').trim();
        if (text) result.hero.paragraphs.push(text);
      });

      result.hero.bulletPoints = [];
      leftCol.querySelectorAll('ul li').forEach((li) => {
        const text = li.textContent.trim().replace(/\u00A0/g, ' ').trim();
        if (text) result.hero.bulletPoints.push(text);
      });
    }

    // Extract HubSpot form ID from right column
    const formDiv = heroSection.querySelector('.hbspt-form');
    if (formDiv) {
      const formId = formDiv.id?.replace('hbspt-form-', '') || '';
      result.hero.hubspotFormId = formId;
    }
    const formHeading = heroSection.querySelector('.gated-wrapper h2');
    result.hero.formHeading = formHeading?.textContent.trim() || 'Read now';
  }

  // Parse tags
  const tagSection = document.querySelector('.resource-tags');
  if (tagSection) {
    tagSection.querySelectorAll('.tag a').forEach((a) => {
      result.tags.push(a.textContent.trim());
    });
  }

  // Parse share links
  const shareSection = document.querySelector('.share-post');
  if (shareSection) {
    shareSection.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      const label = a.querySelector('.visually-hidden')?.textContent.trim()
        || a.textContent.trim();
      if (href && label) {
        result.shareLinks.push({ label, href });
      }
    });
  }

  // Parse related posts
  const relatedSection = document.querySelector('.related-posts');
  if (relatedSection) {
    relatedSection.querySelectorAll('.resource').forEach((card) => {
      const post = {};
      post.category = card.querySelector('.leader')?.textContent.trim() || '';
      const img = card.querySelector('.wp-post-image');
      post.image = img?.getAttribute('src') || '';
      post.title = card.querySelector('h3')?.textContent.trim() || '';
      post.description = card.querySelector('p:not(.leader)')?.textContent.trim() || '';
      const cta = card.querySelector('a.mt-auto');
      post.ctaText = cta?.textContent.trim() || '';
      post.ctaUrl = cta?.getAttribute('href') || '';
      if (post.title) result.relatedPosts.push(post);
    });
  }

  // Extract metadata
  const getMeta = (name) => document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.getAttribute('content') || '';

  result.metadata = {
    title: getMeta('og:title') || result.hero.title,
    description: getMeta('description'),
    date: getMeta('article:published_time')?.split('T')[0] || '',
    image: getMeta('og:image'),
    tags: result.tags.join(', '),
    category: extractCategory(document),
    template: 'gated-resource',
  };

  return result;
}

/**
 * Extract content category from article classes
 */
function extractCategory(document) {
  const article = document.querySelector('article');
  if (!article) return '';
  const classes = article.className;
  const match = classes.match(/category-([a-z-]+)/);
  if (match) {
    return match[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return '';
}

/**
 * Convert parsed content to EDS markdown
 * @param {object} parsed - Output from parse()
 * @returns {string} EDS-compatible markdown
 */
export function toMarkdown(parsed) {
  const lines = [];

  // Section 1: Hero with form (dark)
  lines.push(`# ${parsed.hero.title}`);
  lines.push('');

  // Columns block: description (left) + form (right)
  const descParts = [];
  if (parsed.hero.subtitle) {
    descParts.push(`**${parsed.hero.subtitle}**`);
  }
  parsed.hero.paragraphs.forEach((p) => {
    descParts.push(p);
  });
  const leftContent = descParts.join(' ');

  const formUrl = parsed.hero.hubspotFormId
    ? `https://share.hsforms.com/${parsed.hero.hubspotFormId}`
    : '#';
  const rightContent = `**${parsed.hero.formHeading}** [Download now](${formUrl})`;

  lines.push('| Columns |  |');
  lines.push('| --- | --- |');
  lines.push(`| ${leftContent} | ${rightContent} |`);
  lines.push('');

  // Bullet points (below columns, still in dark section)
  if (parsed.hero.bulletPoints.length > 0) {
    parsed.hero.bulletPoints.forEach((bp) => {
      lines.push(`- ${bp}`);
    });
    lines.push('');
  }

  // Closing paragraph (if any text after "learn how to:")
  const closingParas = parsed.hero.paragraphs.filter(
    (p) => !p.includes('learn how to') && !p.includes('comes in') && !p.includes('explores how'),
  );
  const lastPara = closingParas[closingParas.length - 1];
  if (lastPara && !descParts.includes(lastPara)) {
    lines.push(lastPara);
    lines.push('');
  }

  lines.push('| Section Metadata |  |');
  lines.push('| --- | --- |');
  lines.push('| style | dark |');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Section 2: Tags + Share
  if (parsed.tags.length > 0) {
    lines.push(parsed.tags.join(', '));
    lines.push('');
  }

  if (parsed.shareLinks.length > 0) {
    const shareText = parsed.shareLinks
      .map((s) => `[${s.label}](${s.href})`)
      .join(' ');
    lines.push(`Share: ${shareText}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  // Section 3: Related Posts (dark)
  lines.push('## Related Posts');
  lines.push('');
  lines.push('[View all resources](https://www.zelis.com/resources/)');
  lines.push('');

  if (parsed.relatedPosts.length > 0) {
    lines.push('| Cards |  |');
    lines.push('| --- | --- |');
    parsed.relatedPosts.forEach((post) => {
      const imgAlt = post.title.substring(0, 50);
      const imgSrc = post.image.startsWith('/') ? `${SOURCE_DOMAIN}${post.image}` : post.image;
      const ctaUrl = post.ctaUrl.startsWith('/') ? `${SOURCE_DOMAIN}${post.ctaUrl}` : post.ctaUrl;
      lines.push(`| ![${imgAlt}](${imgSrc}) | **${post.title}** ${post.description} [${post.ctaText}](${ctaUrl}) |`);
    });
    lines.push('');
  }

  lines.push('| Section Metadata |  |');
  lines.push('| --- | --- |');
  lines.push('| style | dark |');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Metadata block
  lines.push('| Metadata |  |');
  lines.push('| --- | --- |');
  Object.entries(parsed.metadata).forEach(([key, value]) => {
    if (value) lines.push(`| ${key} | ${value} |`);
  });

  return lines.join('\n');
}
