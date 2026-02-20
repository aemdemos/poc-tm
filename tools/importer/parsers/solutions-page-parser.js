/**
 * Solutions Page Parser
 * Extracts structured content from Zelis solutions/product pages.
 *
 * Expected sections:
 * - Hero (H1 + description + CTA + optional video)
 * - Product Introduction (H2 + description + key benefits)
 * - Capabilities Accordion (H2 + expandable items)
 * - Stats (H2 + stat cards)
 * - Partnership (columns: text + image)
 * - Meeting CTA (subtitle + H2 + CTA)
 */

const SOURCE_DOMAIN = 'https://www.zelis.com';

/**
 * Parse a solutions page DOM into structured content
 * @param {Document} document - The page DOM
 * @param {string} url - The source URL
 * @returns {object} Parsed page content
 */
export function parse(document, url) {
  const result = {
    url,
    template: 'solutions-page',
    hero: {},
    productIntro: {},
    capabilities: [],
    stats: [],
    partnership: {},
    meetingCta: {},
    metadata: {},
  };

  // Parse hero
  const mainSections = document.querySelectorAll('main section.block--section-wrapper');
  if (mainSections.length > 0) {
    const heroSection = mainSections[0];
    result.hero.title = heroSection.querySelector('h1')?.textContent.trim() || '';
    result.hero.description = heroSection.querySelector('.has-body-large-font-size')?.textContent.trim() || '';
    const ctaLink = heroSection.querySelector('.wp-block-button__link');
    result.hero.ctaText = ctaLink?.textContent.trim() || '';
    result.hero.ctaUrl = ctaLink?.getAttribute('href') || '';
    const video = heroSection.querySelector('.block--video iframe');
    result.hero.videoUrl = video?.getAttribute('src') || '';
  }

  // Parse product introduction (section with key-points)
  const keyPointsSection = document.querySelector('.block--key-points');
  if (keyPointsSection) {
    const introSection = keyPointsSection.closest('section.block--section-wrapper');
    if (introSection) {
      result.productIntro.heading = introSection.querySelector('h2')?.textContent.trim() || '';
      const descriptions = [];
      introSection.querySelectorAll('.has-body-large-font-size').forEach((p) => {
        descriptions.push(p.textContent.trim());
      });
      result.productIntro.descriptions = descriptions;
    }
    result.productIntro.benefitsHeading = keyPointsSection.querySelector('h3')?.textContent.trim() || 'Key benefits';
    result.productIntro.benefits = [];
    keyPointsSection.querySelectorAll('.item').forEach((li) => {
      const text = li.textContent.trim();
      if (text) result.productIntro.benefits.push(text);
    });
  }

  // Parse capabilities accordion
  const accordion = document.querySelector('.block--accordion');
  if (accordion) {
    const capSection = accordion.closest('section.block--section-wrapper');
    result.capabilities = {
      heading: capSection?.querySelector('h2')?.textContent.trim() || '',
      items: [],
    };
    accordion.querySelectorAll('.accordion-item').forEach((item) => {
      const title = item.querySelector('.accordion-button')?.textContent.trim() || '';
      const bodyEl = item.querySelector('.accordion-body');
      const body = bodyEl?.innerHTML.trim() || '';
      if (title) {
        result.capabilities.items.push({ title, body });
      }
    });
  }

  // Parse stats
  const statsSection = document.querySelector('.block--cards');
  if (statsSection) {
    const parentSection = statsSection.closest('section.block--section-wrapper');
    result.stats = {
      heading: parentSection?.querySelector('h2')?.textContent.trim() || '',
      items: [],
      ctaText: '',
      ctaUrl: '',
    };
    statsSection.querySelectorAll('.icon-card').forEach((card) => {
      const stat = card.querySelector('.title')?.textContent.trim() || '';
      const desc = card.querySelector('p')?.textContent.trim() || '';
      if (stat) result.stats.items.push({ stat, description: desc });
    });
    const statsCta = parentSection?.querySelector('.wp-block-button__link');
    result.stats.ctaText = statsCta?.textContent.trim() || '';
    result.stats.ctaUrl = statsCta?.getAttribute('href') || '';
  }

  // Parse partnership section (gold background)
  const goldSection = document.querySelector('section.has-gold-background-color');
  if (goldSection) {
    result.partnership.heading = goldSection.querySelector('h2')?.textContent.trim() || '';
    result.partnership.description = goldSection.querySelector('p')?.textContent.trim() || '';
    const img = goldSection.querySelector('figure img');
    result.partnership.image = img?.getAttribute('src') || '';
    result.partnership.imageAlt = img?.getAttribute('alt') || '';
  }

  // Parse meeting CTA (last ink-blue section)
  const inkBlueSections = document.querySelectorAll('section.has-ink-blue-5-background-color');
  if (inkBlueSections.length > 1) {
    const ctaSection = inkBlueSections[inkBlueSections.length - 1];
    result.meetingCta.subtitle = ctaSection.querySelector('.has-lead-font-size')?.textContent.trim() || '';
    result.meetingCta.heading = ctaSection.querySelector('h2')?.textContent.trim() || '';
    const descP = ctaSection.querySelector('p:not(.has-lead-font-size)');
    result.meetingCta.description = descP?.textContent.trim() || '';
    const cta = ctaSection.querySelector('.wp-block-button__link');
    result.meetingCta.ctaText = cta?.textContent.trim() || '';
    result.meetingCta.ctaUrl = cta?.getAttribute('href') || '';
  }

  // Extract metadata
  const getMeta = (name) => document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.getAttribute('content') || '';
  result.metadata = {
    title: getMeta('og:title') || result.hero.title,
    description: getMeta('description'),
    image: getMeta('og:image'),
    template: 'solutions-page',
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
  if (parsed.hero.description) {
    lines.push(parsed.hero.description);
    lines.push('');
  }
  if (parsed.hero.ctaText && parsed.hero.ctaUrl) {
    lines.push(`[${parsed.hero.ctaText}](${parsed.hero.ctaUrl})`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  // Section 2: Product Intro with key benefits
  if (parsed.productIntro.heading) {
    lines.push(`## ${parsed.productIntro.heading}`);
    lines.push('');
    lines.push('| Columns |  |');
    lines.push('| --- | --- |');
    const desc = (parsed.productIntro.descriptions || []).join(' ');
    lines.push(`| ${desc} | **${parsed.productIntro.benefitsHeading}** |`);
    lines.push('');
    if (parsed.productIntro.benefits?.length) {
      parsed.productIntro.benefits.forEach((b) => lines.push(`- ${b}`));
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  // Section 3: Capabilities Accordion
  if (parsed.capabilities?.heading) {
    lines.push(`## ${parsed.capabilities.heading}`);
    lines.push('');
    lines.push('| Accordion |  |');
    lines.push('| --- | --- |');
    parsed.capabilities.items.forEach((item) => {
      const cleanBody = item.body
        .replace(/<\/?p>/g, '')
        .replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
        .replace(/<\/?ul>/g, '')
        .replace(/<li>/g, '')
        .replace(/<\/li>/g, ' ')
        .replace(/<[^>]+>/g, '')
        .trim();
      lines.push(`| ${item.title} | ${cleanBody} |`);
    });
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Section 4: Stats
  if (parsed.stats?.heading) {
    lines.push(`## ${parsed.stats.heading}`);
    lines.push('');
    lines.push('| Cards |  |');
    lines.push('| --- | --- |');
    parsed.stats.items.forEach((s) => {
      lines.push(`| **${s.stat}** ${s.description} |  |`);
    });
    lines.push('');
    if (parsed.stats.ctaText) {
      lines.push(`[${parsed.stats.ctaText}](${parsed.stats.ctaUrl})`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  // Section 5: Partnership
  if (parsed.partnership?.heading) {
    lines.push(`## ${parsed.partnership.heading}`);
    lines.push('');
    const imgSrc = parsed.partnership.image?.startsWith('/') ? `${SOURCE_DOMAIN}${parsed.partnership.image}` : parsed.partnership.image;
    lines.push('| Columns |  |');
    lines.push('| --- | --- |');
    lines.push(`| ${parsed.partnership.description} | ![${parsed.partnership.imageAlt || 'Partnership ecosystem'}](${imgSrc}) |`);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Section 6: Meeting CTA (dark)
  if (parsed.meetingCta?.heading) {
    if (parsed.meetingCta.subtitle) {
      lines.push(parsed.meetingCta.subtitle);
      lines.push('');
    }
    lines.push(`## ${parsed.meetingCta.heading}`);
    lines.push('');
    if (parsed.meetingCta.description) {
      lines.push(parsed.meetingCta.description);
      lines.push('');
    }
    if (parsed.meetingCta.ctaText) {
      lines.push(`[${parsed.meetingCta.ctaText}](${parsed.meetingCta.ctaUrl})`);
      lines.push('');
    }
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

  return lines.join('\n');
}
