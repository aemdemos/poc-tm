/**
 * Import script for zelis.com solutions pages
 *
 * Handles both the /solutions/ hub page and sub-pages like /solutions/payment-integrity/.
 *
 * Hub page sections:
 *   dark-hero       — dark purple hero with eyebrow + H2 + CTA (+ solution finder widget, skipped)
 *   stats           — "By the Numbers" counter cards
 *   audience        — "A Bold Approach" audience cards (For Payers, For Brokers, For Providers)
 *   cta             — "Request a Meeting" call-to-action
 *
 * Sub-page sections (classified by classifySection):
 *   hero            — H1 + description + CTA + Lottie animation (two columns)
 *   why-zelis       — lavender bg with "Why Zelis?" eyebrow + key points
 *   solutions-suite — accordion with product sub-solutions + optional stat counter
 *   testimonials    — blockquote carousel with customer quotes + Lottie
 *   deep-dive       — dark purple section with detailed content (rare, e.g. network-solutions)
 *   cta             — "Request a Meeting" CTA section
 *   resources       — "Top Resources on [Topic]" card grid
 *   content         — generic fallback
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

function createCTA(document, btn, isSecondary) {
  if (!btn) return null;
  const ctaP = document.createElement('p');
  const a = document.createElement('a');
  a.href = stripDomain(btn.getAttribute('href'));
  a.textContent = btn.textContent.trim();
  const wrap = document.createElement(isSecondary ? 'em' : 'strong');
  wrap.appendChild(a);
  ctaP.appendChild(wrap);
  return ctaP;
}

// ── Hub page detector ────────────────────────────────────────────────────────

function isHubPage(document) {
  // Hub page has body class or the "Solutions Showcase" eyebrow with stats cards
  const pathname = document.location?.pathname || '';
  // /solutions/ or /solutions without trailing content
  return /^\/solutions\/?$/.test(pathname);
}

// ── Section classifier (sub-pages) ──────────────────────────────────────────

function classifySection(section) {
  const cls = section.className || '';
  const text = section.textContent || '';

  // Spacer — skip
  if (cls.includes('wp-block-spacer')) return 'spacer';

  // Deep dive — dark purple background (rare)
  if (cls.includes('has-ink-blue-50-background-color')
      || cls.includes('has-ink-blue-100-background-color')) return 'deep-dive';

  // Testimonials — contains blockquote
  if (section.querySelector('blockquote')) return 'testimonials';

  // Solutions suite — contains accordion-like structure
  // WordPress uses various accordion patterns: yoast FAQ, custom toggles, or H3-based
  const accordionEl = section.querySelector(
    '.wp-block-yoast-faq-block, .accordion, [data-block-name="accordion"]',
  );
  if (accordionEl) return 'solutions-suite';

  // Also detect accordion by multiple H3 inside a column that look like toggleable items
  const h3s = section.querySelectorAll('h3');
  const hasButtons = section.querySelector('button');
  if (h3s.length >= 2 && hasButtons) return 'solutions-suite';

  // CTA — "Request a Meeting" or "Let's talk about modernizing"
  if (text.includes('Request a Meeting')
      || text.includes("Let's talk about modernizing")) return 'cta';

  // Resources — "Top Resources" heading or resource card grid
  if (text.includes('Top Resources') || section.querySelector('.resource-card')) return 'resources';

  // Why Zelis — lavender bg with "Why Zelis?" or "Key Points"
  if (cls.includes('has-ink-blue-5-background-color')
      && (text.includes('Why Zelis') || text.includes('Key Points'))) return 'why-zelis';

  // Hero — first section with H1
  if (section.querySelector('h1')) return 'hero';

  // Lavender generic — has-ink-blue-5 without specific markers
  if (cls.includes('has-ink-blue-5-background-color')) return 'why-zelis';

  return 'content';
}

// ── Content extraction helper ───────────────────────────────────────────────

function extractCleanContent(document, container) {
  const div = document.createElement('div');
  if (!container) return div;

  Array.from(container.children).forEach((child) => {
    if (child.classList?.contains('wp-block-spacer')) return;

    if (/^H[1-6]$/i.test(child.tagName)) {
      const h = document.createElement(child.tagName.toLowerCase());
      h.textContent = child.textContent.trim();
      if (h.textContent) div.appendChild(h);
      return;
    }

    if (child.tagName === 'FIGURE' || child.classList?.contains('wp-block-image')) {
      const img = child.querySelector('img');
      if (img) div.appendChild(createImage(document, img.src, img.alt || ''));
      return;
    }

    if (child.tagName === 'UL' || child.tagName === 'OL') {
      const list = document.createElement(child.tagName.toLowerCase());
      child.querySelectorAll('li').forEach((li) => {
        const newLi = document.createElement('li');
        newLi.textContent = li.textContent.trim();
        list.appendChild(newLi);
      });
      div.appendChild(list);
      return;
    }

    if (child.classList?.contains('wp-block-buttons')) {
      child.querySelectorAll('a').forEach((btn) => {
        const ctaP = createCTA(document, btn, btn.classList.contains('is-style-outline'));
        if (ctaP) div.appendChild(ctaP);
      });
      return;
    }

    if (child.classList?.contains('wp-block-columns')) {
      Array.from(child.querySelectorAll(':scope > .wp-block-column')).forEach((col) => {
        const colContent = extractCleanContent(document, col);
        while (colContent.firstChild) div.appendChild(colContent.firstChild);
      });
      return;
    }

    if (child.classList?.contains('wp-block-group')) {
      const groupContent = extractCleanContent(document, child);
      while (groupContent.firstChild) div.appendChild(groupContent.firstChild);
      return;
    }

    // Nested section elements (e.g., block--key-points inside wp-block-column)
    // Recurse into the deepest content container
    if (child.tagName === 'SECTION' || child.tagName === 'DIV') {
      const inner = child.querySelector('.acf-innerblocks-container')
        || child.querySelector('.wrapper')
        || child.querySelector('.col-12')
        || child;
      const nestedContent = extractCleanContent(document, inner);
      if (nestedContent.childNodes.length > 0) {
        while (nestedContent.firstChild) div.appendChild(nestedContent.firstChild);
        return;
      }
    }

    if (child.tagName === 'P' || child.classList?.contains('wp-block-paragraph')
        || child.classList?.contains('has-lead-font-size')) {
      const text = child.textContent.trim();
      if (text) {
        const p = document.createElement('p');
        // Preserve links inside paragraphs
        const links = child.querySelectorAll('a');
        if (links.length > 0) {
          p.innerHTML = child.innerHTML;
          // Fix link hrefs
          p.querySelectorAll('a').forEach((a) => {
            a.href = stripDomain(a.getAttribute('href'));
          });
        } else {
          p.textContent = text;
        }
        div.appendChild(p);
      }
      return;
    }

    // Blockquotes — preserve them
    if (child.tagName === 'BLOCKQUOTE') {
      const bq = document.createElement('blockquote');
      child.querySelectorAll('p').forEach((p) => {
        const text = p.textContent.trim();
        if (text) {
          const pEl = document.createElement('p');
          pEl.textContent = text;
          bq.appendChild(pEl);
        }
      });
      if (bq.childNodes.length) div.appendChild(bq);
      return;
    }

    const text = child.textContent.trim();
    if (text && text.length > 3) {
      const p = document.createElement('p');
      p.textContent = text;
      div.appendChild(p);
    }
  });

  return div;
}

// ── Sub-page section builders ───────────────────────────────────────────────

function buildHeroSection(document, section, main) {
  // H1 + description + CTA in left column, Lottie/image in right
  const h1 = section.querySelector('h1');
  const ctaBtn = section.querySelector('.wp-block-button__link, .btn, a[class*="button"]');

  // Find the left text column (contains H1)
  const leftSrc = section.querySelector('.col-lg-6:first-of-type')
    || section.querySelector('.wp-block-column:first-child');

  const leftCol = document.createElement('div');

  if (h1) {
    const heading = document.createElement('h1');
    heading.textContent = h1.textContent.trim();
    leftCol.appendChild(heading);
  }

  // Get description paragraphs from the left column
  const pSource = leftSrc || section;
  pSource.querySelectorAll('p').forEach((p) => {
    if (p.querySelector('a.btn, .wp-block-button__link')) return;
    if (p.closest('.wp-block-buttons')) return;
    const text = p.textContent.trim();
    if (text && text !== h1?.textContent.trim() && text.length > 1) {
      const pEl = document.createElement('p');
      pEl.textContent = text;
      leftCol.appendChild(pEl);
    }
  });

  // CTA button
  if (ctaBtn) {
    const ctaP = createCTA(document, ctaBtn, false);
    if (ctaP) leftCol.appendChild(ctaP);
  }

  // Right column: Lottie player or image
  const rightCol = document.createElement('div');
  const rightSrc = section.querySelector('.col-lg-6:last-of-type')
    || section.querySelector('.wp-block-column:last-child');

  // Check for <lottie-player> web component
  const lottiePlayer = (rightSrc || section).querySelector('lottie-player');
  if (lottiePlayer) {
    const jsonSrc = lottiePlayer.getAttribute('src');
    if (jsonSrc) {
      // Create a link to the Lottie JSON — EDS delayed.js will pick this up
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = normalizeImageUrl(jsonSrc);
      a.textContent = a.href;
      p.appendChild(a);
      rightCol.appendChild(p);
    }
  } else {
    // Fall back to img
    const img = (rightSrc || section).querySelector('img');
    if (img) {
      rightCol.appendChild(createImage(document, img.src, img.alt || ''));
    }
  }

  main.appendChild(WebImporter.DOMUtils.createTable([
    ['Columns'],
    [leftCol, rightCol],
  ], document));
  // Hero section has white/transparent background on the original site — no dark style
  main.appendChild(document.createElement('hr'));
}

function buildWhyZelisSection(document, section, main) {
  // Eyebrow + H2 + body text | Key Points list
  const container = section.querySelector('.acf-innerblocks-container') || section;
  const colGroups = container.querySelectorAll('.wp-block-columns');

  if (colGroups.length > 0) {
    colGroups.forEach((colGroup) => {
      const cols = colGroup.querySelectorAll(':scope > .wp-block-column');
      if (cols.length >= 2) {
        const leftCol = extractCleanContent(document, cols[0]);
        const rightCol = extractCleanContent(document, cols[1]);
        main.appendChild(WebImporter.DOMUtils.createTable([
          ['Columns'],
          [leftCol, rightCol],
        ], document));
      } else if (cols.length === 1) {
        const content = extractCleanContent(document, cols[0]);
        while (content.firstChild) main.appendChild(content.firstChild);
      }
    });
  } else {
    // No columns — extract all content directly
    const content = extractCleanContent(document, container);
    while (content.firstChild) main.appendChild(content.firstChild);
  }

  main.appendChild(createSectionMetadata(document, 'lavender'));
  main.appendChild(document.createElement('hr'));
}

function buildSolutionsSuiteSection(document, section, main) {
  const container = section.querySelector('.acf-innerblocks-container') || section;

  // Eyebrow
  const eyebrow = container.querySelector('.has-lead-font-size, .block--section-wrapper > p:first-child');
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

  // Accordion items — use Bootstrap .accordion-item structure
  const accordionItems = [];
  const items = section.querySelectorAll('.accordion-item');

  if (items.length > 0) {
    items.forEach((item) => {
      const header = item.querySelector('.accordion-header, h3');
      const title = header?.textContent?.trim() || '';
      const body = item.querySelector('.accordion-body');

      let bodyText = '';
      let ctaLink = null;
      if (body) {
        // Separate description paragraphs from "Explore solution" link
        body.querySelectorAll('p').forEach((p) => {
          const link = p.querySelector('a');
          if (link && /explore\s+(the\s+)?solution/i.test(link.textContent)) {
            ctaLink = { text: link.textContent.trim(), href: stripDomain(link.getAttribute('href')) };
          } else {
            const text = p.textContent.trim();
            if (text) bodyText += (bodyText ? ' ' : '') + text;
          }
        });
      }

      if (title) {
        accordionItems.push({ title, body: bodyText, ctaLink });
      }
    });
  } else {
    // Fallback: look for H3 buttons that act as accordion triggers
    const h3Buttons = section.querySelectorAll('h3 button, h3[role="button"]');
    h3Buttons.forEach((h3btn) => {
      const h3 = h3btn.closest('h3') || h3btn;
      const title = h3.textContent.trim();

      const panel = h3.closest('[class*="accordion"]')?.nextElementSibling
        || h3.parentElement?.nextElementSibling;

      let bodyText = '';
      if (panel) {
        panel.querySelectorAll('p').forEach((p) => {
          const link = p.querySelector('a');
          if (link && /explore\s+(the\s+)?solution/i.test(link.textContent)) return;
          const text = p.textContent.trim();
          if (text) bodyText += (bodyText ? ' ' : '') + text;
        });
      }

      if (title) {
        accordionItems.push({ title, body: bodyText });
      }
    });
  }

  if (accordionItems.length > 0) {
    const rows = [['Accordion']];
    accordionItems.forEach(({ title, body, ctaLink }) => {
      const titleEl = document.createElement('div');
      const h3El = document.createElement('h3');
      h3El.textContent = title;
      titleEl.appendChild(h3El);

      const bodyEl = document.createElement('div');
      if (body) {
        const p = document.createElement('p');
        p.textContent = body;
        bodyEl.appendChild(p);
      }
      if (ctaLink) {
        const ctaP = document.createElement('p');
        const a = document.createElement('a');
        a.href = ctaLink.href;
        a.textContent = ctaLink.text;
        ctaP.appendChild(a);
        bodyEl.appendChild(ctaP);
      }

      rows.push([titleEl, bodyEl]);
    });
    main.appendChild(WebImporter.DOMUtils.createTable(rows, document));
  }

  // Product screenshot image — often in a column alongside the accordion
  const sectionImg = section.querySelector('figure img, .wp-block-image img');
  if (sectionImg) {
    const imgEl = createImage(document, sectionImg.src, sectionImg.alt || '');
    main.appendChild(imgEl);
  }

  // Optional stat counter (e.g., "0 total cost savings")
  const statH3 = section.querySelector('h3[data-value], .stat h3');
  if (statH3) {
    const value = statH3.getAttribute('data-value')
      || statH3.textContent.trim();
    const prefix = statH3.getAttribute('data-prefix') || '';
    const suffix = statH3.getAttribute('data-suffix') || '';
    const statDesc = statH3.closest('.stat')?.querySelector('p')
      || statH3.parentElement?.querySelector('p');

    if (value && value !== '0') {
      const statP = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = `${prefix}${value}${suffix}`;
      statP.appendChild(strong);
      if (statDesc) {
        statP.appendChild(document.createTextNode(` ${statDesc.textContent.trim()}`));
      }
      main.appendChild(statP);
    }
  }

  main.appendChild(document.createElement('hr'));
}

function buildTestimonialsSection(document, section, main) {
  // Lottie animation background for testimonials section
  const lottiePlayer = section.querySelector('lottie-player');
  if (lottiePlayer) {
    const jsonSrc = lottiePlayer.getAttribute('src');
    if (jsonSrc) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = normalizeImageUrl(jsonSrc);
      a.textContent = a.href;
      p.appendChild(a);
      main.appendChild(p);
    }
  }

  // Blockquote carousel: extract all quotes into Quote blocks
  // Structure: figure.testimonial > blockquote (direct text) + figcaption (attribution + case study link)
  const figures = section.querySelectorAll('figure.testimonial, figure');
  const seen = new Set();

  figures.forEach((figure) => {
    const bq = figure.querySelector('blockquote');
    if (!bq) return;

    const quoteText = bq.textContent.trim();
    // Deduplicate (carousel duplicates slides for transition effects)
    if (!quoteText || seen.has(quoteText)) return;
    seen.add(quoteText);

    const quoteDiv = document.createElement('div');

    // Quote text — blockquotes may have <p> children or direct text
    const ps = bq.querySelectorAll('p');
    if (ps.length > 0) {
      ps.forEach((p) => {
        const text = p.textContent.trim();
        if (text) {
          const pEl = document.createElement('p');
          pEl.textContent = text;
          quoteDiv.appendChild(pEl);
        }
      });
    } else if (quoteText) {
      const pEl = document.createElement('p');
      pEl.textContent = quoteText;
      quoteDiv.appendChild(pEl);
    }

    // Attribution — from figcaption sibling or next element after blockquote
    const figcaption = figure.querySelector('figcaption, .blockquote-footer');
    const attrContainer = bq.nextElementSibling || figcaption;

    let attribution = '';
    let caseStudyLink = null;

    if (attrContainer) {
      const linkEl = attrContainer.querySelector('a');
      if (linkEl && /case study/i.test(linkEl.textContent)) {
        caseStudyLink = linkEl;
      }
      // Get attribution text, removing the "View case study" link text
      attribution = attrContainer.textContent.trim();
      if (caseStudyLink) {
        attribution = attribution.replace(/View case study/gi, '').trim();
      }
    }

    // Build attribution div (separate row for quote block decorator)
    const attrDiv = document.createElement('div');

    if (attribution) {
      const attrP = document.createElement('p');
      const em = document.createElement('em');
      em.textContent = attribution;
      attrP.appendChild(em);
      attrDiv.appendChild(attrP);
    }

    if (caseStudyLink) {
      const linkP = document.createElement('p');
      const a = document.createElement('a');
      a.href = stripDomain(caseStudyLink.getAttribute('href'));
      a.textContent = 'View case study';
      linkP.appendChild(a);
      attrDiv.appendChild(linkP);
    }

    if (quoteDiv.childNodes.length > 0) {
      const rows = [['Quote'], [quoteDiv]];
      if (attrDiv.childNodes.length > 0) rows.push([attrDiv]);
      main.appendChild(WebImporter.DOMUtils.createTable(rows, document));
    }
  });

  main.appendChild(createSectionMetadata(document, 'lavender'));
  main.appendChild(document.createElement('hr'));
}

function buildDeepDiveSection(document, section, main) {
  const container = section.querySelector('.acf-innerblocks-container') || section;
  const content = extractCleanContent(document, container);
  while (content.firstChild) main.appendChild(content.firstChild);

  main.appendChild(createSectionMetadata(document, 'dark'));
  main.appendChild(document.createElement('hr'));
}

function buildCtaSection(document, section, main) {
  const container = section.querySelector('.acf-innerblocks-container') || section;

  // Check for media-callout image (e.g., woman holding laptop)
  const mediaCallout = section.querySelector('[class*="media-callout"]');
  const ctaImg = mediaCallout
    ? mediaCallout.querySelector('.image-wrapper img, figure img, img')
    : section.querySelector('figure img, .image-wrapper img');

  // Build text content column
  const textCol = document.createElement('div');

  // Eyebrow
  const eyebrowEl = mediaCallout
    ? mediaCallout.querySelector('.has-lead-font-size, .leader')
    : null;
  const allPs = container.querySelectorAll('p');
  const eyebrowFromP = Array.from(allPs).find(
    (p) => p.textContent.trim() === 'Request a Meeting',
  );
  const eyebrowText = eyebrowEl?.textContent?.trim()
    || eyebrowFromP?.textContent?.trim();
  if (eyebrowText) {
    const p = document.createElement('p');
    p.textContent = eyebrowText;
    textCol.appendChild(p);
  }

  // H2
  const h2 = container.querySelector('h2');
  if (h2) {
    const heading = document.createElement('h2');
    heading.textContent = h2.textContent.trim();
    textCol.appendChild(heading);
  }

  // Body text
  allPs.forEach((p) => {
    const text = p.textContent.trim();
    if (text === 'Request a Meeting') return;
    if (p.querySelector('a.btn, .wp-block-button__link')) return;
    if (p.closest('.wp-block-buttons')) return;
    if (p.classList?.contains('has-lead-font-size')) return;
    if (text && text.length > 10) {
      const pEl = document.createElement('p');
      pEl.textContent = text;
      textCol.appendChild(pEl);
    }
  });

  // CTA button
  const btn = container.querySelector('.wp-block-button__link, .btn, a[class*="button"]');
  if (btn) {
    const ctaP = createCTA(document, btn, false);
    if (ctaP) textCol.appendChild(ctaP);
  }

  // If there's a CTA image, create a Columns block with image | text
  if (ctaImg) {
    const imgCol = document.createElement('div');
    imgCol.appendChild(createImage(document, ctaImg.src, ctaImg.alt || ''));
    main.appendChild(WebImporter.DOMUtils.createTable([
      ['Columns'],
      [imgCol, textCol],
    ], document));
  } else {
    // No image — just append text content directly
    while (textCol.firstChild) main.appendChild(textCol.firstChild);
  }

  main.appendChild(createSectionMetadata(document, 'dark'));
  main.appendChild(document.createElement('hr'));
}

function buildResourcesSection(document, section, main) {
  // H2 + "View all resources" link + resource cards
  const h2 = section.querySelector('h2');
  if (h2) {
    const heading = document.createElement('h2');
    heading.textContent = h2.textContent.trim();
    main.appendChild(heading);
  }

  // "View all resources" link
  const viewAllLink = section.querySelector('a[href*="/resources"]');
  if (viewAllLink) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = stripDomain(viewAllLink.getAttribute('href'));
    a.textContent = viewAllLink.textContent.trim();
    p.appendChild(a);
    main.appendChild(p);
  }

  // Resource cards
  const cards = section.querySelectorAll('.resource, .resource-card, article, [class*="card"]');
  const cardRows = [];

  cards.forEach((card) => {
    const img = card.querySelector('img');
    const h3 = card.querySelector('h3');
    const desc = card.querySelector('p:not(:first-child)');
    const link = card.querySelector('a[href*="/blog"], a[href*="/resources"], a:last-of-type');
    const category = card.querySelector('.leader, .category, [class*="badge"]');

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
      a.textContent = link.textContent.trim() || 'View resource';
      linkP.appendChild(a);
      contentDiv.appendChild(linkP);
    }

    if (contentDiv.childNodes.length > 0) {
      cardRows.push([imgDiv, contentDiv]);
    }
  });

  if (cardRows.length > 0) {
    main.appendChild(WebImporter.DOMUtils.createTable([
      ['Cards'],
      ...cardRows,
    ], document));
  }

  main.appendChild(document.createElement('hr'));
}

function buildContentSection(document, section, main) {
  const container = section.querySelector('.acf-innerblocks-container') || section;
  const content = extractCleanContent(document, container);
  while (content.firstChild) main.appendChild(content.firstChild);
  main.appendChild(document.createElement('hr'));
}

// ── Hub page builders ───────────────────────────────────────────────────────

function buildHubHeroSection(document, section, main) {
  // Dark hero with eyebrow + H2 + button
  // Skip the solution finder widget (interactive JS component)
  const container = section.querySelector('.default-content-wrapper')
    || section.querySelector('.acf-innerblocks-container') || section;

  // Eyebrow
  const eyebrow = container.querySelector('p:first-child');
  if (eyebrow && !eyebrow.querySelector('a')) {
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
  const btn = container.querySelector('.wp-block-button__link, .btn, a.button');
  if (btn) {
    const ctaP = createCTA(document, btn, false);
    if (ctaP) main.appendChild(ctaP);
  }

  main.appendChild(createSectionMetadata(document, 'dark'));
  main.appendChild(document.createElement('hr'));
}

function buildHubStatsSection(document, section, main) {
  const container = section.querySelector('.acf-innerblocks-container') || section;

  // Eyebrow
  const allPs = container.querySelectorAll('p');
  const eyebrow = Array.from(allPs).find(
    (p) => p.textContent.trim() === 'By the Numbers',
  );
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

  // Stats cards — use .stat class directly to avoid matching parent containers
  const stats = section.querySelectorAll('.stat');
  const cardRows = [];
  const seenStatValues = new Set();

  stats.forEach((stat) => {
    const h3 = stat.querySelector('h3');
    const desc = stat.querySelector('p');
    if (!h3) return;

    const dataValue = h3.getAttribute('data-value');
    const prefix = h3.getAttribute('data-prefix') || '';
    const suffix = h3.getAttribute('data-suffix') || '';
    const value = dataValue ? `${prefix}${dataValue}${suffix}` : h3.textContent.trim();

    if (!value || value === '0') return;
    // Deduplicate
    const key = `${value}-${desc?.textContent?.trim() || ''}`;
    if (seenStatValues.has(key)) return;
    seenStatValues.add(key);

    const cardDiv = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = value;
    cardDiv.appendChild(strong);

    if (desc) {
      const descText = desc.textContent.trim();
      if (descText) cardDiv.appendChild(document.createTextNode(` ${descText}`));
    }

    cardRows.push([cardDiv]);
  });

  if (cardRows.length > 0) {
    main.appendChild(WebImporter.DOMUtils.createTable([
      ['Cards'],
      ...cardRows,
    ], document));
  }

  main.appendChild(document.createElement('hr'));
}

function buildHubAudienceSection(document, section, main) {
  const container = section.querySelector('.acf-innerblocks-container') || section;

  // Eyebrow
  const allPs = container.querySelectorAll('p');
  const eyebrow = Array.from(allPs).find(
    (p) => p.textContent.trim() === 'A Bold Approach',
  );
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

  // Audience cards — carousel duplicates slides, so we dedup by title
  // Try precise selectors first, broaden as needed
  let cardEls = section.querySelectorAll('[role="tabpanel"]');
  if (cardEls.length === 0) {
    cardEls = section.querySelectorAll('.card');
  }
  if (cardEls.length === 0) {
    // Fallback: look for containers with h3 + p + link pattern
    cardEls = section.querySelectorAll('[class*="card"]');
  }
  const cardRows = [];
  const seenTitles = new Set();

  cardEls.forEach((card) => {
    const title = card.querySelector('h3, h4, strong');
    const desc = card.querySelector('p');
    const link = card.querySelector('a');

    if (!title) return;
    // Deduplicate carousel clones
    const titleText = title.textContent.trim();
    if (seenTitles.has(titleText)) return;
    seenTitles.add(titleText);

    const cardDiv = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.textContent = title.textContent.trim();
    cardDiv.appendChild(h3);

    if (desc) {
      const pEl = document.createElement('p');
      pEl.textContent = desc.textContent.trim();
      cardDiv.appendChild(pEl);
    }

    if (link) {
      const linkP = document.createElement('p');
      const a = document.createElement('a');
      a.href = stripDomain(link.getAttribute('href'));
      a.textContent = link.textContent.trim();
      const em = document.createElement('em');
      em.appendChild(a);
      linkP.appendChild(em);
      cardDiv.appendChild(linkP);
    }

    cardRows.push([cardDiv]);
  });

  if (cardRows.length > 0) {
    main.appendChild(WebImporter.DOMUtils.createTable([
      ['Cards'],
      ...cardRows,
    ], document));
  }

  main.appendChild(document.createElement('hr'));
}

// ── Hub page classifier ─────────────────────────────────────────────────────

function classifyHubSection(section, index) {
  const cls = section.className || '';
  const text = section.textContent || '';

  if (cls.includes('wp-block-spacer')) return 'spacer';
  if (index === 0 || cls.includes('dark') || section.querySelector('.solution-finder')) return 'dark-hero';
  if (text.includes('By the Numbers')) return 'stats';
  if (text.includes('A Bold Approach')) return 'audience';
  if (text.includes('Request a Meeting') || text.includes("Let's talk about modernizing")) return 'cta';
  return 'content';
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

  meta.template = 'solutions-page';

  main.appendChild(WebImporter.Blocks.getMetadataBlock(document, meta));
}

// ── Main export ─────────────────────────────────────────────────────────────

export default {
  transformDOM: ({ document, url }) => {
    const main = document.createElement('div');

    const hub = isHubPage(document);

    if (hub) {
      // Hub page: sections under main
      const sections = document.querySelectorAll(
        'main > .block--section-wrapper, main > section, main > .wp-block-spacer',
      );

      sections.forEach((section, index) => {
        const type = classifyHubSection(section, index);
        switch (type) {
          case 'dark-hero':
            buildHubHeroSection(document, section, main);
            break;
          case 'stats':
            buildHubStatsSection(document, section, main);
            break;
          case 'audience':
            buildHubAudienceSection(document, section, main);
            break;
          case 'cta':
            buildCtaSection(document, section, main);
            break;
          case 'spacer':
            break;
          default:
            buildContentSection(document, section, main);
            break;
        }
      });
    } else {
      // Sub-page: sections are <section> elements directly under <main>
      const sections = document.querySelectorAll(
        'main > .block--section-wrapper, main > section, main > .wp-block-spacer',
      );

      sections.forEach((section) => {
        const type = classifySection(section);
        switch (type) {
          case 'hero':
            buildHeroSection(document, section, main);
            break;
          case 'why-zelis':
            buildWhyZelisSection(document, section, main);
            break;
          case 'solutions-suite':
            buildSolutionsSuiteSection(document, section, main);
            break;
          case 'testimonials':
            buildTestimonialsSection(document, section, main);
            break;
          case 'deep-dive':
            buildDeepDiveSection(document, section, main);
            break;
          case 'cta':
            buildCtaSection(document, section, main);
            break;
          case 'resources':
            buildResourcesSection(document, section, main);
            break;
          case 'spacer':
            break; // skip
          default:
            buildContentSection(document, section, main);
            break;
        }
      });
    }

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
