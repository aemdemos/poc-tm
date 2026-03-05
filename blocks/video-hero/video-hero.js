function getVideoProvider(url) {
  if (url.includes('vimeo.com')) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? { provider: 'vimeo', id: match[1] } : null;
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? { provider: 'youtube', id: match[1] } : null;
  }
  return null;
}

function createPlayButton() {
  const btn = document.createElement('button');
  btn.classList.add('video-hero-play');
  btn.setAttribute('aria-label', 'Play video');
  btn.innerHTML = `<svg width="94" height="95" viewBox="0 0 94 95" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="47" cy="47.6" r="47" fill="white" fill-opacity="0.9"/>
    <path d="M36 68.6V26.6L65 46.6L36 68.6Z" fill="#321478"/>
  </svg>`;
  return btn;
}

function createBackdrop() {
  const backdrop = document.createElement('div');
  backdrop.classList.add('video-hero-backdrop');
  return backdrop;
}

function createCloseButton() {
  const btn = document.createElement('button');
  btn.classList.add('video-hero-close');
  btn.setAttribute('aria-label', 'Close video');
  btn.textContent = '\u00D7';
  return btn;
}

function buildIframeSrc(video) {
  if (video.provider === 'vimeo') {
    return `https://player.vimeo.com/video/${video.id}?autoplay=1`;
  }
  return `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1`;
}

function openVideo(block, video) {
  const player = block.querySelector('.video-hero-player');
  const iframe = document.createElement('iframe');
  iframe.src = buildIframeSrc(video);
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'autoplay; fullscreen');
  iframe.setAttribute('allowfullscreen', '');
  player.append(iframe);
  block.classList.add('expanded');
  document.body.style.overflow = 'hidden';
}

function closeVideo(block) {
  const player = block.querySelector('.video-hero-player');
  player.innerHTML = '';
  block.classList.remove('expanded');
  document.body.style.overflow = '';
}

export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cols = row.querySelectorAll(':scope > div');
  const textCol = cols[0];
  const mediaCol = cols[1];
  if (!textCol || !mediaCol) return;

  // Extract poster image and video link from media column
  const picture = mediaCol.querySelector('picture');
  const links = mediaCol.querySelectorAll('a');
  let video = null;
  let videoLink = null;

  [...links].forEach((link) => {
    const info = getVideoProvider(link.href) || getVideoProvider(link.textContent.trim());
    if (info) {
      video = info;
      videoLink = link;
    }
  });

  // Build the poster area
  const posterWrapper = document.createElement('div');
  posterWrapper.classList.add('video-hero-poster');

  if (picture) {
    posterWrapper.append(picture);
  }

  // Gradient overlay
  const gradient = document.createElement('div');
  gradient.classList.add('video-hero-gradient');
  posterWrapper.append(gradient);

  // Play button (only if we found a video)
  if (video) {
    const playBtn = createPlayButton();
    posterWrapper.append(playBtn);

    // Player container for iframe
    const player = document.createElement('div');
    player.classList.add('video-hero-player');
    posterWrapper.append(player);

    // Backdrop
    const backdrop = createBackdrop();
    block.append(backdrop);

    // Close button
    const closeBtn = createCloseButton();
    posterWrapper.append(closeBtn);

    // Event handlers
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    playBtn.addEventListener('click', () => {
      if (!reducedMotion) openVideo(block, video);
    });

    backdrop.addEventListener('click', () => closeVideo(block));
    closeBtn.addEventListener('click', () => closeVideo(block));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && block.classList.contains('expanded')) {
        closeVideo(block);
      }
    });

    // Remove the original video link
    if (videoLink) videoLink.remove();
  }

  // Rebuild the block structure
  textCol.classList.add('video-hero-content');
  mediaCol.textContent = '';
  mediaCol.classList.add('video-hero-media');
  mediaCol.append(posterWrapper);
}
