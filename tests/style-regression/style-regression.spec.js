// @ts-check
const { test } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { compareScreenshots, urlToEdsPath } = require('./compare');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const RESULTS_FILE = path.join(__dirname, 'results.json');

// EDS preview base URL — override with EDS_BASE_URL env var
const EDS_BASE = process.env.EDS_BASE_URL || 'http://localhost:3000';

// Load URL catalog and pick sample URLs per template
const catalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../tools/importer/url-catalog.json'), 'utf-8'),
);

// Max sample URLs per template (override with SAMPLES_PER_TEMPLATE env var)
const SAMPLES_PER_TEMPLATE = parseInt(process.env.SAMPLES_PER_TEMPLATE || '1', 10);

function getSampleUrls() {
  const samples = {};
  for (const [, batch] of Object.entries(catalog.batches)) {
    const { template, urls } = batch;
    if (!samples[template]) samples[template] = [];
    for (const url of urls) {
      if (samples[template].length >= SAMPLES_PER_TEMPLATE) break;
      samples[template].push(url);
    }
  }
  return samples;
}

const sampleUrls = getSampleUrls();

// Load existing results so multi-project runs accumulate
let results = [];
try {
  results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
} catch { /* first run or missing file */ }

// Dismiss cookie banners and overlays
async function dismissOverlays(page) {
  const selectors = [
    '[id*="cookie"] button',
    '[class*="cookie"] button',
    '[id*="consent"] button',
    '[class*="consent"] button',
    '.onetrust-close-btn-handler',
    '#onetrust-accept-btn-handler',
    '[aria-label="Close"]',
    '[aria-label="close"]',
  ];
  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 1000 })) {
        await el.click({ timeout: 2000 });
        await page.waitForTimeout(500);
      }
    } catch { /* ignore */ }
  }
}

// Wait for page to settle (images, animations, lazy-load)
async function waitForSettle(page) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 15_000 });
  } catch { /* proceed anyway */ }
  await page.waitForTimeout(2000);
}

// Take a full-page screenshot with retries
async function takeScreenshot(page, url, filePath) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await waitForSettle(page);
  await dismissOverlays(page);
  await page.waitForTimeout(500);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  await page.screenshot({ path: filePath, fullPage: true });
  return fs.readFileSync(filePath);
}

for (const [template, urls] of Object.entries(sampleUrls)) {
  for (const originalUrl of urls) {
    const edsPath = urlToEdsPath(originalUrl);
    const slug = edsPath.replace(/\//g, '_').replace(/^_/, '') || 'index';

    test(`${template}: ${slug}`, async ({ page }, testInfo) => {
      const viewport = testInfo.project.name; // 'desktop' or 'mobile'
      const dir = path.join(SCREENSHOT_DIR, viewport, template);

      const originalFile = path.join(dir, `${slug}-original.png`);
      const edsFile = path.join(dir, `${slug}-eds.png`);
      const diffFile = path.join(dir, `${slug}-diff.png`);

      const result = {
        template,
        url: originalUrl,
        edsPath,
        viewport,
        originalScreenshot: originalFile,
        edsScreenshot: edsFile,
      };

      // Screenshot original site
      let originalBuf;
      try {
        originalBuf = await takeScreenshot(page, originalUrl, originalFile);
        result.originalOk = true;
      } catch (err) {
        result.originalOk = false;
        result.originalError = err.message;
      }

      // Screenshot EDS preview
      let edsBuf;
      const edsUrl = `${EDS_BASE}${edsPath}`;
      try {
        edsBuf = await takeScreenshot(page, edsUrl, edsFile);
        result.edsOk = true;
      } catch (err) {
        result.edsOk = false;
        result.edsError = err.message;
      }

      // Pixel diff if both screenshots succeeded
      if (originalBuf && edsBuf) {
        const comparison = compareScreenshots(originalBuf, edsBuf, diffFile);
        result.similarity = comparison.similarity;
        result.diffPixels = comparison.diffPixels;
        result.totalPixels = comparison.totalPixels;
        result.diffPath = comparison.diffPath;
      }

      results.push(result);

      // Write intermediate results after each test
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

      // Log summary to console
      if (result.similarity !== undefined) {
        let icon = 'FAIL';
        if (result.similarity >= 80) icon = 'PASS';
        else if (result.similarity >= 60) icon = 'WARN';
        console.log(`[${icon}] ${viewport}/${template}/${slug}: ${result.similarity}% similar`);
      } else {
        console.log(`[SKIP] ${viewport}/${template}/${slug}: screenshot failed`);
      }
    });
  }
}
