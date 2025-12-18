// 科目リスト（独自定義）
const SUBJECT_OPTIONS = [
    "理系数学",
    "文系数学",
    "英語",
    "国語",
    "物理",
    "化学",
    "生物",
    "地学",
    "社会",
    "情報",
    "謎解きor阪大模試",
    "その他"
];

let rowIndex = 1;

// 科目のselect要素を作成する関数
function createSubjectSelect() {
    const select = document.createElement('select');
    select.className = 'input-field select-field';
    select.setAttribute('data-field', 'subject');
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '科目を選択';
    select.appendChild(defaultOption);
    
    SUBJECT_OPTIONS.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        select.appendChild(option);
    });
    
    return select;
}

// 初期行の科目selectを設定
document.addEventListener('DOMContentLoaded', () => {
    const firstSelect = document.querySelector('[data-field="subject"]');
    if (firstSelect) {
        const newSelect = createSubjectSelect();
        firstSelect.parentNode.replaceChild(newSelect, firstSelect);
    }
});

// 行を追加
function addRow() {
    const container = document.getElementById('rowsContainer');
    const newRow = document.createElement('div');
    newRow.className = 'row';
    newRow.setAttribute('data-index', rowIndex);
    
    const subjectSelect = createSubjectSelect();
    newRow.appendChild(subjectSelect);
    
    const kindInput = document.createElement('input');
    kindInput.type = 'text';
    kindInput.className = 'input-field';
    kindInput.placeholder = '模試の種類';
    kindInput.setAttribute('data-field', 'kind');
    newRow.appendChild(kindInput);
    
    const yearInput = document.createElement('input');
    yearInput.type = 'number';
    yearInput.className = 'input-field';
    yearInput.placeholder = '年度';
    yearInput.setAttribute('data-field', 'year');
    yearInput.setAttribute('min', '0');
    newRow.appendChild(yearInput);
    
    const countInput = document.createElement('input');
    countInput.type = 'number';
    countInput.className = 'input-field';
    countInput.placeholder = '大問数';
    countInput.setAttribute('data-field', 'count');
    countInput.setAttribute('min', '0');
    newRow.appendChild(countInput);
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn btn-remove';
    removeBtn.textContent = '削除';
    removeBtn.onclick = function() { removeRow(this); };
    newRow.appendChild(removeBtn);
    
    container.appendChild(newRow);
    rowIndex++;
}

document.getElementById('addRowBtn').addEventListener('click', addRow);

// 行を削除
function removeRow(button) {
    const container = document.getElementById('rowsContainer');
    const rows = container.querySelectorAll('.row');
    
    // 最後の1行は削除できない
    if (rows.length <= 1) {
        alert('最低1行は必要です');
        return;
    }
    
    button.closest('.row').remove();
}

// ショートカットキー処理（MacのCommandキーとWindowsのCtrlキーの両方に対応）
document.addEventListener('keydown', (e) => {
    // Ctrl+Enter または Command+Enter: 行を追加
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        addRow();
    }
    
    // Ctrl+Backspace または Command+Backspace: 行を削除（フォーカスがある行を削除）
    if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
        e.preventDefault();
        const activeElement = document.activeElement;
        const row = activeElement.closest('.row');
        if (row) {
            const removeBtn = row.querySelector('.btn-remove');
            if (removeBtn) {
                removeRow(removeBtn);
            }
        }
    }
});

// JSONを生成してコピー
document.getElementById('outputBtn').addEventListener('click', () => {
    const rows = document.querySelectorAll('.row');
    const data = [];
    const errors = [];
    
    rows.forEach((row, index) => {
        const rowNum = index + 1;
        const subjectSelect = row.querySelector('[data-field="subject"]');
        const subject = subjectSelect ? subjectSelect.value.trim() : '';
        const kind = row.querySelector('[data-field="kind"]').value.trim();
        const yearStr = row.querySelector('[data-field="year"]').value.trim();
        const countStr = row.querySelector('[data-field="count"]').value.trim();
        
        // 必須項目のチェック
        if (!subject) {
            errors.push(`${rowNum}行目: 科目が選択されていません`);
            return;
        }
        
        if (!kind) {
            errors.push(`${rowNum}行目: 模試の種類が入力されていません`);
            return;
        }
        
        if (!countStr) {
            errors.push(`${rowNum}行目: 大問数が入力されていません`);
            return;
        }
        
        // 数値変換とバリデーション
        let year = 0;
        if (yearStr) {
            year = parseInt(yearStr, 10);
            if (isNaN(year)) {
                errors.push(`${rowNum}行目: 年度が数値ではありません`);
                return;
            }
            if (year < 0) {
                errors.push(`${rowNum}行目: 年度は0以上である必要があります`);
                return;
            }
        }
        
        const count = parseInt(countStr, 10);
        if (isNaN(count)) {
            errors.push(`${rowNum}行目: 大問数が数値ではありません`);
            return;
        }
        if (count < 0) {
            errors.push(`${rowNum}行目: 大問数は0以上である必要があります`);
            return;
        }
        
        data.push({
            subject: subject,
            kind: kind,
            year: year,
            count: count
        });
    });
    
    // エラーがある場合は表示して終了
    if (errors.length > 0) {
        alert('入力エラー:\n' + errors.join('\n'));
        return;
    }
    
    if (data.length === 0) {
        alert('有効なデータがありません。科目、模試の種類、大問数を入力してください。');
        return;
    }
    
    const jsonString = JSON.stringify(data, null, 2);
    
    // クリップボードにコピー
    navigator.clipboard.writeText(jsonString).then(() => {
        alert(`✅ ${data.length}件のデータをJSON形式でコピーしました！`);
    }).catch(err => {
        console.error('コピーに失敗しました:', err);
        // フォールバック: テキストエリアを使用
        const textarea = document.createElement('textarea');
        textarea.value = jsonString;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert(`✅ ${data.length}件のデータをJSON形式でコピーしました！`);
    });
});

