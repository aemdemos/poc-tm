export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns and detect Lottie animations
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }

      // Lottie animation: replace .json link with animation container
      const lottieLink = [...col.querySelectorAll('a')].find(
        (a) => a.textContent.trim().endsWith('.json'),
      );
      if (lottieLink) {
        // Prefer href (full URL) when intact; fall back to textContent for DA
        const href = lottieLink.getAttribute('href') || '';
        const lottiePath = href.endsWith('.json') ? href : lottieLink.textContent.trim();
        const container = document.createElement('div');
        container.dataset.lottiePath = lottiePath;
        container.dataset.lottieLoop = 'true';
        // Replace the parent <p> to avoid invalid <p><div> nesting
        const wrapper = lottieLink.closest('p') || lottieLink;
        wrapper.replaceWith(container);
      }
    });
  });
}
