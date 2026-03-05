# Post-Bulk-Import Flow

After running a bulk import (via `tools/importer/bulk-import.js` or individual page migrations), follow these steps to ensure all pages render correctly.

## Step 1: Convert Markdown to HTML

All imported `.md` files need corresponding `.html` and `.plain.html` files for the local preview server.

```bash
# Convert all markdown files that don't have HTML yet
node tools/importer/convert-all-md.js

# Force reconvert all files (e.g., after head.html changes)
node tools/importer/convert-all-md.js --force

# Preview what would be converted
node tools/importer/convert-all-md.js --dry-run
```

The converter reads `head.html` from the workspace root (see `docs/head-contract.md`).

## Step 2: Verify Preview

Start the local preview server and check pages:

```bash
aem up
# Pages available at http://localhost:3000/content/{page-name}.html
```

## Step 3: Check Block Rendering

Each page should have its blocks properly decorated. Common issues:

- **Block not rendering**: Check that the block's `.js` and `.css` exist in `blocks/{name}/`
- **Missing styles**: Verify `styles/styles.css` loads (check browser console)
- **Font issues**: Confirm all font preloads are in `head.html`

## Step 4: Section Styling

Sections get their styling from section metadata in the markdown. The available section variants:

| Class | Background | Text Color |
|-------|-----------|------------|
| `dark` | Ink blue (#23004B) | White |
| `light` | Lavender (#F7F6FF) | Default |
| `accent` | Gold (#FFBE00) | Ink blue |
| `center` | (none) | Default, centered |

Section metadata is defined in the markdown as a table at the end of each section:

```markdown
| Section Metadata |          |
| ---------------- | -------- |
| style            | dark     |
```

## Notes

- The auto-convert hook (`.claude/skills/hooks/auto-convert-md.js`) automatically converts `.md` to `.html` when files are written during migration sessions
- Images reference source URLs and are not downloaded locally during migration
- The `--force` flag is useful after changing `head.html` or global styles
