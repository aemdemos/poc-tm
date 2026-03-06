#!/usr/bin/env node

/**
 * Regenerate .plain.html from .html files in the content directory.
 *
 * Extracts the <main> body from each .html file and writes it as .plain.html.
 * This fixes cases where .plain.html has broken pipe-table rendering.
 *
 * Usage:
 *   node regenerate-plain-html.js let-care-flow       # Single page
 *   node regenerate-plain-html.js --all                # All pages
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const CONTENT_DIR = path.join(__dirname, '../../content');

function extractPlainHtml(htmlContent) {
  const dom = new JSDOM(htmlContent);
  const main = dom.window.document.querySelector('main');
  if (!main) return null;
  return main.innerHTML.trim();
}

function regenerate(pageName) {
  const htmlPath = path.join(CONTENT_DIR, `${pageName}.html`);
  const plainPath = path.join(CONTENT_DIR, `${pageName}.plain.html`);

  if (!fs.existsSync(htmlPath)) {
    console.error(`  [SKIP] ${pageName}: no .html file found`);
    return false;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const plain = extractPlainHtml(html);

  if (!plain) {
    console.error(`  [SKIP] ${pageName}: no <main> element found`);
    return false;
  }

  fs.writeFileSync(plainPath, plain, 'utf8');
  console.log(`  [OK] ${pageName}.plain.html (${plain.length} chars)`);
  return true;
}

const args = process.argv.slice(2);

if (args.includes('--all')) {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.html') && !f.endsWith('.plain.html'));
  let count = 0;
  files.forEach((f) => {
    const name = f.replace('.html', '');
    if (regenerate(name)) count += 1;
  });
  console.log(`\nRegenerated ${count} .plain.html files`);
} else if (args.length > 0) {
  args.forEach((name) => regenerate(name));
} else {
  console.log('Usage: node regenerate-plain-html.js <page-name> [<page-name>...]');
  console.log('       node regenerate-plain-html.js --all');
}
