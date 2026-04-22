const Storage = (() => {
  const KEYS = {
    ITEMS: 'glossary_items',
    THEME: 'glossary_theme',
    CATEGORIES: 'glossary_categories',
  };

  const DEFAULT_CATEGORIES = ['Git', 'Linux', 'JavaScript', 'Python', 'Docker', '기타'];
  const STORAGE_WARN_BYTES = 4 * 1024 * 1024; // 4MB

  function _get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  function _set(key, value) {
    try {
      const str = JSON.stringify(value);
      localStorage.setItem(key, str);
      _checkQuota();
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        alert('저장 공간이 가득 찼습니다. 일부 항목을 내보낸 후 삭제해주세요.');
      }
      return false;
    }
  }

  function _checkQuota() {
    let total = 0;
    for (const k in localStorage) {
      if (!localStorage.hasOwnProperty(k)) continue;
      total += (localStorage.getItem(k) || '').length * 2;
    }
    if (total > STORAGE_WARN_BYTES) {
      console.warn(`[Glossary] LocalStorage 사용량: ${(total / 1024).toFixed(0)}KB — 5MB 한도 근접`);
    }
  }

  /* ── Items ── */
  function getItems() { return _get(KEYS.ITEMS, []); }

  function saveItem(data) {
    const items = getItems();
    const now = new Date().toISOString();
    if (data.id) {
      const idx = items.findIndex(i => i.id === data.id);
      if (idx !== -1) { items[idx] = { ...items[idx], ...data, updatedAt: now }; }
    } else {
      items.unshift({ ...data, id: Date.now(), createdAt: now, updatedAt: now });
    }
    return _set(KEYS.ITEMS, items) ? getItems() : null;
  }

  function deleteItem(id) {
    const items = getItems().filter(i => i.id !== id);
    _set(KEYS.ITEMS, items);
    return items;
  }

  function getItem(id) { return getItems().find(i => i.id === id) || null; }

  /* ── Theme ── */
  function getTheme() { return _get(KEYS.THEME, 'dark'); }
  function setTheme(val) { _set(KEYS.THEME, val); }

  /* ── Categories ── */
  function getCategories() {
    const saved = _get(KEYS.CATEGORIES, null);
    if (!saved) {
      _set(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES.slice();
    }
    return saved;
  }
  function addCategory(name) {
    const cats = getCategories();
    if (!cats.includes(name)) { cats.push(name); _set(KEYS.CATEGORIES, cats); }
    return cats;
  }

  /* ── Bulk (Backup) ── */
  function exportAll() {
    return { items: getItems(), categories: getCategories(), exportedAt: new Date().toISOString() };
  }

  function importAll(data, mode = 'merge') {
    if (!Array.isArray(data.items)) throw new Error('올바른 백업 파일이 아닙니다.');
    if (mode === 'overwrite') {
      _set(KEYS.ITEMS, data.items);
    } else {
      const existing = getItems();
      const existingIds = new Set(existing.map(i => i.id));
      const merged = [...data.items.filter(i => !existingIds.has(i.id)), ...existing];
      _set(KEYS.ITEMS, merged);
    }
    if (Array.isArray(data.categories)) {
      const cats = getCategories();
      data.categories.forEach(c => { if (!cats.includes(c)) cats.push(c); });
      _set(KEYS.CATEGORIES, cats);
    }
    return getItems();
  }

  return { getItems, saveItem, deleteItem, getItem, getTheme, setTheme, getCategories, addCategory, exportAll, importAll };
})();
