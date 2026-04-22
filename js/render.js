const Render = (() => {
  const grid = document.getElementById('card-grid');
  const emptyState = document.getElementById('empty-state');
  const searchInfo = document.getElementById('search-info');

  function _tags(tags) {
    if (!tags || !tags.length) return '';
    return tags.map(t => `<span class="tag">#${t}</span>`).join('');
  }

  function _badge(cat) {
    return cat ? `<span class="badge">${cat}</span>` : '';
  }

  function _formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function card(item) {
    const el = document.createElement('article');
    el.className = 'card';
    el.setAttribute('role', 'listitem');
    el.dataset.id = item.id;

    el.innerHTML = `
      <div class="card__header">
        <span class="card__name">${_esc(item.name)}</span>
        <div class="card__actions">
          <button class="card__action-btn" data-action="edit" aria-label="수정" title="수정">✏️</button>
          <button class="card__action-btn card__action-btn--delete" data-action="delete" aria-label="삭제" title="삭제">🗑️</button>
        </div>
      </div>
      <p class="card__desc">${_esc(item.description || '설명 없음')}</p>
      <div class="card__footer">
        ${_badge(item.category)}
        ${_tags(item.tags)}
      </div>
    `;

    el.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'edit') { e.stopPropagation(); window.App.openEdit(item.id); }
      else if (action === 'delete') { e.stopPropagation(); window.App.confirmDelete(item.id); }
      else { window.App.openDetail(item.id); }
    });

    return el;
  }

  function _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderList(items, total) {
    grid.innerHTML = '';
    if (!items.length) {
      emptyState.hidden = false;
      searchInfo.textContent = '';
    } else {
      emptyState.hidden = true;
      items.forEach(item => grid.appendChild(card(item)));
      searchInfo.textContent = total !== items.length
        ? `${total}개 중 ${items.length}개 표시`
        : `총 ${total}개 항목`;
    }
  }

  function populateCategorySelects(categories) {
    const selects = ['category-filter', 'form-category'];
    selects.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const current = el.value;
      const isFilter = id === 'category-filter';
      el.innerHTML = isFilter
        ? '<option value="">전체 카테고리</option>'
        : '<option value="">선택 없음</option>';
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        el.appendChild(opt);
      });
      if (current) el.value = current;
    });
  }

  function formatDate(iso) { return _formatDate(iso); }
  function esc(str) { return _esc(str); }

  return { renderList, populateCategorySelects, formatDate, esc };
})();
