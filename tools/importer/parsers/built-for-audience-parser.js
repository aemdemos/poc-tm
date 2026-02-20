/**
 * Built-For/Audience Page Parser
 * Extracts structured content from Zelis built-for audience pages.
 *
 * Expected sections:
 * - Hero (H1 + description + CTA + image)
 * - Use Cases (subtitle + H2 + accordion + key points)
 * - Capabilities (subtitle + H2 + icon cards)
 * - Testimonials (image + carousel of quotes)
 * - Resources (H2 + resource card grid, dark background)
 * - Meeting CTA (image + subtitle + H2 + description + CTA)
 */

const SOURCE_DOMAIN = 'https://www.zelis.com';

/**
 * Parse a built-for audience page DOM into structured content
 * @param {Document} document - The page DOM
 * @param {string} url - The source URL
 * @returns {object} Parsed page content
 */
export function parse(document, url) {
  const result = {
    url,
    template: 'built-for-audience',
    hero: {},
    useCases: { subtitle: '', heading: '', accordionItems: [], keyPoints: [] },
    capabilities: { subtitle: '', heading: '', cards: [] },
    testimonials: [],
    resources: { heading: '', viewAllUrl: '', cards: [] },
    meetingCta: {},
    metadata: {},
  };

  // Parse hero
  const heroBlock = document.querySelector('.block--hero');
  if (heroBlock) {
    result.hero.title = heroBlock.querySelector('h1')?.textContent.trim() || '';
    result.hero.description = heroBlock.querySelector('p')?.textContent.trim() || '';
    const ctaLink = heroBlock.querySelector('.btn');
    result.hero.ctaText = ctaLink?.textContent.trim() || '';
    result.hero.ctaUrl = ctaLink?.getAttribute('href') || '';
    const heroImg = heroBlock.querySelector('.wrapper img');
    result.hero.image = heroImg?.getAttribute('src') || '';
    result.hero.imageAlt = heroImg?.getAttribute('alt') || '';
  }

  // Parse use cases (accordion + key points)
  const accordion = document.querySelector('.block--accordion');
  if (accordion) {
    const useCaseSection = accordion.closest('section.block--section-wrapper');
    result.useCases.subtitle = useCaseSection?.querySelector('.has-lead-font-size')?.textContent.trim() || '';
    result.useCases.heading = useCaseSection?.querySelector('h2')?.textContent.trim() || '';

    accordion.querySelectorAll('.accordion-item').forEach((item) => {
      const title = item.querySelector('.accordion-button')?.textContent.trim() || '';
      const bodyEl = item.querySelector('.accordion-body');
      const paragraphs = [];
      bodyEl?.querySelectorAll('p').forEach((p) => {
        const link = p.querySelector('a');
        if (link) {
          paragraphs.push({ type: 'link', text: link.textContent.trim(), url: link.getAttribute('href') });
        } else {
          paragraphs.push({ type: 'text', text: p.textContent.trim() });
        }
      });
      if (title) result.useCases.accordionItems.push({ title, paragraphs });
    });

    const keyPoints = document.querySelector('.block--key-points');
    if (keyPoints) {
      result.useCases.keyPointsHeading = keyPoints.querySelector('h3')?.textContent.trim() || 'Key Use Cases';
      keyPoints.querySelectorAll('.item').forEach((item) => {
        const text = item.textContent.trim();
        if (text) result.useCases.keyPoints.push(text);
      });
    }
  }

  // Parse capabilities (icon cards)
  const iconCards = document.querySelector('.block--icon-cards');
  if (iconCards) {
    result.capabilities.subtitle = iconCards.querySelector('.leader')?.textContent.trim() || '';
    result.capabilities.heading = iconCards.querySelector('h2')?.textContent.trim() || '';
    iconCards.querySelectorAll('.icon-card').forEach((card) => {
      const title = card.querySelector('h3')?.textContent.trim() || '';
      const desc = card.querySelector('p')?.textContent.trim() || '';
      if (title) result.capabilities.cards.push({ title, description: desc });
    });
  }

  // Parse testimonials
  const testimonialBlock = document.querySelector('.block--testimonials');
  if (testimonialBlock) {
    const seenQuotes = new Set();
    testimonialBlock.querySelectorAll('.testimonial').forEach((item) => {
      const quote = item.querySelector('blockquote')?.textContent.trim() || '';
      if (quote && !seenQuotes.has(quote)) {
        seenQuotes.add(quote);
        const name = item.querySelector('.blockquote-footer__author-info__name')?.textContent.trim() || '';
        const titleText = item.querySelector('.blockquote-footer__author-info__title')?.textContent.trim() || '';
        const caseStudyLink = item.querySelector('a[href*="case-studies"]');
        result.testimonials.push({
          quote,
          name,
          title: titleText,
          caseStudyUrl: caseStudyLink?.getAttribute('href') || '',
          caseStudyText: caseStudyLink?.textContent.trim() || '',
        });
      }
    });
  }

  // Parse testimonial image (from parent columns)
  if (testimonialBlock) {
    const parentCols = testimonialBlock.closest('.wp-block-columns');
    if (parentCols) {
      const img = parentCols.querySelector('.wp-block-image img');
      if (img) {
        result.testimonialImage = img.getAttribute('src') || '';
        result.testimonialImageAlt = img.getAttribute('alt') || '';
      }
    }
  }

  // Parse resources
  const resourceBlock = document.querySelector('.block--resources');
  if (resourceBlock) {
    const resourceSection = resourceBlock.closest('section.block--section-wrapper');
    result.resources.heading = resourceSection?.querySelector('h2')?.textContent.trim() || '';
    const viewAll = resourceSection?.querySelector('.wp-block-button__link');
    result.resources.viewAllUrl = viewAll?.getAttribute('href') || '';
    result.resources.viewAllText = viewAll?.textContent.trim() || '';

    resourceBlock.querySelectorAll('.resource').forEach((card) => {
      const category = card.querySelector('.leader')?.textContent.trim() || '';
      const img = card.querySelector('.wp-post-image');
      const title = card.querySelector('h3')?.textContent.trim() || '';
      const desc = card.querySelector('.content-group p, p:not(.leader)')?.textContent.trim() || '';
      const ctaLink = card.querySelector('a.mt-auto, a:last-of-type');
      if (title) {
        result.resources.cards.push({
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
  }

  // Parse meeting CTA
  const mediaCallout = document.querySelector('.block--media-callout');
  if (mediaCallout) {
    result.meetingCta.subtitle = mediaCallout.querySelector('.leader')?.textContent.trim() || '';
    result.meetingCta.heading = mediaCallout.querySelector('h2')?.textContent.trim() || '';
    result.meetingCta.description = mediaCallout.querySelector('.inner-wrapper p')?.textContent.trim() || '';
    const cta = mediaCallout.querySelector('.btn');
    result.meetingCta.ctaText = cta?.textContent.trim() || '';
    result.meetingCta.ctaUrl = cta?.getAttribute('href') || '';
    const ctaImg = mediaCallout.querySelector('.image-wrapper img');
    result.meetingCta.image = ctaImg?.getAttribute('src') || '';
    result.meetingCta.imageAlt = ctaImg?.getAttribute('alt') || '';
  }

  // Extract metadata
  const getMeta = (name) => document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.getAttribute('content') || '';
  result.metadata = {
    title: getMeta('og:title') || result.hero.title,
    description: getMeta('description'),
    image: getMeta('og:image'),
    template: 'built-for-audience',
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
  lines.push('| Columns |  |');
  lines.push('| --- | --- |');
  const heroLeft = `${parsed.hero.description} [${parsed.hero.ctaText}](${parsed.hero.ctaUrl})`;
  const heroImgSrc = parsed.hero.image.startsWith('/') ? `${SOURCE_DOMAIN}${parsed.hero.image}` : parsed.hero.image;
  lines.push(`| ${heroLeft} | ![${parsed.hero.imageAlt || 'Hero image'}](${heroImgSrc}) |`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Section 2: Use Cases
  if (parsed.useCases.heading) {
    if (parsed.useCases.subtitle) {
      lines.push(parsed.useCases.subtitle);
      lines.push('');
    }
    lines.push(`## ${parsed.useCases.heading}`);
    lines.push('');
    lines.push('| Accordion |  |');
    lines.push('| --- | --- |');
    parsed.useCases.accordionItems.forEach((item) => {
      const bodyParts = item.paragraphs.map((p) => {
        if (p.type === 'link') return `[${p.text}](${p.url})`;
        return p.text;
      });
      lines.push(`| ${item.title} | ${bodyParts.join(' ')} |`);
    });
    lines.push('');

    if (parsed.useCases.keyPoints.length > 0) {
      parsed.useCases.keyPoints.forEach((kp) => lines.push(`- ${kp}`));
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  // Section 3: Capabilities
  if (parsed.capabilities.heading) {
    if (parsed.capabilities.subtitle) {
      lines.push(parsed.capabilities.subtitle);
      lines.push('');
    }
    lines.push(`## ${parsed.capabilities.heading}`);
    lines.push('');
    lines.push('| Cards |  |');
    lines.push('| --- | --- |');
    parsed.capabilities.cards.forEach((card) => {
      lines.push(`| **${card.title}** ${card.description} |  |`);
    });
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Section 4: Testimonials
  if (parsed.testimonials.length > 0) {
    if (parsed.testimonialImage) {
      const tImgSrc = parsed.testimonialImage.startsWith('/') ? `${SOURCE_DOMAIN}${parsed.testimonialImage}` : parsed.testimonialImage;
      lines.push('| Columns |  |');
      lines.push('| --- | --- |');
      lines.push(`| ![${parsed.testimonialImageAlt || 'Testimonial image'}](${tImgSrc}) | |`);
      lines.push('');
    }
    lines.push('| Carousel |  |');
    lines.push('| --- | --- |');
    parsed.testimonials.forEach((t) => {
      let entry = `"${t.quote}" — **${t.name}**, ${t.title}`;
      if (t.caseStudyUrl) entry += ` [${t.caseStudyText || 'View case study'}](${t.caseStudyUrl})`;
      lines.push(`| ${entry} | |`);
    });
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Section 5: Resources (dark)
  if (parsed.resources.heading) {
    lines.push(`## ${parsed.resources.heading}`);
    lines.push('');
    if (parsed.resources.viewAllUrl) {
      lines.push(`[${parsed.resources.viewAllText || 'View all resources'}](${parsed.resources.viewAllUrl})`);
      lines.push('');
    }
    lines.push('| Cards |  |');
    lines.push('| --- | --- |');
    parsed.resources.cards.forEach((card) => {
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

  // Section 6: Meeting CTA
  if (parsed.meetingCta.heading) {
    if (parsed.meetingCta.subtitle) {
      lines.push(parsed.meetingCta.subtitle);
      lines.push('');
    }
    lines.push(`## ${parsed.meetingCta.heading}`);
    lines.push('');
    lines.push('| Columns |  |');
    lines.push('| --- | --- |');
    const ctaImgSrc = parsed.meetingCta.image?.startsWith('/') ? `${SOURCE_DOMAIN}${parsed.meetingCta.image}` : parsed.meetingCta.image;
    lines.push(`| ![${parsed.meetingCta.imageAlt || 'Meeting'}](${ctaImgSrc}) | ${parsed.meetingCta.description} [${parsed.meetingCta.ctaText}](${parsed.meetingCta.ctaUrl}) |`);
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
