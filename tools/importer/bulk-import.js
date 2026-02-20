#!/usr/bin/env node

/**
 * Zelis Bulk Import Script
 *
 * Imports pages from zelis.com into Edge Delivery Services markdown format.
 * Uses the parsers from Phase 2 to extract content and generate markdown.
 *
 * Usage:
 *   node bulk-import.js --batch 3a-blog              # Import all blog posts
 *   node bulk-import.js --batch 3a-blog --limit 5     # Import first 5 blog posts
 *   node bulk-import.js --batch 3a-blog --offset 10   # Skip first 10, then import
 *   node bulk-import.js --url https://www.zelis.com/blog/some-post/  # Import single URL
 *   node bulk-import.js --batch all                   # Import everything
 *   node bulk-import.js --dry-run --batch 3a-blog     # Preview without saving
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONTENT_DIR = path.join(__dirname, '../../content');
const CATALOG_PATH = path.join(__dirname, 'url-catalog.json');
const CONCURRENCY = 3; // Number of parallel fetches
const DELAY_MS = 500; // Delay between fetches to avoid rate limiting
const SOURCE_DOMAIN = 'https://www.zelis.com';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Parse arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : null;
};
const hasFlag = (name) => args.includes(`--${name}`);

const batchName = getArg('batch');
const singleUrl = getArg('url');
const limit = getArg('limit') ? parseInt(getArg('limit'), 10) : Infinity;
const offset = getArg('offset') ? parseInt(getArg('offset'), 10) : 0;
const dryRun = hasFlag('dry-run');
const verbose = hasFlag('verbose');

// Progress tracking
const results = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
  errors: [],
};

/**
 * Fetch a URL and return the HTML
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 30000,
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).href;
        fetchUrl(redirectUrl).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

/**
 * Generate the content file path from a URL
 */
function urlToContentPath(url) {
  const urlObj = new URL(url);
  let pathname = urlObj.pathname.replace(/\/$/, '') || '/index';

  // If pathname ends with nothing after last /, treat as index
  if (pathname.endsWith('/')) {
    pathname += 'index';
  }

  // Remove leading slash
  pathname = pathname.replace(/^\//, '');

  // Split into directory and filename
  const parts = pathname.split('/');
  const filename = parts.pop();
  const dir = parts.join('/');

  return {
    mdPath: path.join(CONTENT_DIR, dir, `${filename}.md`),
    dir: path.join(CONTENT_DIR, dir),
    relativePath: `content/${dir}/${filename}.md`,
  };
}

/**
 * Parse a blog article page using inline extraction
 * (Mirrors blog-article-parser.js logic)
 */
function parseBlogArticle(document, url) {
  const article = document.querySelector('article') || document.querySelector('main');
  if (!article) return null;

  // Hero section
  const date = article.querySelector('.hero .leader, .published-date')?.textContent?.trim() || '';
  const title = article.querySelector('.hero .post-title, h1')?.textContent?.trim() || '';
  const featuredImg = article.querySelector('.hero .featured-img img, .wp-post-image')?.getAttribute('src') || '';

  // Author bio
  const authorAvatar = article.querySelector('.post-author .author-image, .post-author img')?.getAttribute('src') || '';
  const authorNameEl = article.querySelector('.post-author strong a, .post-author a');
  const authorName = authorNameEl?.textContent?.trim() || '';
  const authorLink = authorNameEl?.getAttribute('href') || '';
  const authorBio = article.querySelector('.post-author .has-small-font-size, .post-author p')?.textContent?.trim() || '';

  // Article body - extract structured content
  const bodyContainer = article.querySelector('.post-content .acf-innerblocks-container > .wp-block-column')
    || article.querySelector('.post-content')
    || article.querySelector('.entry-content');
  const bodyMarkdown = extractBodyMarkdown(bodyContainer);

  // Tags
  const tags = [...document.querySelectorAll('.resource-tags .tags li a, .resource-tags .tag a')]
    .map((a) => a.textContent.trim())
    .filter(Boolean);

  // Social share links
  const shareLinks = [...document.querySelectorAll('.share-post a')]
    .map((a) => ({
      platform: a.querySelector('.visually-hidden')?.textContent?.trim() || a.textContent?.trim() || '',
      href: a.getAttribute('href'),
    }))
    .filter((link) => link.platform && link.href);

  // Related posts
  const relatedPosts = [...document.querySelectorAll('.related-posts .resource')]
    .map((card) => ({
      category: card.querySelector('.leader')?.textContent?.trim() || '',
      image: resolveUrl(card.querySelector('.wp-post-image, img')?.getAttribute('src') || ''),
      title: card.querySelector('h3')?.textContent?.trim() || '',
      description: card.querySelector('p:not(.leader)')?.textContent?.trim() || '',
      link: resolveUrl(card.querySelector('a.mt-auto, a:last-of-type')?.getAttribute('href') || ''),
      linkText: card.querySelector('a.mt-auto, a:last-of-type')?.textContent?.trim() || 'View resource',
    }))
    .filter((card) => card.title);

  // Page metadata
  const getMeta = (sel, attr = 'content') => document.querySelector(sel)?.getAttribute(attr) || '';
  const metadata = {
    title: getMeta("meta[property='og:title']") || title,
    description: getMeta("meta[property='og:description']") || getMeta("meta[name='description']"),
    author: getMeta("meta[name='author']") || authorName,
    date: (getMeta("meta[property='article:published_time']") || '').split('T')[0],
    image: getMeta("meta[property='og:image']") || resolveUrl(featuredImg),
    tags: tags.join(', '),
    template: 'blog-article',
  };

  return { hero: { date, title, featuredImg: resolveUrl(featuredImg) }, author: { authorAvatar: resolveUrl(authorAvatar), authorName, authorLink: resolveUrl(authorLink), authorBio }, bodyMarkdown, tags, shareLinks, relatedPosts, metadata };
}

/**
 * Parse a gated resource page
 */
function parseGatedResource(document, url) {
  const title = document.querySelector('.post-title, h1')?.textContent?.trim() || '';
  const featuredImg = resolveUrl(document.querySelector('.hero .featured-img img, .featured-wrapper img, .wp-post-image')?.getAttribute('src') || '');

  // Description
  const leftCol = document.querySelector('.block--resource-hero .col-12.col-lg-6:first-child')
    || document.querySelector('.post-content');
  const subtitle = leftCol?.querySelector('h3 b span, h3')?.textContent?.trim() || '';
  const paragraphs = [];
  leftCol?.querySelectorAll('p').forEach((p) => {
    const text = p.textContent.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
    if (text && text.length > 10) paragraphs.push(text);
  });
  const bulletPoints = [];
  leftCol?.querySelectorAll('ul li').forEach((li) => {
    const text = li.textContent.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) bulletPoints.push(text);
  });

  // HubSpot form
  const formDiv = document.querySelector('.hbspt-form, [data-hs-form-id]');
  const formId = formDiv?.id?.replace('hbspt-form-', '') || formDiv?.getAttribute('data-hs-form-id') || '';
  const formHeading = document.querySelector('.gated-wrapper h2')?.textContent?.trim() || 'Read now';

  // Tags
  const tags = [...document.querySelectorAll('.resource-tags .tag a')].map((a) => a.textContent.trim()).filter(Boolean);

  // Related posts
  const relatedPosts = [...document.querySelectorAll('.related-posts .resource')]
    .map((card) => ({
      image: resolveUrl(card.querySelector('.wp-post-image, img')?.getAttribute('src') || ''),
      title: card.querySelector('h3')?.textContent?.trim() || '',
      description: card.querySelector('p:not(.leader)')?.textContent?.trim() || '',
      link: resolveUrl(card.querySelector('a.mt-auto, a:last-of-type')?.getAttribute('href') || ''),
      linkText: card.querySelector('a.mt-auto, a:last-of-type')?.textContent?.trim() || 'View resource',
    }))
    .filter((card) => card.title);

  const getMeta = (sel, attr = 'content') => document.querySelector(sel)?.getAttribute(attr) || '';
  const metadata = {
    title: getMeta("meta[property='og:title']") || title,
    description: getMeta("meta[property='og:description']") || getMeta("meta[name='description']"),
    date: (getMeta("meta[property='article:published_time']") || '').split('T')[0],
    image: getMeta("meta[property='og:image']") || featuredImg,
    tags: tags.join(', '),
    template: 'gated-resource',
  };

  return { title, featuredImg, subtitle, paragraphs, bulletPoints, formId, formHeading, tags, relatedPosts, metadata };
}

/**
 * Parse a case study page
 */
function parseCaseStudy(document, url) {
  const mainSections = document.querySelectorAll('main section.block--section-wrapper, main > section');

  const hero = {};
  if (mainSections.length > 0) {
    const heroSection = mainSections[0];
    hero.title = heroSection.querySelector('.post-title, h1')?.textContent?.trim() || '';
    const heroImg = heroSection.querySelector('.featured-wrapper img, .wp-post-image');
    hero.image = resolveUrl(heroImg?.getAttribute('src') || '');
    hero.imageAlt = heroImg?.getAttribute('alt') || '';
  }

  // Summary
  const summary = {};
  if (mainSections.length > 1) {
    const summarySection = mainSections[1];
    summary.heading = summarySection.querySelector('h2')?.textContent?.trim() || '';
    const columns = summarySection.querySelectorAll('.wp-block-columns .wp-block-column');
    if (columns.length >= 2) {
      summary.challengeHeading = columns[0].querySelector('h3')?.textContent?.trim() || 'The Challenge';
      summary.challengeText = columns[0].querySelector('p')?.textContent?.trim() || '';
      summary.solutionHeading = columns[1].querySelector('h3')?.textContent?.trim() || 'The Solution';
      summary.solutionText = columns[1].querySelector('p')?.textContent?.trim() || '';
    }
  }

  // Stats
  const stats = [];
  const goldSection = document.querySelector('section.has-gold-background-color, .block--stats');
  if (goldSection) {
    goldSection.querySelectorAll('.stat').forEach((stat) => {
      const value = stat.querySelector('.value')?.textContent?.trim() || '';
      const desc = stat.querySelector('.desc')?.textContent?.trim() || '';
      if (value) stats.push({ value, description: desc });
    });
  }

  // Narrative
  const narrative = {};
  const narrativeSection = mainSections.length > 3 ? mainSections[3] : null;
  if (narrativeSection) {
    narrative.subtitle = narrativeSection.querySelector('.has-lead-font-size')?.textContent?.trim() || '';
    narrative.heading = narrativeSection.querySelector('h2')?.textContent?.trim() || '';
    const narColumns = narrativeSection.querySelectorAll('.wp-block-columns');
    if (narColumns.length >= 2) {
      const detailCols = narColumns[1].querySelectorAll('.wp-block-column');
      if (detailCols.length >= 2) {
        narrative.challengeHeading = detailCols[0].querySelector('h3')?.textContent?.trim() || 'The Challenge';
        const challengePs = detailCols[0].querySelectorAll('p');
        narrative.challengeBold = challengePs[0]?.textContent?.trim() || '';
        narrative.challengeText = challengePs[1]?.textContent?.trim() || '';
        narrative.solutionHeading = detailCols[1].querySelector('h3')?.textContent?.trim() || 'The Solution';
        const solutionPs = detailCols[1].querySelectorAll('p');
        narrative.solutionBold = solutionPs[0]?.textContent?.trim() || '';
        narrative.solutionText = solutionPs[1]?.textContent?.trim() || '';
      }
    }
    const cta = narrativeSection.querySelector('.wp-block-button__link');
    narrative.ctaText = cta?.textContent?.trim() || '';
    narrative.ctaUrl = resolveUrl(cta?.getAttribute('href') || '');
  }

  // Tags + Related posts
  const tags = [...document.querySelectorAll('.resource-tags .tag a')].map((a) => a.textContent.trim()).filter(Boolean);
  const relatedPosts = [...document.querySelectorAll('.related-posts .resource')]
    .map((card) => ({
      image: resolveUrl(card.querySelector('.wp-post-image, img')?.getAttribute('src') || ''),
      title: card.querySelector('h3')?.textContent?.trim() || '',
      description: card.querySelector('p:not(.leader)')?.textContent?.trim() || '',
      link: resolveUrl(card.querySelector('a.mt-auto, a:last-of-type')?.getAttribute('href') || ''),
      linkText: card.querySelector('a.mt-auto, a:last-of-type')?.textContent?.trim() || 'View resource',
    }))
    .filter((card) => card.title);

  const getMeta = (sel, attr = 'content') => document.querySelector(sel)?.getAttribute(attr) || '';
  const metadata = {
    title: getMeta("meta[property='og:title']") || hero.title,
    description: getMeta("meta[property='og:description']") || getMeta("meta[name='description']"),
    date: (getMeta("meta[property='article:published_time']") || '').split('T')[0],
    image: getMeta("meta[property='og:image']") || hero.image,
    tags: tags.join(', '),
    template: 'case-study',
    category: 'Case Studies',
  };

  return { hero, summary, stats, narrative, tags, relatedPosts, metadata };
}

/**
 * Parse a solutions page (simplified extraction)
 */
function parseSolutionsPage(document, url) {
  const title = document.querySelector('h1')?.textContent?.trim() || '';
  const sections = [];

  // Extract all sections with headings and content
  document.querySelectorAll('main section, main > div > div').forEach((section) => {
    const h2 = section.querySelector('h2');
    const heading = h2?.textContent?.trim() || '';
    const paragraphs = [...section.querySelectorAll('p')].map((p) => p.textContent.trim()).filter((t) => t.length > 20);
    const links = [...section.querySelectorAll('a.wp-block-button__link, a.btn-primary')].map((a) => ({
      text: a.textContent.trim(),
      href: resolveUrl(a.getAttribute('href') || ''),
    }));

    if (heading || paragraphs.length > 0) {
      sections.push({ heading, paragraphs, links });
    }
  });

  // Accordion items
  const accordionItems = [...document.querySelectorAll('.accordion-item, .wp-block-column')].map((item) => {
    const itemTitle = item.querySelector('h3, h4, .accordion-header')?.textContent?.trim() || '';
    const itemContent = item.querySelector('p, .accordion-body')?.textContent?.trim() || '';
    return { title: itemTitle, content: itemContent };
  }).filter((item) => item.title);

  const getMeta = (sel, attr = 'content') => document.querySelector(sel)?.getAttribute(attr) || '';
  const metadata = {
    title: getMeta("meta[property='og:title']") || title,
    description: getMeta("meta[property='og:description']") || getMeta("meta[name='description']"),
    image: getMeta("meta[property='og:image']"),
    template: 'solutions-page',
  };

  return { title, sections, accordionItems, metadata };
}

/**
 * Parse a built-for audience page (simplified extraction)
 */
function parseBuiltForPage(document, url) {
  const title = document.querySelector('h1')?.textContent?.trim() || '';
  const description = document.querySelector('.hero p, .block--hero p')?.textContent?.trim() || '';

  const sections = [];
  document.querySelectorAll('main section, main > div').forEach((section) => {
    const h2 = section.querySelector('h2');
    const heading = h2?.textContent?.trim() || '';
    const subtitle = section.querySelector('.has-lead-font-size')?.textContent?.trim() || '';
    const paragraphs = [...section.querySelectorAll('p:not(.has-lead-font-size)')].map((p) => p.textContent.trim()).filter((t) => t.length > 20);
    if (heading) sections.push({ heading, subtitle, paragraphs });
  });

  const getMeta = (sel, attr = 'content') => document.querySelector(sel)?.getAttribute(attr) || '';
  const metadata = {
    title: getMeta("meta[property='og:title']") || title,
    description: getMeta("meta[property='og:description']") || getMeta("meta[name='description']"),
    image: getMeta("meta[property='og:image']"),
    template: 'built-for-audience',
  };

  return { title, description, sections, metadata };
}

/**
 * Parse a company/utility page (simplified extraction)
 */
function parseCompanyUtilityPage(document, url) {
  const title = document.querySelector('h1')?.textContent?.trim() || '';
  const sections = [];

  document.querySelectorAll('main section, main > div').forEach((section) => {
    const h2 = section.querySelector('h2');
    const heading = h2?.textContent?.trim() || '';
    const subtitle = section.querySelector('.has-lead-font-size')?.textContent?.trim() || '';
    const paragraphs = [...section.querySelectorAll('p:not(.has-lead-font-size)')].map((p) => p.textContent.trim()).filter((t) => t.length > 15);
    const links = [...section.querySelectorAll('a.wp-block-button__link, a.btn-primary')].map((a) => ({
      text: a.textContent.trim(),
      href: resolveUrl(a.getAttribute('href') || ''),
    }));
    const images = [...section.querySelectorAll('img')].map((img) => ({
      src: resolveUrl(img.getAttribute('src') || ''),
      alt: img.getAttribute('alt') || '',
    })).filter((img) => img.src && !img.src.includes('ajax-loader'));

    if (heading || paragraphs.length > 0) {
      sections.push({ heading, subtitle, paragraphs, links, images });
    }
  });

  const getMeta = (sel, attr = 'content') => document.querySelector(sel)?.getAttribute(attr) || '';
  const metadata = {
    title: getMeta("meta[property='og:title']") || title,
    description: getMeta("meta[property='og:description']") || getMeta("meta[name='description']"),
    image: getMeta("meta[property='og:image']"),
    template: 'company-utility',
  };

  return { title, sections, metadata };
}

// ============================================================
// Markdown Generators
// ============================================================

function blogToMarkdown(parsed) {
  const lines = [];

  // Hero
  if (parsed.hero.featuredImg) {
    lines.push(`![${parsed.hero.title}](${parsed.hero.featuredImg})`);
    lines.push('');
  }
  lines.push(`# ${parsed.hero.title}`);
  lines.push('');
  if (parsed.hero.date) {
    lines.push(parsed.hero.date);
    lines.push('');
  }

  // Author
  if (parsed.author.authorName) {
    lines.push('| Columns |  |');
    lines.push('| --- | --- |');
    const authorText = parsed.author.authorLink
      ? `**By: [${parsed.author.authorName}](${parsed.author.authorLink})** ${parsed.author.authorBio}`
      : `**By: ${parsed.author.authorName}** ${parsed.author.authorBio}`;
    const avatarPart = parsed.author.authorAvatar ? `![${parsed.author.authorName}](${parsed.author.authorAvatar})` : '';
    lines.push(`| ${avatarPart} | ${authorText} |`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  // Body
  if (parsed.bodyMarkdown) {
    lines.push(parsed.bodyMarkdown);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Tags + Share
  if (parsed.tags.length > 0) {
    lines.push(parsed.tags.join(', '));
    lines.push('');
  }
  if (parsed.shareLinks.length > 0) {
    const shareStr = parsed.shareLinks.map((s) => `[${s.platform}](${s.href})`).join(' ');
    lines.push(`Share: ${shareStr}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  // Related Posts
  if (parsed.relatedPosts.length > 0) {
    lines.push('## Related Posts');
    lines.push('');
    lines.push('| Cards |  |');
    lines.push('| --- | --- |');
    parsed.relatedPosts.forEach((card) => {
      lines.push(`| ![${card.title}](${card.image}) | **${card.title}** ${card.description} [${card.linkText}](${card.link}) |`);
    });
    lines.push('');
    lines.push('| Section Metadata |  |');
    lines.push('| --- | --- |');
    lines.push('| style | dark |');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Metadata
  lines.push('| Metadata |  |');
  lines.push('| --- | --- |');
  Object.entries(parsed.metadata).forEach(([key, value]) => {
    if (value) lines.push(`| ${key} | ${value} |`);
  });

  return lines.join('\n');
}

function gatedResourceToMarkdown(parsed) {
  const lines = [];
  lines.push(`# ${parsed.title}`);
  lines.push('');
  if (parsed.featuredImg) {
    lines.push(`![${parsed.title}](${parsed.featuredImg})`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  if (parsed.subtitle) {
    lines.push(`**${parsed.subtitle}**`);
    lines.push('');
  }
  parsed.paragraphs.forEach((p) => {
    lines.push(p);
    lines.push('');
  });
  if (parsed.bulletPoints.length > 0) {
    parsed.bulletPoints.forEach((bp) => {
      lines.push(`- ${bp}`);
    });
    lines.push('');
  }

  // Form embed
  if (parsed.formId) {
    lines.push(`## ${parsed.formHeading}`);
    lines.push('');
    lines.push('| Embed |  |');
    lines.push('| --- | --- |');
    lines.push(`| https://share.hsforms.com/${parsed.formId} |  |`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  if (parsed.tags.length > 0) {
    lines.push(parsed.tags.join(', '));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  if (parsed.relatedPosts.length > 0) {
    lines.push('## Related Resources');
    lines.push('');
    lines.push('| Cards |  |');
    lines.push('| --- | --- |');
    parsed.relatedPosts.forEach((card) => {
      lines.push(`| ![${card.title}](${card.image}) | **${card.title}** ${card.description} [${card.linkText}](${card.link}) |`);
    });
    lines.push('');
    lines.push('| Section Metadata |  |');
    lines.push('| --- | --- |');
    lines.push('| style | dark |');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('| Metadata |  |');
  lines.push('| --- | --- |');
  Object.entries(parsed.metadata).forEach(([key, value]) => {
    if (value) lines.push(`| ${key} | ${value} |`);
  });

  return lines.join('\n');
}

function caseStudyToMarkdown(parsed) {
  const lines = [];
  lines.push(`# ${parsed.hero.title}`);
  lines.push('');
  if (parsed.hero.image) {
    lines.push(`![${parsed.hero.imageAlt || 'Case study hero'}](${parsed.hero.image})`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  if (parsed.summary.heading) {
    lines.push(`## ${parsed.summary.heading}`);
    lines.push('');
    if (parsed.summary.challengeHeading) {
      lines.push('| Columns |  |');
      lines.push('| --- | --- |');
      lines.push(`| **${parsed.summary.challengeHeading}** ${parsed.summary.challengeText} | **${parsed.summary.solutionHeading}** ${parsed.summary.solutionText} |`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  if (parsed.stats.length > 0) {
    lines.push('| Cards |  |');
    lines.push('| --- | --- |');
    parsed.stats.forEach((s) => lines.push(`| **${s.value}** ${s.description} |  |`));
    lines.push('');
    lines.push('| Section Metadata |  |');
    lines.push('| --- | --- |');
    lines.push('| style | highlight |');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  if (parsed.narrative.heading) {
    if (parsed.narrative.subtitle) { lines.push(parsed.narrative.subtitle); lines.push(''); }
    lines.push(`## ${parsed.narrative.heading}`);
    lines.push('');
    if (parsed.narrative.challengeHeading) {
      lines.push('| Columns |  |');
      lines.push('| --- | --- |');
      const ch = `**${parsed.narrative.challengeHeading}** **${parsed.narrative.challengeBold || ''}** ${parsed.narrative.challengeText || ''}`;
      const sol = `**${parsed.narrative.solutionHeading}** **${parsed.narrative.solutionBold || ''}** ${parsed.narrative.solutionText || ''}`;
      lines.push(`| ${ch} | ${sol} |`);
      lines.push('');
    }
    if (parsed.narrative.ctaText) {
      lines.push(`[${parsed.narrative.ctaText}](${parsed.narrative.ctaUrl})`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  if (parsed.tags.length > 0) { lines.push(parsed.tags.join(', ')); lines.push(''); lines.push('---'); lines.push(''); }

  if (parsed.relatedPosts.length > 0) {
    lines.push('## Related Posts');
    lines.push('');
    lines.push('[View all resources](https://www.zelis.com/resources/)');
    lines.push('');
    lines.push('| Cards |  |');
    lines.push('| --- | --- |');
    parsed.relatedPosts.forEach((card) => {
      lines.push(`| ![${card.title}](${card.image}) | **${card.title}** ${card.description} [${card.linkText}](${card.link}) |`);
    });
    lines.push('');
    lines.push('| Section Metadata |  |');
    lines.push('| --- | --- |');
    lines.push('| style | dark |');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('| Metadata |  |');
  lines.push('| --- | --- |');
  Object.entries(parsed.metadata).forEach(([key, value]) => {
    if (value) lines.push(`| ${key} | ${value} |`);
  });

  return lines.join('\n');
}

function solutionsPageToMarkdown(parsed) {
  const lines = [];
  lines.push(`# ${parsed.title}`);
  lines.push('');

  parsed.sections.forEach((section, i) => {
    if (i > 0) { lines.push('---'); lines.push(''); }
    if (section.heading) { lines.push(`## ${section.heading}`); lines.push(''); }
    section.paragraphs.forEach((p) => { lines.push(p); lines.push(''); });
    section.links.forEach((l) => { lines.push(`[${l.text}](${l.href})`); lines.push(''); });
  });

  if (parsed.accordionItems.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('| Accordion |  |');
    lines.push('| --- | --- |');
    parsed.accordionItems.forEach((item) => {
      lines.push(`| ${item.title} | ${item.content} |`);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('| Metadata |  |');
  lines.push('| --- | --- |');
  Object.entries(parsed.metadata).forEach(([key, value]) => {
    if (value) lines.push(`| ${key} | ${value} |`);
  });

  return lines.join('\n');
}

function builtForPageToMarkdown(parsed) {
  const lines = [];
  lines.push(`# ${parsed.title}`);
  lines.push('');
  if (parsed.description) { lines.push(parsed.description); lines.push(''); }

  parsed.sections.forEach((section) => {
    lines.push('---');
    lines.push('');
    if (section.subtitle) { lines.push(section.subtitle); lines.push(''); }
    if (section.heading) { lines.push(`## ${section.heading}`); lines.push(''); }
    section.paragraphs.forEach((p) => { lines.push(p); lines.push(''); });
  });

  lines.push('---');
  lines.push('');
  lines.push('| Metadata |  |');
  lines.push('| --- | --- |');
  Object.entries(parsed.metadata).forEach(([key, value]) => {
    if (value) lines.push(`| ${key} | ${value} |`);
  });

  return lines.join('\n');
}

function companyUtilityToMarkdown(parsed) {
  const lines = [];
  if (parsed.title) {
    lines.push(`# ${parsed.title}`);
    lines.push('');
  }

  parsed.sections.forEach((section, i) => {
    if (i > 0) { lines.push('---'); lines.push(''); }
    if (section.subtitle) { lines.push(section.subtitle); lines.push(''); }
    if (section.heading) { lines.push(`## ${section.heading}`); lines.push(''); }
    section.paragraphs.forEach((p) => { lines.push(p); lines.push(''); });
    section.images.forEach((img) => { lines.push(`![${img.alt}](${img.src})`); lines.push(''); });
    section.links.forEach((l) => { lines.push(`[${l.text}](${l.href})`); lines.push(''); });
  });

  lines.push('---');
  lines.push('');
  lines.push('| Metadata |  |');
  lines.push('| --- | --- |');
  Object.entries(parsed.metadata).forEach(([key, value]) => {
    if (value) lines.push(`| ${key} | ${value} |`);
  });

  return lines.join('\n');
}

// ============================================================
// Helper functions
// ============================================================

function resolveUrl(url) {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${SOURCE_DOMAIN}${url}`;
  return url;
}

function extractBodyMarkdown(container) {
  if (!container) return '';
  const lines = [];

  const walk = (node) => {
    if (!node) return;
    for (const child of node.children || []) {
      const tag = child.tagName?.toLowerCase();
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        const level = parseInt(tag[1], 10);
        // Bump to h3+ for article body to avoid conflicting with page h1/h2
        const adjustedLevel = Math.max(level, 3);
        lines.push(`${'#'.repeat(adjustedLevel)} ${child.textContent.trim()}`);
        lines.push('');
      } else if (tag === 'p') {
        const text = inlineHtmlToMd(child.innerHTML.trim());
        if (text) { lines.push(text); lines.push(''); }
      } else if (tag === 'ul') {
        [...child.querySelectorAll('li')].forEach((li) => {
          lines.push(`- ${inlineHtmlToMd(li.innerHTML.trim())}`);
        });
        lines.push('');
      } else if (tag === 'ol') {
        [...child.querySelectorAll('li')].forEach((li, idx) => {
          lines.push(`${idx + 1}. ${inlineHtmlToMd(li.innerHTML.trim())}`);
        });
        lines.push('');
      } else if (tag === 'blockquote') {
        lines.push(`> ${child.textContent.trim()}`);
        lines.push('');
      } else if (tag === 'figure') {
        const img = child.querySelector('img');
        if (img) {
          lines.push(`![${img.getAttribute('alt') || ''}](${resolveUrl(img.getAttribute('src') || '')})`);
          lines.push('');
        }
      } else if (tag === 'div' || tag === 'section') {
        walk(child);
      }
    }
  };
  walk(container);
  return lines.join('\n').trim();
}

function inlineHtmlToMd(html) {
  return html
    .replace(/<strong>(.*?)<\/strong>/gs, '**$1**')
    .replace(/<b>(.*?)<\/b>/gs, '**$1**')
    .replace(/<em>(.*?)<\/em>/gs, '*$1*')
    .replace(/<i>(.*?)<\/i>/gs, '*$1*')
    .replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gs, (_, href, text) => `[${text}](${resolveUrl(href)})`)
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .trim();
}

// ============================================================
// Template router
// ============================================================

const TEMPLATE_PARSERS = {
  'blog-article': { parse: parseBlogArticle, toMarkdown: blogToMarkdown },
  'gated-resource': { parse: parseGatedResource, toMarkdown: gatedResourceToMarkdown },
  'case-study': { parse: parseCaseStudy, toMarkdown: caseStudyToMarkdown },
  'solutions-page': { parse: parseSolutionsPage, toMarkdown: solutionsPageToMarkdown },
  'built-for-audience': { parse: parseBuiltForPage, toMarkdown: builtForPageToMarkdown },
  'company-utility': { parse: parseCompanyUtilityPage, toMarkdown: companyUtilityToMarkdown },
};

// ============================================================
// Main import function
// ============================================================

async function importPage(url, templateName) {
  const parser = TEMPLATE_PARSERS[templateName];
  if (!parser) throw new Error(`Unknown template: ${templateName}`);

  // Fetch the page
  const html = await fetchUrl(url);

  // Parse with jsdom
  const dom = new JSDOM(html, { url });
  const { document } = dom.window;

  // Run parser
  const parsed = parser.parse(document, url);
  if (!parsed) throw new Error(`Parser returned null for ${url}`);

  // Generate markdown
  const markdown = parser.toMarkdown(parsed);
  if (!markdown || markdown.length < 50) throw new Error(`Generated markdown too short for ${url}`);

  // Determine output path
  const contentPath = urlToContentPath(url);

  if (dryRun) {
    console.log(`  [DRY RUN] Would save to: ${contentPath.relativePath} (${markdown.length} chars)`);
    return { url, path: contentPath.relativePath, chars: markdown.length };
  }

  // Create directory and save
  fs.mkdirSync(contentPath.dir, { recursive: true });
  fs.writeFileSync(contentPath.mdPath, markdown, 'utf8');

  return { url, path: contentPath.relativePath, chars: markdown.length };
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processBatch(urls, templateName, batchLabel) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Batch: ${batchLabel} (${templateName})`);
  console.log(`URLs: ${urls.length} | Offset: ${offset} | Limit: ${limit}`);
  console.log(`${'='.repeat(60)}`);

  // Apply offset and limit
  const filteredUrls = urls.slice(offset, offset + limit);
  results.total += filteredUrls.length;

  for (let i = 0; i < filteredUrls.length; i++) {
    const url = filteredUrls[i];
    const progress = `[${i + 1}/${filteredUrls.length}]`;

    try {
      const result = await importPage(url, templateName);
      results.success++;
      console.log(`  ${progress} ✓ ${url} → ${result.path} (${result.chars} chars)`);
    } catch (err) {
      results.failed++;
      results.errors.push({ url, error: err.message });
      console.error(`  ${progress} ✗ ${url} — ${err.message}`);
    }

    // Rate limiting delay
    if (i < filteredUrls.length - 1) {
      await sleep(DELAY_MS);
    }
  }
}

// ============================================================
// Entry point
// ============================================================

async function main() {
  console.log('Zelis Bulk Import Script');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('');

  // Load catalog
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const alreadyMigrated = new Set(catalog.alreadyMigrated || []);

  if (singleUrl) {
    // Single URL mode - detect template from URL
    let templateName = 'blog-article'; // default
    for (const [, batch] of Object.entries(catalog.batches)) {
      if (batch.urls.includes(singleUrl)) {
        templateName = batch.template;
        break;
      }
    }
    console.log(`Single URL mode: ${singleUrl} (template: ${templateName})`);
    await processBatch([singleUrl], templateName, 'single');
  } else if (batchName === 'all') {
    // Import all batches
    for (const [name, batch] of Object.entries(catalog.batches)) {
      const urls = batch.urls.filter((u) => !alreadyMigrated.has(u));
      await processBatch(urls, batch.template, name);
    }
  } else if (batchName) {
    const batch = catalog.batches[batchName];
    if (!batch) {
      console.error(`Unknown batch: ${batchName}`);
      console.error(`Available batches: ${Object.keys(catalog.batches).join(', ')}`);
      process.exit(1);
    }
    const urls = batch.urls.filter((u) => !alreadyMigrated.has(u));
    await processBatch(urls, batch.template, batchName);
  } else {
    console.log('Usage:');
    console.log('  node bulk-import.js --batch <batch-name>    Import a batch');
    console.log('  node bulk-import.js --batch all             Import all batches');
    console.log('  node bulk-import.js --url <url>             Import single URL');
    console.log('  node bulk-import.js --dry-run --batch <n>   Preview without saving');
    console.log('');
    console.log('Available batches:');
    Object.entries(catalog.batches).forEach(([name, batch]) => {
      console.log(`  ${name.padEnd(40)} ${batch.urls.length} URLs (${batch.template})`);
    });
    process.exit(0);
  }

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('IMPORT SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total:   ${results.total}`);
  console.log(`Success: ${results.success}`);
  console.log(`Failed:  ${results.failed}`);
  console.log(`Skipped: ${results.skipped}`);

  if (results.errors.length > 0) {
    console.log(`\nFailed URLs:`);
    results.errors.forEach(({ url, error }) => {
      console.log(`  ${url} — ${error}`);
    });
  }

  // Save results
  const resultsPath = path.join(__dirname, 'import-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    ...results,
  }, null, 2));
  console.log(`\nResults saved to: ${resultsPath}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
