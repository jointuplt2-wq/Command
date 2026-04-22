const Backup = (() => {
  function exportJSON() {
    const data = Storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glossary-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.show('백업 파일이 다운로드되었습니다.', 'success');
  }

  function importJSON(file, onDone) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        const mode = window.confirm(
          '가져오기 방식을 선택하세요.\n\n[확인] 기존 데이터와 병합\n[취소] 기존 데이터를 덮어쓰기'
        ) ? 'merge' : 'overwrite';
        Storage.importAll(data, mode);
        Toast.show(`${data.items?.length || 0}개 항목을 가져왔습니다.`, 'success');
        onDone?.();
      } catch (err) {
        Toast.show('올바른 백업 파일이 아닙니다.', 'error');
      }
    };
    reader.readAsText(file);
  }

  return { exportJSON, importJSON };
})();
