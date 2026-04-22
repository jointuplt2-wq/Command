const Search = (() => {
  let _keyword = '';
  let _category = '';

  function filter(items) {
    const kw = _keyword.trim().toLowerCase();
    return items.filter(item => {
      const matchCat = !_category || item.category === _category;
      if (!matchCat) return false;
      if (!kw) return true;
      const inName = item.name?.toLowerCase().includes(kw);
      const inDesc = item.description?.toLowerCase().includes(kw);
      const inTags = item.tags?.some(t => t.toLowerCase().includes(kw));
      return inName || inDesc || inTags;
    });
  }

  function setKeyword(val) { _keyword = val; }
  function setCategory(val) { _category = val; }
  function getKeyword() { return _keyword; }
  function getCategory() { return _category; }

  return { filter, setKeyword, setCategory, getKeyword, getCategory };
})();
