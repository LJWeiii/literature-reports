(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('[data-theme-toggle]');
  const themes = ['system', 'light', 'dark'];

  function themeLabel(theme) {
    return theme === 'dark' ? '深色模式' : theme === 'light' ? '浅色模式' : '跟随系统';
  }

  function updateThemeButton() {
    if (!themeButton) return;
    themeButton.title = `当前：${themeLabel(root.dataset.theme)}；点击切换`;
    themeButton.setAttribute('aria-label', themeButton.title);
  }

  themeButton?.addEventListener('click', () => {
    const current = root.dataset.theme || 'system';
    const next = themes[(themes.indexOf(current) + 1) % themes.length];
    root.dataset.theme = next;
    localStorage.setItem('literature-theme', next);
    updateThemeButton();
  });
  updateThemeButton();

  document.querySelector('[data-report-select]')?.addEventListener('change', (event) => {
    if (event.target.value) window.location.href = event.target.value;
  });

  const archiveButton = document.querySelector('[data-archive-toggle]');
  const archiveSidebar = document.querySelector('[data-archive-sidebar]');
  archiveButton?.addEventListener('click', () => {
    const open = archiveSidebar?.classList.toggle('is-open') || false;
    archiveButton.setAttribute('aria-expanded', String(open));
  });

  const input = document.querySelector('[data-site-search]');
  const results = document.querySelector('[data-search-results]');
  if (!input || !results) return;

  let reports = [];
  fetch(document.body.dataset.indexUrl)
    .then((response) => {
      if (!response.ok) throw new Error('index unavailable');
      return response.json();
    })
    .then((data) => { reports = Array.isArray(data) ? data : []; })
    .catch(() => { input.placeholder = '搜索索引暂不可用'; });

  function escapeHtml(value) {
    const node = document.createElement('span');
    node.textContent = value;
    return node.innerHTML;
  }

  input.addEventListener('input', () => {
    const query = input.value.trim().toLocaleLowerCase();
    if (!query) {
      results.hidden = true;
      results.innerHTML = '';
      return;
    }
    const matches = reports.filter((item) =>
      `${item.title} ${item.search_text}`.toLocaleLowerCase().includes(query)
    ).slice(0, 20);
    results.innerHTML = matches.length
      ? matches.map((item) => `
          <a href="${escapeHtml((document.body.dataset.base || '') + item.url)}">
            <span>${escapeHtml(item.display_date)}</span>
            <strong>${escapeHtml(item.title)}</strong>
            <small>${escapeHtml(item.summary)}</small>
          </a>`).join('')
      : '<p>没有匹配的周报。</p>';
    results.hidden = false;
  });
})();
