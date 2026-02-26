/**
 * Hero Block
 * Converts links to .json files in the image column into Lottie animation containers.
 * The actual Lottie library loading is handled by delayed.js.
 */
export default function decorate(block) {
  const imageCol = block.querySelector(':scope > div > div:nth-child(2)');
  if (!imageCol) return;

  const link = imageCol.querySelector('a[href$=".json"]');
  if (!link) return;

  const lottieContainer = document.createElement('div');
  lottieContainer.dataset.lottiePath = link.href;
  lottieContainer.dataset.lottieLoop = 'true';

  imageCol.textContent = '';
  imageCol.append(lottieContainer);
}
