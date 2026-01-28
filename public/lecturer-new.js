// Lecturer management for SQL Server exercises
const state = {
  exercises: [],
  subjects: [],
  currentExercise: null
};

async function loadExercises() {
  try {
    const res = await fetch('/api/baitap');
    if (!res.ok) throw new Error('Failed to fetch exercises');
    const data = await res.json();
    
    // Group by subject
    const grouped = {};
    data.forEach(ex => {
      const subject = ex.TenMon || 'Không xác định';
      if (!grouped[subject]) grouped[subject] = [];
      grouped[subject].push({
        MaBaiTap: ex.MaBaiTap,
        TenBaiTap: ex.TenBaiTap,
        TenMon: ex.TenMon,
        TenDangBai: ex.TenDangBai,
        TenDoKho: ex.TenDoKho,
        MoTa: ex.MoTa,
        YeuCau: ex.YeuCau,
        TieuChiChamDiem: ex.TieuChiChamDiem
      });
    });
    
    state.exercises = data;
    renderExerciseList(grouped);
  } catch (err) {
    console.error('Error loading exercises:', err);
    alert('Lỗi tải bài tập: ' + err.message);
  }
}

function renderExerciseList(grouped) {
  const container = document.getElementById('exercise-list');
  if (!container) {
    console.error('Element exercise-list not found');
    return;
  }
  container.innerHTML = '';
  
  Object.keys(grouped).sort().forEach(subject => {
    const subHeader = document.createElement('div');
    subHeader.style.fontWeight = 'bold';
    subHeader.style.marginTop = '12px';
    subHeader.style.marginBottom = '8px';
    subHeader.textContent = subject;
    container.appendChild(subHeader);
    
    grouped[subject].forEach(ex => {
      const item = document.createElement('div');
      item.className = 'exercise-item';
      item.innerHTML = `<strong>${ex.TenBaiTap}</strong><br/><small class="small-muted">${ex.TenDangBai} (${ex.TenDoKho})</small>`;
      item.onclick = (e) => {
        loadExerciseDetail(ex.MaBaiTap, e.currentTarget);
      };
      container.appendChild(item);
    });
  });
}

async function loadExerciseDetail(maBaiTap, itemElement) {
  try {
    const res = await fetch(`/api/baitap/${encodeURIComponent(maBaiTap)}`);
    if (!res.ok) throw new Error('Exercise not found');
    const ex = await res.json();
    
    state.currentExercise = ex;
    renderEditForm(ex);
    
    // Mark as active
    document.querySelectorAll('.exercise-item').forEach(el => el.classList.remove('active'));
    if (itemElement) itemElement.classList.add('active');
  } catch (err) {
    console.error('Error loading exercise detail:', err);
    alert('Lỗi tải bài tập: ' + err.message);
  }
}

function parseGradingCriteria(jsonStr) {
  try {
    if (!jsonStr) return [];
    const parsed = JSON.parse(jsonStr);
    return (parsed && parsed.tieu_chi && Array.isArray(parsed.tieu_chi)) ? parsed.tieu_chi : [];
  } catch (e) {
    return jsonStr ? [jsonStr] : [];
  }
}

function parseRequirements(jsonStr) {
  try {
    if (!jsonStr) return [];
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [jsonStr];
  } catch (e) {
    return jsonStr ? [jsonStr] : [];
  }
}

function renderEditForm(ex) {
  const panel = document.getElementById('edit-panel');
  if (!panel) {
    console.error('Element edit-panel not found');
    return;
  }
  const grading = parseGradingCriteria(ex.TieuChiChamDiem);
  const requirements = parseRequirements(ex.YeuCau);
  
  panel.innerHTML = `
    <h3 style="margin-top: 0">${ex.TenBaiTap}</h3>
    
    <form id="edit-form">
      <input type="hidden" id="field-maBaiTap" value="${ex.MaBaiTap}" />
      
      <div class="form-section">
        <label>Tên bài tập</label>
        <input type="text" id="field-TenBaiTap" value="${escapeHtml(ex.TenBaiTap || '')}" />
      </div>
      
      <div class="form-section">
        <label>Môn học (Tên)</label>
        <input type="text" id="field-TenMon" value="${escapeHtml(ex.TenMon || '')}" readonly style="background: #f5f5f5" />
      </div>
      
      <div class="form-section">
        <label>Dạng bài (Tên)</label>
        <input type="text" id="field-TenDangBai" value="${escapeHtml(ex.TenDangBai || '')}" readonly style="background: #f5f5f5" />
      </div>
      
      <div class="form-section">
        <label>Độ khó (Tên)</label>
        <input type="text" id="field-TenDoKho" value="${escapeHtml(ex.TenDoKho || '')}" readonly style="background: #f5f5f5" />
      </div>
      
      <div class="form-section">
        <label>Mô tả (Markdown)</label>
        <textarea id="field-MoTa" rows="4">${escapeHtml(ex.MoTa || '')}</textarea>
      </div>
      
      <div class="form-section">
        <label>Yêu cầu (mỗi dòng 1 yêu cầu)</label>
        <textarea id="field-YeuCau" rows="4">${requirements.map(r => escapeHtml(r)).join('\n')}</textarea>
      </div>
      
      <div class="form-section">
        <label>Tiêu chí chấm (mỗi dòng 1 tiêu chí)</label>
        <textarea id="field-TieuChi" rows="4">${grading.map(c => escapeHtml(c)).join('\n')}</textarea>
      </div>
      
      <div class="form-controls">
        <button type="submit" class="accent">Lưu (Update SQL Server)</button>
        <button type="button" id="btn-cancel" class="secondary">Đóng</button>
      </div>
    </form>
  `;
  
  document.getElementById('edit-form').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    await saveExercise();
  });
  
  document.getElementById('btn-cancel').addEventListener('click', () => {
    document.getElementById('edit-panel').innerHTML = '<p class="no-exercise">Chọn bài tập để chỉnh sửa</p>';
    state.currentExercise = null;
  });
}

async function saveExercise() {
  try {
    const maBaiTap = document.getElementById('field-maBaiTap').value;
    const tenBaiTap = document.getElementById('field-TenBaiTap').value;
    const moTa = document.getElementById('field-MoTa').value;
    const yeucau = document.getElementById('field-YeuCau').value
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    const tieuchi = document.getElementById('field-TieuChi').value
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    
    // Convert requirements and criteria to JSON format
    const yeuCauJson = JSON.stringify(yeucau);
    const tieuChiJson = JSON.stringify({ tieu_chi: tieuchi });
    
    const payload = {
      TenBaiTap: tenBaiTap,
      MaMon: state.currentExercise.MaMon,
      MaDangBai: state.currentExercise.MaDangBai,
      MaDoKho: state.currentExercise.MaDoKho,
      MoTa: moTa,
      YeuCau: yeuCauJson,
      TieuChiChamDiem: tieuChiJson
    };
    
    const res = await fetch(`/api/baitap/${encodeURIComponent(maBaiTap)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Update failed');
    }
    
    alert('✓ Lưu thành công! Dữ liệu đã được cập nhật vào SQL Server.');
    await loadExercises();
    document.getElementById('edit-panel').innerHTML = '<p class="no-exercise">Chọn bài tập để chỉnh sửa</p>';
    state.currentExercise = null;
  } catch (err) {
    console.error('Error saving:', err);
    alert('Lỗi lưu: ' + err.message);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  loadExercises();
  
  // Setup filter listeners
  const searchInput = document.getElementById('lecturer-search');
  const filterSubject = document.getElementById('lecturer-filter-subject');
  const filterForm = document.getElementById('lecturer-filter-form');
  const filterDifficulty = document.getElementById('lecturer-filter-difficulty');
  const filterClear = document.getElementById('lecturer-filter-clear');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      loadExercises();
    });
  }
  
  if (filterSubject) {
    filterSubject.addEventListener('change', (e) => {
      state.filterSubject = e.target.value;
      loadExercises();
    });
  }
  
  if (filterForm) {
    filterForm.addEventListener('change', (e) => {
      state.filterForm = e.target.value;
      loadExercises();
    });
  }
  
  if (filterDifficulty) {
    filterDifficulty.addEventListener('change', (e) => {
      state.filterDifficulty = e.target.value;
      loadExercises();
    });
  }
  
  if (filterClear) {
    filterClear.addEventListener('click', () => {
      state.searchQuery = '';
      state.filterSubject = '';
      state.filterForm = '';
      state.filterDifficulty = '';
      searchInput.value = '';
      filterSubject.value = '';
      filterForm.value = '';
      filterDifficulty.value = '';
      loadExercises();
    });
  }
  
  document.getElementById('btn-logout').addEventListener('click', async () => {
    try {
      await fetch('/api/lecturer/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    location.href = '/';
  });
});
