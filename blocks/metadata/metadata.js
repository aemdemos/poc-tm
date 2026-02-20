/**
 * Metadata Block
 * Processes page metadata key-value pairs and applies them to the document head.
 * The block is hidden after processing.
 */
export default function decorate(block) {
  const meta = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();
      if (key && value) {
        meta[key] = value;
      }
    }
  });

  // Apply metadata to document head
  Object.entries(meta).forEach(([key, value]) => {
    if (key === 'title') {
      document.title = value;
    } else {
      const existing = document.querySelector(`meta[name="${key}"]`);
      if (existing) {
        existing.setAttribute('content', value);
      } else {
        const tag = document.createElement('meta');
        tag.setAttribute('name', key);
        tag.setAttribute('content', value);
        document.head.appendChild(tag);
      }
    }
  });

  // Hide the metadata block from display
  block.closest('.section').style.display = 'none';
}
