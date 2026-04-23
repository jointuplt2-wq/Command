/**
 * CustomSelect — 네이티브 select를 대체하는 커스텀 드롭다운
 * createCustomSelect(config) → { getValue, setValue, setOptions, onChange }
 */
function createCustomSelect({ btnId, labelId, listId, wrapperId, placeholder = '선택 없음' }) {
  const btn     = document.getElementById(btnId);
  const label   = document.getElementById(labelId);
  const list    = document.getElementById(listId);
  const wrapper = document.getElementById(wrapperId);

  let _value = '';
  let _options = [];
  let _onChange = null;

  function open() {
    list.hidden = false;
    wrapper.classList.add('custom-select--open');
  }
  function close() {
    list.hidden = true;
    wrapper.classList.remove('custom-select--open');
  }
  function toggle() { list.hidden ? open() : close(); }

  function render() {
    list.innerHTML = '';
    _options.forEach(({ value, text }) => {
      const li = document.createElement('li');
      li.textContent = text;
      li.dataset.value = value;
      if (value === _value) li.setAttribute('aria-selected', 'true');
      li.addEventListener('click', () => {
        _value = value;
        label.textContent = text;
        close();
        renderSelected();
        _onChange?.(_value);
      });
      list.appendChild(li);
    });
  }

  function renderSelected() {
    list.querySelectorAll('li').forEach(li => {
      li.setAttribute('aria-selected', li.dataset.value === _value ? 'true' : 'false');
    });
  }

  btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  return {
    getValue() { return _value; },
    setValue(v) {
      _value = v;
      const opt = _options.find(o => o.value === v);
      label.textContent = opt ? opt.text : placeholder;
      renderSelected();
    },
    setOptions(opts) {
      _options = opts;
      const cur = _value;
      render();
      if (cur !== undefined) {
        _value = cur;
        renderSelected();
      }
    },
    onChange(fn) { _onChange = fn; },
    reset() {
      _value = '';
      label.textContent = placeholder;
      renderSelected();
    }
  };
}
