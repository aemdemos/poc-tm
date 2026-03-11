/**
 * Import script for zelis.com case-study pages
 *
 * Uses content-based section classification (not hardcoded indices) to handle
 * both newer-format and older-format WordPress case study templates.
 *
 * Newer format: .block--hero, .block--media-callout, etc.
 * Older format: .block--resource-hero, .block--stats, challenge/solution columns
 *
 * Section types detected by classifySection():
 *   hero           — .block--hero child (newer format hero)
 *   resource-hero  — .block--resource-hero child (older format hero)
 *   stats          — .block--stats child (counter numbers, may have gold bg)
 *   related        — .resource or .block--resources child (related resource cards)
 *   media-callout  — .block--media-callout child (image/video + text)
 *   gold-cta       — has-gold-background-color on wrapper (CTA section)
 *   lavender       — has-ink-blue-5-background-color on wrapper (angled purple bg)
 *   content        — generic fallback (columns with text/images/blockquotes)
 */

// ── Utility helpers ─────────────────────────────────────────────────────────

function createSectionMetadata(document, style) {
  return WebImporter.DOMUtils.createTable([
    ['Section Metadata'],
    ['style', style],
  ], document);
}

function stripDomain(href) {
  if (!href) return '';
  return href
    .replace('https://www.zelis.com', '')
    .replace('https://zelisstg.wpengine.com', '') || '/';
}

function normalizeImageUrl(src) {
  if (!src) return src;
  return src.replace('https://zelisstg.wpengine.com', 'https://www.zelis.com');
}

function createImage(document, src, alt) {
  const img = document.createElement('img');
  img.src = normalizeImageUrl(src);
  img.alt = alt || '';
  return img;
}

// ── Section classifier ──────────────────────────────────────────────────────

function classifySection(section) {
  const cls = section.className || '';
  // Order matters — more specific block types checked first
  if (section.querySelector('.block--hero')) return 'hero';
  if (section.querySelector('.block--resource-hero')) return 'resource-hero';
  if (section.querySelector('.block--stats')) return 'stats';
  if (section.querySelector('.resource, .block--resources')) return 'related';
  if (section.querySelector('.block--media-callout')) return 'media-callout';
  if (cls.includes('has-gold-background-color')) return 'gold-cta';
  if (cls.includes('has-ink-blue-5-background-color')) return 'lavender';
  return 'content';
}

// ── Content extraction helper ───────────────────────────────────────────────

/**
 * Extract clean content from a wp-block-column element into a new div.
 * Handles headings, paragraphs, lists, images, buttons, nested columns.
 * Skips spacers and blockquotes (blockquotes handled separately as Quote blocks).
 */
function extractColumnDiv(document, colEl) {
  const div = document.createElement('div');
  if (!colEl) return div;

  const processChildren = (parent, target) => {
    Array.from(parent.children).forEach((child) => {
      // Skip spacers
      if (child.classList.contains('wp-block-spacer')) return;

      // Blockquotes — include inline as formatted quote text
      if (child.tagName === 'BLOCKQUOTE') {
        const quotePs = child.querySelectorAll('p');
        const cite = child.querySelector('cite');

        quotePs.forEach((qp) => {
          const text = qp.textContent.trim();
          if (text) {
            const pEl = document.createElement('p');
            pEl.textContent = text;
            target.appendChild(pEl);
          }
        });

        if (cite) {
          const attrP = document.createElement('p');
          const em = document.createElement('em');
          const strongEl = document.createElement('strong');
          const citeText = cite.textContent.trim();
          const commaParts = citeText.split(',');
          strongEl.textContent = commaParts[0].trim();
          em.appendChild(strongEl);
          if (commaParts.length > 1) {
            em.appendChild(document.createTextNode(`, ${commaParts.slice(1).join(',').trim()}`));
          }
          attrP.appendChild(em);
          target.appendChild(attrP);
        }
        return;
      }

      // Headings
      if (/^H[1-6]$/i.test(child.tagName)) {
        const h = document.createElement(child.tagName.toLowerCase());
        h.textContent = child.textContent.trim();
        if (h.textContent) target.appendChild(h);
        return;
      }

      // Images
      if (child.tagName === 'FIGURE' || child.classList.contains('wp-block-image')) {
        const img = child.querySelector('img');
        if (img) target.appendChild(createImage(document, img.src, img.alt || ''));
        return;
      }

      // Lists
      if (child.tagName === 'UL' || child.tagName === 'OL') {
        const list = document.createElement(child.tagName.toLowerCase());
        child.querySelectorAll('li').forEach((li) => {
          const newLi = document.createElement('li');
          const strong = li.querySelector('strong');
          if (strong) {
            const s = document.createElement('strong');
            s.textContent = strong.textContent.trim();
            newLi.appendChild(s);
            const rest = li.textContent.replace(strong.textContent, '').trim();
            if (rest) newLi.appendChild(document.createTextNode(` ${rest}`));
          } else {
            newLi.textContent = li.textContent.trim();
          }
          list.appendChild(newLi);
        });
        target.appendChild(list);
        return;
      }

      // Buttons
      if (child.classList.contains('wp-block-buttons')) {
        const ctaP = document.createElement('p');
        child.querySelectorAll('a').forEach((btn, j) => {
          if (j > 0) ctaP.appendChild(document.createTextNode(' '));
          const a = document.createElement('a');
          a.href = stripDomain(btn.getAttribute('href'));
          a.textContent = btn.textContent.trim();
          const wrap = document.createElement('strong');
          wrap.appendChild(a);
          ctaP.appendChild(wrap);
        });
        if (ctaP.childNodes.length) target.appendChild(ctaP);
        return;
      }

      // Nested wp-block-columns — flatten into parent
      if (child.classList.contains('wp-block-columns')) {
        const nestedCols = child.querySelectorAll(':scope > .wp-block-column');
        nestedCols.forEach((nc) => processChildren(nc, target));
        return;
      }

      // Paragraphs and other text
      if (child.tagName === 'P' || child.classList.contains('wp-block-paragraph')
          || child.classList.contains('has-lead-font-size')) {
        const text = child.textContent.trim();
        if (text) {
          const p = document.createElement('p');
          p.textContent = text;
          target.appendChild(p);
        }
        return;
      }

      // wp-block-group — recurse into its content
      if (child.classList.contains('wp-block-group')) {
        processChildren(child, target);
        return;
      }

      // Fallback: extract text
      const text = child.textContent.trim();
      if (text && text.length > 2) {
        const p = document.createElement('p');
        p.textContent = text;
        target.appendChild(p);
      }
    });
  };

  processChildren(colEl, div);
  return div;
}

// ── Quote block builder ─────────────────────────────────────────────────────

function buildQuoteBlock(document, sourceBlockquote) {
  if (!sourceBlockquote) return null;

  const cells = [['Quote']];

  // Quote text — all paragraphs except the last if it has <cite> sibling
  const quotePs = sourceBlockquote.querySelectorAll('p');
  const cite = sourceBlockquote.querySelector('cite');

  const quoteDiv = document.createElement('div');
  const attrParagraphs = [];

  quotePs.forEach((p) => {
    const text = p.textContent.trim();
    if (text) {
      const pEl = document.createElement('p');
      pEl.textContent = text;
      quoteDiv.appendChild(pEl);
    }
  });

  if (quoteDiv.childNodes.length) cells.push([quoteDiv]);

  // Attribution from <cite> or from <strong> in last paragraph
  if (cite) {
    const attrDiv = document.createElement('div');
    const attrP = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = cite.textContent.trim();
    attrP.appendChild(em);
    attrDiv.appendChild(attrP);
    cells.push([attrDiv]);
  } else if (quotePs.length > 1) {
    const lastP = quotePs[quotePs.length - 1];
    const strong = lastP.querySelector('strong');
    if (strong) {
      const attrDiv = document.createElement('div');
      const attrP = document.createElement('p');
      const em = document.createElement('em');
      const strongEl = document.createElement('strong');
      strongEl.textContent = strong.textContent.trim();
      em.appendChild(strongEl);
      const remainder = lastP.textContent.replace(strong.textContent, '').trim();
      if (remainder) em.appendChild(document.createTextNode(remainder));
      attrP.appendChild(em);
      attrDiv.appendChild(attrP);
      cells.push([attrDiv]);
    }
  }

  return cells.length > 1 ? WebImporter.DOMUtils.createTable(cells, document) : null;
}

// ── Section builders ────────────────────────────────────────────────────────

// HERO — newer format with .block--hero
function buildHeroSection(document, section, main) {
  const hero = section.querySelector('.block--hero');
  if (!hero) return;

  const h1 = hero.querySelector('h1');
  const subtitle = hero.querySelector('h1 + p')
    || hero.querySelector('.col-12.col-lg-6 p');
  const buttons = hero.querySelectorAll('.wp-block-buttons a, .btn');

  const leftCol = document.createElement('div');

  if (h1) {
    const heading = document.createElement('h1');
    heading.textContent = h1.textContent.trim();
    leftCol.appendChild(heading);
  }

  if (subtitle) {
    const p = document.createElement('p');
    p.textContent = subtitle.textContent.trim();
    leftCol.appendChild(p);
  }

  if (buttons.length > 0) {
    const ctaP = document.createElement('p');
    buttons.forEach((btn, i) => {
      const href = stripDomain(btn.getAttribute('href'));
      if (i > 0) ctaP.appendChild(document.createTextNode(' '));
      const a = document.createElement('a');
      a.href = href;
      a.textContent = btn.textContent.trim();
      const isOutline = btn.classList.contains('btn-outline');
      const wrap = document.createElement(isOutline ? 'em' : 'strong');
      wrap.appendChild(a);
      ctaP.appendChild(wrap);
    });
    leftCol.appendChild(ctaP);
  }

  // Right column: hero image
  const rightCol = document.createElement('div');
  let heroImgSrc = '';

  const videoDiv = hero.querySelector('.video[data-src]');
  if (videoDiv) {
    const bgStyle = videoDiv.style.backgroundImage || '';
    const match = bgStyle.match(/url\(["']?([^"')]+)["']?\)/);
    if (match) heroImgSrc = match[1];
  }

  if (!heroImgSrc) {
    const img = hero.querySelector('.col-12.col-lg-6:last-child img');
    if (img) heroImgSrc = img.src;
  }

  if (heroImgSrc) rightCol.appendChild(createImage(document, heroImgSrc, ''));

  main.appendChild(WebImporter.DOMUtils.createTable([
    ['Columns'],
    [leftCol, rightCol],
  ], document));
  main.appendChild(document.createElement('hr'));
}

// RESOURCE-HERO — older format with .block--resource-hero
function buildResourceHeroSection(document, section, main) {
  const hero = section.querySelector('.block--resource-hero');
  if (!hero) return;

  const leftCol = document.createElement('div');

  // Category leader
  const leader = hero.querySelector('.leader');
  if (leader && leader.textContent.trim()) {
    const p = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = leader.textContent.trim();
    p.appendChild(em);
    leftCol.appendChild(p);
  }

  // H1 title
  const h1 = hero.querySelector('h1');
  if (h1) {
    const heading = document.createElement('h1');
    heading.textContent = h1.textContent.trim();
    leftCol.appendChild(heading);
  }

  // Right column: gated content with subtitle + download link
  const rightCol = document.createElement('div');
  const gatedInner = hero.querySelector('.gated-wrapper .inner-wrapper')
    || hero.querySelector('.gated-wrapper');

  if (gatedInner) {
    const h2 = gatedInner.querySelector('h2');
    if (h2) {
      const heading = document.createElement('h2');
      heading.textContent = h2.textContent.trim();
      rightCol.appendChild(heading);
    }

    gatedInner.querySelectorAll('p').forEach((p) => {
      const text = p.textContent.trim();
      if (text) {
        const pEl = document.createElement('p');
        pEl.textContent = text;
        rightCol.appendChild(pEl);
      }
    });

    const btn = gatedInner.querySelector('a.btn, .wp-block-button__link');
    if (btn) {
      const ctaP = document.createElement('p');
      const strong = document.createElement('strong');
      const a = document.createElement('a');
      a.href = btn.getAttribute('href') || '';
      a.textContent = btn.textContent.trim();
      strong.appendChild(a);
      ctaP.appendChild(strong);
      rightCol.appendChild(ctaP);
    }
  } else {
    // Fallback: look for image in right column
    const img = hero.querySelector('.col-lg-6:last-child img');
    if (img) rightCol.appendChild(createImage(document, img.src, img.alt || ''));
  }

  main.appendChild(WebImporter.DOMUtils.createTable([
    ['Columns'],
    [leftCol, rightCol],
  ], document));
  main.appendChild(document.createElement('hr'));
}

// MEDIA-CALLOUT — .block--media-callout (image/video + text)
function buildMediaCalloutSection(document, section, main) {
  const callout = section.querySelector('.block--media-callout');
  if (!callout) {
    // fallback to generic
    buildContentSection(document, section, main);
    return;
  }

  const isMediaRight = callout.classList.contains('media-right');

  // Text content from .inner-wrapper
  const textCol = document.createElement('div');
  const wrapper = callout.querySelector('.inner-wrapper');
  if (wrapper) {
    const h2 = wrapper.querySelector('h2');
    if (h2) {
      const heading = document.createElement('h2');
      heading.textContent = h2.textContent.trim();
      textCol.appendChild(heading);
    }

    wrapper.querySelectorAll('p').forEach((p) => {
      const text = p.textContent.trim();
      if (text) {
        const pEl = document.createElement('p');
        pEl.textContent = text;
        textCol.appendChild(pEl);
      }
    });

    const ul = wrapper.querySelector('ul');
    if (ul) {
      const newUl = document.createElement('ul');
      ul.querySelectorAll('li').forEach((li) => {
        const newLi = document.createElement('li');
        const strong = li.querySelector('strong');
        if (strong) {
          const s = document.createElement('strong');
          s.textContent = strong.textContent.trim();
          newLi.appendChild(s);
          const rest = li.textContent.replace(strong.textContent, '').trim();
          if (rest) newLi.appendChild(document.createTextNode(` ${rest}`));
        } else {
          newLi.textContent = li.textContent.trim();
        }
        newUl.appendChild(newLi);
      });
      textCol.appendChild(newUl);
    }
  }

  // Media content: image or video
  const mediaCol = document.createElement('div');

  // Try image
  const img = callout.querySelector('.image-wrapper img, figure img, .accent ~ div img');
  if (img) {
    mediaCol.appendChild(createImage(document, img.src, img.alt || ''));
  }

  // Try video iframe
  const iframe = callout.querySelector('iframe');
  if (iframe) {
    const src = iframe.getAttribute('src') || iframe.getAttribute('data-src') || '';
    if (src) {
      const a = document.createElement('a');
      a.href = src;
      a.textContent = src;
      mediaCol.appendChild(a);
    }
  }

  // Try HTML5 video
  if (!mediaCol.childNodes.length) {
    const videoEl = callout.querySelector('video');
    if (videoEl) {
      const source = videoEl.querySelector('source');
      const src = source?.getAttribute('src') || videoEl.getAttribute('src') || '';
      if (src) {
        const a = document.createElement('a');
        a.href = src;
        a.textContent = src;
        mediaCol.appendChild(a);
      }
    }
  }

  // Try background-image
  if (!mediaCol.childNodes.length) {
    const bgEl = callout.querySelector('.video[data-src], [style*="background"]');
    if (bgEl) {
      const bgStyle = bgEl.style?.backgroundImage || '';
      const match = bgStyle.match(/url\(["']?([^"')]+)["']?\)/);
      if (match) mediaCol.appendChild(createImage(document, match[1], ''));
    }
  }

  const leftCol = isMediaRight ? textCol : mediaCol;
  const rightCol = isMediaRight ? mediaCol : textCol;

  main.appendChild(WebImporter.DOMUtils.createTable([
    ['Columns'],
    [leftCol, rightCol],
  ], document));
  main.appendChild(document.createElement('hr'));
}

// LAVENDER — has-ink-blue-5-background-color (angled purple section)
function buildLavenderSection(document, section, main) {
  const container = section.querySelector('.acf-innerblocks-container') || section;
  const colGroups = container.querySelectorAll(':scope > .wp-block-columns');

  colGroups.forEach((colGroup) => {
    const cols = colGroup.querySelectorAll(':scope > .wp-block-column');

    if (cols.length >= 2) {
      const rowCells = [];
      cols.forEach((col) => rowCells.push(extractColumnDiv(document, col)));

      main.appendChild(WebImporter.DOMUtils.createTable([
        ['Columns'],
        rowCells,
      ], document));
    } else if (cols.length === 1) {
      // Single column — extract as default content
      const content = extractColumnDiv(document, cols[0]);
      while (content.firstChild) main.appendChild(content.firstChild);
    }
  });

  // Section metadata: lavender (angled light purple background)
  main.appendChild(createSectionMetadata(document, 'lavender'));
  main.appendChild(document.createElement('hr'));
}

// GOLD-CTA — has-gold-background-color (gold background CTA section)
function buildCtaSection(document, section, main) {
  const container = section.querySelector('.acf-innerblocks-container') || section;

  // Eyebrow text
  const eyebrow = container.querySelector('.has-lead-font-size');
  if (eyebrow) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    main.appendChild(p);
  }

  // H2
  const h2 = container.querySelector('h2');
  if (h2) {
    const heading = document.createElement('h2');
    heading.textContent = h2.textContent.trim();
    main.appendChild(heading);
  }

  // CTA button
  const btn = container.querySelector('.wp-block-button__link, .btn, a[class*="button"]');
  if (btn) {
    const ctaP = document.createElement('p');
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    a.href = stripDomain(btn.getAttribute('href'));
    a.textContent = btn.textContent.trim();
    strong.appendChild(a);
    ctaP.appendChild(strong);
    main.appendChild(ctaP);
  }

  main.appendChild(createSectionMetadata(document, 'highlight'));
  main.appendChild(document.createElement('hr'));
}

// STATS — .block--stats (counter numbers with data-value attributes)
function buildStatsSection(document, section, main) {
  const stats = section.querySelector('.block--stats');
  if (!stats) return;

  const statItems = stats.querySelectorAll('.stat');
  const cardRows = [];

  statItems.forEach((stat) => {
    const h3 = stat.querySelector('h3');
    const desc = stat.querySelector('p.desc, p');
    if (!h3) return;

    // Extract counter value from data attributes
    const dataValue = h3.getAttribute('data-value');
    const prefix = h3.getAttribute('data-prefix') || '';
    const suffix = h3.getAttribute('data-suffix') || '';
    let value = dataValue ? `${prefix}${dataValue}${suffix}` : h3.textContent.trim();

    // Add common formatting: $, +, M, B suffixes
    if (value === '0' || !value) return; // skip if still zero / empty

    const cardDiv = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = value;
    cardDiv.appendChild(heading);

    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      cardDiv.appendChild(p);
    }

    cardRows.push([cardDiv]);
  });

  if (cardRows.length > 0) {
    main.appendChild(WebImporter.DOMUtils.createTable([
      ['Cards'],
      ...cardRows,
    ], document));
  }

  // Add section-metadata if gold background
  if ((section.className || '').includes('has-gold-background-color')) {
    main.appendChild(createSectionMetadata(document, 'highlight'));
  }

  main.appendChild(document.createElement('hr'));
}

// RELATED — .resource elements (related resource cards)
function buildRelatedResourcesSection(document, section, main) {
  const h2 = section.querySelector('h2');
  if (h2) {
    const heading = document.createElement('h2');
    heading.textContent = h2.textContent.trim();
    main.appendChild(heading);
  }

  const resources = section.querySelectorAll('.resource');
  const cardRows = [];

  resources.forEach((resource) => {
    const img = resource.querySelector('img');
    const h3 = resource.querySelector('h3');
    const desc = resource.querySelector('.content-group p');
    const link = resource.querySelector('.content-group a');
    const category = resource.querySelector('.leader');

    const imgDiv = document.createElement('div');
    if (img) imgDiv.appendChild(createImage(document, img.src, img.alt || ''));

    const contentDiv = document.createElement('div');

    if (category) {
      const catP = document.createElement('p');
      const em = document.createElement('em');
      em.textContent = category.textContent.trim().split('\n')[0].trim();
      catP.appendChild(em);
      contentDiv.appendChild(catP);
    }

    if (h3) {
      const h3El = document.createElement('h3');
      h3El.textContent = h3.textContent.trim();
      contentDiv.appendChild(h3El);
    }

    if (desc) {
      const pEl = document.createElement('p');
      pEl.textContent = desc.textContent.trim();
      contentDiv.appendChild(pEl);
    }

    if (link) {
      const linkP = document.createElement('p');
      const a = document.createElement('a');
      a.href = stripDomain(link.getAttribute('href'));
      a.textContent = link.textContent.trim();
      linkP.appendChild(a);
      contentDiv.appendChild(linkP);
    }

    cardRows.push([imgDiv, contentDiv]);
  });

  if (cardRows.length > 0) {
    main.appendChild(WebImporter.DOMUtils.createTable([
      ['Cards'],
      ...cardRows,
    ], document));
  }

  main.appendChild(document.createElement('hr'));
}

// CONTENT — generic fallback for sections with wp-block-columns
function buildContentSection(document, section, main) {
  const container = section.querySelector('.acf-innerblocks-container') || section;
  const children = Array.from(container.children);

  children.forEach((child) => {
    // Skip spacers
    if (child.classList.contains('wp-block-spacer')) return;

    // wp-block-columns → Columns block or default content
    if (child.classList.contains('wp-block-columns')) {
      const cols = child.querySelectorAll(':scope > .wp-block-column');

      if (cols.length >= 2) {
        // Multi-column → Columns block
        const rowCells = [];
        cols.forEach((col) => rowCells.push(extractColumnDiv(document, col)));

        main.appendChild(WebImporter.DOMUtils.createTable([
          ['Columns'],
          rowCells,
        ], document));
      } else if (cols.length === 1) {
        // Single column — extract as default content
        const content = extractColumnDiv(document, cols[0]);
        while (content.firstChild) main.appendChild(content.firstChild);
      }
      return;
    }

    // Standalone heading
    if (/^H[1-6]$/i.test(child.tagName)) {
      const h = document.createElement(child.tagName.toLowerCase());
      h.textContent = child.textContent.trim();
      if (h.textContent) main.appendChild(h);
      return;
    }

    // Standalone paragraph or lead text
    if (child.tagName === 'P' || child.classList.contains('has-lead-font-size')) {
      const text = child.textContent.trim();
      if (text) {
        const p = document.createElement('p');
        p.textContent = text;
        main.appendChild(p);
      }
      return;
    }

    // Buttons
    if (child.classList.contains('wp-block-buttons')) {
      const ctaP = document.createElement('p');
      child.querySelectorAll('a').forEach((btn, j) => {
        if (j > 0) ctaP.appendChild(document.createTextNode(' '));
        const a = document.createElement('a');
        a.href = stripDomain(btn.getAttribute('href'));
        a.textContent = btn.textContent.trim();
        const wrap = document.createElement('strong');
        wrap.appendChild(a);
        ctaP.appendChild(wrap);
      });
      if (ctaP.childNodes.length) main.appendChild(ctaP);
      return;
    }

    // Standalone blockquote
    if (child.tagName === 'BLOCKQUOTE') {
      const quoteBlock = buildQuoteBlock(document, child);
      if (quoteBlock) main.appendChild(quoteBlock);
      return;
    }

    // Fallback: extract text if meaningful
    const text = child.textContent.trim();
    if (text && text.length > 5) {
      const p = document.createElement('p');
      p.textContent = text;
      main.appendChild(p);
    }
  });

  main.appendChild(document.createElement('hr'));
}

// ── Metadata block ──────────────────────────────────────────────────────────

function buildMetadataBlock(document, main) {
  const getMeta = (name) => document.querySelector(
    `meta[property="${name}"], meta[name="${name}"]`,
  )?.getAttribute('content') || '';

  const meta = {};
  meta.title = getMeta('og:title') || document.title || '';
  meta.description = getMeta('description') || getMeta('og:description') || '';

  const ogImage = getMeta('og:image');
  if (ogImage) meta.image = ogImage;

  meta.template = 'case-study';

  main.appendChild(WebImporter.Blocks.getMetadataBlock(document, meta));
}

// ── Main export ─────────────────────────────────────────────────────────────

export default {
  transformDOM: ({ document }) => {
    const main = document.createElement('div');

    const sections = document.querySelectorAll(
      '.post-content > .block--section-wrapper',
    );

    sections.forEach((section) => {
      const type = classifySection(section);

      switch (type) {
        case 'hero':
          buildHeroSection(document, section, main);
          break;
        case 'resource-hero':
          buildResourceHeroSection(document, section, main);
          break;
        case 'media-callout':
          buildMediaCalloutSection(document, section, main);
          break;
        case 'lavender':
          buildLavenderSection(document, section, main);
          break;
        case 'gold-cta':
          buildCtaSection(document, section, main);
          break;
        case 'stats':
          buildStatsSection(document, section, main);
          break;
        case 'related':
          buildRelatedResourcesSection(document, section, main);
          break;
        default:
          buildContentSection(document, section, main);
          break;
      }
    });

    buildMetadataBlock(document, main);
    return main;
  },

  generateDocumentPath: ({ url }) => {
    let path = new URL(url).pathname;
    path = path.replace(/\/$/, '');
    if (!path) path = '/index';
    return WebImporter.FileUtils.sanitizePath(path);
  },
};
