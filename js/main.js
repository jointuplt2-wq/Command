/* ── Toast ── */
const Toast = (() => {
  const container = document.getElementById('toast-container');
  function show(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('toast--out');
      el.addEventListener('animationend', () => el.remove());
    }, 2800);
  }
  return { show };
})();

/* ── App ── */
window.App = (() => {
  let _deleteTargetId = null;

  /* ── Refs ── */
  const formBackdrop    = document.getElementById('form-backdrop');
  const formTitle       = document.getElementById('form-modal-title');
  const itemForm        = document.getElementById('item-form');
  const formId          = document.getElementById('form-id');
  const formName        = document.getElementById('form-name');
  const formDesc        = document.getElementById('form-desc');
  const formTags        = document.getElementById('form-tags');
  const errorName       = document.getElementById('error-name');

  const detailBackdrop  = document.getElementById('detail-backdrop');
  const detailTitle     = document.getElementById('detail-modal-title');
  const detailCat       = document.getElementById('detail-category');
  const detailDesc      = document.getElementById('detail-desc');
  const detailTags      = document.getElementById('detail-tags');
  const detailMeta      = document.getElementById('detail-meta');
  const detailEditBtn   = document.getElementById('detail-edit');
  const detailDeleteBtn = document.getElementById('detail-delete');

  const confirmBackdrop = document.getElementById('confirm-backdrop');
  const searchInput     = document.getElementById('search-input');
  const importFileInput = document.getElementById('import-file');

  /* ── 커스텀 드롭다운 인스턴스 ── */
  let filterSelect, formCatSelect;

  /* ── Core Refresh ── */
  function refresh() {
    const all = Storage.getItems();
    const filtered = Search.filter(all);
    Render.renderList(filtered, all.length);
  }

  /* ── Category 옵션 동기화 ── */
  function refreshCategories() {
    const cats = Storage.getCategories();

    const filterOpts = [{ value: '', text: '전체 카테고리' }, ...cats.map(c => ({ value: c, text: c }))];
    filterSelect.setOptions(filterOpts);

    const formOpts = [{ value: '', text: '선택 없음' }, ...cats.map(c => ({ value: c, text: c }))];
    formCatSelect.setOptions(formOpts);
  }

  /* ── Form Modal ── */
  function openAdd() {
    formId.value = '';
    itemForm.reset();
    errorName.textContent = '';
    formName.classList.remove('error');
    formTitle.textContent = '새 항목 추가';
    refreshCategories();
    formCatSelect.reset();
    setModalVisible(formBackdrop, true);
    setTimeout(() => formName.focus(), 100);
  }

  function openEdit(id) {
    const item = Storage.getItem(id);
    if (!item) return;
    formId.value = item.id;
    formName.value = item.name || '';
    formDesc.value = item.description || '';
    formTags.value = (item.tags || []).join(', ');
    errorName.textContent = '';
    formName.classList.remove('error');
    formTitle.textContent = '항목 수정';
    refreshCategories();
    formCatSelect.setValue(item.category || '');
    closeDetail();
    setModalVisible(formBackdrop, true);
    setTimeout(() => formName.focus(), 100);
  }

  function closeForm() { setModalVisible(formBackdrop, false); }

  function handleFormSubmit(e) {
    e.preventDefault();
    const name = formName.value.trim();
    if (!name) {
      errorName.textContent = '용어명을 입력해주세요.';
      formName.classList.add('error');
      formName.focus();
      return;
    }
    errorName.textContent = '';
    formName.classList.remove('error');

    const tags = formTags.value.split(',').map(t => t.trim()).filter(Boolean);
    const data = {
      id: formId.value ? Number(formId.value) : undefined,
      name,
      category: formCatSelect.getValue(),
      description: formDesc.value.trim(),
      tags,
    };

    Storage.saveItem(data);
    closeForm();
    refresh();
    Toast.show(data.id ? '항목이 수정되었습니다.' : '항목이 저장되었습니다.', 'success');
  }

  /* ── Detail Modal ── */
  function openDetail(id) {
    const item = Storage.getItem(id);
    if (!item) return;
    detailTitle.textContent = item.name;
    detailCat.textContent = item.category || '';
    detailCat.style.display = item.category ? '' : 'none';
    detailDesc.textContent = item.description || '설명 없음';
    detailTags.innerHTML = (item.tags || []).map(t => `<span class="tag">#${t}</span>`).join('');
    detailMeta.textContent = `등록: ${Render.formatDate(item.createdAt)}  |  수정: ${Render.formatDate(item.updatedAt)}`;
    detailEditBtn.onclick = () => openEdit(item.id);
    detailDeleteBtn.onclick = () => { closeDetail(); confirmDelete(item.id); };
    setModalVisible(detailBackdrop, true);
  }

  function closeDetail() { setModalVisible(detailBackdrop, false); }

  /* ── Delete Confirm ── */
  function confirmDelete(id) {
    _deleteTargetId = id;
    setModalVisible(confirmBackdrop, true);
  }
  function closeConfirm() {
    _deleteTargetId = null;
    setModalVisible(confirmBackdrop, false);
  }
  function handleDeleteConfirm() {
    if (!_deleteTargetId) return;
    Storage.deleteItem(_deleteTargetId);
    closeConfirm();
    refresh();
    Toast.show('항목이 삭제되었습니다.', 'info');
  }

  /* ── Modal Visibility ── */
  function setModalVisible(backdrop, visible) {
    backdrop.hidden = !visible;
    backdrop.setAttribute('aria-hidden', String(!visible));
    document.body.style.overflow = visible ? 'hidden' : '';
  }

  function handleBackdropClick(backdrop, closeFn) {
    backdrop.addEventListener('click', e => { if (e.target === backdrop) closeFn(); });
  }

  /* ── Add Category ── */
  function promptAddCategory() {
    const name = window.prompt('새 카테고리 이름을 입력하세요:')?.trim();
    if (!name) return;
    Storage.addCategory(name);
    refreshCategories();
    formCatSelect.setValue(name);
  }

  /* ── Search & Filter ── */
  function handleSearch() {
    Search.setKeyword(searchInput.value);
    refresh();
  }

  /* ── Keyboard ── */
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      if (!confirmBackdrop.hidden) closeConfirm();
      else if (!formBackdrop.hidden) closeForm();
      else if (!detailBackdrop.hidden) closeDetail();
    }
  }

  /* ── Init ── */
  function init() {
    Theme.init();

    /* 커스텀 드롭다운 초기화 */
    filterSelect = createCustomSelect({
      btnId: 'category-filter-btn',
      labelId: 'category-filter-label',
      listId: 'category-filter-list',
      wrapperId: 'category-filter-wrap',
      placeholder: '전체 카테고리',
    });
    filterSelect.onChange(val => {
      Search.setCategory(val);
      refresh();
    });

    formCatSelect = createCustomSelect({
      btnId: 'form-category-btn',
      labelId: 'form-category-label',
      listId: 'form-category-list',
      wrapperId: 'form-category-wrap',
      placeholder: '선택 없음',
    });

    refreshCategories();
    refresh();

    /* Form */
    document.getElementById('btn-add').addEventListener('click', openAdd);
    document.getElementById('form-close').addEventListener('click', closeForm);
    document.getElementById('form-cancel').addEventListener('click', closeForm);
    document.getElementById('btn-add-category').addEventListener('click', promptAddCategory);
    itemForm.addEventListener('submit', handleFormSubmit);
    handleBackdropClick(formBackdrop, closeForm);

    /* Detail */
    document.getElementById('detail-close').addEventListener('click', closeDetail);
    handleBackdropClick(detailBackdrop, closeDetail);

    /* Confirm */
    document.getElementById('confirm-cancel').addEventListener('click', closeConfirm);
    document.getElementById('confirm-ok').addEventListener('click', handleDeleteConfirm);
    handleBackdropClick(confirmBackdrop, closeConfirm);

    /* Search */
    searchInput.addEventListener('input', handleSearch);

    /* Backup */
    document.getElementById('btn-export').addEventListener('click', () => Backup.exportJSON());
    document.getElementById('btn-import').addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) Backup.importJSON(file, () => { refreshCategories(); refresh(); });
      importFileInput.value = '';
    });

    /* Keyboard */
    document.addEventListener('keydown', handleKeydown);

    /* Scroll To Top */
    const scrollTopBtn = document.getElementById('btn-scroll-top');
    window.addEventListener('scroll', () => {
      scrollTopBtn.hidden = window.scrollY < 300;
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  return { init, openEdit, openDetail, confirmDelete };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
