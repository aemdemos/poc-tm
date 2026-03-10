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

  // tools/importer/import-case-study.js
  var import_case_study_exports = {};
  __export(import_case_study_exports, {
    default: () => import_case_study_default
  });
  function createSectionMetadata(document, style) {
    const cells = [
      ["Section Metadata"],
      ["style", style]
    ];
    return WebImporter.DOMUtils.createTable(cells, document);
  }
  function stripDomain(href) {
    if (!href) return "";
    return href.replace("https://www.zelis.com", "").replace("https://zelisstg.wpengine.com", "") || "/";
  }
  function createImage(document, src, alt) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt || "";
    return img;
  }
  function buildQuoteBlock(document, sourceBlockquote) {
    if (!sourceBlockquote) return null;
    const cells = [["Quote"]];
    const quotePs = sourceBlockquote.querySelectorAll("p");
    const quoteDiv = document.createElement("div");
    if (quotePs.length > 0) {
      const quoteP = document.createElement("p");
      const quoteText = quotePs[0].textContent.trim();
      quoteP.textContent = quoteText;
      quoteDiv.appendChild(quoteP);
    }
    cells.push([quoteDiv]);
    if (quotePs.length > 1) {
      const attrDiv = document.createElement("div");
      const attrP = document.createElement("p");
      const strong = quotePs[1].querySelector("strong");
      if (strong) {
        const em = document.createElement("em");
        const strongEl = document.createElement("strong");
        strongEl.textContent = strong.textContent.trim();
        em.appendChild(strongEl);
        const remainder = quotePs[1].textContent.replace(strong.textContent, "").trim();
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
  function buildHeroSection(document, section, main) {
    if (!section) return;
    const hero = section.querySelector(".block--hero");
    if (!hero) return;
    const h1 = hero.querySelector("h1");
    const subtitle = hero.querySelector("h1 + p") || hero.querySelector(".col-12.col-lg-6 p");
    const buttons = hero.querySelectorAll(".wp-block-buttons a, .btn");
    const leftCol = document.createElement("div");
    if (h1) {
      const heading = document.createElement("h1");
      heading.textContent = h1.textContent.trim();
      leftCol.appendChild(heading);
    }
    if (subtitle) {
      const p = document.createElement("p");
      p.textContent = subtitle.textContent.trim();
      leftCol.appendChild(p);
    }
    if (buttons.length > 0) {
      const ctaP = document.createElement("p");
      buttons.forEach((btn, i) => {
        const href = stripDomain(btn.getAttribute("href"));
        const isOutline = btn.classList.contains("btn-outline");
        if (i > 0) {
          ctaP.appendChild(document.createTextNode(" "));
        }
        const a = document.createElement("a");
        a.href = href;
        a.textContent = btn.textContent.trim();
        if (isOutline) {
          const em = document.createElement("em");
          em.appendChild(a);
          ctaP.appendChild(em);
        } else {
          const strong = document.createElement("strong");
          strong.appendChild(a);
          ctaP.appendChild(strong);
        }
      });
      leftCol.appendChild(ctaP);
    }
    const rightCol = document.createElement("div");
    const videoDiv = hero.querySelector(".video[data-src]");
    let heroImgSrc = "";
    if (videoDiv) {
      const bgStyle = videoDiv.style.backgroundImage || "";
      const match = bgStyle.match(/url\(["']?([^"')]+)["']?\)/);
      if (match) {
        heroImgSrc = match[1];
      }
    }
    if (!heroImgSrc) {
      const img = hero.querySelector(".col-12.col-lg-6:last-child img");
      if (img) heroImgSrc = img.src;
    }
    if (heroImgSrc) {
      const img = createImage(document, heroImgSrc, "");
      rightCol.appendChild(img);
    }
    const columnsTable = WebImporter.DOMUtils.createTable([
      ["Columns"],
      [leftCol, rightCol]
    ], document);
    main.appendChild(columnsTable);
    main.appendChild(document.createElement("hr"));
  }
  function buildNarrativeSection(document, section, main) {
    if (!section) return;
    const columns = section.querySelectorAll(".wp-block-column");
    if (columns.length < 2) return;
    const leftCol = document.createElement("div");
    const figure = columns[0].querySelector("figure img");
    if (figure) {
      const img = createImage(document, figure.src, figure.alt || "");
      leftCol.appendChild(img);
    }
    const rightCol = document.createElement("div");
    const h2 = columns[1].querySelector("h2");
    if (h2) {
      const heading = document.createElement("h2");
      heading.textContent = h2.textContent.trim();
      rightCol.appendChild(heading);
    }
    const paragraphs = columns[1].querySelectorAll(":scope > p");
    paragraphs.forEach((p) => {
      const pEl = document.createElement("p");
      pEl.textContent = p.textContent.trim();
      if (pEl.textContent) {
        rightCol.appendChild(pEl);
      }
    });
    const columnsTable = WebImporter.DOMUtils.createTable([
      ["Columns"],
      [leftCol, rightCol]
    ], document);
    main.appendChild(columnsTable);
    const blockquote = columns[1].querySelector("blockquote");
    if (blockquote) {
      const quoteBlock = buildQuoteBlock(document, blockquote);
      if (quoteBlock) {
        main.appendChild(quoteBlock);
      }
    }
    main.appendChild(document.createElement("hr"));
  }
  function buildPartnershipSection(document, section, main) {
    if (!section) return;
    const topColumns = section.querySelectorAll(":scope .acf-innerblocks-container > .wp-block-columns > .wp-block-column");
    if (topColumns.length < 2) return;
    const leftSource = topColumns[0];
    const rightSource = topColumns[1];
    const leftCol = document.createElement("div");
    const h2 = leftSource.querySelector("h2");
    if (h2) {
      const heading = document.createElement("h2");
      heading.textContent = h2.textContent.trim();
      leftCol.appendChild(heading);
    }
    const pEls = leftSource.querySelectorAll(":scope > p");
    pEls.forEach((p) => {
      const text = p.textContent.trim();
      if (text) {
        const pEl = document.createElement("p");
        pEl.textContent = text;
        leftCol.appendChild(pEl);
      }
    });
    const rightCol = document.createElement("div");
    const h3 = rightSource.querySelector("h3");
    if (h3) {
      const heading = document.createElement("h3");
      heading.textContent = h3.textContent.trim();
      rightCol.appendChild(heading);
    }
    const ul = rightSource.querySelector("ul");
    if (ul) {
      const newUl = document.createElement("ul");
      ul.querySelectorAll("li").forEach((li) => {
        const newLi = document.createElement("li");
        const strong = li.querySelector("strong");
        if (strong) {
          const strongEl = document.createElement("strong");
          strongEl.textContent = strong.textContent.trim();
          newLi.appendChild(strongEl);
          const remainder = li.textContent.replace(strong.textContent, "").trim();
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
    const rightImg = rightSource.querySelector("figure img");
    if (rightImg) {
      const img = createImage(document, rightImg.src, rightImg.alt || "");
      rightCol.appendChild(img);
    }
    const columnsTable = WebImporter.DOMUtils.createTable([
      ["Columns"],
      [leftCol, rightCol]
    ], document);
    main.appendChild(columnsTable);
    const blockquote = leftSource.querySelector("blockquote");
    if (blockquote) {
      const quoteBlock = buildQuoteBlock(document, blockquote);
      if (quoteBlock) {
        main.appendChild(quoteBlock);
      }
    }
    main.appendChild(createSectionMetadata(document, "lavender"));
    main.appendChild(document.createElement("hr"));
  }
  function buildPayoffSection(document, section, main) {
    if (!section) return;
    const mediaCallout = section.querySelector(".block--media-callout");
    const leftCol = document.createElement("div");
    const img = section.querySelector(".image-wrapper img, figure img");
    if (img) {
      const imgEl = createImage(document, img.src, img.alt || "");
      leftCol.appendChild(imgEl);
    }
    const rightCol = document.createElement("div");
    const wrapper = mediaCallout ? mediaCallout.querySelector(".inner-wrapper") : section;
    const h2 = wrapper == null ? void 0 : wrapper.querySelector("h2");
    if (h2) {
      const heading = document.createElement("h2");
      heading.textContent = h2.textContent.trim();
      rightCol.appendChild(heading);
    }
    const pEls = wrapper == null ? void 0 : wrapper.querySelectorAll("p");
    if (pEls) {
      pEls.forEach((p) => {
        const text = p.textContent.trim();
        if (text) {
          const pEl = document.createElement("p");
          pEl.textContent = text;
          rightCol.appendChild(pEl);
        }
      });
    }
    const ulEl = wrapper == null ? void 0 : wrapper.querySelector("ul");
    if (ulEl) {
      const newUl = document.createElement("ul");
      ulEl.querySelectorAll("li").forEach((li) => {
        const newLi = document.createElement("li");
        newLi.textContent = li.textContent.trim();
        newUl.appendChild(newLi);
      });
      rightCol.appendChild(newUl);
    }
    const columnsTable = WebImporter.DOMUtils.createTable([
      ["Columns"],
      [leftCol, rightCol]
    ], document);
    main.appendChild(columnsTable);
    main.appendChild(document.createElement("hr"));
  }
  function buildCtaSection(document, section, main) {
    if (!section) return;
    const eyebrow = section.querySelector(".has-lead-font-size");
    if (eyebrow) {
      const p = document.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      main.appendChild(p);
    }
    const h2 = section.querySelector("h2");
    if (h2) {
      const heading = document.createElement("h2");
      heading.textContent = h2.textContent.trim();
      main.appendChild(heading);
    }
    const btn = section.querySelector(".wp-block-button__link, .btn");
    if (btn) {
      const ctaP = document.createElement("p");
      const strong = document.createElement("strong");
      const a = document.createElement("a");
      const href = stripDomain(btn.getAttribute("href"));
      a.href = href || "/connect-with-zelis/";
      a.textContent = btn.textContent.trim();
      strong.appendChild(a);
      ctaP.appendChild(strong);
      main.appendChild(ctaP);
    }
    main.appendChild(createSectionMetadata(document, "highlight"));
    main.appendChild(document.createElement("hr"));
  }
  function buildRelatedResourcesSection(document, section, main) {
    if (!section) return;
    const h2 = section.querySelector("h2");
    if (h2) {
      const heading = document.createElement("h2");
      heading.textContent = h2.textContent.trim();
      main.appendChild(heading);
    }
    const resources = section.querySelectorAll(".resource");
    const cardRows = [];
    resources.forEach((resource) => {
      const img = resource.querySelector("img");
      const h3 = resource.querySelector("h3");
      const desc = resource.querySelector(".content-group p");
      const link = resource.querySelector(".content-group a");
      const category = resource.querySelector(".leader");
      const imgDiv = document.createElement("div");
      if (img) {
        const imgEl = createImage(document, img.src, img.alt || "");
        imgDiv.appendChild(imgEl);
      }
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
        a.textContent = link.textContent.trim();
        linkP.appendChild(a);
        contentDiv.appendChild(linkP);
      }
      cardRows.push([imgDiv, contentDiv]);
    });
    if (cardRows.length > 0) {
      const cardsTable = WebImporter.DOMUtils.createTable([
        ["Cards"],
        ...cardRows
      ], document);
      main.appendChild(cardsTable);
    }
    main.appendChild(document.createElement("hr"));
  }
  function buildMetadataBlock(document, main) {
    const meta = {};
    const getMeta = (name) => {
      var _a;
      return ((_a = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)) == null ? void 0 : _a.getAttribute("content")) || "";
    };
    meta.title = getMeta("og:title") || document.title || "";
    meta.description = getMeta("description") || getMeta("og:description") || "";
    const ogImage = getMeta("og:image");
    if (ogImage) {
      meta.image = ogImage;
    }
    meta.template = "case-study";
    const block = WebImporter.Blocks.getMetadataBlock(document, meta);
    main.appendChild(block);
  }
  var import_case_study_default = {
    transformDOM: ({ document }) => {
      const main = document.createElement("div");
      const sections = document.querySelectorAll(".post-content > .block--section-wrapper");
      buildHeroSection(document, sections[0], main);
      buildNarrativeSection(document, sections[1], main);
      buildPartnershipSection(document, sections[2], main);
      buildPayoffSection(document, sections[3], main);
      buildCtaSection(document, sections[4], main);
      buildRelatedResourcesSection(document, sections[5], main);
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
  return __toCommonJS(import_case_study_exports);
})();
