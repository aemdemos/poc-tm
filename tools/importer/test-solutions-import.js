/**
 * Quick test runner for import-solutions-page.js
 * Uses jsdom to fetch a WordPress page and run the transformDOM logic.
 * Outputs the generated HTML to verify section structure.
 *
 * Usage: node test-solutions-import.js [URL]
 * Default URL: https://www.zelis.com/solutions/payment-integrity/
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const url = process.argv[2] || 'https://www.zelis.com/solutions/payment-integrity/';

// Minimal WebImporter shim for testing
const WebImporter = {
  DOMUtils: {
    createTable(cells, document) {
      const table = document.createElement('table');
      cells.forEach((row, i) => {
        const tr = document.createElement('tr');
        if (!Array.isArray(row)) row = [row];
        row.forEach((cell) => {
          const td = document.createElement(i === 0 ? 'th' : 'td');
          if (typeof cell === 'string') {
            td.textContent = cell;
          } else if (cell instanceof document.defaultView.HTMLElement || cell instanceof document.defaultView.Node) {
            td.appendChild(cell.cloneNode ? cell.cloneNode(true) : document.createTextNode(String(cell)));
          } else {
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
    getMetadataBlock(document, meta) {
      const cells = [['Metadata']];
      Object.entries(meta).forEach(([key, value]) => {
        if (value) cells.push([key, value]);
      });
      return WebImporter.DOMUtils.createTable(cells, document);
    },
  },
  FileUtils: {
    sanitizePath(p) {
      return p.replace(/[^a-zA-Z0-9/._-]/g, '-').toLowerCase();
    },
  },
};

// Make WebImporter global (import script references it)
global.WebImporter = WebImporter;

async function main() {
  console.log(`Fetching: ${url}`);
  const dom = await JSDOM.fromURL(url, {
    resources: 'usable',
    pretendToBeVisual: true,
  });

  const { document } = dom.window;

  // Load the import script (source, not bundle)
  // We need to transpile the ESM export, so let's require it differently
  const scriptSrc = fs.readFileSync(
    path.join(__dirname, 'import-solutions-page.js'),
    'utf-8',
  );

  // Replace ESM export with CommonJS
  const cjsSrc = scriptSrc
    .replace('export default {', 'module.exports = {')
    .replace(/^import .*/gm, ''); // remove any imports

  // Write temp file and require it
  const tmpFile = path.join(__dirname, '_tmp_solutions_import.cjs');
  fs.writeFileSync(tmpFile, cjsSrc);

  const importScript = require(tmpFile);

  // Set location for hub page detection — jsdom already sets document.location from the URL

  console.log(`\nRunning transformDOM...`);
  const result = importScript.transformDOM({ document, url });

  // Count sections and blocks
  const hrs = result.querySelectorAll('hr');
  const tables = result.querySelectorAll('table');

  console.log(`\n=== RESULT SUMMARY ===`);
  console.log(`Sections (hr separators): ${hrs.length}`);
  console.log(`Block tables: ${tables.length}`);

  tables.forEach((table, i) => {
    const header = table.querySelector('th')?.textContent || '(no header)';
    const rows = table.querySelectorAll('tr').length - 1;
    console.log(`  Table ${i + 1}: [${header}] (${rows} rows)`);
  });

  // Output full HTML
  const html = result.innerHTML;
  const outFile = path.join(__dirname, '_test_solutions_output.html');
  fs.writeFileSync(outFile, html);
  console.log(`\nFull HTML written to: ${outFile}`);
  console.log(`HTML length: ${html.length} chars`);

  // Preview first 2000 chars
  console.log(`\n=== HTML PREVIEW (first 2000 chars) ===`);
  console.log(html.substring(0, 2000));

  // Clean up
  fs.unlinkSync(tmpFile);
  dom.window.close();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
