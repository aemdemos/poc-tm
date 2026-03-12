#!/usr/bin/env node

/**
 * Generate EDS content files from the solutions-page import script.
 *
 * Usage:
 *   node generate-solutions-content.js https://www.zelis.com/solutions/payment-integrity/
 *   node generate-solutions-content.js --batch   # Process all 41 URLs from url-catalog.json
 *   node generate-solutions-content.js --batch --limit 5
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '../../content');
const CATALOG_PATH = path.join(__dirname, 'url-catalog.json');
const IMPORT_SCRIPT_PATH = path.join(__dirname, 'import-solutions-page.js');

// Parse arguments
const args = process.argv.slice(2);
const isBatch = args.includes('--batch');
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;
const singleUrl = args.find((a) => a.startsWith('http'));

// Load and prepare the import script (ESM → CJS)
function loadImportScript() {
  let src = fs.readFileSync(IMPORT_SCRIPT_PATH, 'utf-8');
  src = src.replace('export default {', 'module.exports = {');
  const tmpPath = path.join(__dirname, '_tmp_solutions_import.cjs');
  fs.writeFileSync(tmpPath, src);
  const mod = require(tmpPath);
  return mod;
}

// WebImporter shim
function createWebImporterShim(document) {
  return {
    DOMUtils: {
      createTable(data, doc) {
        const table = doc.createElement('table');
        data.forEach((row, i) => {
          const tr = doc.createElement('tr');
          row.forEach((cell) => {
            const td = doc.createElement(i === 0 ? 'th' : 'td');
            if (typeof cell === 'string') {
              td.textContent = cell;
            } else if (cell && cell.nodeType) {
              td.appendChild(cell.cloneNode(true));
            } else if (cell) {
              td.textContent = String(cell);
            }
            tr.appendChild(td);
          });
          table.appendChild(tr);
        });
        return table;
      },
    },
    Blocks: {
      getMetadataBlock(doc, meta) {
        const rows = [['Metadata']];
        Object.entries(meta).forEach(([key, val]) => {
          if (val) rows.push([key, val]);
        });
        return this._parent.DOMUtils.createTable(rows, doc);
      },
    },
    FileUtils: {
      sanitizePath(p) {
        return p.toLowerCase().replace(/[^a-z0-9/.-]/g, '-').replace(/-+/g, '-');
      },
    },
  };
}

// Convert block <table> elements to <div class="blockname"> format for .plain.html
function tablesToDivs(rawHtml) {
  const { JSDOM: J } = require('jsdom');
  const dom = new J(`<body>${rawHtml}</body>`);
  const doc = dom.window.document;
  const body = doc.querySelector('body');

  // Convert all tables to div-based block format
  body.querySelectorAll('table').forEach((table) => {
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0) return;

    // First row header cells define block name
    const headerCells = rows[0].querySelectorAll('th, td');
    const blockName = headerCells[0]?.textContent?.trim().toLowerCase().replace(/\s+/g, '-') || 'unknown';

    const blockDiv = doc.createElement('div');
    blockDiv.className = blockName;

    // Each subsequent row becomes a div with cell divs inside
    for (let i = 1; i < rows.length; i++) {
      const rowDiv = doc.createElement('div');
      const cells = rows[i].querySelectorAll('td, th');
      cells.forEach((cell) => {
        // If cell has a single <div> child, use it directly (avoid double-wrapping)
        const children = Array.from(cell.childNodes).filter((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()));
        if (children.length === 1 && children[0].tagName === 'DIV') {
          rowDiv.appendChild(children[0]);
        } else {
          const cellDiv = doc.createElement('div');
          while (cell.firstChild) {
            cellDiv.appendChild(cell.firstChild);
          }
          rowDiv.appendChild(cellDiv);
        }
      });
      blockDiv.appendChild(rowDiv);
    }

    table.replaceWith(blockDiv);
  });

  // Split on <hr> to get sections, wrap each in <div>
  const html = body.innerHTML;
  const parts = html.split(/<hr\s*\/?>/i);
  const sections = parts.map((part) => {
    const trimmed = part.trim();
    if (!trimmed) return '';
    return `<div>${trimmed}</div>`;
  }).filter(Boolean);

  return sections.join('\n');
}

// URL → content file path
function urlToContentPath(url, ext = '.html') {
  const u = new URL(url);
  let p = u.pathname.replace(/\/$/, '') || '/index';
  return path.join(CONTENT_DIR, `${p}${ext}`);
}

// Fetch and transform a single URL
async function processUrl(url, importScript) {
  console.log(`  Fetching: ${url}`);

  const dom = await JSDOM.fromURL(url, {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    pretendToBeVisual: true,
  });

  const { document } = dom.window;

  // Create WebImporter shim
  const shim = createWebImporterShim(document);
  shim.Blocks._parent = shim;
  dom.window.WebImporter = shim;
  global.WebImporter = shim;

  // Run the import transform
  const main = document.createElement('div');
  const result = importScript.transformDOM({
    document,
    url,
    html: dom.serialize(),
    params: {},
  });

  // The transform returns an element; get its innerHTML
  let rawHtml = '';
  if (result && result.element) {
    rawHtml = result.element.innerHTML;
  } else if (result && result.innerHTML) {
    rawHtml = result.innerHTML;
  }

  if (!rawHtml) {
    console.log(`    ⚠ No content generated for ${url}`);
    return null;
  }

  // Convert tables to div-based block format (what aem up expects)
  let plainHtml = tablesToDivs(rawHtml);

  // Rewrite Lottie JSON URLs from zelis.com to local /lottie/ paths (avoid CORS)
  plainHtml = plainHtml.replace(
    /https:\/\/www\.zelis\.com\/wp-content\/uploads\/json\/([^"<]+\.json)/g,
    '/lottie/$1',
  );

  // Write .plain.html (no boilerplate — aem up serves these directly)
  const plainPath = urlToContentPath(url, '.plain.html');
  const dir = path.dirname(plainPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(plainPath, plainHtml);

  console.log(`    ✓ Saved: ${plainPath.replace(CONTENT_DIR, 'content')}`);
  return plainPath;
}

// Main
async function main() {
  const importScript = loadImportScript();

  let urls = [];

  if (singleUrl) {
    urls = [singleUrl];
  } else if (isBatch) {
    const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
    const batch = catalog.batches['7a-solutions'];
    if (!batch || !batch.urls) {
      console.error('Batch 7a-solutions not found in url-catalog.json');
      process.exit(1);
    }
    urls = batch.urls.slice(0, limit);
  } else {
    console.log('Usage: node generate-solutions-content.js <URL> | --batch [--limit N]');
    process.exit(1);
  }

  console.log(`Processing ${urls.length} solutions page(s)...\n`);

  let success = 0;
  let failed = 0;

  for (const url of urls) {
    try {
      const result = await processUrl(url, importScript);
      if (result) success++;
      else failed++;
    } catch (err) {
      console.log(`    ✗ Error: ${err.message}`);
      failed++;
    }
    // Small delay to avoid rate limiting
    if (urls.length > 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  console.log(`\nDone: ${success} success, ${failed} failed out of ${urls.length} total`);
}

main().catch(console.error);
