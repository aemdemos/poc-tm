const { PNG } = require('pngjs');
const pixelmatchModule = require('pixelmatch');
const fs = require('fs');
const path = require('path');

const pixelmatch = pixelmatchModule.default || pixelmatchModule;

/**
 * Resize a PNG buffer to target dimensions by creating a new canvas.
 * Pads with white if smaller, crops if larger.
 */
function resizeToMatch(png, targetWidth, targetHeight) {
  const out = new PNG({ width: targetWidth, height: targetHeight });
  // Fill with white
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = 255;
    out.data[i + 1] = 255;
    out.data[i + 2] = 255;
    out.data[i + 3] = 255;
  }
  const copyW = Math.min(png.width, targetWidth);
  const copyH = Math.min(png.height, targetHeight);
  for (let y = 0; y < copyH; y += 1) {
    for (let x = 0; x < copyW; x += 1) {
      const srcIdx = (y * png.width + x) * 4;
      const dstIdx = (y * targetWidth + x) * 4;
      out.data[dstIdx] = png.data[srcIdx];
      out.data[dstIdx + 1] = png.data[srcIdx + 1];
      out.data[dstIdx + 2] = png.data[srcIdx + 2];
      out.data[dstIdx + 3] = png.data[srcIdx + 3];
    }
  }
  return out;
}

/**
 * Compare two screenshot buffers and return similarity info.
 * @param {Buffer} originalBuf - PNG buffer of original page
 * @param {Buffer} edsBuf - PNG buffer of EDS page
 * @param {string} diffPath - Where to save the diff image
 * @returns {{ similarity: number, diffPixels: number, totalPixels: number, diffPath: string }}
 */
function compareScreenshots(originalBuf, edsBuf, diffPath) {
  let original = PNG.sync.read(originalBuf);
  let eds = PNG.sync.read(edsBuf);

  // Normalize dimensions — use the larger of the two for each axis
  const width = Math.max(original.width, eds.width);
  const height = Math.max(original.height, eds.height);

  if (original.width !== width || original.height !== height) {
    original = resizeToMatch(original, width, height);
  }
  if (eds.width !== width || eds.height !== height) {
    eds = resizeToMatch(eds, width, height);
  }

  const diff = new PNG({ width, height });
  const totalPixels = width * height;

  const diffPixels = pixelmatch(
    original.data,
    eds.data,
    diff.data,
    width,
    height,
    { threshold: 0.3, alpha: 0.5 },
  );

  const similarity = ((totalPixels - diffPixels) / totalPixels) * 100;

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(diffPath), { recursive: true });
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  return {
    similarity: Math.round(similarity * 100) / 100,
    diffPixels,
    totalPixels,
    diffPath,
  };
}

/**
 * Convert a zelis.com URL to the corresponding EDS preview path.
 * @param {string} url - Original URL like https://www.zelis.com/blog/some-article/
 * @returns {string} EDS path like /blog/some-article
 */
function urlToEdsPath(url) {
  const u = new URL(url);
  let p = u.pathname.replace(/\/+$/, '') || '/index';
  if (p === '/') p = '/index';
  return p;
}

module.exports = { compareScreenshots, urlToEdsPath };
