const Storage = (() => {
  const KEYS = {
    ITEMS: 'glossary_items',
    THEME: 'glossary_theme',
    CATEGORIES: 'glossary_categories',
    SEEDED: 'glossary_seeded',
  };

  const DEFAULT_CATEGORIES = ['Git', 'Linux', 'JavaScript', 'Python', 'Docker', 'Claude Code', '기타'];
  const STORAGE_WARN_BYTES = 4 * 1024 * 1024;

  /* ── 기본 내장 데이터 ── */
  const now = new Date().toISOString();
  const mk = (id, name, category, description, tags) => ({
    id, name, category, description, tags, createdAt: now, updatedAt: now
  });

  const SEED_ITEMS = [
    /* ── Git ── */
    mk(2001,'git init','Git','현재 디렉터리를 새로운 Git 저장소로 초기화한다. .git 폴더가 생성되며, 이후 모든 Git 작업의 기준이 된다.',['init','저장소','초기화']),
    mk(2002,'git clone <url>','Git','원격 저장소를 로컬로 복제한다. --depth 1 옵션으로 최신 커밋만 얕게 받아올 수 있다.',['clone','원격','복제']),
    mk(2003,'git status','Git','현재 작업 디렉터리와 스테이징 영역의 상태를 보여준다. 변경된 파일, 스테이지된 파일, 추적되지 않는 파일을 구분해 표시한다.',['status','상태']),
    mk(2004,'git add <파일>','Git','변경된 파일을 스테이징 영역에 추가한다. git add . 은 모든 변경사항을, git add -p 는 변경 단위를 선택적으로 추가한다.',['add','stage','스테이징']),
    mk(2005,'git commit -m "<메시지>"','Git','스테이징된 변경사항을 로컬 저장소에 커밋한다. --amend 옵션으로 직전 커밋을 수정할 수 있다.',['commit','메시지','저장']),
    mk(2006,'git push <원격> <브랜치>','Git','로컬 커밋을 원격 저장소에 업로드한다. 최초 push 시 -u 옵션으로 추적 브랜치를 설정한다.',['push','업로드','원격']),
    mk(2007,'git pull','Git','원격 저장소의 변경사항을 가져와 현재 브랜치에 병합(fetch + merge)한다. --rebase 옵션으로 리베이스를 사용할 수 있다.',['pull','fetch','merge','동기화']),
    mk(2008,'git fetch','Git','원격 저장소의 변경사항을 로컬로 가져오되 자동 병합하지 않는다. 확인 후 직접 merge나 rebase를 수행해야 한다.',['fetch','원격','동기화']),
    mk(2009,'git branch','Git','브랜치 목록을 출력한다. -d로 삭제, -m으로 이름 변경, -a로 원격 포함 전체 목록을 볼 수 있다.',['branch','브랜치','목록']),
    mk(2010,'git checkout <브랜치>','Git','지정한 브랜치로 전환하거나 특정 커밋 상태로 이동한다. -b 옵션으로 새 브랜치를 만들며 전환한다.',['checkout','전환','브랜치']),
    mk(2011,'git switch <브랜치>','Git','checkout의 브랜치 전환 역할만 분리한 최신 명령어. -c 옵션으로 새 브랜치 생성 후 전환한다. (Git 2.23+)',['switch','브랜치','전환']),
    mk(2012,'git merge <브랜치>','Git','지정한 브랜치를 현재 브랜치로 병합한다. --no-ff로 항상 병합 커밋 생성, --squash로 하나의 커밋으로 압축 병합한다.',['merge','병합','브랜치']),
    mk(2013,'git rebase <브랜치>','Git','현재 브랜치의 베이스를 다른 브랜치의 최신 커밋으로 변경한다. 선형 히스토리를 유지하지만 공유 브랜치에서는 사용을 피한다.',['rebase','히스토리','베이스']),
    mk(2014,'git log','Git','커밋 히스토리를 출력한다. --oneline 간결하게, --graph 시각화, --author 작성자 필터, -n 개수 제한이 가능하다.',['log','히스토리','커밋']),
    mk(2015,'git diff','Git','변경 내용을 비교한다. git diff는 워킹트리 vs 스테이지, --staged는 스테이지 vs 최신 커밋, 브랜치 간 비교도 가능하다.',['diff','비교','변경']),
    mk(2016,'git stash','Git','현재 변경사항을 임시 저장하고 워킹트리를 초기화한다. pop으로 복원, list로 목록 확인, drop으로 삭제한다.',['stash','임시저장','워킹트리']),
    mk(2017,'git reset','Git','커밋을 취소한다. --soft(커밋만 취소), --mixed(스테이지 해제, 기본값), --hard(워킹트리까지, 데이터 손실 주의) 세 가지 모드가 있다.',['reset','취소','되돌리기']),
    mk(2018,'git revert <커밋해시>','Git','특정 커밋의 변경사항을 되돌리는 새 커밋을 생성한다. 히스토리를 보존하므로 공유 브랜치에서 안전하게 사용할 수 있다.',['revert','되돌리기','안전']),
    mk(2019,'git cherry-pick <커밋해시>','Git','다른 브랜치의 특정 커밋만 선택해 현재 브랜치에 적용한다. -n 옵션으로 커밋 없이 변경사항만 가져올 수 있다.',['cherry-pick','선택','커밋']),
    mk(2020,'git tag <태그명>','Git','특정 커밋에 태그를 붙인다. -a 옵션으로 주석 태그를 생성하고, push 시 명시적으로 전송해야 한다.',['tag','버전','릴리스']),
    mk(2021,'git remote','Git','원격 저장소를 관리한다. -v로 목록 확인, add로 추가, remove로 삭제한다.',['remote','원격','저장소']),
    mk(2022,'git blame <파일>','Git','파일의 각 라인을 마지막으로 수정한 커밋과 작성자를 표시한다. 버그 도입 시점을 추적할 때 유용하다.',['blame','작성자','추적']),
    mk(2023,'git bisect','Git','이진 탐색으로 버그가 도입된 커밋을 찾는다. start → bad → good 순으로 사용하며 자동으로 범위를 절반씩 좁혀간다.',['bisect','이진탐색','디버깅']),
    mk(2024,'git reflog','Git','HEAD가 이동한 모든 기록을 보여준다. reset --hard 실수 후에도 이 로그로 복구할 수 있다.',['reflog','복구','HEAD']),
    mk(2025,'git clean','Git','추적되지 않는 파일과 디렉터리를 삭제한다. -n으로 미리 확인, -f로 강제 삭제, -d로 디렉터리까지 삭제한다.',['clean','삭제','untracked']),
    mk(2026,'git config','Git','Git 설정을 조회하거나 변경한다. --global로 전역, --local로 저장소별 설정이 가능하다. 이름·이메일·에디터·alias 등을 설정한다.',['config','설정','전역']),
    mk(2027,'git show <커밋해시>','Git','특정 커밋의 상세 정보와 변경 내용을 출력한다. 태그나 브랜치명도 사용 가능하다.',['show','상세','커밋']),
    mk(2028,'git shortlog','Git','작성자별로 그룹화된 커밋 요약을 출력한다. -s -n 옵션으로 기여자별 커밋 수를 정렬해 볼 수 있다.',['shortlog','요약','기여자']),
    mk(2029,'git worktree','Git','하나의 저장소에서 여러 브랜치를 동시에 다른 디렉터리에 체크아웃할 수 있다. 브랜치 전환 없이 병렬 작업이 가능하다.',['worktree','병렬','브랜치']),
    mk(2030,'git submodule','Git','다른 Git 저장소를 현재 저장소의 서브디렉터리로 포함한다. add로 추가, update --init --recursive로 초기화한다.',['submodule','서브모듈','의존성']),
    /* ── Claude Code ── */
    mk(3001,'/help','Claude Code','사용 가능한 모든 슬래시 명령어와 단축키 목록을 표시한다.',['슬래시','도움말','명령어']),
    mk(3002,'/clear','Claude Code','현재 대화 컨텍스트를 초기화한다. 새로운 작업 시작이나 토큰 절약 시 사용한다.',['clear','초기화','컨텍스트']),
    mk(3003,'/compact','Claude Code','대화 히스토리를 요약·압축하여 컨텍스트 창을 절약한다. 긴 세션에서 토큰 한계 전에 사용한다.',['compact','압축','컨텍스트']),
    mk(3004,'/cost','Claude Code','현재 세션에서 사용한 토큰 수와 예상 비용을 표시한다.',['cost','비용','토큰']),
    mk(3005,'/doctor','Claude Code','Claude Code 설치 상태, 설정, 권한 등을 진단하고 문제를 보고한다.',['doctor','진단','설정']),
    mk(3006,'/init','Claude Code','현재 프로젝트를 분석해 CLAUDE.md 파일을 자동 생성한다. 코드베이스 구조, 주요 패턴, 명령어 등이 기록된다.',['init','CLAUDE.md','초기화']),
    mk(3007,'/login','Claude Code','Anthropic 계정 또는 API 키로 로그인한다.',['login','인증','계정']),
    mk(3008,'/logout','Claude Code','현재 로그인된 세션에서 로그아웃한다.',['logout','로그아웃','계정']),
    mk(3009,'/memory','Claude Code','CLAUDE.md 메모리 파일을 열어 편집한다. 프로젝트 규칙, 선호도, 컨텍스트를 지속적으로 기억시킬 수 있다.',['memory','메모리','CLAUDE.md']),
    mk(3010,'/model','Claude Code','사용할 Claude 모델을 변경한다. claude-opus-4-5, claude-sonnet-4-5 등을 세션 중 전환할 수 있다.',['model','모델','변경']),
    mk(3011,'/pr_comments','Claude Code','현재 브랜치의 GitHub PR 코멘트를 가져와 표시한다. PR 리뷰 피드백을 Claude와 함께 처리할 때 유용하다.',['pr','코멘트','GitHub']),
    mk(3012,'/review','Claude Code','현재 브랜치의 변경사항에 대한 코드 리뷰를 수행한다. 버그, 스타일, 보안 이슈 등을 종합 분석한다.',['review','코드리뷰','분석']),
    mk(3013,'/terminal-setup','Claude Code','터미널 환경(쉘 통합, 자동완성 등)을 설정한다.',['terminal','설정','쉘']),
    mk(3014,'/vim','Claude Code','Claude Code 입력창에서 Vim 키바인딩 모드를 활성화/비활성화한다.',['vim','키바인딩','편집기']),
    mk(3015,'/bug','Claude Code','버그 리포트를 작성하고 Anthropic에 전송한다. 현재 세션 정보가 함께 첨부된다.',['bug','리포트','신고']),
    mk(3016,'/exit','Claude Code','Claude Code CLI를 종료한다.',['exit','종료','cli']),
    mk(3017,'claude','Claude Code','Claude Code CLI의 기본 실행 명령어. 인수 없이 실행하면 대화형 세션이 시작된다.',['cli','실행','기본']),
    mk(3018,'claude "<프롬프트>"','Claude Code','프롬프트를 인수로 전달해 비대화형으로 실행한다. 스크립트나 파이프라인에서 활용한다.',['cli','프롬프트','비대화형']),
    mk(3019,'claude -p / --print','Claude Code','응답을 stdout으로 출력하고 대화형 세션 없이 종료한다. 다른 명령어와 파이프로 연결할 때 사용한다.',['print','stdout','파이프']),
    mk(3020,'claude --model <모델명>','Claude Code','실행 시 사용할 Claude 모델을 지정한다. 예: claude --model claude-opus-4-5',['model','모델','cli']),
    mk(3021,'claude --output-format <형식>','Claude Code','출력 형식을 지정한다. text(기본), json, stream-json 중 선택. 자동화·파싱 시 json 형식을 활용한다.',['output','json','형식']),
    mk(3022,'claude --verbose','Claude Code','디버깅용 상세 로그를 출력한다. 도구 호출, API 요청 등 내부 동작을 확인할 수 있다.',['verbose','디버그','로그']),
    mk(3023,'claude --add-dir <경로>','Claude Code','지정한 디렉터리를 Claude가 접근할 수 있는 컨텍스트에 추가한다. 여러 경로를 반복 사용해 추가할 수 있다.',['add-dir','경로','컨텍스트']),
    mk(3024,'claude --dangerously-skip-permissions','Claude Code','모든 권한 확인 프롬프트를 건너뛴다. CI/CD나 완전 자동화 환경에서만 사용. 보안 주의.',['skip','권한','자동화','ci']),
    mk(3025,'claude --no-stream','Claude Code','스트리밍을 비활성화하고 응답 전체를 한 번에 받는다. 일부 파이프라인 호환성 문제 해결 시 사용한다.',['stream','no-stream','출력']),
    mk(3026,'CLAUDE.md','Claude Code','Claude Code가 프로젝트 시작 시 자동으로 읽는 마크다운 파일. 프로젝트 규칙, 코딩 스타일, 주의사항 등을 기록해두면 매 세션 참고한다.',['CLAUDE.md','메모리','프로젝트','규칙']),
    mk(3027,'settings.json','Claude Code','Claude Code의 동작을 제어하는 설정 파일. ~/.claude/settings.json(전역)과 .claude/settings.json(프로젝트)로 구분된다. 허용 도구, 훅, 환경변수 등을 설정한다.',['settings','설정','json','훅']),
    mk(3028,'Hooks (훅)','Claude Code','Claude가 특정 이벤트(PreToolUse, PostToolUse, Stop 등) 발생 시 자동으로 실행할 쉘 명령어를 settings.json에 등록하는 기능. 자동화·로깅·검증 등에 활용한다.',['hook','훅','자동화','이벤트']),
    mk(3029,'MCP (Model Context Protocol)','Claude Code','Claude에 외부 도구와 데이터 소스를 연결하는 프로토콜. 파일 시스템, DB, API, 브라우저 등을 MCP 서버로 연결하면 Claude가 직접 사용할 수 있다.',['MCP','프로토콜','도구','서버']),
    mk(3030,'/permissions','Claude Code','현재 세션에서 허용된 도구와 권한 목록을 확인한다. allowedTools, deniedTools 설정 내용을 표시한다.',['permissions','권한','도구']),
  ];

  /* ── Private helpers ── */
  function _get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  function _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
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
      console.warn(`[Glossary] LocalStorage 사용량: ${(total / 1024).toFixed(0)}KB`);
    }
  }

  /* ── Seed (최초 방문 시 기본 데이터 삽입) ── */
  function _seed() {
    if (localStorage.getItem(KEYS.SEEDED)) return;
    _set(KEYS.ITEMS, SEED_ITEMS);
    _set(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    localStorage.setItem(KEYS.SEEDED, '1');
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
    if (!saved) { _set(KEYS.CATEGORIES, DEFAULT_CATEGORIES); return DEFAULT_CATEGORIES.slice(); }
    return saved;
  }
  function addCategory(name) {
    const cats = getCategories();
    if (!cats.includes(name)) { cats.push(name); _set(KEYS.CATEGORIES, cats); }
    return cats;
  }

  /* ── Backup ── */
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
      _set(KEYS.ITEMS, [...data.items.filter(i => !existingIds.has(i.id)), ...existing]);
    }
    if (Array.isArray(data.categories)) {
      const cats = getCategories();
      data.categories.forEach(c => { if (!cats.includes(c)) cats.push(c); });
      _set(KEYS.CATEGORIES, cats);
    }
    return getItems();
  }

  /* ── Init ── */
  _seed();

  return { getItems, saveItem, deleteItem, getItem, getTheme, setTheme, getCategories, addCategory, exportAll, importAll };
})();
