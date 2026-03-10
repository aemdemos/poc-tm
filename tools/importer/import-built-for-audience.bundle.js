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

  // tools/importer/import-built-for-audience.js
  var import_built_for_audience_exports = {};
  __export(import_built_for_audience_exports, {
    default: () => import_built_for_audience_default
  });
  function createColumnsBlock(document, cells) {
    return WebImporter.DOMUtils.createTable(cells, document);
  }
  function createCardsBlock(document, cells) {
    return WebImporter.DOMUtils.createTable(cells, document);
  }
  function createSectionMetadata(document, style) {
    const cells = [
      ["Section Metadata"],
      ["style", style]
    ];
    return WebImporter.DOMUtils.createTable(cells, document);
  }
  function buildHeroSection(document, main) {
    var _a, _b;
    const heroSection = document.querySelector(".block--hero");
    if (!heroSection) return;
    const h1 = heroSection.querySelector("h1");
    const desc = h1 == null ? void 0 : h1.nextElementSibling;
    const ctaLink = heroSection.querySelector(".btn, .wp-block-button__link");
    const lottiePlayer = (_a = heroSection.closest("section")) == null ? void 0 : _a.querySelector("lottie-player");
    const leftCol = document.createElement("div");
    if (h1) {
      const heading = document.createElement("h1");
      heading.textContent = h1.textContent.trim();
      leftCol.appendChild(heading);
    }
    if (desc) {
      const p = document.createElement("p");
      p.textContent = desc.textContent.trim();
      leftCol.appendChild(p);
    }
    if (ctaLink) {
      const ctaP = document.createElement("p");
      const strong = document.createElement("strong");
      const a = document.createElement("a");
      a.href = ((_b = ctaLink.getAttribute("href")) == null ? void 0 : _b.replace("https://www.zelis.com", "")) || "/connect-with-zelis/";
      a.textContent = ctaLink.textContent.trim();
      strong.appendChild(a);
      ctaP.appendChild(strong);
      leftCol.appendChild(ctaP);
    }
    const rightCol = document.createElement("div");
    if (lottiePlayer) {
      const lottieP = document.createElement("p");
      const lottieA = document.createElement("a");
      const localLottiePath = "/animations/built-for-hero.json";
      lottieA.href = localLottiePath;
      lottieA.textContent = localLottiePath;
      lottieP.appendChild(lottieA);
      rightCol.appendChild(lottieP);
    }
    const columnsTable = createColumnsBlock(document, [
      ["Columns"],
      [leftCol, rightCol]
    ]);
    main.appendChild(columnsTable);
    main.appendChild(document.createElement("hr"));
  }
  function buildUseCasesSection(document, main) {
    const sections = document.querySelectorAll("main > section.block--section-wrapper");
    const useCasesSection = sections[1];
    if (!useCasesSection) return;
    const eyebrowEl = useCasesSection.querySelector(".has-lead-font-size");
    if (eyebrowEl) {
      const eyebrowP = document.createElement("p");
      eyebrowP.textContent = eyebrowEl.textContent.trim();
      main.appendChild(eyebrowP);
    }
    const leftCol = document.createElement("div");
    const h2 = useCasesSection.querySelector("h2");
    if (h2) {
      const heading = document.createElement("h2");
      const h2Clone = h2.cloneNode(true);
      h2Clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      heading.textContent = h2Clone.textContent.trim().replace(/\s+/g, " ");
      leftCol.appendChild(heading);
    }
    const allPs = useCasesSection.querySelectorAll("p");
    for (const p of allPs) {
      const text = p.textContent.trim();
      if (text.startsWith("We partner with")) {
        const descP = document.createElement("p");
        descP.textContent = text;
        leftCol.appendChild(descP);
        break;
      }
    }
    const rightCol = document.createElement("div");
    const keyPointsBlock = useCasesSection.querySelector(".block--key-points");
    const keyH3 = (keyPointsBlock == null ? void 0 : keyPointsBlock.querySelector("h3")) || useCasesSection.querySelector("h3");
    if (keyH3) {
      const h3El = document.createElement("h3");
      h3El.textContent = keyH3.textContent.trim();
      rightCol.appendChild(h3El);
    }
    const keyPointItems = keyPointsBlock ? keyPointsBlock.querySelectorAll(".item") : useCasesSection.querySelectorAll("ul li");
    if (keyPointItems.length > 0) {
      const ul = document.createElement("ul");
      keyPointItems.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item.textContent.trim();
        ul.appendChild(li);
      });
      rightCol.appendChild(ul);
    }
    const columnsTable = createColumnsBlock(document, [
      ["Columns"],
      [leftCol, rightCol]
    ]);
    main.appendChild(columnsTable);
    main.appendChild(document.createElement("hr"));
  }
  function buildAudienceCardsSection(document, main) {
    const sections = document.querySelectorAll("main > section.block--section-wrapper");
    const cardsSection = sections[2];
    if (!cardsSection) return;
    const wrappers = cardsSection.querySelectorAll(".wrapper");
    const cardRows = [];
    const seenTitles = /* @__PURE__ */ new Set();
    wrappers.forEach((wrapper) => {
      var _a;
      const h3 = wrapper.querySelector("h3");
      const title = (_a = h3 == null ? void 0 : h3.textContent) == null ? void 0 : _a.trim();
      if (!title || seenTitles.has(title)) return;
      seenTitles.add(title);
      const desc = wrapper.querySelector(".content p");
      const link = wrapper.querySelector("a");
      const emptyDiv = document.createElement("div");
      const contentDiv = document.createElement("div");
      const h3El = document.createElement("h3");
      h3El.textContent = title;
      contentDiv.appendChild(h3El);
      if (desc) {
        const pEl = document.createElement("p");
        pEl.textContent = desc.textContent.trim();
        contentDiv.appendChild(pEl);
      }
      if (link) {
        const linkP = document.createElement("p");
        const a = document.createElement("a");
        let href = link.getAttribute("href") || "";
        href = href.replace("https://www.zelis.com", "");
        if (href.includes("page_id=4847")) {
          href = "/built-for/payers/";
        }
        a.href = href;
        a.textContent = link.textContent.trim();
        linkP.appendChild(a);
        contentDiv.appendChild(linkP);
      }
      cardRows.push([emptyDiv, contentDiv]);
    });
    if (cardRows.length > 0) {
      const cardsTable = createCardsBlock(document, [
        ["Cards"],
        ...cardRows
      ]);
      main.appendChild(cardsTable);
    }
    main.appendChild(createSectionMetadata(document, "light"));
    main.appendChild(document.createElement("hr"));
  }
  function buildStatsSection(document, main) {
    const sections = document.querySelectorAll("main > section.block--section-wrapper");
    const statsSection = sections[3];
    if (!statsSection) return;
    const eyebrowEl = statsSection.querySelector(".has-lead-font-size");
    if (eyebrowEl) {
      const eyebrowP = document.createElement("p");
      eyebrowP.textContent = eyebrowEl.textContent.trim();
      main.appendChild(eyebrowP);
    }
    const h2 = statsSection.querySelector("h2");
    if (h2) {
      const heading = document.createElement("h2");
      heading.textContent = h2.textContent.trim();
      main.appendChild(heading);
    }
    const counters = statsSection.querySelectorAll("[data-value]");
    const cardRows = [];
    counters.forEach((counter) => {
      var _a, _b, _c, _d, _e;
      const value = counter.dataset.value || "0";
      const prefix = counter.dataset.prefix || "";
      const suffix = counter.dataset.suffix || "";
      const label = ((_b = (_a = counter.nextElementSibling) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || ((_e = (_d = (_c = counter.closest("div")) == null ? void 0 : _c.querySelector("p")) == null ? void 0 : _d.textContent) == null ? void 0 : _e.trim()) || "";
      const displayValue = `${prefix}${value}${suffix}+`;
      const emptyDiv = document.createElement("div");
      const contentDiv = document.createElement("div");
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = displayValue;
      p.appendChild(strong);
      p.appendChild(document.createTextNode(` ${label}`));
      contentDiv.appendChild(p);
      cardRows.push([emptyDiv, contentDiv]);
    });
    if (cardRows.length > 0) {
      const cardsTable = createCardsBlock(document, [
        ["Cards"],
        ...cardRows
      ]);
      main.appendChild(cardsTable);
    }
    main.appendChild(createSectionMetadata(document, "center"));
    main.appendChild(document.createElement("hr"));
  }
  function buildMetadataBlock(document, main) {
    const meta = {};
    const getMeta = (name) => {
      var _a;
      return ((_a = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)) == null ? void 0 : _a.getAttribute("content")) || "";
    };
    meta.title = getMeta("og:title") || "Built for";
    meta.description = getMeta("description");
    const ogImage = getMeta("og:image");
    if (ogImage) {
      meta.image = ogImage;
    }
    meta.template = "built-for-audience";
    const block = WebImporter.Blocks.getMetadataBlock(document, meta);
    main.appendChild(block);
  }
  var import_built_for_audience_default = {
    transformDOM: ({ document }) => {
      const main = document.createElement("div");
      buildHeroSection(document, main);
      buildUseCasesSection(document, main);
      buildAudienceCardsSection(document, main);
      buildStatsSection(document, main);
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
  return __toCommonJS(import_built_for_audience_exports);
})();
