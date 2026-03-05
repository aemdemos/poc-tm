function showSlide(block, index) {
  const slides = block.querySelectorAll('.image-slider-slide');
  const total = slides.length;
  let target = index;
  if (target < 0) target = total - 1;
  if (target >= total) target = 0;

  block.dataset.activeSlide = target;
  const track = block.querySelector('.image-slider-track');
  track.scrollTo({ left: slides[target].offsetLeft, behavior: 'smooth' });

  slides.forEach((s, i) => {
    s.setAttribute('aria-hidden', i !== target);
  });
}

function startAutoplay(block) {
  if (block.dataset.autoplay === 'paused') return;
  stopAutoplay(block);
  const id = setInterval(() => {
    const current = parseInt(block.dataset.activeSlide, 10) || 0;
    showSlide(block, current + 1);
  }, 5000);
  block.dataset.autoplayId = id;
}

function stopAutoplay(block) {
  const id = block.dataset.autoplayId;
  if (id) {
    clearInterval(parseInt(id, 10));
    block.dataset.autoplayId = '';
  }
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Image Slider');

  // Build slide track
  const track = document.createElement('ul');
  track.classList.add('image-slider-track');

  rows.forEach((row, idx) => {
    const slide = document.createElement('li');
    slide.classList.add('image-slider-slide');
    slide.dataset.slideIndex = idx;
    slide.setAttribute('aria-hidden', idx !== 0);

    const pic = row.querySelector('picture');
    if (pic) slide.append(pic);
    track.append(slide);
    row.remove();
  });

  // Container
  const container = document.createElement('div');
  container.classList.add('image-slider-container');
  container.append(track);

  // Arrows
  const prevBtn = document.createElement('button');
  prevBtn.classList.add('image-slider-prev');
  prevBtn.setAttribute('aria-label', 'Previous slide');

  const nextBtn = document.createElement('button');
  nextBtn.classList.add('image-slider-next');
  nextBtn.setAttribute('aria-label', 'Next slide');

  container.append(prevBtn, nextBtn);
  block.prepend(container);

  block.dataset.activeSlide = 0;

  // Arrow events
  prevBtn.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
    stopAutoplay(block);
    startAutoplay(block);
  });

  nextBtn.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    stopAutoplay(block);
    startAutoplay(block);
  });

  // Scroll-snap observer to update active slide index
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        block.dataset.activeSlide = entry.target.dataset.slideIndex;
      }
    });
  }, { root: track, threshold: 0.5 });

  track.querySelectorAll('.image-slider-slide').forEach((s) => slideObserver.observe(s));

  // Pause on hover / focus
  block.addEventListener('mouseenter', () => stopAutoplay(block));
  block.addEventListener('focusin', () => stopAutoplay(block));
  block.addEventListener('mouseleave', () => startAutoplay(block));
  block.addEventListener('focusout', () => startAutoplay(block));

  // Respect prefers-reduced-motion
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    block.dataset.autoplay = 'paused';
  }

  // Start autoplay when block enters viewport
  const blockObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startAutoplay(block);
      } else {
        stopAutoplay(block);
      }
    });
  }, { threshold: 0.3 });

  blockObserver.observe(block);
}
