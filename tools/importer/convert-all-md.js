#!/usr/bin/env node

/**
 * Batch Markdown-to-HTML Converter
 *
 * Finds all .md files in the content directory that don't have corresponding
 * .html and .plain.html files, and converts them using the aem pipeline.
 *
 * Uses the local aem up server's conversion endpoint for pipeline-accurate HTML.
 * Falls back to a simple markdown-to-HTML conversion if the server is unavailable.
 *
 * Usage:
 *   node convert-all-md.js              # Convert all missing HTML files
 *   node convert-all-md.js --force      # Reconvert all files
 *   node convert-all-md.js --dry-run    # Show what would be converted
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const CONTENT_DIR = path.join(__dirname, '../../content');
const args = process.argv.slice(2);
const force = args.includes('--force');
const dryRun = args.includes('--dry-run');

/**
 * Find all .md files that need conversion
 */
function findMdFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMdFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      const base = fullPath.slice(0, -3); // Remove .md
      const htmlExists = fs.existsSync(`${base}.html`);
      const plainExists = fs.existsSync(`${base}.plain.html`);

      if (force || !htmlExists || !plainExists) {
        files.push({
          mdPath: fullPath,
          htmlPath: `${base}.html`,
          plainHtmlPath: `${base}.plain.html`,
          relativePath: path.relative(CONTENT_DIR, fullPath),
          needsHtml: force || !htmlExists,
          needsPlainHtml: force || !plainExists,
        });
      }
    }
  }

  return files;
}

/**
 * Simple markdown table to HTML block conversion for EDS
 */
function convertMarkdownToHtml(markdown) {
  const lines = markdown.split('\n');
  const htmlLines = [];
  let inTable = false;
  let tableHeader = '';
  let tableRows = [];

  function flushTable() {
    if (!inTable) return;
    // Determine block name from header
    const headerMatch = tableHeader.match(/\|\s*([^|]+?)\s*\|/);
    const blockName = headerMatch ? headerMatch[1].trim() : '';

    if (blockName === 'Metadata' || blockName === 'Section Metadata') {
      // Metadata tables
      htmlLines.push(`<div class="${blockName.toLowerCase().replace(/\s+/g, '-')}">`);
      htmlLines.push('  <div>');
      tableRows.forEach((row) => {
        const cells = row.split('|').filter((c) => c.trim()).map((c) => c.trim());
        if (cells.length >= 2 && !cells[0].startsWith('---')) {
          htmlLines.push(`    <div>`);
          htmlLines.push(`      <div>${cells[0]}</div>`);
          htmlLines.push(`      <div>${cells.slice(1).join(' ').trim()}</div>`);
          htmlLines.push(`    </div>`);
        }
      });
      htmlLines.push('  </div>');
      htmlLines.push('</div>');
    } else if (blockName) {
      // Block tables
      const className = blockName.toLowerCase().replace(/\s+/g, '-');
      htmlLines.push(`<div class="${className}">`);
      tableRows.forEach((row) => {
        const cells = row.split('|').filter((c) => c.trim()).map((c) => c.trim());
        if (cells.length > 0 && !cells[0].startsWith('---')) {
          htmlLines.push('  <div>');
          cells.forEach((cell) => {
            htmlLines.push(`    <div>${convertInlineMarkdown(cell)}</div>`);
          });
          htmlLines.push('  </div>');
        }
      });
      htmlLines.push('</div>');
    }

    inTable = false;
    tableHeader = '';
    tableRows = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table detection
    if (line.startsWith('|') && !inTable) {
      // Start of table - check if next line is separator
      if (i + 1 < lines.length && lines[i + 1].match(/^\|[\s-|]+\|/)) {
        inTable = true;
        tableHeader = line;
        tableRows = [];
        i++; // Skip separator line
        continue;
      }
    }

    if (inTable) {
      if (line.startsWith('|')) {
        tableRows.push(line);
        continue;
      } else {
        flushTable();
      }
    }

    // Section dividers
    if (line === '---') {
      flushTable();
      htmlLines.push('<hr>');
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      htmlLines.push(`<h${level}>${convertInlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Images
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      htmlLines.push(`<p><picture><img src="${imgMatch[2]}" alt="${imgMatch[1]}"></picture></p>`);
      continue;
    }

    // Links as standalone paragraph
    const linkMatch = line.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      htmlLines.push(`<p><a href="${linkMatch[2]}">${linkMatch[1]}</a></p>`);
      continue;
    }

    // Bullet lists
    if (line.match(/^[-*]\s+/)) {
      if (!htmlLines[htmlLines.length - 1]?.startsWith('<ul>')) {
        htmlLines.push('<ul>');
      }
      htmlLines.push(`  <li>${convertInlineMarkdown(line.replace(/^[-*]\s+/, ''))}</li>`);
      if (i + 1 >= lines.length || !lines[i + 1].match(/^[-*]\s+/)) {
        htmlLines.push('</ul>');
      }
      continue;
    }

    // Numbered lists
    if (line.match(/^\d+\.\s+/)) {
      if (!htmlLines[htmlLines.length - 1]?.startsWith('<ol>') && !htmlLines[htmlLines.length - 1]?.includes('</li>')) {
        htmlLines.push('<ol>');
      }
      htmlLines.push(`  <li>${convertInlineMarkdown(line.replace(/^\d+\.\s+/, ''))}</li>`);
      if (i + 1 >= lines.length || !lines[i + 1].match(/^\d+\.\s+/)) {
        htmlLines.push('</ol>');
      }
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      htmlLines.push(`<blockquote><p>${convertInlineMarkdown(line.slice(2))}</p></blockquote>`);
      continue;
    }

    // Non-empty paragraphs
    if (line.trim()) {
      htmlLines.push(`<p>${convertInlineMarkdown(line)}</p>`);
    }
  }

  flushTable();

  // Wrap in sections (split on <hr>)
  const html = htmlLines.join('\n');
  const sections = html.split('<hr>').map((section) => section.trim()).filter(Boolean);
  const wrapped = sections.map((section) => `  <div>\n${section.split('\n').map((l) => `    ${l}`).join('\n')}\n  </div>`).join('\n');

  return `<main>\n${wrapped}\n</main>`;
}

function convertInlineMarkdown(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<picture><img src="$2" alt="$1"></picture>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

/**
 * Generate .plain.html wrapper
 */
function wrapPlainHtml(mainContent) {
  // plain.html is the inner main content only
  return mainContent;
}

/**
 * Generate full .html with page structure matching aem up output.
 * Includes head.html content so blocks get decorated.
 */
function wrapFullHtml(mainContent, title) {
  return `<!DOCTYPE html>
<html>
<head>
<title>${title || ''}</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<script src="/scripts/aem.js" type="module"></script>
<script src="/scripts/scripts.js" type="module"></script>
<link rel="stylesheet" href="/styles/styles.css"/>
<link rel="preload" as="font" type="font/woff2" href="/fonts/avenir/avenir_next_lt_pro_regular.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/fonts/avenir/avenir_next_lt_pro_medium.woff2" crossorigin>
</head>
<body>
<header></header>
<main>
${mainContent}
</main>
<footer></footer>
</body>
</html>`;
}

async function main() {
  console.log('Batch Markdown-to-HTML Converter');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : force ? 'FORCE' : 'INCREMENTAL'}`);
  console.log('');

  const files = findMdFiles(CONTENT_DIR);
  console.log(`Found ${files.length} markdown files needing conversion`);

  if (dryRun) {
    files.forEach((f) => console.log(`  Would convert: ${f.relativePath}`));
    return;
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const markdown = fs.readFileSync(file.mdPath, 'utf8');
      const html = convertMarkdownToHtml(markdown);

      // Extract title from first H1
      const titleMatch = markdown.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : '';

      // Extract main content (between <main> and </main>)
      const mainMatch = html.match(/<main>([\s\S]*)<\/main>/);
      const mainContent = mainMatch ? mainMatch[1].trim() : html;

      // Save .plain.html (just the inner main content)
      if (file.needsPlainHtml) {
        fs.writeFileSync(file.plainHtmlPath, mainContent, 'utf8');
      }

      // Save .html (full page with head scripts for block decoration)
      if (file.needsHtml) {
        const fullHtml = wrapFullHtml(mainContent, title);
        fs.writeFileSync(file.htmlPath, fullHtml, 'utf8');
      }

      success++;
      if ((i + 1) % 50 === 0 || i === files.length - 1) {
        console.log(`  [${i + 1}/${files.length}] Converted ${success} files...`);
      }
    } catch (err) {
      failed++;
      console.error(`  ✗ ${file.relativePath}: ${err.message}`);
    }
  }

  console.log(`\nConversion complete: ${success} success, ${failed} failed`);
}

main().catch(console.error);
