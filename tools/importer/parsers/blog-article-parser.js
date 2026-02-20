/**
 * Blog Article Parser
 * Extracts content from Zelis WordPress blog posts and generates EDS markdown.
 *
 * Source structure:
 *   article.type---post-single
 *     .hero (date + title + featured image)
 *     .post-author (avatar + name + bio)
 *     .post-content (article body)
 *     .resource-tags (tag links)
 *     .share-post (social links)
 *     .related-posts (3 resource cards)
 *
 * Target structure:
 *   Section 1: Default content (image, h1, date) + Columns (author bio)
 *   Section 2: Default content (article body)
 *   Section 3: Default content (tags + share)
 *   Section 4: Cards block in dark section (related posts)
 *   Section 5: Metadata block
 */

/**
 * Parse a blog article page DOM and return structured content
 * @param {Document} document - The parsed HTML document
 * @param {string} url - The source URL
 * @returns {object} Parsed content sections
 */
export function parse(document, url) {
  const article = document.querySelector('article');
  if (!article) return null;

  // Hero section
  const date = article.querySelector('.hero .leader')?.textContent?.trim() || '';
  const title = article.querySelector('.hero .post-title')?.textContent?.trim() || '';
  const featuredImg = article.querySelector('.hero .featured-img img')?.getAttribute('src') || '';

  // Author bio
  const authorAvatar = article.querySelector('.post-author .author-image')?.getAttribute('src') || '';
  const authorNameEl = article.querySelector('.post-author strong a');
  const authorName = authorNameEl?.textContent?.trim() || '';
  const authorLink = authorNameEl?.getAttribute('href') || '';
  const authorBio = article.querySelector('.post-author .has-small-font-size')?.textContent?.trim() || '';

  // Article body
  const bodyContainer = article.querySelector('.post-content .acf-innerblocks-container > .wp-block-column');
  const bodyHtml = bodyContainer?.innerHTML || '';

  // Tags
  const tags = [...document.querySelectorAll('.resource-tags .tags li a')]
    .map((a) => ({
      text: a.textContent.trim(),
      href: a.getAttribute('href'),
    }));

  // Social share links
  const shareLinks = [...document.querySelectorAll('.share-post a')]
    .map((a) => ({
      platform: a.querySelector('.visually-hidden')?.textContent?.trim() || '',
      href: a.getAttribute('href'),
    }))
    .filter((link) => link.platform);

  // Related posts
  const relatedPosts = [...document.querySelectorAll('.related-posts .resource')]
    .map((card) => ({
      category: card.querySelector('.leader')?.textContent?.trim() || '',
      image: card.querySelector('.wrapper img')?.getAttribute('src') || '',
      title: card.querySelector('.wrapper h3')?.textContent?.trim() || '',
      description: card.querySelector('.wrapper p')?.textContent?.trim() || '',
      link: card.querySelector('.wrapper a')?.getAttribute('href') || '',
      linkText: card.querySelector('.wrapper a')?.textContent?.trim() || '',
    }));

  // Page metadata from meta tags
  const getMeta = (selector, attr = 'content') => {
    const el = document.querySelector(selector);
    return el?.getAttribute(attr) || '';
  };

  const metadata = {
    title: getMeta("meta[property='og:title']") || title,
    description: getMeta("meta[property='og:description']") || getMeta("meta[name='description']"),
    author: getMeta("meta[name='author']") || authorName,
    date: (getMeta("meta[property='article:published_time']") || '').split('T')[0],
    image: getMeta("meta[property='og:image']") || featuredImg,
    tags: tags.map((t) => t.text).join(', '),
    template: 'blog-article',
  };

  return {
    hero: { date, title, featuredImg },
    author: { authorAvatar, authorName, authorLink, authorBio },
    bodyHtml,
    tags,
    shareLinks,
    relatedPosts,
    metadata,
  };
}

/**
 * Generate EDS markdown from parsed content
 * @param {object} parsed - Output from parse()
 * @returns {string} EDS-compliant markdown
 */
export function toMarkdown(parsed) {
  const lines = [];

  // Section 1: Hero + Author (default content + columns)
  if (parsed.hero.featuredImg) {
    lines.push(`![${parsed.hero.title}](${parsed.hero.featuredImg})`);
    lines.push('');
  }
  lines.push(`# ${parsed.hero.title}`);
  lines.push('');
  lines.push(parsed.hero.date);
  lines.push('');

  // Author bio as columns block
  lines.push('| Columns |  |');
  lines.push('| --- | --- |');
  const authorText = `**By: [${parsed.author.authorName}](${parsed.author.authorLink})** ${parsed.author.authorBio}`;
  lines.push(`| ![${parsed.author.authorName}](${parsed.author.authorAvatar}) | ${authorText} |`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Section 2: Article body (needs HTML-to-markdown conversion)
  lines.push('<!-- Article body content goes here - convert from bodyHtml -->');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Section 3: Tags + Share
  if (parsed.tags.length > 0) {
    lines.push(parsed.tags.map((t) => t.text).join(', '));
    lines.push('');
  }
  if (parsed.shareLinks.length > 0) {
    const shareStr = parsed.shareLinks.map((s) => `[${s.platform}](${s.href})`).join(' ');
    lines.push(`Share: ${shareStr}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  // Section 4: Related posts (cards in dark section)
  if (parsed.relatedPosts.length > 0) {
    lines.push('## Related Posts');
    lines.push('');
    lines.push('| Cards |  |');
    lines.push('| --- | --- |');
    parsed.relatedPosts.forEach((card) => {
      const cardText = `**${card.title}** ${card.description} [${card.linkText}](${card.link})`;
      lines.push(`| ![${card.title}](${card.image}) | ${cardText} |`);
    });
    lines.push('');
    lines.push('| Section Metadata |  |');
    lines.push('| --- | --- |');
    lines.push('| style | dark |');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Section 5: Page metadata
  lines.push('| Metadata |  |');
  lines.push('| --- | --- |');
  Object.entries(parsed.metadata).forEach(([key, value]) => {
    if (value) {
      lines.push(`| ${key} | ${value} |`);
    }
  });

  return lines.join('\n');
}
