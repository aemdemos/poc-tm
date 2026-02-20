/**
 * Case Study Parser
 * Extracts structured content from Zelis case study pages.
 *
 * Expected sections:
 * - Hero (H1 + featured image)
 * - Summary (H2 subtitle + Challenge/Solution columns)
 * - Stats (gold background, 3 KPI metrics)
 * - Narrative (Deeper Dive: detailed Challenge/Solution + CTA)
 * - Tags + Share
 * - Related Posts (3-card grid)
 */

const SOURCE_DOMAIN = 'https://www.zelis.com';

/**
 * Parse a case study page DOM into structured content
 * @param {Document} document - The page DOM
 * @param {string} url - The source URL
 * @returns {object} Parsed page content
 */
export function parse(document, url) {
  const result = {
    url,
    template: 'case-study',
    hero: {},
    summary: {},
    stats: [],
    narrative: {},
    tags: [],
    shareLinks: [],
    relatedPosts: [],
    metadata: {},
  };

  const mainSections = document.querySelectorAll('main section.block--section-wrapper');

  // Parse hero (first section)
  if (mainSections.length > 0) {
    const heroSection = mainSections[0];
    result.hero.title = heroSection.querySelector('.post-title, h1')?.textContent.trim() || '';
    const heroImg = heroSection.querySelector('.featured-wrapper img, .wp-post-image');
    result.hero.image = heroImg?.getAttribute('src') || '';
    result.hero.imageAlt = heroImg?.getAttribute('alt') || '';
  }

  // Parse summary (second section)
  if (mainSections.length > 1) {
    const summarySection = mainSections[1];
    result.summary.heading = summarySection.querySelector('h2')?.textContent.trim() || '';
    const columns = summarySection.querySelectorAll('.wp-block-columns .wp-block-column');
    if (columns.length >= 2) {
      result.summary.challengeHeading = columns[0].querySelector('h3')?.textContent.trim() || 'The Challenge';
      result.summary.challengeText = columns[0].querySelector('p')?.textContent.trim() || '';
      result.summary.solutionHeading = columns[1].querySelector('h3')?.textContent.trim() || 'The Solution';
      result.summary.solutionText = columns[1].querySelector('p')?.textContent.trim() || '';
    }
  }

  // Parse stats (gold background section)
  const goldSection = document.querySelector('section.has-gold-background-color');
  if (goldSection) {
    const statElements = goldSection.querySelectorAll('.stat');
    statElements.forEach((stat) => {
      const value = stat.querySelector('.value')?.textContent.trim() || '';
      const desc = stat.querySelector('.desc')?.textContent.trim() || '';
      if (value) result.stats.push({ value, description: desc });
    });
  }

  // Parse narrative / deeper dive (section after stats)
  const narrativeSection = mainSections.length > 3 ? mainSections[3] : null;
  if (narrativeSection) {
    result.narrative.subtitle = narrativeSection.querySelector('.has-lead-font-size')?.textContent.trim() || '';
    result.narrative.heading = narrativeSection.querySelector('h2')?.textContent.trim() || '';

    const narColumns = narrativeSection.querySelectorAll('.wp-block-columns');
    if (narColumns.length >= 2) {
      const detailCols = narColumns[1].querySelectorAll('.wp-block-column');
      if (detailCols.length >= 2) {
        result.narrative.challengeHeading = detailCols[0].querySelector('h3')?.textContent.trim() || 'The Challenge';
        const challengePs = detailCols[0].querySelectorAll('p');
        result.narrative.challengeBold = challengePs[0]?.textContent.trim() || '';
        result.narrative.challengeText = challengePs[1]?.textContent.trim() || '';

        result.narrative.solutionHeading = detailCols[1].querySelector('h3')?.textContent.trim() || 'The Solution';
        const solutionPs = detailCols[1].querySelectorAll('p');
        result.narrative.solutionBold = solutionPs[0]?.textContent.trim() || '';
        result.narrative.solutionText = solutionPs[1]?.textContent.trim() || '';
      }
    }

    const cta = narrativeSection.querySelector('.wp-block-button__link');
    result.narrative.ctaText = cta?.textContent.trim() || '';
    result.narrative.ctaUrl = cta?.getAttribute('href') || '';
  }

  // Parse tags
  document.querySelectorAll('.resource-tags .tag a').forEach((tag) => {
    const text = tag.textContent.trim();
    if (text) result.tags.push(text);
  });

  // Parse share links
  document.querySelectorAll('.share-post a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    const label = link.querySelector('.visually-hidden')?.textContent.trim()
      || link.textContent.trim() || '';
    if (href && label) result.shareLinks.push({ label, url: href });
  });

  // Parse related posts
  document.querySelectorAll('.related-posts .resource').forEach((card) => {
    const img = card.querySelector('.wp-post-image');
    const title = card.querySelector('h3')?.textContent.trim() || '';
    const desc = card.querySelector('p:not(.leader)')?.textContent.trim() || '';
    const ctaLink = card.querySelector('a.mt-auto, a:last-of-type');
    const category = card.querySelector('.leader')?.textContent.trim() || '';
    if (title) {
      result.relatedPosts.push({
        category,
        image: img?.getAttribute('src') || '',
        imageAlt: img?.getAttribute('alt') || '',
        title,
        description: desc,
        ctaText: ctaLink?.textContent.trim() || '',
        ctaUrl: ctaLink?.getAttribute('href') || '',
      });
    }
  });

  // Extract metadata
  const getMeta = (name) => document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.getAttribute('content') || '';
  result.metadata = {
    title: getMeta('og:title') || result.hero.title,
    description: getMeta('description'),
    image: getMeta('og:image'),
    date: getMeta('article:published_time')?.split('T')[0] || '',
    template: 'case-study',
  };

  return result;
}

/**
 * Convert parsed content to EDS markdown
 * @param {object} parsed - Output from parse()
 * @returns {string} EDS-compatible markdown
 */
export function toMarkdown(parsed) {
  const lines = [];

  // Section 1: Hero
  lines.push(`# ${parsed.hero.title}`);
  lines.push('');
  if (parsed.hero.image) {
    const imgSrc = parsed.hero.image.startsWith('/') ? `${SOURCE_DOMAIN}${parsed.hero.image}` : parsed.hero.image;
    lines.push(`![${parsed.hero.imageAlt || 'Case study hero'}](${imgSrc})`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  // Section 2: Summary
  if (parsed.summary.heading) {
    lines.push(`## ${parsed.summary.heading}`);
    lines.push('');
    lines.push('| Columns |  |');
    lines.push('| --- | --- |');
    lines.push(`| **${parsed.summary.challengeHeading}** ${parsed.summary.challengeText} | **${parsed.summary.solutionHeading}** ${parsed.summary.solutionText} |`);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Section 3: Stats
  if (parsed.stats.length > 0) {
    lines.push('| Cards |  |');
    lines.push('| --- | --- |');
    parsed.stats.forEach((s) => {
      lines.push(`| **${s.value}** ${s.description} |  |`);
    });
    lines.push('');
    lines.push('| Section Metadata |  |');
    lines.push('| --- | --- |');
    lines.push('| style | highlight |');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Section 4: Narrative
  if (parsed.narrative.heading) {
    if (parsed.narrative.subtitle) {
      lines.push(parsed.narrative.subtitle);
      lines.push('');
    }
    lines.push(`## ${parsed.narrative.heading}`);
    lines.push('');
    lines.push('| Columns |  |');
    lines.push('| --- | --- |');
    const challengeCol = `**${parsed.narrative.challengeHeading}** **${parsed.narrative.challengeBold}** ${parsed.narrative.challengeText}`;
    const solutionCol = `**${parsed.narrative.solutionHeading}** **${parsed.narrative.solutionBold}** ${parsed.narrative.solutionText}`;
    lines.push(`| ${challengeCol} | ${solutionCol} |`);
    lines.push('');
    if (parsed.narrative.ctaText) {
      lines.push(`[${parsed.narrative.ctaText}](${parsed.narrative.ctaUrl})`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  // Section 5: Tags
  if (parsed.tags.length > 0) {
    lines.push(parsed.tags.join(', '));
    lines.push('');
  }

  // Section 6: Share
  if (parsed.shareLinks.length > 0) {
    const shareStr = parsed.shareLinks.map((l) => `[${l.label}](${l.url})`).join(' ');
    lines.push(`Share: ${shareStr}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  // Section 7: Related Posts
  if (parsed.relatedPosts.length > 0) {
    lines.push('## Related Posts');
    lines.push('');
    lines.push('[View all resources](https://www.zelis.com/resources/)');
    lines.push('');
    lines.push('| Cards |  |');
    lines.push('| --- | --- |');
    parsed.relatedPosts.forEach((card) => {
      const imgSrc = card.image.startsWith('/') ? `${SOURCE_DOMAIN}${card.image}` : card.image;
      lines.push(`| ![${card.imageAlt || card.title}](${imgSrc}) | **${card.title}** ${card.description} [${card.ctaText}](${card.ctaUrl}) |`);
    });
    lines.push('');
    lines.push('| Section Metadata |  |');
    lines.push('| --- | --- |');
    lines.push('| style | dark |');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Metadata block
  lines.push('| Metadata |  |');
  lines.push('| --- | --- |');
  Object.entries(parsed.metadata).forEach(([key, value]) => {
    if (value) lines.push(`| ${key} | ${value} |`);
  });
  if (parsed.tags.length > 0) {
    lines.push(`| tags | ${parsed.tags.join(', ')} |`);
  }
  lines.push('| category | Case Studies |');

  return lines.join('\n');
}
