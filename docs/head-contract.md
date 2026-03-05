# Head Contract

## Single Source of Truth

The file `head.html` in the workspace root is the **single source of truth** for all `<head>` content injected into generated HTML pages. Any tool or script that produces full HTML pages must read from this file rather than hardcoding `<head>` content.

## What `head.html` Contains

- Viewport meta tag
- AEM scripts (`aem.js`, `scripts.js`)
- Global stylesheet (`styles/styles.css`)
- Font preload links (all 4 Avenir Next LT Pro weights)

## Consumers

| Consumer | Location | How it reads head.html |
|----------|----------|----------------------|
| `aem up` (AEM CLI) | Built-in | Reads `head.html` natively |
| Auto-convert hook | `.claude/skills/hooks/auto-convert-md.js` | Via `html-utils.js` `buildFullHtml()` |
| Batch converter | `tools/importer/convert-all-md.js` | Via `readHeadHtml()` (reads file directly) |

## Adding to `<head>`

When you need to add a new preload, stylesheet, or script:

1. Edit `head.html` in the workspace root
2. All consumers pick up the change automatically on next run
3. No other files need updating

## Why This Matters

Previously, `convert-all-md.js` had a hardcoded `<head>` that drifted from the actual `head.html` (it was missing 2 of 4 font preloads). The head contract ensures all HTML generation stays in sync.
