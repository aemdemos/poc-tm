/**
 * Hero Block
 * Converts Lottie animation links in the image column into animation containers.
 * In DA, link hrefs get mangled (dots → hyphens), so we match by link text
 * content ending in .json and use the text as the canonical path.
 * The actual Lottie library loading is handled by delayed.js.
 */
export default function decorate(block) {
  const imageCol = block.querySelector(':scope > div > div:nth-child(2)');
  if (!imageCol) return;

  const links = imageCol.querySelectorAll('a');
  const lottieLink = [...links].find((a) => a.textContent.trim().endsWith('.json'));
  if (!lottieLink) return;

  const lottiePath = lottieLink.textContent.trim();

  const lottieContainer = document.createElement('div');
  lottieContainer.dataset.lottiePath = lottiePath;
  lottieContainer.dataset.lottieLoop = 'true';

  imageCol.textContent = '';
  imageCol.append(lottieContainer);
}
