/**
 * Import script for zelis.com case-study pages
 *
 * Transforms the WordPress DOM into EDS-compatible structure with:
 * - Hero: Columns block (text col with H1, subtitle, CTAs + image col)
 * - Narrative 1: Columns block (image + text with blockquote)
 * - Partnership (angled bg): Columns block + section-metadata style=lavender
 * - Payoff/Results: Columns block (image + text with list)
 * - CTA (gold bg): Default content + section-metadata style=highlight
 * - Related Resources: Cards block
 * - Metadata block with template=case-study
 */

function createSectionMetadata(document, style) {
  const cells = [
    ['Section Metadata'],
    ['style', style],
  ];
  return WebImporter.DOMUtils.createTable(cells, document);
}

/**
 * Strip zelis.com domain from absolute URLs to make them relative.
 */
function stripDomain(href) {
  if (!href) return '';
  return href.replace('https://www.zelis.com', '').replace('https://zelisstg.wpengine.com', '') || '/';
}

/**
 * Create a <picture>-wrapped image element from a source img element.
 * EDS import keeps <img> src as-is; we just preserve the src and alt.
 */
function createImage(document, src, alt) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || '';
  return img;
}

/**
 * Build a blockquote element from a source blockquote.
 * Row 1: the quote text (em/italic)
 * Row 2: attribution (strong name + title)
 */
function buildQuoteBlock(document, sourceBlockquote) {
  if (!sourceBlockquote) return null;

  const cells = [['Quote']];

  // Quote text row
  const quotePs = sourceBlockquote.querySelectorAll('p');
  const quoteDiv = document.createElement('div');

  if (quotePs.length > 0) {
    // First <p> is the quote text
    const quoteP = document.createElement('p');
    const quoteText = quotePs[0].textContent.trim();
    quoteP.textContent = quoteText;
    quoteDiv.appendChild(quoteP);
  }

  cells.push([quoteDiv]);

  // Attribution row
  if (quotePs.length > 1) {
    const attrDiv = document.createElement('div');
    const attrP = document.createElement('p');
    const strong = quotePs[1].querySelector('strong');
    if (strong) {
      const em = document.createElement('em');
      // Rebuild: "– Name, Title"
      const strongEl = document.createElement('strong');
      strongEl.textContent = strong.textContent.trim();
      em.appendChild(strongEl);
      // Remaining text after the strong (e.g. ", Chief Operating Officer")
      const remainder = quotePs[1].textContent.replace(strong.textContent, '').trim();
      if (remainder) {
        em.appendChild(document.createTextNode(remainder));
      }
      attrP.appendChild(em);
    } else {
      attrP.textContent = quotePs[1].textContent.trim();
    }
    attrDiv.appendChild(attrP);
    cells.push([attrDiv]);
  }

  return WebImporter.DOMUtils.createTable(cells, document);
}

// ── Section 0: Hero ──────────────────────────────────────────────────────────

function buildHeroSection(document, section, main) {
  if (!section) return;

  const hero = section.querySelector('.block--hero');
  if (!hero) return;

  const h1 = hero.querySelector('h1');
  const subtitle = hero.querySelector('h1 + p') || hero.querySelector('.col-12.col-lg-6 p');
  const buttons = hero.querySelectorAll('.wp-block-buttons a, .btn');

  // Left column: H1 + subtitle + CTA buttons
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

  // CTA buttons
  if (buttons.length > 0) {
    const ctaP = document.createElement('p');
    buttons.forEach((btn, i) => {
      const href = stripDomain(btn.getAttribute('href'));
      const isOutline = btn.classList.contains('btn-outline');

      if (i > 0) {
        ctaP.appendChild(document.createTextNode(' '));
      }

      const a = document.createElement('a');
      a.href = href;
      a.textContent = btn.textContent.trim();

      if (isOutline) {
        // Secondary button: just an <em> wrapped link
        const em = document.createElement('em');
        em.appendChild(a);
        ctaP.appendChild(em);
      } else {
        // Primary button: strong wrapped link
        const strong = document.createElement('strong');
        strong.appendChild(a);
        ctaP.appendChild(strong);
      }
    });
    leftCol.appendChild(ctaP);
  }

  // Right column: hero image (from video background-image or a fallback)
  const rightCol = document.createElement('div');
  const videoDiv = hero.querySelector('.video[data-src]');
  let heroImgSrc = '';

  if (videoDiv) {
    // Extract background-image URL
    const bgStyle = videoDiv.style.backgroundImage || '';
    const match = bgStyle.match(/url\(["']?([^"')]+)["']?\)/);
    if (match) {
      heroImgSrc = match[1];
    }
  }

  // Fallback: any img in the hero right column
  if (!heroImgSrc) {
    const img = hero.querySelector('.col-12.col-lg-6:last-child img');
    if (img) heroImgSrc = img.src;
  }

  if (heroImgSrc) {
    const img = createImage(document, heroImgSrc, '');
    rightCol.appendChild(img);
  }

  const columnsTable = WebImporter.DOMUtils.createTable([
    ['Columns'],
    [leftCol, rightCol],
  ], document);

  main.appendChild(columnsTable);
  main.appendChild(document.createElement('hr'));
}

// ── Section 1: Narrative (image + text + blockquote) ─────────────────────────

function buildNarrativeSection(document, section, main) {
  if (!section) return;

  const columns = section.querySelectorAll('.wp-block-column');
  if (columns.length < 2) return;

  // Left column: image
  const leftCol = document.createElement('div');
  const figure = columns[0].querySelector('figure img');
  if (figure) {
    const img = createImage(document, figure.src, figure.alt || '');
    leftCol.appendChild(img);
  }

  // Right column: H2 + paragraph + blockquote
  const rightCol = document.createElement('div');

  const h2 = columns[1].querySelector('h2');
  if (h2) {
    const heading = document.createElement('h2');
    heading.textContent = h2.textContent.trim();
    rightCol.appendChild(heading);
  }

  const paragraphs = columns[1].querySelectorAll(':scope > p');
  paragraphs.forEach((p) => {
    const pEl = document.createElement('p');
    pEl.textContent = p.textContent.trim();
    if (pEl.textContent) {
      rightCol.appendChild(pEl);
    }
  });

  const columnsTable = WebImporter.DOMUtils.createTable([
    ['Columns'],
    [leftCol, rightCol],
  ], document);

  main.appendChild(columnsTable);

  // Blockquote as a separate Quote block
  const blockquote = columns[1].querySelector('blockquote');
  if (blockquote) {
    const quoteBlock = buildQuoteBlock(document, blockquote);
    if (quoteBlock) {
      main.appendChild(quoteBlock);
    }
  }

  main.appendChild(document.createElement('hr'));
}

// ── Section 2: Partnership (angled background, two-column) ───────────────────

function buildPartnershipSection(document, section, main) {
  if (!section) return;

  const topColumns = section.querySelectorAll(':scope .acf-innerblocks-container > .wp-block-columns > .wp-block-column');
  if (topColumns.length < 2) return;

  const leftSource = topColumns[0];
  const rightSource = topColumns[1];

  // Left column: H2, paragraph text, blockquote
  const leftCol = document.createElement('div');

  const h2 = leftSource.querySelector('h2');
  if (h2) {
    const heading = document.createElement('h2');
    heading.textContent = h2.textContent.trim();
    leftCol.appendChild(heading);
  }

  const pEls = leftSource.querySelectorAll(':scope > p');
  pEls.forEach((p) => {
    const text = p.textContent.trim();
    if (text) {
      const pEl = document.createElement('p');
      pEl.textContent = text;
      leftCol.appendChild(pEl);
    }
  });

  // Right column: H3 "Here's what changed:" + UL list + image
  const rightCol = document.createElement('div');

  const h3 = rightSource.querySelector('h3');
  if (h3) {
    const heading = document.createElement('h3');
    heading.textContent = h3.textContent.trim();
    rightCol.appendChild(heading);
  }

  const ul = rightSource.querySelector('ul');
  if (ul) {
    const newUl = document.createElement('ul');
    ul.querySelectorAll('li').forEach((li) => {
      const newLi = document.createElement('li');
      // Preserve bold lead text
      const strong = li.querySelector('strong');
      if (strong) {
        const strongEl = document.createElement('strong');
        strongEl.textContent = strong.textContent.trim();
        newLi.appendChild(strongEl);
        // Get remaining text after the strong
        const remainder = li.textContent.replace(strong.textContent, '').trim();
        if (remainder) {
          newLi.appendChild(document.createTextNode(` ${remainder}`));
        }
      } else {
        newLi.textContent = li.textContent.trim();
      }
      newUl.appendChild(newLi);
    });
    rightCol.appendChild(newUl);
  }

  const rightImg = rightSource.querySelector('figure img');
  if (rightImg) {
    const img = createImage(document, rightImg.src, rightImg.alt || '');
    rightCol.appendChild(img);
  }

  const columnsTable = WebImporter.DOMUtils.createTable([
    ['Columns'],
    [leftCol, rightCol],
  ], document);

  main.appendChild(columnsTable);

  // Blockquote from the left column as a Quote block
  const blockquote = leftSource.querySelector('blockquote');
  if (blockquote) {
    const quoteBlock = buildQuoteBlock(document, blockquote);
    if (quoteBlock) {
      main.appendChild(quoteBlock);
    }
  }

  // Section metadata: lavender (angled light purple background)
  main.appendChild(createSectionMetadata(document, 'lavender'));
  main.appendChild(document.createElement('hr'));
}

// ── Section 3: Payoff / Results (media callout with image + text) ────────────

function buildPayoffSection(document, section, main) {
  if (!section) return;

  const mediaCallout = section.querySelector('.block--media-callout');

  // Left column: image
  const leftCol = document.createElement('div');
  const img = section.querySelector('.image-wrapper img, figure img');
  if (img) {
    const imgEl = createImage(document, img.src, img.alt || '');
    leftCol.appendChild(imgEl);
  }

  // Right column: H2, paragraph, UL list
  const rightCol = document.createElement('div');

  const wrapper = mediaCallout
    ? mediaCallout.querySelector('.inner-wrapper')
    : section;

  const h2 = wrapper?.querySelector('h2');
  if (h2) {
    const heading = document.createElement('h2');
    heading.textContent = h2.textContent.trim();
    rightCol.appendChild(heading);
  }

  const pEls = wrapper?.querySelectorAll('p');
  if (pEls) {
    pEls.forEach((p) => {
      const text = p.textContent.trim();
      if (text) {
        const pEl = document.createElement('p');
        pEl.textContent = text;
        rightCol.appendChild(pEl);
      }
    });
  }

  const ulEl = wrapper?.querySelector('ul');
  if (ulEl) {
    const newUl = document.createElement('ul');
    ulEl.querySelectorAll('li').forEach((li) => {
      const newLi = document.createElement('li');
      newLi.textContent = li.textContent.trim();
      newUl.appendChild(newLi);
    });
    rightCol.appendChild(newUl);
  }

  const columnsTable = WebImporter.DOMUtils.createTable([
    ['Columns'],
    [leftCol, rightCol],
  ], document);

  main.appendChild(columnsTable);
  main.appendChild(document.createElement('hr'));
}

// ── Section 4: CTA (gold background) ────────────────────────────────────────

function buildCtaSection(document, section, main) {
  if (!section) return;

  // Eyebrow text
  const eyebrow = section.querySelector('.has-lead-font-size');
  if (eyebrow) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    main.appendChild(p);
  }

  // H2
  const h2 = section.querySelector('h2');
  if (h2) {
    const heading = document.createElement('h2');
    heading.textContent = h2.textContent.trim();
    main.appendChild(heading);
  }

  // CTA button
  const btn = section.querySelector('.wp-block-button__link, .btn');
  if (btn) {
    const ctaP = document.createElement('p');
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    const href = stripDomain(btn.getAttribute('href'));
    a.href = href || '/connect-with-zelis/';
    a.textContent = btn.textContent.trim();
    strong.appendChild(a);
    ctaP.appendChild(strong);
    main.appendChild(ctaP);
  }

  // Section metadata: highlight (gold background)
  main.appendChild(createSectionMetadata(document, 'highlight'));
  main.appendChild(document.createElement('hr'));
}

// ── Section 5: Related Resources (Cards block) ──────────────────────────────

function buildRelatedResourcesSection(document, section, main) {
  if (!section) return;

  // H2 heading
  const h2 = section.querySelector('h2');
  if (h2) {
    const heading = document.createElement('h2');
    heading.textContent = h2.textContent.trim();
    main.appendChild(heading);
  }

  // Resource cards
  const resources = section.querySelectorAll('.resource');
  const cardRows = [];

  resources.forEach((resource) => {
    const img = resource.querySelector('img');
    const h3 = resource.querySelector('h3');
    const desc = resource.querySelector('.content-group p');
    const link = resource.querySelector('.content-group a');
    const category = resource.querySelector('.leader');

    // Image column
    const imgDiv = document.createElement('div');
    if (img) {
      const imgEl = createImage(document, img.src, img.alt || '');
      imgDiv.appendChild(imgEl);
    }

    // Content column
    const contentDiv = document.createElement('div');

    if (category) {
      const catP = document.createElement('p');
      const em = document.createElement('em');
      // Clean up category text (remove SVG line decoration text artifacts)
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
    const cardsTable = WebImporter.DOMUtils.createTable([
      ['Cards'],
      ...cardRows,
    ], document);
    main.appendChild(cardsTable);
  }

  main.appendChild(document.createElement('hr'));
}

// ── Metadata block ──────────────────────────────────────────────────────────

function buildMetadataBlock(document, main) {
  const meta = {};

  const getMeta = (name) => document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.getAttribute('content') || '';

  meta.title = getMeta('og:title') || document.title || '';
  meta.description = getMeta('description') || getMeta('og:description') || '';

  const ogImage = getMeta('og:image');
  if (ogImage) {
    meta.image = ogImage;
  }

  meta.template = 'case-study';

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.appendChild(block);
}

// ── Main export ─────────────────────────────────────────────────────────────

export default {
  transformDOM: ({ document }) => {
    const main = document.createElement('div');

    // Gather all .block--section-wrapper sections from .post-content
    const sections = document.querySelectorAll('.post-content > .block--section-wrapper');

    // Section 0: Hero
    buildHeroSection(document, sections[0], main);

    // Section 1: Narrative (image left + text right with blockquote)
    buildNarrativeSection(document, sections[1], main);

    // Section 2: Partnership (angled lavender background, two-column)
    buildPartnershipSection(document, sections[2], main);

    // Section 3: Payoff / Results (media callout with image + text)
    buildPayoffSection(document, sections[3], main);

    // Section 4: CTA (gold background)
    buildCtaSection(document, sections[4], main);

    // Section 5: Related Resources (cards)
    buildRelatedResourcesSection(document, sections[5], main);

    // Metadata
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
