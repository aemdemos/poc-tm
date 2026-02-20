/**
 * Blog Article Transformer
 * Transforms raw WordPress HTML content into clean EDS-compatible content.
 *
 * Handles:
 * - WordPress block markup cleanup (wp-block-* classes, ACF containers)
 * - Image URL resolution (relative → absolute)
 * - Link cleanup and validation
 * - Heading level normalization
 * - Empty element removal
 */

const SOURCE_DOMAIN = 'https://www.zelis.com';

/**
 * Clean WordPress-specific markup from article body HTML
 * @param {string} html - Raw article body HTML
 * @returns {string} Cleaned HTML suitable for markdown conversion
 */
export function cleanArticleBody(html) {
  // Remove WordPress block wrapper classes
  let cleaned = html
    .replace(/class="wp-block-[^"]*"/g, '')
    .replace(/class="acf-[^"]*"/g, '')
    .replace(/class="block[^"]*"/g, '')
    .replace(/id="section-wrapper-[^"]*"/g, '')
    .replace(/id="h-[^"]*"/g, '');

  // Remove empty div/section wrappers (preserve content)
  cleaned = cleaned
    .replace(/<div[^>]*>\s*<div[^>]*>\s*<div[^>]*>\s*<div[^>]*>/g, '')
    .replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g, '');

  // Fix relative URLs
  cleaned = cleaned.replace(
    /href="\/([^"]*)/g,
    `href="${SOURCE_DOMAIN}/$1`,
  );
  cleaned = cleaned.replace(
    /src="\/([^"]*)/g,
    `src="${SOURCE_DOMAIN}/$1`,
  );

  return cleaned.trim();
}

/**
 * Extract clean text content for markdown conversion
 * @param {Element} container - DOM element containing article body
 * @returns {Array<{type: string, content: string}>} Structured content blocks
 */
export function extractContentBlocks(container) {
  const blocks = [];

  const walk = (node) => {
    if (!node) return;

    for (const child of node.children || []) {
      const tag = child.tagName?.toLowerCase();

      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        const level = parseInt(tag[1], 10);
        blocks.push({
          type: 'heading',
          level,
          content: child.textContent.trim(),
        });
      } else if (tag === 'p') {
        const html = child.innerHTML.trim();
        if (html) {
          blocks.push({
            type: 'paragraph',
            content: html,
          });
        }
      } else if (tag === 'ul' || tag === 'ol') {
        blocks.push({
          type: tag === 'ul' ? 'unordered-list' : 'ordered-list',
          content: child.innerHTML.trim(),
        });
      } else if (tag === 'blockquote') {
        blocks.push({
          type: 'blockquote',
          content: child.textContent.trim(),
        });
      } else if (tag === 'div' || tag === 'section') {
        // Recurse into wrapper divs
        walk(child);
      }
    }
  };

  walk(container);
  return blocks;
}

/**
 * Convert content blocks to markdown
 * @param {Array} blocks - From extractContentBlocks
 * @returns {string} Markdown content
 */
export function blocksToMarkdown(blocks) {
  return blocks.map((block) => {
    switch (block.type) {
      case 'heading':
        return `${'#'.repeat(block.level)} ${block.content}`;
      case 'paragraph':
        return htmlToMarkdownInline(block.content);
      case 'unordered-list':
        return block.content;
      case 'ordered-list':
        return block.content;
      case 'blockquote':
        return `> ${block.content}`;
      default:
        return block.content;
    }
  }).join('\n\n');
}

/**
 * Convert inline HTML to markdown (links, bold, italic, images)
 * @param {string} html - Inline HTML content
 * @returns {string} Markdown equivalent
 */
function htmlToMarkdownInline(html) {
  return html
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '') // Strip remaining tags
    .trim();
}
