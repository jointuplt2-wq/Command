const Theme = (() => {
  function apply(val) {
    document.documentElement.setAttribute('data-theme', val);
    Storage.setTheme(val);
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    apply(current === 'dark' ? 'light' : 'dark');
  }

  function init() {
    apply(Storage.getTheme());
    document.getElementById('btn-theme').addEventListener('click', toggle);
  }

  return { init };
})();
