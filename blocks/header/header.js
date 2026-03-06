import { getMetadata } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');
const HOVER_DELAY = 200;

/* ── utility ────────────────────────────────────────────────────────── */

function closeAllPanels(container) {
  container.querySelectorAll('.nav-drop').forEach((drop) => {
    drop.setAttribute('aria-expanded', 'false');
  });
  container.querySelectorAll('.mega-panel').forEach((panel) => {
    panel.classList.remove('open');
  });
  const overlay = document.querySelector('.nav-overlay');
  if (overlay) overlay.classList.remove('visible');
}

function openPanel(navDrop, container) {
  closeAllPanels(container);
  navDrop.setAttribute('aria-expanded', 'true');
  const panelId = navDrop.dataset.megaPanel;
  const panel = container.querySelector(`.mega-panel[data-panel-id="${panelId}"]`);
  if (panel) panel.classList.add('open');
  const overlay = document.querySelector('.nav-overlay');
  if (overlay) overlay.classList.add('visible');
}

/* ── keyboard / focus ───────────────────────────────────────────────── */

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const wrapper = nav.closest('.nav-wrapper');
    if (isDesktop.matches) {
      closeAllPanels(wrapper);
    } else {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        // eslint-disable-next-line no-use-before-define
        toggleMenu(nav, nav.querySelector('.nav-sections'), false);
        nav.querySelector('.nav-hamburger button').focus();
      }
    }
  }
}

function closeOnClickOutside(e) {
  const wrapper = document.querySelector('.nav-wrapper');
  if (!wrapper) return;
  if (!wrapper.contains(e.target)) {
    closeAllPanels(wrapper);
  }
}

/* ── mobile toggle ──────────────────────────────────────────────────── */

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  if (!expanded && !isDesktop.matches) {
    const wrapper = nav.closest('.nav-wrapper');
    if (wrapper) closeAllPanels(wrapper);
  }

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

/* ── mega-menu panel builder ────────────────────────────────────────── */

function buildMegaPanel(subUl, panelId) {
  const panel = document.createElement('div');
  panel.className = 'mega-panel';
  panel.dataset.panelId = panelId;

  const inner = document.createElement('div');
  inner.className = 'mega-panel-inner';

  const items = [...subUl.querySelectorAll(':scope > li')];
  if (!items.length) return panel;

  // First item with <strong> is the intro
  const firstItem = items[0];
  const introStrong = firstItem.querySelector(':scope > strong');
  if (introStrong) {
    const intro = document.createElement('div');
    intro.className = 'mega-intro';
    const title = document.createElement('p');
    title.className = 'mega-intro-title';
    title.textContent = introStrong.textContent;
    intro.append(title);
    firstItem.querySelectorAll(':scope > p').forEach((p) => {
      const link = p.querySelector('a');
      if (link) {
        const cta = document.createElement('p');
        cta.className = 'mega-intro-cta';
        cta.append(link.cloneNode(true));
        intro.append(cta);
      } else {
        const desc = document.createElement('p');
        desc.className = 'mega-intro-desc';
        desc.textContent = p.textContent;
        intro.append(desc);
      }
    });
    inner.append(intro);
    items.shift();
  }

  if (!items.length) { panel.append(inner); return panel; }

  const content = document.createElement('div');
  content.className = 'mega-content';

  const hasCategoryGroups = items.some(
    (li) => li.querySelector(':scope > ul') && !li.querySelector(':scope > a'),
  );
  const hasDescriptions = items.some((li) => li.querySelector(':scope > p'));

  if (hasDescriptions && !hasCategoryGroups) {
    // Solutions-style: 2-column grid with title + description
    content.classList.add('mega-solutions');
    items.forEach((li) => {
      const card = document.createElement('div');
      card.className = 'mega-solution-card';
      const link = li.querySelector(':scope > a');
      const desc = li.querySelector(':scope > p');
      if (link) {
        const a = document.createElement('a');
        a.href = link.href;
        a.className = 'mega-solution-link';
        a.textContent = link.textContent;
        card.append(a);
      }
      if (desc) {
        const p = document.createElement('p');
        p.className = 'mega-solution-desc';
        p.textContent = desc.textContent;
        card.append(p);
      }
      content.append(card);
    });
  } else if (hasCategoryGroups) {
    // Category-style: columns of categorized links
    content.classList.add('mega-categories');
    items.forEach((li) => {
      const group = document.createElement('div');
      group.className = 'mega-category';
      const textNodes = [...li.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent.trim())
        .filter(Boolean);
      const headingText = textNodes.join(' ')
        || li.querySelector(':scope > a')?.textContent
        || '';
      if (headingText) {
        const h = document.createElement('p');
        h.className = 'mega-category-title';
        h.textContent = headingText;
        group.append(h);
      }
      const nestedUl = li.querySelector(':scope > ul');
      if (nestedUl) {
        const ul = document.createElement('ul');
        nestedUl.querySelectorAll(':scope > li').forEach((subLi) => {
          const newLi = document.createElement('li');
          const a = subLi.querySelector('a');
          if (a) newLi.append(a.cloneNode(true));
          else newLi.textContent = subLi.textContent;
          ul.append(newLi);
        });
        group.append(ul);
      }
      content.append(group);
    });
  } else {
    // Simple link list fallback
    content.classList.add('mega-links');
    const ul = document.createElement('ul');
    items.forEach((li) => {
      const newLi = document.createElement('li');
      const a = li.querySelector(':scope > a');
      if (a) newLi.append(a.cloneNode(true));
      else newLi.textContent = li.textContent;
      ul.append(newLi);
    });
    content.append(ul);
  }

  inner.append(content);
  panel.append(inner);
  return panel;
}

/* ── breadcrumbs ────────────────────────────────────────────────────── */

function getDirectTextContent(menuItem) {
  const menuLink = menuItem.querySelector(':scope > :where(a,p)');
  if (menuLink) return menuLink.textContent.trim();
  return Array.from(menuItem.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
}

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = [];
  const homeUrl = document.querySelector('.nav-brand a[href]').href;

  let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
  if (menuItem) {
    do {
      const link = menuItem.querySelector(':scope > a');
      crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
      menuItem = menuItem.closest('ul')?.closest('li');
    } while (menuItem);
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
  }

  const placeholders = await fetchPlaceholders();
  const homePlaceholder = placeholders.breadcrumbsHomeLabel || 'Home';
  crumbs.unshift({ title: homePlaceholder, url: homeUrl });

  if (crumbs.length > 1) crumbs[crumbs.length - 1].url = null;
  crumbs[crumbs.length - 1]['aria-current'] = 'page';
  return crumbs;
}

async function buildBreadcrumbs() {
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';

  const crumbs = await buildBreadcrumbsFromNavTree(
    document.querySelector('.nav-sections'),
    document.location.href,
  );

  const ol = document.createElement('ol');
  ol.append(...crumbs.map((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.textContent = item.title;
    }
    return li;
  }));

  breadcrumbs.append(ol);
  return breadcrumbs;
}

/* ── decorate ───────────────────────────────────────────────────────── */

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Detect sections: announcement (optional), brand, sections, tools
  const children = [...nav.children];
  let announcementSection = null;
  let brandSection;
  let sectionsSection;
  let toolsSection;

  const firstHasUl = children[0]?.querySelector('ul');
  const firstHasPicture = children[0]?.querySelector('picture');
  if (!firstHasUl && !firstHasPicture && children.length > 3) {
    [announcementSection, brandSection, sectionsSection, toolsSection] = children;
  } else {
    [brandSection, sectionsSection, toolsSection] = children;
  }

  // Announcement bar
  if (announcementSection) {
    announcementSection.classList.add('nav-announcement');
  }

  // Brand
  if (brandSection) {
    brandSection.classList.add('nav-brand');
    const brandLink = brandSection.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      brandLink.closest('.button-container').className = '';
    }
  }

  // Container for mega-panels (placed in nav-wrapper, outside nav)
  const panelsContainer = document.createElement('div');
  panelsContainer.className = 'mega-panels-container';

  // Sections — build mega-menu panels
  if (sectionsSection) {
    sectionsSection.classList.add('nav-sections');
    const topItems = sectionsSection.querySelectorAll(':scope .default-content-wrapper > ul > li');
    let hoverTimeout;

    topItems.forEach((navSection, idx) => {
      const subUl = navSection.querySelector(':scope > ul');
      if (!subUl) return;

      const panelId = `mega-${idx}`;
      navSection.classList.add('nav-drop');
      navSection.setAttribute('aria-expanded', 'false');
      navSection.dataset.megaPanel = panelId;

      // Build mega-panel and move it to the external container
      const megaPanel = buildMegaPanel(subUl, panelId);
      subUl.remove();
      panelsContainer.append(megaPanel);

      // Also build a mobile-only inline copy
      const mobilePanel = megaPanel.cloneNode(true);
      mobilePanel.classList.add('mega-panel-mobile');
      mobilePanel.classList.remove('mega-panel');
      navSection.append(mobilePanel);

      // Desktop: hover behavior
      navSection.addEventListener('mouseenter', () => {
        if (!isDesktop.matches) return;
        clearTimeout(hoverTimeout);
        const wrapper = nav.closest('.nav-wrapper');
        openPanel(navSection, wrapper);
      });

      navSection.addEventListener('mouseleave', () => {
        if (!isDesktop.matches) return;
        hoverTimeout = setTimeout(() => {
          const wrapper = nav.closest('.nav-wrapper');
          closeAllPanels(wrapper);
        }, HOVER_DELAY);
      });

      // Desktop: click on label toggles (for accessibility)
      const topLink = navSection.querySelector(':scope > a');
      if (topLink) {
        topLink.addEventListener('click', (e) => {
          if (isDesktop.matches) {
            e.preventDefault();
            const wrapper = nav.closest('.nav-wrapper');
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            if (expanded) closeAllPanels(wrapper);
            else openPanel(navSection, wrapper);
          }
        });
      }

      // Mobile: click toggles accordion
      navSection.addEventListener('click', (e) => {
        if (isDesktop.matches) return;
        if (e.target.closest('.mega-panel-mobile')) return;
        if (e.target.closest('a')) return;
        e.preventDefault();
        const expanded = navSection.getAttribute('aria-expanded') === 'true';
        navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });

      // Keyboard accessibility
      navSection.setAttribute('tabindex', '0');
      navSection.addEventListener('keydown', (e) => {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          const wrapper = nav.closest('.nav-wrapper');
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          if (expanded) closeAllPanels(wrapper);
          else openPanel(navSection, wrapper);
        }
      });
    });

    // Keep hover alive when mouse enters a mega-panel
    panelsContainer.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
    });
    panelsContainer.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        const wrapper = nav.closest('.nav-wrapper');
        closeAllPanels(wrapper);
      }, HOVER_DELAY);
    });

    // Strip button classes from links in nav sections
    sectionsSection.querySelectorAll('.button-container').forEach((bc) => {
      bc.classList.remove('button-container');
      const btn = bc.querySelector('.button');
      if (btn) btn.classList.remove('button');
    });

    // Strip button decoration from mega-panel links
    panelsContainer.querySelectorAll('.button-container').forEach((bc) => {
      bc.className = '';
    });
    panelsContainer.querySelectorAll('.button').forEach((btn) => {
      btn.classList.remove('button');
    });
    sectionsSection.querySelectorAll('.mega-panel-mobile .button-container').forEach((bc) => {
      bc.className = '';
    });
    sectionsSection.querySelectorAll('.mega-panel-mobile .button').forEach((btn) => {
      btn.classList.remove('button');
    });
  }

  // Tools — handle search
  if (toolsSection) {
    toolsSection.classList.add('nav-tools');
    const searchLink = toolsSection.querySelector('a.nav-search, a[href*="search"]');
    if (searchLink) {
      const searchBtn = document.createElement('button');
      searchBtn.className = 'nav-search-btn';
      searchBtn.setAttribute('aria-label', 'Search');
      searchBtn.innerHTML = '<span class="icon icon-search"></span> Search';
      searchLink.closest('p')?.replaceWith(searchBtn);
    }
  }

  // Hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, sectionsSection));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, sectionsSection, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, sectionsSection, isDesktop.matches));

  // Overlay for desktop mega-menu backdrop
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.addEventListener('click', () => {
    const wrapper = nav.closest('.nav-wrapper');
    if (wrapper) closeAllPanels(wrapper);
  });

  // Click outside to close
  document.addEventListener('click', closeOnClickOutside);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  if (announcementSection) {
    nav.removeChild(announcementSection);
    navWrapper.append(announcementSection);
  }
  navWrapper.append(nav, panelsContainer);
  block.append(navWrapper, overlay);

  // Ensure panels are closed on initial load
  closeAllPanels(navWrapper);

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    navWrapper.append(await buildBreadcrumbs());
  }
}
