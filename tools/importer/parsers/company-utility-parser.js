/**
 * Company/Utility Page Parser
 * Extracts structured content from Zelis company and utility pages.
 *
 * Expected sections:
 * - Hero (H1 + description + CTA, dark background)
 * - Modern Care (H2 + body text + image + stats Cards)
 * - Stories of Impact (subtitle + H2 + case study Card)
 * - Client Pledge (subtitle + H2 + 3 principle Cards)
 * - Milestones (subtitle + H2 + Accordion timeline)
 * - Awards/Excellence (H2 + description + badge images, dark)
 * - Leadership (subtitle + H2 + description + 2 CTAs)
 */

const SOURCE_DOMAIN = 'https://www.zelis.com';

/**
 * Parse a company/utility page DOM into structured content
 * @param {Document} document - The page DOM
 * @param {string} url - The source URL
 * @returns {object} Parsed page content
 */
export function parse(document, url) {
  const result = {
    url,
    template: 'company-utility',
    hero: {},
    modernCare: {},
    storiesOfImpact: {},
    clientPledge: {},
    milestones: [],
    awards: {},
    leadership: {},
    metadata: {},
  };

  const mainSections = document.querySelectorAll('main section.block--section-wrapper, main > section');

  // Parse hero (first section - dark background with H1)
  if (mainSections.length > 0) {
    const heroSection = mainSections[0];
    result.hero.title = heroSection.querySelector('h1')?.textContent.trim() || '';
    // Gather description paragraphs
    const descPs = heroSection.querySelectorAll('p:not(.has-lead-font-size)');
    const descTexts = [];
    descPs.forEach((p) => {
      const text = p.textContent.trim();
      if (text && !text.startsWith('Connect') && text.length > 20) descTexts.push(text);
    });
    result.hero.description = descTexts.join('\n\n');
    const heroBtn = heroSection.querySelector('.wp-block-button__link, a.btn-primary');
    result.hero.ctaText = heroBtn?.textContent.trim() || '';
    result.hero.ctaUrl = heroBtn?.getAttribute('href') || '';
  }

  // Parse sections by scanning headings and content patterns
  const allH2 = document.querySelectorAll('main h2');
  const sectionMap = {};
  allH2.forEach((h2) => {
    const text = h2.textContent.trim().toLowerCase();
    sectionMap[text] = h2;
  });

  // Modern Care section - look for body text + image + stats pattern
  const modernCareHeading = [...allH2].find((h) => h.textContent.includes('Modern care'));
  if (modernCareHeading) {
    result.modernCare.heading = modernCareHeading.textContent.trim();
    const section = modernCareHeading.closest('section') || modernCareHeading.parentElement;
    const paragraphs = section?.querySelectorAll('p') || [];
    const bodyTexts = [];
    paragraphs.forEach((p) => {
      const text = p.textContent.trim();
      if (text && text.length > 50) bodyTexts.push(text);
    });
    result.modernCare.bodyText = bodyTexts.join('\n\n');
    const img = section?.querySelector('.wp-block-image img, img[src*="uploads"]');
    result.modernCare.image = img?.getAttribute('src') || '';
    result.modernCare.imageAlt = img?.getAttribute('alt') || '';

    // Stats (payer clients, providers paid, engaged members)
    result.modernCare.stats = [];
    const statElements = section?.querySelectorAll('.stat, .has-title-font-family') || [];
    statElements.forEach((stat) => {
      const value = stat.querySelector('.value, strong')?.textContent.trim() || stat.textContent.trim();
      const desc = stat.querySelector('.desc')?.textContent.trim() || '';
      if (value) result.modernCare.stats.push({ value, description: desc });
    });
  }

  // Stories of Impact - case study card section
  const storiesHeading = [...allH2].find((h) => h.textContent.includes('Bridging Gaps'));
  if (storiesHeading) {
    const section = storiesHeading.closest('section') || storiesHeading.parentElement;
    result.storiesOfImpact.subtitle = section?.querySelector('.has-lead-font-size')?.textContent.trim() || 'Stories of Impact';
    result.storiesOfImpact.heading = storiesHeading.textContent.trim();
    const viewAllLink = section?.querySelector('.wp-block-button__link, a.btn-primary');
    result.storiesOfImpact.viewAllText = viewAllLink?.textContent.trim() || '';
    result.storiesOfImpact.viewAllUrl = viewAllLink?.getAttribute('href') || '';
    result.storiesOfImpact.cards = [];
    const cards = section?.querySelectorAll('.resource, .wp-block-media-text') || [];
    cards.forEach((card) => {
      const img = card.querySelector('img');
      const title = card.querySelector('h3, strong')?.textContent.trim() || '';
      const desc = card.querySelector('p:not(.leader)')?.textContent.trim() || '';
      const ctaLink = card.querySelector('a:last-of-type');
      if (title) {
        result.storiesOfImpact.cards.push({
          image: img?.getAttribute('src') || '',
          imageAlt: img?.getAttribute('alt') || title,
          title,
          description: desc,
          ctaText: ctaLink?.textContent.trim() || '',
          ctaUrl: ctaLink?.getAttribute('href') || '',
        });
      }
    });
  }

  // Client Pledge - 3 principle cards
  const pledgeHeading = [...allH2].find((h) => h.textContent.includes('unique principles'));
  if (pledgeHeading) {
    const section = pledgeHeading.closest('section') || pledgeHeading.parentElement;
    result.clientPledge.subtitle = section?.querySelector('.has-lead-font-size')?.textContent.trim() || 'Our Client Pledge';
    result.clientPledge.heading = pledgeHeading.textContent.trim();
    result.clientPledge.principles = [];
    const columns = section?.querySelectorAll('.wp-block-column') || [];
    columns.forEach((col) => {
      const strong = col.querySelector('strong, h3');
      const text = col.querySelector('p')?.textContent.trim() || col.textContent.trim();
      if (strong) {
        result.clientPledge.principles.push({
          title: strong.textContent.trim(),
          description: text.replace(strong.textContent.trim(), '').trim(),
        });
      }
    });
  }

  // Milestones - timeline with year entries
  const milestonesHeading = [...allH2].find((h) => h.textContent.includes('Milestones'));
  if (milestonesHeading) {
    const section = milestonesHeading.closest('section') || milestonesHeading.parentElement;
    result.milestones = [];
    // Try slick/swiper slides first
    const slides = section?.querySelectorAll('.slick-slide:not(.slick-cloned), .swiper-slide, .milestone-item, .wp-block-column') || [];
    const seenYears = new Set();
    slides.forEach((slide) => {
      const yearEl = slide.querySelector('.year, h3, strong, .has-title-font-family');
      const descEl = slide.querySelector('p, .description');
      const year = yearEl?.textContent.trim() || '';
      const desc = descEl?.textContent.trim() || '';
      if (year && !seenYears.has(year)) {
        seenYears.add(year);
        result.milestones.push({ year, description: desc });
      }
    });
  }

  // Awards / Industry Excellence
  const awardsHeading = [...allH2].find((h) => h.textContent.includes('Standing Out') || h.textContent.includes('Excellence'));
  if (awardsHeading) {
    const section = awardsHeading.closest('section') || awardsHeading.parentElement;
    result.awards.heading = awardsHeading.textContent.trim();
    const descP = section?.querySelector('p');
    result.awards.description = descP?.textContent.trim() || '';
    result.awards.badges = [];
    const imgs = section?.querySelectorAll('img') || [];
    imgs.forEach((img) => {
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      if (src && !src.includes('ajax-loader')) {
        result.awards.badges.push({ src, alt });
      }
    });
  }

  // Leadership section
  const leadershipHeading = [...allH2].find((h) => h.textContent.includes('Leading') || h.textContent.includes('leadership'));
  if (leadershipHeading) {
    const section = leadershipHeading.closest('section') || leadershipHeading.parentElement;
    result.leadership.subtitle = section?.querySelector('.has-lead-font-size')?.textContent.trim() || 'A Dynamic Executive Team';
    result.leadership.heading = leadershipHeading.textContent.trim();
    const descP = section?.querySelector('p:not(.has-lead-font-size)');
    result.leadership.description = descP?.textContent.trim() || '';
    result.leadership.ctas = [];
    const buttons = section?.querySelectorAll('.wp-block-button__link, a.btn-primary') || [];
    buttons.forEach((btn) => {
      result.leadership.ctas.push({
        text: btn.textContent.trim(),
        url: btn.getAttribute('href') || '',
      });
    });
  }

  // Extract metadata
  const getMeta = (name) => document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.getAttribute('content') || '';
  result.metadata = {
    title: getMeta('og:title') || result.hero.title,
    description: getMeta('description'),
    image: getMeta('og:image'),
    template: 'company-utility',
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

  // Section 1: Hero (dark)
  if (parsed.hero.title) {
    lines.push(`# ${parsed.hero.title}`);
    lines.push('');
    if (parsed.hero.description) {
      lines.push(parsed.hero.description);
      lines.push('');
    }
    if (parsed.hero.ctaText) {
      lines.push(`[${parsed.hero.ctaText}](${parsed.hero.ctaUrl})`);
      lines.push('');
    }
    lines.push('| Section Metadata |  |');
    lines.push('| --- | --- |');
    lines.push('| style | dark |');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Section 2: Modern Care (body text + image + stats)
  if (parsed.modernCare.heading) {
    lines.push(`## ${parsed.modernCare.heading}`);
    lines.push('');
    if (parsed.modernCare.bodyText) {
      lines.push(parsed.modernCare.bodyText);
      lines.push('');
    }
    if (parsed.modernCare.image) {
      const imgSrc = parsed.modernCare.image.startsWith('/') ? `${SOURCE_DOMAIN}${parsed.modernCare.image}` : parsed.modernCare.image;
      lines.push(`![${parsed.modernCare.imageAlt || 'Zelis'}](${imgSrc})`);
      lines.push('');
    }
    if (parsed.modernCare.stats && parsed.modernCare.stats.length > 0) {
      lines.push('| Cards |  |');
      lines.push('| --- | --- |');
      parsed.modernCare.stats.forEach((s) => {
        lines.push(`| **${s.value}** ${s.description} |  |`);
      });
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  // Section 3: Stories of Impact
  if (parsed.storiesOfImpact.heading) {
    if (parsed.storiesOfImpact.subtitle) {
      lines.push(parsed.storiesOfImpact.subtitle);
      lines.push('');
    }
    lines.push(`## ${parsed.storiesOfImpact.heading}`);
    lines.push('');
    if (parsed.storiesOfImpact.viewAllText) {
      lines.push(`[${parsed.storiesOfImpact.viewAllText}](${parsed.storiesOfImpact.viewAllUrl})`);
      lines.push('');
    }
    if (parsed.storiesOfImpact.cards && parsed.storiesOfImpact.cards.length > 0) {
      lines.push('| Cards |  |');
      lines.push('| --- | --- |');
      parsed.storiesOfImpact.cards.forEach((card) => {
        const imgSrc = card.image.startsWith('/') ? `${SOURCE_DOMAIN}${card.image}` : card.image;
        lines.push(`| ![${card.imageAlt}](${imgSrc}) | **${card.title}** ${card.description} [${card.ctaText}](${card.ctaUrl}) |`);
      });
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  // Section 4: Client Pledge
  if (parsed.clientPledge.heading) {
    if (parsed.clientPledge.subtitle) {
      lines.push(parsed.clientPledge.subtitle);
      lines.push('');
    }
    lines.push(`## ${parsed.clientPledge.heading}`);
    lines.push('');
    if (parsed.clientPledge.principles && parsed.clientPledge.principles.length > 0) {
      lines.push('| Cards |  |');
      lines.push('| --- | --- |');
      parsed.clientPledge.principles.forEach((p) => {
        lines.push(`| **${p.title}** ${p.description} |  |`);
      });
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  // Section 5: Milestones (Accordion)
  if (parsed.milestones && parsed.milestones.length > 0) {
    lines.push('A Legacy of Impact');
    lines.push('');
    lines.push('## Milestones');
    lines.push('');
    lines.push('| Accordion |  |');
    lines.push('| --- | --- |');
    parsed.milestones.forEach((m) => {
      lines.push(`| ${m.year} | ${m.description} |`);
    });
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Section 6: Awards (dark)
  if (parsed.awards.heading) {
    lines.push(`## ${parsed.awards.heading}`);
    lines.push('');
    if (parsed.awards.description) {
      lines.push(parsed.awards.description);
      lines.push('');
    }
    if (parsed.awards.badges && parsed.awards.badges.length > 0) {
      const badgeImgs = parsed.awards.badges.map((b) => {
        const src = b.src.startsWith('/') ? `${SOURCE_DOMAIN}${b.src}` : b.src;
        return `![${b.alt}](${src})`;
      });
      lines.push(badgeImgs.join(' '));
      lines.push('');
    }
    lines.push('| Section Metadata |  |');
    lines.push('| --- | --- |');
    lines.push('| style | dark |');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Section 7: Leadership
  if (parsed.leadership.heading) {
    if (parsed.leadership.subtitle) {
      lines.push(parsed.leadership.subtitle);
      lines.push('');
    }
    lines.push(`## ${parsed.leadership.heading}`);
    lines.push('');
    if (parsed.leadership.description) {
      lines.push(parsed.leadership.description);
      lines.push('');
    }
    if (parsed.leadership.ctas && parsed.leadership.ctas.length > 0) {
      const ctaLinks = parsed.leadership.ctas.map((c) => `[${c.text}](${c.url})`);
      lines.push(ctaLinks.join(' '));
      lines.push('');
    }
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
