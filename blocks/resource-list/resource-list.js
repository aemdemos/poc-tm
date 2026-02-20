import { createOptimizedPicture } from '../../scripts/aem.js';

const PAGE_SIZE = 9;

// Map template names to display labels and URL path prefixes
const TYPE_MAP = {
  'blog-article': { label: 'Blog', paths: ['/blog/'] },
  news: { label: 'News', paths: ['/news/'] },
  'gated-resource': { label: 'White Papers & Reports', paths: ['/white-papers/', '/playbooks/', '/webinars/', '/analyst-report/'] },
  'case-study': { label: 'Case Studies', paths: ['/case-studies/'] },
  podcast: { label: 'Podcasts', paths: ['/podcasts/'] },
  video: { label: 'Videos', paths: ['/videos/'] },
  infographic: { label: 'Infographics', paths: ['/infographics/'] },
  legislative: { label: 'Legislative', paths: ['/legislative-highlights/'] },
};

// Derive resource type from path if template is missing
function getResourceType(item) {
  if (item.template && TYPE_MAP[item.template]) {
    return item.template;
  }
  // Fallback: match by path
  const matched = Object.entries(TYPE_MAP).find(
    ([, { paths }]) => paths.some((p) => item.path.includes(p)),
  );
  return matched ? matched[0] : 'blog-article';
}

function getTypeLabel(type) {
  return TYPE_MAP[type]?.label || type;
}

function getAllTags(data) {
  const tags = new Set();
  data.forEach((item) => {
    if (item.tags) {
      item.tags.split(',').map((t) => t.trim()).filter(Boolean).forEach((t) => tags.add(t));
    }
  });
  return [...tags].sort();
}

function getAllTypes(data) {
  const types = new Set();
  data.forEach((item) => {
    types.add(getResourceType(item));
  });
  return [...types].sort((a, b) => {
    const la = getTypeLabel(a);
    const lb = getTypeLabel(b);
    return la.localeCompare(lb);
  });
}

function renderCard(item) {
  const card = document.createElement('li');
  card.className = 'resource-card';

  const a = document.createElement('a');
  a.href = item.path;

  if (item.image) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'resource-card-image';
    const pic = createOptimizedPicture(item.image, item.title, false, [{ width: '400' }]);
    imgWrap.append(pic);
    a.append(imgWrap);
  }

  const body = document.createElement('div');
  body.className = 'resource-card-body';

  const typeBadge = document.createElement('span');
  typeBadge.className = 'resource-card-type';
  typeBadge.textContent = getTypeLabel(getResourceType(item));
  body.append(typeBadge);

  if (item.title) {
    const title = document.createElement('h3');
    title.textContent = item.title;
    body.append(title);
  }

  if (item.description) {
    const desc = document.createElement('p');
    desc.textContent = item.description.length > 160
      ? `${item.description.substring(0, 157)}...`
      : item.description;
    body.append(desc);
  }

  const cta = document.createElement('span');
  cta.className = 'resource-card-cta';
  cta.textContent = `View ${getTypeLabel(getResourceType(item))}`;
  body.append(cta);

  a.append(body);
  card.append(a);
  return card;
}

function createFilterBar(types, tags, state) {
  const bar = document.createElement('div');
  bar.className = 'resource-filters';

  // Type filter
  const typeSection = document.createElement('div');
  typeSection.className = 'filter-group';

  const typeLabel = document.createElement('span');
  typeLabel.className = 'filter-label';
  typeLabel.textContent = 'Type';
  typeSection.append(typeLabel);

  const typeAll = document.createElement('button');
  typeAll.className = 'filter-btn active';
  typeAll.dataset.type = '';
  typeAll.textContent = 'All';
  typeSection.append(typeAll);

  types.forEach((type) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.type = type;
    btn.textContent = getTypeLabel(type);
    if (state.type === type) {
      btn.classList.add('active');
      typeAll.classList.remove('active');
    }
    typeSection.append(btn);
  });

  bar.append(typeSection);

  // Topic filter (dropdown)
  const topicSection = document.createElement('div');
  topicSection.className = 'filter-group';

  const topicLabel = document.createElement('span');
  topicLabel.className = 'filter-label';
  topicLabel.textContent = 'Topic';
  topicSection.append(topicLabel);

  const select = document.createElement('select');
  select.className = 'filter-select';
  const optAll = document.createElement('option');
  optAll.value = '';
  optAll.textContent = 'All Topics';
  select.append(optAll);

  tags.forEach((tag) => {
    const opt = document.createElement('option');
    opt.value = tag;
    opt.textContent = tag;
    if (state.tag === tag) opt.selected = true;
    select.append(opt);
  });

  topicSection.append(select);
  bar.append(topicSection);

  // Search input
  const searchSection = document.createElement('div');
  searchSection.className = 'filter-group filter-search';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'filter-search-input';
  searchInput.placeholder = 'Search resources...';
  searchInput.value = state.q || '';
  searchSection.append(searchInput);

  bar.append(searchSection);

  return bar;
}

function filterData(data, state) {
  return data.filter((item) => {
    if (state.type && getResourceType(item) !== state.type) return false;
    if (state.tag) {
      const itemTags = (item.tags || '').split(',').map((t) => t.trim().toLowerCase());
      if (!itemTags.includes(state.tag.toLowerCase())) return false;
    }
    if (state.q) {
      const q = state.q.toLowerCase();
      const searchable = `${item.title} ${item.description} ${item.tags || ''}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });
}

function updateUrl(state) {
  const url = new URL(window.location.href);
  if (state.type) url.searchParams.set('type', state.type);
  else url.searchParams.delete('type');
  if (state.tag) url.searchParams.set('tag', state.tag);
  else url.searchParams.delete('tag');
  if (state.q) url.searchParams.set('q', state.q);
  else url.searchParams.delete('q');
  window.history.replaceState({}, '', url.toString());
}

function render(block, data, state) {
  const filtered = filterData(data, state);
  const visible = filtered.slice(0, state.page * PAGE_SIZE);

  // Update results container
  const results = block.querySelector('.resource-results');
  results.innerHTML = '';

  if (visible.length === 0) {
    const noResults = document.createElement('p');
    noResults.className = 'no-results';
    noResults.textContent = 'No resources match your filters. Try adjusting your selection.';
    results.append(noResults);
  } else {
    const grid = document.createElement('ul');
    grid.className = 'resource-grid';
    visible.forEach((item) => grid.append(renderCard(item)));
    results.append(grid);
  }

  // Update count
  const count = block.querySelector('.resource-count');
  count.textContent = `Showing ${visible.length} of ${filtered.length} resources`;

  // Load more button
  let loadMore = block.querySelector('.load-more');
  if (!loadMore) {
    loadMore = document.createElement('button');
    loadMore.className = 'load-more';
    loadMore.textContent = 'Load More';
    block.querySelector('.resource-footer').append(loadMore);
  }
  loadMore.style.display = visible.length < filtered.length ? '' : 'none';

  // Update active filter buttons
  block.querySelectorAll('.filter-btn[data-type]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.type === (state.type || ''));
  });

  updateUrl(state);
}

export default async function decorate(block) {
  // Read data source from block content or default
  const source = block.querySelector('a[href]')?.href || '/content/query-index.json';

  // Parse URL params for initial state
  const params = new URLSearchParams(window.location.search);
  const state = {
    type: params.get('type') || '',
    tag: params.get('tag') || '',
    q: params.get('q') || '',
    page: 1,
  };

  // Fetch data
  block.innerHTML = '<p class="loading">Loading resources...</p>';
  let data;
  try {
    const resp = await fetch(source);
    const json = await resp.json();
    data = json.data || [];
  } catch (err) {
    block.innerHTML = '<p class="error">Unable to load resources.</p>';
    return;
  }

  // Filter out non-resource pages (solutions, company, etc.)
  const resourceTemplates = new Set(Object.keys(TYPE_MAP));
  const resourcePaths = Object.values(TYPE_MAP).flatMap((t) => t.paths);
  data = data.filter((item) => {
    if (item.template && resourceTemplates.has(item.template)) return true;
    return resourcePaths.some((p) => item.path.includes(p));
  });

  const types = getAllTypes(data);
  const tags = getAllTags(data);

  // Build UI
  block.innerHTML = '';

  const filters = createFilterBar(types, tags, state);
  block.append(filters);

  const countEl = document.createElement('p');
  countEl.className = 'resource-count';
  block.append(countEl);

  const results = document.createElement('div');
  results.className = 'resource-results';
  block.append(results);

  const footer = document.createElement('div');
  footer.className = 'resource-footer';
  block.append(footer);

  // Initial render
  render(block, data, state);

  // Event listeners
  let debounceTimer;

  filters.querySelectorAll('.filter-btn[data-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.type = btn.dataset.type;
      state.page = 1;
      render(block, data, state);
    });
  });

  filters.querySelector('.filter-select').addEventListener('change', (e) => {
    state.tag = e.target.value;
    state.page = 1;
    render(block, data, state);
  });

  filters.querySelector('.filter-search-input').addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.q = e.target.value;
      state.page = 1;
      render(block, data, state);
    }, 300);
  });

  footer.addEventListener('click', (e) => {
    if (e.target.classList.contains('load-more')) {
      state.page += 1;
      render(block, data, state);
    }
  });
}
