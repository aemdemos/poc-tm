var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // import-solutions-page.js
  var import_solutions_page_exports = {};
  __export(import_solutions_page_exports, {
    default: () => import_solutions_page_default
  });
  function createSectionMetadata(document, style) {
    return WebImporter.DOMUtils.createTable([
      ["Section Metadata"],
      ["style", style]
    ], document);
  }
  function stripDomain(href) {
    if (!href) return "";
    return href.replace("https://www.zelis.com", "").replace("https://zelisstg.wpengine.com", "") || "/";
  }
  function normalizeImageUrl(src) {
    if (!src) return src;
    return src.replace("https://zelisstg.wpengine.com", "https://www.zelis.com");
  }
  function createImage(document, src, alt) {
    const img = document.createElement("img");
    img.src = normalizeImageUrl(src);
    img.alt = alt || "";
    return img;
  }
  function createCTA(document, btn, isSecondary) {
    if (!btn) return null;
    const ctaP = document.createElement("p");
    const a = document.createElement("a");
    a.href = stripDomain(btn.getAttribute("href"));
    a.textContent = btn.textContent.trim();
    const wrap = document.createElement(isSecondary ? "em" : "strong");
    wrap.appendChild(a);
    ctaP.appendChild(wrap);
    return ctaP;
  }
  function isHubPage(document) {
    const pathname = document.location?.pathname || "";
    return /^\/solutions\/?$/.test(pathname);
  }
  function classifySection(section) {
    const cls = section.className || "";
    const text = section.textContent || "";
    if (cls.includes("wp-block-spacer")) return "spacer";
    if (cls.includes("has-ink-blue-50-background-color") || cls.includes("has-ink-blue-100-background-color")) return "deep-dive";
    if (section.querySelector("blockquote")) return "testimonials";
    const accordionEl = section.querySelector(
      '.wp-block-yoast-faq-block, .accordion, [data-block-name="accordion"]'
    );
    if (accordionEl) return "solutions-suite";
    const h3s = section.querySelectorAll("h3");
    const hasButtons = section.querySelector("button");
    if (h3s.length >= 2 && hasButtons) return "solutions-suite";
    if (text.includes("Request a Meeting") || text.includes("Let's talk about modernizing")) return "cta";
    if (text.includes("Top Resources") || section.querySelector(".resource-card")) return "resources";
    if (cls.includes("has-ink-blue-5-background-color") && (text.includes("Why Zelis") || text.includes("Key Points"))) return "why-zelis";
    if (section.querySelector("h1")) return "hero";
    if (cls.includes("has-ink-blue-5-background-color")) return "why-zelis";
    return "content";
  }
  function extractCleanContent(document, container) {
    const div = document.createElement("div");
    if (!container) return div;
    Array.from(container.children).forEach((child) => {
      if (child.classList?.contains("wp-block-spacer")) return;
      if (/^H[1-6]$/i.test(child.tagName)) {
        const h = document.createElement(child.tagName.toLowerCase());
        h.textContent = child.textContent.trim();
        if (h.textContent) div.appendChild(h);
        return;
      }
      if (child.tagName === "FIGURE" || child.classList?.contains("wp-block-image")) {
        const img = child.querySelector("img");
        if (img) div.appendChild(createImage(document, img.src, img.alt || ""));
        return;
      }
      if (child.tagName === "UL" || child.tagName === "OL") {
        const list = document.createElement(child.tagName.toLowerCase());
        child.querySelectorAll("li").forEach((li) => {
          const newLi = document.createElement("li");
          newLi.textContent = li.textContent.trim();
          list.appendChild(newLi);
        });
        div.appendChild(list);
        return;
      }
      if (child.classList?.contains("wp-block-buttons")) {
        child.querySelectorAll("a").forEach((btn) => {
          const ctaP = createCTA(document, btn, btn.classList.contains("is-style-outline"));
          if (ctaP) div.appendChild(ctaP);
        });
        return;
      }
      if (child.classList?.contains("wp-block-columns")) {
        Array.from(child.querySelectorAll(":scope > .wp-block-column")).forEach((col) => {
          const colContent = extractCleanContent(document, col);
          while (colContent.firstChild) div.appendChild(colContent.firstChild);
        });
        return;
      }
      if (child.classList?.contains("wp-block-group")) {
        const groupContent = extractCleanContent(document, child);
        while (groupContent.firstChild) div.appendChild(groupContent.firstChild);
        return;
      }
      if (child.tagName === "SECTION" || child.tagName === "DIV") {
        const inner = child.querySelector(".acf-innerblocks-container") || child.querySelector(".wrapper") || child.querySelector(".col-12") || child;
        const nestedContent = extractCleanContent(document, inner);
        if (nestedContent.childNodes.length > 0) {
          while (nestedContent.firstChild) div.appendChild(nestedContent.firstChild);
          return;
        }
      }
      if (child.tagName === "P" || child.classList?.contains("wp-block-paragraph") || child.classList?.contains("has-lead-font-size")) {
        const text2 = child.textContent.trim();
        if (text2) {
          const p = document.createElement("p");
          const links = child.querySelectorAll("a");
          if (links.length > 0) {
            p.innerHTML = child.innerHTML;
            p.querySelectorAll("a").forEach((a) => {
              a.href = stripDomain(a.getAttribute("href"));
            });
          } else {
            p.textContent = text2;
          }
          div.appendChild(p);
        }
        return;
      }
      if (child.tagName === "BLOCKQUOTE") {
        const bq = document.createElement("blockquote");
        child.querySelectorAll("p").forEach((p) => {
          const text2 = p.textContent.trim();
          if (text2) {
            const pEl = document.createElement("p");
            pEl.textContent = text2;
            bq.appendChild(pEl);
          }
        });
        if (bq.childNodes.length) div.appendChild(bq);
        return;
      }
      const text = child.textContent.trim();
      if (text && text.length > 3) {
        const p = document.createElement("p");
        p.textContent = text;
        div.appendChild(p);
      }
    });
    return div;
  }
  function buildHeroSection(document, section, main) {
    const h1 = section.querySelector("h1");
    const ctaBtn = section.querySelector('.wp-block-button__link, .btn, a[class*="button"]');
    const leftSrc = section.querySelector(".col-lg-6:first-of-type") || section.querySelector(".wp-block-column:first-child");
    const leftCol = document.createElement("div");
    if (h1) {
      const heading = document.createElement("h1");
      heading.textContent = h1.textContent.trim();
      leftCol.appendChild(heading);
    }
    const pSource = leftSrc || section;
    pSource.querySelectorAll("p").forEach((p) => {
      if (p.querySelector("a.btn, .wp-block-button__link")) return;
      if (p.closest(".wp-block-buttons")) return;
      const text = p.textContent.trim();
      if (text && text !== h1?.textContent.trim() && text.length > 1) {
        const pEl = document.createElement("p");
        pEl.textContent = text;
        leftCol.appendChild(pEl);
      }
    });
    if (ctaBtn) {
      const ctaP = createCTA(document, ctaBtn, false);
      if (ctaP) leftCol.appendChild(ctaP);
    }
    const rightCol = document.createElement("div");
    const rightSrc = section.querySelector(".col-lg-6:last-of-type") || section.querySelector(".wp-block-column:last-child");
    const lottiePlayer = (rightSrc || section).querySelector("lottie-player");
    if (lottiePlayer) {
      const jsonSrc = lottiePlayer.getAttribute("src");
      if (jsonSrc) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = normalizeImageUrl(jsonSrc);
        a.textContent = a.href;
        p.appendChild(a);
        rightCol.appendChild(p);
      }
    } else {
      const img = (rightSrc || section).querySelector("img");
      if (img) {
        rightCol.appendChild(createImage(document, img.src, img.alt || ""));
      }
    }
    main.appendChild(WebImporter.DOMUtils.createTable([
      ["Columns"],
      [leftCol, rightCol]
    ], document));
    main.appendChild(createSectionMetadata(document, "dark"));
    main.appendChild(document.createElement("hr"));
  }
  function buildWhyZelisSection(document, section, main) {
    const container = section.querySelector(".acf-innerblocks-container") || section;
    const colGroups = container.querySelectorAll(".wp-block-columns");
    if (colGroups.length > 0) {
      colGroups.forEach((colGroup) => {
        const cols = colGroup.querySelectorAll(":scope > .wp-block-column");
        if (cols.length >= 2) {
          const leftCol = extractCleanContent(document, cols[0]);
          const rightCol = extractCleanContent(document, cols[1]);
          main.appendChild(WebImporter.DOMUtils.createTable([
            ["Columns"],
            [leftCol, rightCol]
          ], document));
        } else if (cols.length === 1) {
          const content = extractCleanContent(document, cols[0]);
          while (content.firstChild) main.appendChild(content.firstChild);
        }
      });
    } else {
      const content = extractCleanContent(document, container);
      while (content.firstChild) main.appendChild(content.firstChild);
    }
    main.appendChild(createSectionMetadata(document, "lavender"));
    main.appendChild(document.createElement("hr"));
  }
  function buildSolutionsSuiteSection(document, section, main) {
    const container = section.querySelector(".acf-innerblocks-container") || section;
    const eyebrow = container.querySelector(".has-lead-font-size, .block--section-wrapper > p:first-child");
    if (eyebrow) {
      const p = document.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      main.appendChild(p);
    }
    const h2 = container.querySelector("h2");
    if (h2) {
      const heading = document.createElement("h2");
      heading.textContent = h2.textContent.trim();
      main.appendChild(heading);
    }
    const accordionItems = [];
    const items = section.querySelectorAll(".accordion-item");
    if (items.length > 0) {
      items.forEach((item) => {
        const header = item.querySelector(".accordion-header, h3");
        const title = header?.textContent?.trim() || "";
        const body = item.querySelector(".accordion-body");
        let bodyText = "";
        let ctaLink = null;
        if (body) {
          body.querySelectorAll("p").forEach((p) => {
            const link = p.querySelector("a");
            if (link && /explore\s+(the\s+)?solution/i.test(link.textContent)) {
              ctaLink = { text: link.textContent.trim(), href: stripDomain(link.getAttribute("href")) };
            } else {
              const text = p.textContent.trim();
              if (text) bodyText += (bodyText ? " " : "") + text;
            }
          });
        }
        if (title) {
          accordionItems.push({ title, body: bodyText, ctaLink });
        }
      });
    } else {
      const h3Buttons = section.querySelectorAll('h3 button, h3[role="button"]');
      h3Buttons.forEach((h3btn) => {
        const h3 = h3btn.closest("h3") || h3btn;
        const title = h3.textContent.trim();
        const panel = h3.closest('[class*="accordion"]')?.nextElementSibling || h3.parentElement?.nextElementSibling;
        let bodyText = "";
        if (panel) {
          panel.querySelectorAll("p").forEach((p) => {
            const link = p.querySelector("a");
            if (link && /explore\s+(the\s+)?solution/i.test(link.textContent)) return;
            const text = p.textContent.trim();
            if (text) bodyText += (bodyText ? " " : "") + text;
          });
        }
        if (title) {
          accordionItems.push({ title, body: bodyText });
        }
      });
    }
    if (accordionItems.length > 0) {
      const rows = [["Accordion"]];
      accordionItems.forEach(({ title, body, ctaLink }) => {
        const titleEl = document.createElement("div");
        const h3El = document.createElement("h3");
        h3El.textContent = title;
        titleEl.appendChild(h3El);
        const bodyEl = document.createElement("div");
        if (body) {
          const p = document.createElement("p");
          p.textContent = body;
          bodyEl.appendChild(p);
        }
        if (ctaLink) {
          const ctaP = document.createElement("p");
          const a = document.createElement("a");
          a.href = ctaLink.href;
          a.textContent = ctaLink.text;
          ctaP.appendChild(a);
          bodyEl.appendChild(ctaP);
        }
        rows.push([titleEl, bodyEl]);
      });
      main.appendChild(WebImporter.DOMUtils.createTable(rows, document));
    }
    const statH3 = section.querySelector("h3[data-value], .stat h3");
    if (statH3) {
      const value = statH3.getAttribute("data-value") || statH3.textContent.trim();
      const prefix = statH3.getAttribute("data-prefix") || "";
      const suffix = statH3.getAttribute("data-suffix") || "";
      const statDesc = statH3.closest(".stat")?.querySelector("p") || statH3.parentElement?.querySelector("p");
      if (value && value !== "0") {
        const statP = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = `${prefix}${value}${suffix}`;
        statP.appendChild(strong);
        if (statDesc) {
          statP.appendChild(document.createTextNode(` ${statDesc.textContent.trim()}`));
        }
        main.appendChild(statP);
      }
    }
    main.appendChild(document.createElement("hr"));
  }
  function buildTestimonialsSection(document, section, main) {
    const figures = section.querySelectorAll("figure.testimonial, figure");
    const seen = /* @__PURE__ */ new Set();
    figures.forEach((figure) => {
      const bq = figure.querySelector("blockquote");
      if (!bq) return;
      const quoteText = bq.textContent.trim();
      if (!quoteText || seen.has(quoteText)) return;
      seen.add(quoteText);
      const quoteDiv = document.createElement("div");
      const ps = bq.querySelectorAll("p");
      if (ps.length > 0) {
        ps.forEach((p) => {
          const text = p.textContent.trim();
          if (text) {
            const pEl = document.createElement("p");
            pEl.textContent = text;
            quoteDiv.appendChild(pEl);
          }
        });
      } else if (quoteText) {
        const pEl = document.createElement("p");
        pEl.textContent = quoteText;
        quoteDiv.appendChild(pEl);
      }
      const figcaption = figure.querySelector("figcaption, .blockquote-footer");
      const attrContainer = bq.nextElementSibling || figcaption;
      let attribution = "";
      let caseStudyLink = null;
      if (attrContainer) {
        const linkEl = attrContainer.querySelector("a");
        if (linkEl && /case study/i.test(linkEl.textContent)) {
          caseStudyLink = linkEl;
        }
        attribution = attrContainer.textContent.trim();
        if (caseStudyLink) {
          attribution = attribution.replace(/View case study/gi, "").trim();
        }
      }
      if (attribution) {
        const attrP = document.createElement("p");
        const em = document.createElement("em");
        em.textContent = attribution;
        attrP.appendChild(em);
        quoteDiv.appendChild(attrP);
      }
      if (caseStudyLink) {
        const linkP = document.createElement("p");
        const a = document.createElement("a");
        a.href = stripDomain(caseStudyLink.getAttribute("href"));
        a.textContent = "View case study";
        linkP.appendChild(a);
        quoteDiv.appendChild(linkP);
      }
      if (quoteDiv.childNodes.length > 0) {
        main.appendChild(WebImporter.DOMUtils.createTable([
          ["Quote"],
          [quoteDiv]
        ], document));
      }
    });
    main.appendChild(createSectionMetadata(document, "lavender"));
    main.appendChild(document.createElement("hr"));
  }
  function buildDeepDiveSection(document, section, main) {
    const container = section.querySelector(".acf-innerblocks-container") || section;
    const content = extractCleanContent(document, container);
    while (content.firstChild) main.appendChild(content.firstChild);
    main.appendChild(createSectionMetadata(document, "dark"));
    main.appendChild(document.createElement("hr"));
  }
  function buildCtaSection(document, section, main) {
    const container = section.querySelector(".acf-innerblocks-container") || section;
    const allPs = container.querySelectorAll("p");
    const eyebrow = Array.from(allPs).find(
      (p) => p.textContent.trim() === "Request a Meeting"
    );
    if (eyebrow) {
      const p = document.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      main.appendChild(p);
    }
    const h2 = container.querySelector("h2");
    if (h2) {
      const heading = document.createElement("h2");
      heading.textContent = h2.textContent.trim();
      main.appendChild(heading);
    }
    allPs.forEach((p) => {
      const text = p.textContent.trim();
      if (text === "Request a Meeting") return;
      if (p.querySelector("a.btn, .wp-block-button__link")) return;
      if (p.closest(".wp-block-buttons")) return;
      if (text && text.length > 10) {
        const pEl = document.createElement("p");
        pEl.textContent = text;
        main.appendChild(pEl);
      }
    });
    const btn = container.querySelector('.wp-block-button__link, .btn, a[class*="button"]');
    if (btn) {
      const ctaP = createCTA(document, btn, false);
      if (ctaP) main.appendChild(ctaP);
    }
    main.appendChild(document.createElement("hr"));
  }
  function buildResourcesSection(document, section, main) {
    const h2 = section.querySelector("h2");
    if (h2) {
      const heading = document.createElement("h2");
      heading.textContent = h2.textContent.trim();
      main.appendChild(heading);
    }
    const viewAllLink = section.querySelector('a[href*="/resources"]');
    if (viewAllLink) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = stripDomain(viewAllLink.getAttribute("href"));
      a.textContent = viewAllLink.textContent.trim();
      p.appendChild(a);
      main.appendChild(p);
    }
    const cards = section.querySelectorAll('.resource, .resource-card, article, [class*="card"]');
    const cardRows = [];
    cards.forEach((card) => {
      const img = card.querySelector("img");
      const h3 = card.querySelector("h3");
      const desc = card.querySelector("p:not(:first-child)");
      const link = card.querySelector('a[href*="/blog"], a[href*="/resources"], a:last-of-type');
      const category = card.querySelector('.leader, .category, [class*="badge"]');
      const imgDiv = document.createElement("div");
      if (img) imgDiv.appendChild(createImage(document, img.src, img.alt || ""));
      const contentDiv = document.createElement("div");
      if (category) {
        const catP = document.createElement("p");
        const em = document.createElement("em");
        em.textContent = category.textContent.trim().split("\n")[0].trim();
        catP.appendChild(em);
        contentDiv.appendChild(catP);
      }
      if (h3) {
        const h3El = document.createElement("h3");
        h3El.textContent = h3.textContent.trim();
        contentDiv.appendChild(h3El);
      }
      if (desc) {
        const pEl = document.createElement("p");
        pEl.textContent = desc.textContent.trim();
        contentDiv.appendChild(pEl);
      }
      if (link) {
        const linkP = document.createElement("p");
        const a = document.createElement("a");
        a.href = stripDomain(link.getAttribute("href"));
        a.textContent = link.textContent.trim() || "View resource";
        linkP.appendChild(a);
        contentDiv.appendChild(linkP);
      }
      if (contentDiv.childNodes.length > 0) {
        cardRows.push([imgDiv, contentDiv]);
      }
    });
    if (cardRows.length > 0) {
      main.appendChild(WebImporter.DOMUtils.createTable([
        ["Cards"],
        ...cardRows
      ], document));
    }
    main.appendChild(document.createElement("hr"));
  }
  function buildContentSection(document, section, main) {
    const container = section.querySelector(".acf-innerblocks-container") || section;
    const content = extractCleanContent(document, container);
    while (content.firstChild) main.appendChild(content.firstChild);
    main.appendChild(document.createElement("hr"));
  }
  function buildHubHeroSection(document, section, main) {
    const container = section.querySelector(".default-content-wrapper") || section.querySelector(".acf-innerblocks-container") || section;
    const eyebrow = container.querySelector("p:first-child");
    if (eyebrow && !eyebrow.querySelector("a")) {
      const p = document.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      main.appendChild(p);
    }
    const h2 = container.querySelector("h2");
    if (h2) {
      const heading = document.createElement("h2");
      heading.textContent = h2.textContent.trim();
      main.appendChild(heading);
    }
    const btn = container.querySelector(".wp-block-button__link, .btn, a.button");
    if (btn) {
      const ctaP = createCTA(document, btn, false);
      if (ctaP) main.appendChild(ctaP);
    }
    main.appendChild(createSectionMetadata(document, "dark"));
    main.appendChild(document.createElement("hr"));
  }
  function buildHubStatsSection(document, section, main) {
    const container = section.querySelector(".acf-innerblocks-container") || section;
    const allPs = container.querySelectorAll("p");
    const eyebrow = Array.from(allPs).find(
      (p) => p.textContent.trim() === "By the Numbers"
    );
    if (eyebrow) {
      const p = document.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      main.appendChild(p);
    }
    const h2 = container.querySelector("h2");
    if (h2) {
      const heading = document.createElement("h2");
      heading.textContent = h2.textContent.trim();
      main.appendChild(heading);
    }
    const stats = section.querySelectorAll(".stat");
    const cardRows = [];
    const seenStatValues = /* @__PURE__ */ new Set();
    stats.forEach((stat) => {
      const h3 = stat.querySelector("h3");
      const desc = stat.querySelector("p");
      if (!h3) return;
      const dataValue = h3.getAttribute("data-value");
      const prefix = h3.getAttribute("data-prefix") || "";
      const suffix = h3.getAttribute("data-suffix") || "";
      const value = dataValue ? `${prefix}${dataValue}${suffix}` : h3.textContent.trim();
      if (!value || value === "0") return;
      const key = `${value}-${desc?.textContent?.trim() || ""}`;
      if (seenStatValues.has(key)) return;
      seenStatValues.add(key);
      const cardDiv = document.createElement("div");
      const strong = document.createElement("strong");
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
        ["Cards"],
        ...cardRows
      ], document));
    }
    main.appendChild(document.createElement("hr"));
  }
  function buildHubAudienceSection(document, section, main) {
    const container = section.querySelector(".acf-innerblocks-container") || section;
    const allPs = container.querySelectorAll("p");
    const eyebrow = Array.from(allPs).find(
      (p) => p.textContent.trim() === "A Bold Approach"
    );
    if (eyebrow) {
      const p = document.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      main.appendChild(p);
    }
    const h2 = container.querySelector("h2");
    if (h2) {
      const heading = document.createElement("h2");
      heading.textContent = h2.textContent.trim();
      main.appendChild(heading);
    }
    let cardEls = section.querySelectorAll('[role="tabpanel"]');
    if (cardEls.length === 0) {
      cardEls = section.querySelectorAll(".card");
    }
    if (cardEls.length === 0) {
      cardEls = section.querySelectorAll('[class*="card"]');
    }
    const cardRows = [];
    const seenTitles = /* @__PURE__ */ new Set();
    cardEls.forEach((card) => {
      const title = card.querySelector("h3, h4, strong");
      const desc = card.querySelector("p");
      const link = card.querySelector("a");
      if (!title) return;
      const titleText = title.textContent.trim();
      if (seenTitles.has(titleText)) return;
      seenTitles.add(titleText);
      const cardDiv = document.createElement("div");
      const h3 = document.createElement("h3");
      h3.textContent = title.textContent.trim();
      cardDiv.appendChild(h3);
      if (desc) {
        const pEl = document.createElement("p");
        pEl.textContent = desc.textContent.trim();
        cardDiv.appendChild(pEl);
      }
      if (link) {
        const linkP = document.createElement("p");
        const a = document.createElement("a");
        a.href = stripDomain(link.getAttribute("href"));
        a.textContent = link.textContent.trim();
        const em = document.createElement("em");
        em.appendChild(a);
        linkP.appendChild(em);
        cardDiv.appendChild(linkP);
      }
      cardRows.push([cardDiv]);
    });
    if (cardRows.length > 0) {
      main.appendChild(WebImporter.DOMUtils.createTable([
        ["Cards"],
        ...cardRows
      ], document));
    }
    main.appendChild(document.createElement("hr"));
  }
  function classifyHubSection(section, index) {
    const cls = section.className || "";
    const text = section.textContent || "";
    if (cls.includes("wp-block-spacer")) return "spacer";
    if (index === 0 || cls.includes("dark") || section.querySelector(".solution-finder")) return "dark-hero";
    if (text.includes("By the Numbers")) return "stats";
    if (text.includes("A Bold Approach")) return "audience";
    if (text.includes("Request a Meeting") || text.includes("Let's talk about modernizing")) return "cta";
    return "content";
  }
  function buildMetadataBlock(document, main) {
    const getMeta = (name) => document.querySelector(
      `meta[property="${name}"], meta[name="${name}"]`
    )?.getAttribute("content") || "";
    const meta = {};
    meta.title = getMeta("og:title") || document.title || "";
    meta.description = getMeta("description") || getMeta("og:description") || "";
    const ogImage = getMeta("og:image");
    if (ogImage) meta.image = ogImage;
    meta.template = "solutions-page";
    main.appendChild(WebImporter.Blocks.getMetadataBlock(document, meta));
  }
  var import_solutions_page_default = {
    transformDOM: ({ document, url }) => {
      const main = document.createElement("div");
      const hub = isHubPage(document);
      if (hub) {
        const sections = document.querySelectorAll(
          "main > .block--section-wrapper, main > section, main > .wp-block-spacer"
        );
        sections.forEach((section, index) => {
          const type = classifyHubSection(section, index);
          switch (type) {
            case "dark-hero":
              buildHubHeroSection(document, section, main);
              break;
            case "stats":
              buildHubStatsSection(document, section, main);
              break;
            case "audience":
              buildHubAudienceSection(document, section, main);
              break;
            case "cta":
              buildCtaSection(document, section, main);
              break;
            case "spacer":
              break;
            default:
              buildContentSection(document, section, main);
              break;
          }
        });
      } else {
        const sections = document.querySelectorAll(
          "main > .block--section-wrapper, main > section, main > .wp-block-spacer"
        );
        sections.forEach((section) => {
          const type = classifySection(section);
          switch (type) {
            case "hero":
              buildHeroSection(document, section, main);
              break;
            case "why-zelis":
              buildWhyZelisSection(document, section, main);
              break;
            case "solutions-suite":
              buildSolutionsSuiteSection(document, section, main);
              break;
            case "testimonials":
              buildTestimonialsSection(document, section, main);
              break;
            case "deep-dive":
              buildDeepDiveSection(document, section, main);
              break;
            case "cta":
              buildCtaSection(document, section, main);
              break;
            case "resources":
              buildResourcesSection(document, section, main);
              break;
            case "spacer":
              break;
            // skip
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
      path = path.replace(/\/$/, "");
      if (!path) path = "/index";
      return WebImporter.FileUtils.sanitizePath(path);
    }
  };
  return __toCommonJS(import_solutions_page_exports);
})();
