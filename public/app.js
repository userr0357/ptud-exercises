const API = '';

// helper: escape HTML to avoid XSS when building innerHTML
function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Custom confirm modal — replaces native confirm() with a styled dialog
function showConfirmModal({ title = 'Xác nhận', body = '', confirmText = 'Đồng ý', cancelText = 'Huỷ', type = 'warning' } = {}) {
  return new Promise(resolve => {
    // Remove any existing
    const old = document.getElementById('_custom-confirm-modal');
    if (old) old.remove();

    const colorMap = { warning: { bg: '#fffbeb', border: '#fde68a', icon: '⚠️', btn: '#f59e0b', btnHover: '#d97706' },
                       danger:  { bg: '#fef2f2', border: '#fecaca', icon: '🚫', btn: '#ef4444', btnHover: '#dc2626' },
                       info:    { bg: '#eff6ff', border: '#bfdbfe', icon: 'ℹ️', btn: '#3b82f6', btnHover: '#2563eb' } };
    const c = colorMap[type] || colorMap.warning;

    const el = document.createElement('div');
    el.id = '_custom-confirm-modal';
    el.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.55);backdrop-filter:blur(4px);animation:fadeIn .15s ease';
    el.innerHTML = `
      <div style="background:#fff;border-radius:16px;box-shadow:0 24px 64px rgba(0,0,0,0.2);max-width:440px;width:92%;overflow:hidden;animation:slideUp .2s ease">
        <div style="background:${c.bg};border-bottom:1px solid ${c.border};padding:20px 24px 16px;display:flex;align-items:flex-start;gap:14px">
          <span style="font-size:28px;line-height:1;flex-shrink:0">${c.icon}</span>
          <div>
            <div style="font-size:17px;font-weight:800;color:#1e293b;margin-bottom:4px">${escapeHtml(title)}</div>
            <div style="font-size:14px;color:#475569;line-height:1.6">${body}</div>
          </div>
        </div>
        <div style="padding:16px 24px;display:flex;justify-content:flex-end;gap:10px;background:#f8fafc">
          <button id="_ccm-cancel" style="padding:9px 20px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;color:#475569;font-size:14px;font-weight:600;cursor:pointer">${escapeHtml(cancelText)}</button>
          <button id="_ccm-confirm" style="padding:9px 20px;border-radius:8px;border:none;background:${c.btn};color:#fff;font-size:14px;font-weight:700;cursor:pointer">${escapeHtml(confirmText)}</button>
        </div>
      </div>
      <style>
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
        #_ccm-confirm:hover{opacity:.9} #_ccm-cancel:hover{background:#f1f5f9}
      </style>`;

    document.body.appendChild(el);
    const cleanup = (val) => { el.remove(); resolve(val); };
    document.getElementById('_ccm-confirm').onclick = () => cleanup(true);
    document.getElementById('_ccm-cancel').onclick  = () => cleanup(false);
    el.addEventListener('click', e => { if (e.target === el) cleanup(false); });
  });
}

const state = { subjects: [], currentSubject: null, expandedForms: {}, searchQuery: '', currentPage: 1, formsPerPage: 2 }; 

// difficulty order mapping (lowercased keys)
const DIFF_ORDER = { 'dễ': 0, 'de': 0, 'dễ': 0, 'trung bình': 1, 'trung': 1, 'trung binh': 1, 'khó': 2, 'kho': 2 };

function normalizeDifficultyLabel(raw) {
  if (!raw) return '';
  const s = String(raw).toLowerCase().trim();
  if (s.includes('dễ') || s.includes('de')) return 'Dễ';
  if (s.includes('khó') || s.includes('kho')) return 'Khó';
  if (s.includes('trung')) return 'Trung bình';
  // also handle bracketed forms like "[Trung bình]"
  const m = raw.match(/\[(.*?)\]/);
  if (m && m[1]) {
    const inner = m[1].toLowerCase();
    if (inner.includes('dễ') || inner.includes('de')) return 'Dễ';
    if (inner.includes('khó') || inner.includes('kho')) return 'Khó';
    if (inner.includes('trung')) return 'Trung bình';
  }
  return '';
}

// restore expandedForms state (which form cards were expanded)
try {
  const ef = localStorage.getItem('expandedForms');
  if (ef) state.expandedForms = JSON.parse(ef);
} catch (e) { /* ignore */ }


async function loadSubjects() {
  state.subjects = await fetchJSON('/api/subjects');
  renderSidebar();
  // try to get current lecturer info (if authed)
  try {
    const r = await fetch('/api/lecturer/me', { credentials: 'include' });
    if (r.ok) state.lecturer = await r.json(); else state.lecturer = null;
  } catch (e) { state.lecturer = null; }
  populateLecturerSelects();
  // refresh login button (in case lecturer restored earlier)
  try { updateLoginButton(); } catch (e) {}
  // auto-select first subject when opening student page (so students see exercises immediately)
  try {
    const hash = (location.hash || '').replace(/^#/, '');
    if (!hash && state.subjects && state.subjects.length) {
      await selectSubject(state.subjects[0].subject_id);
    }
  } catch (e) { /* ignore */ }
  // If we are on the lecturer management page (has #manage-list), render its list now
  try {
    if (document.getElementById('manage-list')) {
      renderManageList();
      if (state.lecturer) {
        const info = document.getElementById('lecturer-info');
        if (info) info.textContent = `Giảng viên: ${state.lecturer.name} (${state.lecturer.lecturer_id || ''})`;
      }
    }
  } catch (err) { /* ignore */ }
  // if URL fragment present (e.g. #CS101), select that subject automatically
  // fragment handling kept earlier but we already handled no-fragment case above
}

function renderSidebar() {
  const ul = document.getElementById('subject-list');
  if (!ul) return;
  ul.innerHTML = '';
  state.subjects.forEach(s => {
    const li = document.createElement('li');
    const isActive = state.currentSubject && state.currentSubject.subject_id === s.subject_id;
    const firstLetter = (s.subject_name || 'S').charAt(0).toUpperCase();
    li.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
      <div style="display:flex; align-items:center; gap:10px;">
        <div class="subject-icon" style="flex-shrink:0; width:32px; height:32px; display:flex; align-items:center; justify-content:center; background:var(--bg-main, #f1f5f9); color:var(--text-main, #1e293b); border-radius:8px; font-size:15px; font-weight:800; border:1px solid var(--border-color, #e2e8f0); transition:all 0.2s;">${firstLetter}</div>
        <span class="subject-text" style="font-weight:600; line-height:1.4; font-size:15px; white-space:normal;">${escapeHtml(s.subject_name)}</span>
      </div>
      <div class="subject-badge-container" style="flex-shrink:0;">
        ${isActive ? `` : `<span style="font-size:12px; background:var(--border); color:var(--text-muted); padding:2px 8px; border-radius:12px; font-weight:800;">${s.total_exercises}</span>`}
      </div>
    </div>`;
    li.onclick = async () => { await selectSubject(s.subject_id); renderSidebar(); };
    if (isActive) {
      li.classList.add('active');
      const icon = li.querySelector('.subject-icon');
      if (icon) { 
        icon.style.background = 'rgba(255,255,255,0.2)'; 
        icon.style.color = '#fff'; 
        icon.style.borderColor = 'transparent'; 
      }
    }
    ul.appendChild(li);
  });
}

async function selectSubject(id) {
  const subject = await fetchJSON(`/api/subject/${id}`);
  state.currentSubject = subject;
  // normalize grading_criteria shapes for exercises and forms
  try {
    normalizeSubjectCriteria(state.currentSubject);
  } catch (e) {}
  // reset form page when switching subjects
  state.currentPage = 1;
  renderSubject();
  renderSidebar();
  // update URL fragment without adding a history entry
  try { history.replaceState(null, '', '#' + id); } catch (e) { location.hash = '#' + id; }
}

function normalizeCriteria(raw) {
  // returns an array of criteria objects { name, points?, note? } or []
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(g => {
      if (typeof g === 'string') return { name: g, points: 0 };
      if (typeof g === 'object') {
        // if object has tieu_chi key (API legacy), map those
        if (g.tieu_chi && Array.isArray(g.tieu_chi)) return g.tieu_chi.map(s => ({ name: s, points: 0 }));
        return { name: g.name || g.tieu_chi || '(Không tên)', points: g.points || 0, note: g.note || '' };
      }
      return { name: String(g), points: 0 };
    }).flat();
  }
  if (typeof raw === 'object') {
    if (raw.tieu_chi && Array.isArray(raw.tieu_chi)) {
      return raw.tieu_chi.map(s => ({ name: s, points: 0 }));
    }
    // unknown object shape — try to extract name/points
    if (raw.name) return [{ name: raw.name, points: raw.points || 0 }];
    return [];
  }
  return [];
}

function normalizeSubjectCriteria(subject) {
  if (!subject || !subject.forms) return;
  subject.forms.forEach(f => {
    if (f.grading_criteria) f.grading_criteria = normalizeCriteria(f.grading_criteria);
    if (f.exercises && Array.isArray(f.exercises)) {
      f.exercises.forEach(ex => {
        ex.grading_criteria = normalizeCriteria(ex.grading_criteria);
      });
    }
  });
}

function renderSubject() {
  const s = state.currentSubject;
  const titleEl = document.getElementById('subject-title');
  if (!titleEl || !s) return; // Not on student page, skip silently
  titleEl.textContent = s.subject_name;
  const descEl = document.getElementById('subject-desc');
  if (descEl) descEl.textContent = s.description || '';
  const container = document.getElementById('forms-container');
  container.innerHTML = '';
  // 1. Filter all forms and their exercises first
  const q = state.searchQuery || '';
  const searchStr = q.normalize('NFC').toLowerCase();
  const filteredForms = [];
  
  (s.forms || []).forEach(f => {
    const filteredExercises = (f.exercises || []).filter(ex => {
      if (state.difficultyFilter && state.difficultyFilter !== 'all') {
        const lab = (normalizeDifficultyLabel(ex.difficulty) || '').toLowerCase();
        if (state.difficultyFilter === 'easy' && lab !== 'dễ') return false;
        if (state.difficultyFilter === 'medium' && lab !== 'trung bình') return false;
        if (state.difficultyFilter === 'hard' && lab !== 'khó') return false;
      }
      if (!searchStr) return true;
      const titleMatch = (ex.title || '').normalize('NFC').toLowerCase().includes(searchStr);
      const descMatch = (ex.description || '').normalize('NFC').toLowerCase().includes(searchStr);
      const kwMatch = (ex.ai_keywords || '').normalize('NFC').toLowerCase().includes(searchStr);
      return titleMatch || descMatch || kwMatch;
    });
    
    if (filteredExercises.length > 0) {
      filteredForms.push({ ...f, exercises: filteredExercises, exercise_count: filteredExercises.length });
    }
  });

  // sort filtered forms by difficulty then by name
  filteredForms.sort((a,b) => {
    const da = DIFF_ORDER[(normalizeDifficultyLabel(a.difficulty)||a.difficulty||'').toLowerCase()] ?? 1;
    const db = DIFF_ORDER[(normalizeDifficultyLabel(b.difficulty)||b.difficulty||'').toLowerCase()] ?? 1;
    if (da !== db) return da - db;
    return (a.name||'').localeCompare(b.name||'');
  });

  // Render subject summary based on FILTERED results
  try {
    const summaryEl = document.getElementById('subject-summary');
    if (summaryEl) {
      const allFilteredExercises = filteredForms.reduce((acc, f) => acc.concat(f.exercises || []), []);
      const totals = { total: allFilteredExercises.length, easy: 0, medium: 0, hard: 0 };
      allFilteredExercises.forEach(ex => {
        const lab = normalizeDifficultyLabel(ex.difficulty) || '';
        if (lab === 'Dễ') totals.easy++;
        else if (lab === 'Trung bình') totals.medium++;
        else if (lab === 'Khó') totals.hard++;
      });
      summaryEl.innerHTML = `
        <div class="stat-card" style="background:linear-gradient(135deg, #3b82f6, #2563eb);">
          <div style="position:absolute; right:-10px; top:-10px; font-size:60px; opacity:0.15; transform:rotate(15deg); user-select:none;">📚</div>
          <div class="stat-label" style="text-transform:uppercase; letter-spacing:1px;">${q || (state.difficultyFilter && state.difficultyFilter !== 'all') ? 'Kết quả tìm kiếm' : 'Tổng bài tập'}</div>
          <div class="stat-value">${totals.total}</div>
        </div>
        <div class="stat-card" style="background:linear-gradient(135deg, #10b981, #059669);">
          <div style="position:absolute; right:-10px; top:-10px; font-size:60px; opacity:0.15; transform:rotate(-10deg); user-select:none;">🟢</div>
          <div class="stat-label" style="text-transform:uppercase; letter-spacing:1px;">Mức độ Dễ</div>
          <div class="stat-value">${totals.easy}</div>
        </div>
        <div class="stat-card" style="background:linear-gradient(135deg, #f59e0b, #d97706);">
          <div style="position:absolute; right:-10px; top:-10px; font-size:60px; opacity:0.15; transform:rotate(10deg); user-select:none;">🟡</div>
          <div class="stat-label" style="text-transform:uppercase; letter-spacing:1px;">Trung bình</div>
          <div class="stat-value">${totals.medium}</div>
        </div>
        <div class="stat-card" style="background:linear-gradient(135deg, #ef4444, #dc2626);">
          <div style="position:absolute; right:-10px; top:-10px; font-size:60px; opacity:0.15; transform:rotate(-15deg); user-select:none;">🔴</div>
          <div class="stat-label" style="text-transform:uppercase; letter-spacing:1px;">Mức độ Khó</div>
          <div class="stat-value">${totals.hard}</div>
        </div>
      `;
    }
  } catch (e) { /* ignore summary errors */ }

  // 2. paginate the FILTERED forms
  const formsPerPage = state.formsPerPage || 2;
  const totalFormPages = Math.max(1, Math.ceil(filteredForms.length / formsPerPage));
  if (!state.currentPage || state.currentPage < 1) state.currentPage = 1;
  if (state.currentPage > totalFormPages) state.currentPage = totalFormPages;
  
  if (filteredForms.length === 0) {
    container.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-muted); font-size:16px;">Không tìm thấy bài tập nào phù hợp với từ khóa/bộ lọc.</div>';
    const pagination = document.getElementById('pagination-control');
    if (pagination) pagination.style.display = 'none';
    return;
  }

  const startIdx = (state.currentPage - 1) * formsPerPage;
  const pageForms = filteredForms.slice(startIdx, startIdx + formsPerPage);

  pageForms.forEach((form, formIndex) => {
    const card = document.createElement('div');
    card.className = 'form-card';
    card.style.background = 'transparent';
    card.style.border = 'none';
    card.style.boxShadow = 'none';
    card.style.overflow = 'visible';

    const h = document.createElement('h3');
    h.style.background = 'transparent';
    h.style.borderBottom = 'none';
    h.style.padding = '10px 0 16px 0';
    h.style.display = 'flex';
    h.style.alignItems = 'center';
    h.style.gap = '12px';
    const globalIndex = startIdx + formIndex + 1;
    h.innerHTML = `<span style="font-size:21px; font-weight:800; color:var(--text-heading); background:linear-gradient(90deg, #6366f1, #a855f7); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Dạng ${globalIndex} - ${escapeHtml(form.name)}</span>
                   <span style="background:#e0e7ff; color:#4338ca; font-size:14px; font-weight:700; padding:4px 10px; border-radius:20px; box-shadow:0 2px 4px rgba(67,56,202,0.1);">[ ${form.exercise_count} Bài ]</span>`;
    card.appendChild(h);

    const grid = document.createElement('div');
    grid.className = 'exercise-grid';

    const filtered = form.exercises;
    // sort by difficulty (easy -> medium -> hard), then by numeric order extracted from title (e.g. "Bài 10")
    // fall back to localeCompare when no numeric prefix is found
    filtered.sort((a, b) => {
      const daLabel = normalizeDifficultyLabel(a.difficulty) || a.difficulty || '';
      const dbLabel = normalizeDifficultyLabel(b.difficulty) || b.difficulty || '';
      const da = DIFF_ORDER[(daLabel).toLowerCase()] ?? 1;
      const db = DIFF_ORDER[(dbLabel).toLowerCase()] ?? 1;
      if (da !== db) return da - db;

      const titleA = (a.title || '').trim();
      const titleB = (b.title || '').trim();

      // try to extract the first integer that appears in the title (handles "Bài 1", "Exercise 10", etc.)
      const numA = (() => { const m = titleA.match(/(\d+)/); return m ? parseInt(m[1], 10) : null; })();
      const numB = (() => { const m = titleB.match(/(\d+)/); return m ? parseInt(m[1], 10) : null; })();

      if (numA != null && numB != null) {
        if (numA !== numB) return numA - numB;
        // if numbers equal, fall through to text compare of the rest
      } else if (numA != null) {
        // put numeric-prefixed titles before non-numeric
        return -1;
      } else if (numB != null) {
        return 1;
      }

      return titleA.localeCompare(titleB);
    });

    const key = `${s.subject_id}-${form.form_id}`;
    const expanded = !!state.expandedForms[key];
    const SHOW_COUNT = 8; // more cards visible in grid by default
    const toShow = expanded ? filtered : filtered.slice(0, SHOW_COUNT);

    toShow.forEach(ex => {
      const cardEl = document.createElement('div');
      cardEl.className = 'exercise-card';
      cardEl.style.display = 'flex';
      cardEl.style.flexDirection = 'column';
      
      const diffLabel = normalizeDifficultyLabel(ex.difficulty) || ex.difficulty || '';
      const reqCount = (ex.requirements || []).length || 0;
      const critCount = (ex.grading_criteria || []).length || 0;
      
      cardEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <span style="font-size:11px; font-weight:800; background:#e0e7ff; color:#4f46e5; padding:4px 10px; border-radius:12px; letter-spacing:0.5px;">${escapeHtml(ex.id || ex.exercise_id || 'ID')}</span>
        </div>
        <div class="exercise-title" style="font-size:18px; font-weight:700; color:var(--text-heading); line-height:1.4; margin-bottom:8px;">${escapeHtml(ex.title)}</div>
        <div class="exercise-desc" style="font-size:15px; color:var(--text-muted); line-height:1.6; margin-bottom:16px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(ex.description ? ex.description.replace(/<[^>]*>?/gm, '') : '')}</div>
        <div style="margin-top:auto; padding-top:14px; border-top:1px dashed var(--border); display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:12px; font-size:14px; font-weight:600; color:var(--text-muted);">
            <span title="Yêu cầu">📄 ${reqCount}</span>
            <span title="Tiêu chí">⚖️ ${critCount}</span>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <span style="display:inline-block;white-space:nowrap;font-size:12px; font-weight:700; background:${diffLabel==='Khó'?'#fee2e2':(diffLabel==='Trung bình'?'#fef3c7':'#dcfce7')}; color:${diffLabel==='Khó'?'#991b1b':(diffLabel==='Trung bình'?'#92400e':'#166534')}; padding:4px 8px; border-radius:6px;">${escapeHtml(diffLabel)}</span>
            ${ex.submission_format ? `<span style="font-size:12px; font-weight:600; color:var(--text-muted);">${escapeHtml(ex.submission_format)}</span>` : ''}
          </div>
        </div>
      `;
      
      cardEl.onclick = () => showExercise(ex, form);
      grid.appendChild(cardEl);
    });

    card.appendChild(grid);

    if (filtered.length > SHOW_COUNT) {
      const moreBtn = document.createElement('button');
      moreBtn.style.width = '100%';
      moreBtn.style.marginTop = '16px';
      moreBtn.style.padding = '12px';
      moreBtn.style.background = 'transparent';
      moreBtn.style.color = '#6366f1';
      moreBtn.style.border = '2px dashed #6366f1';
      moreBtn.style.borderRadius = '12px';
      moreBtn.style.fontSize = '14px';
      moreBtn.style.fontWeight = '700';
      moreBtn.style.cursor = 'pointer';
      moreBtn.style.transition = 'all 0.2s';
      moreBtn.onmouseover = () => { moreBtn.style.background = '#e0e7ff'; };
      moreBtn.onmouseout = () => { moreBtn.style.background = 'transparent'; };
      
      moreBtn.innerHTML = expanded ? 'Thu gọn ▲' : `Xem thêm (${filtered.length - SHOW_COUNT}) ▼`;
      moreBtn.onclick = () => {
        state.expandedForms[key] = !state.expandedForms[key];
        try { localStorage.setItem('expandedForms', JSON.stringify(state.expandedForms)); } catch (e) {}
        renderSubject();
      };
      card.appendChild(moreBtn);
    }

    container.appendChild(card);
  });

  // render form-level pagination controls
  const pagination = document.getElementById('pagination-control');
  if (pagination) {
    if ((s.forms||[]).length <= formsPerPage) { pagination.innerHTML = ''; }
    else {
      const total = totalFormPages;
      const btnStyle = `padding:8px 16px; border-radius:10px; font-size:16px; font-weight:700; cursor:pointer; border:1px solid #c7d2fe; background:var(--card-bg,#fff); color:#4f46e5; transition:all 0.2s; box-shadow:0 2px 4px rgba(0,0,0,0.02);`;
      const disabledStyle = `padding:8px 16px; border-radius:10px; font-size:16px; font-weight:700; border:1px solid #e2e8f0; background:var(--bg-color,#f8fafc); color:var(--text-muted); cursor:not-allowed;`;
      
      let html = `<div style="display:flex; justify-content:center; align-items:center; gap:16px; margin:24px 0 16px;">`;
      if (state.currentPage > 1) {
        html += `<button onclick="changeFormPage(${state.currentPage-1})" style="${btnStyle}" onmouseover="this.style.background='#e0e7ff'" onmouseout="this.style.background='#fff'">← Trang trước</button>`;
      } else {
        html += `<button style="${disabledStyle}" disabled>← Trang trước</button>`;
      }
      
      html += `<div style="font-size:16px; font-weight:600; color:var(--text-muted); background:var(--bg-main); padding:6px 16px; border-radius:20px; border:1px solid var(--border);">Trang <span style="color:#4f46e5; font-weight:800;">${state.currentPage}</span> / ${total}</div>`;
      
      if (state.currentPage < total) {
        html += `<button onclick="changeFormPage(${state.currentPage+1})" style="${btnStyle}" onmouseover="this.style.background='#e0e7ff'" onmouseout="this.style.background='#fff'">Trang tiếp →</button>`;
      } else {
        html += `<button style="${disabledStyle}" disabled>Trang tiếp →</button>`;
      }
      html += `</div>`;
      pagination.innerHTML = html;
    }
  }
}

// helper to change form page (exposed to inline onclick above)
function changeFormPage(p) {
  state.currentPage = p;
  renderSubject();
}

async function showExercise(ex, parentForm) {
  function renderGradingHtml(criteria, fallback) {
    if ((!criteria || !criteria.length) && (fallback && fallback.length)) {
      criteria = fallback;
    }
    if (!criteria || !criteria.length) return '<div style="font-style:italic;color:var(--text-muted);text-align:center;padding:16px">(Chưa có tiêu chí)</div>';
    
    const totalPts = criteria.reduce((sum, c) => sum + (typeof c.points === 'number' ? c.points : 0), 0);

    const listHtml = '<ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px;">' + criteria.map(g => {
      if (!g) return '';
      if (typeof g === 'string') return `<li style="padding:12px 16px; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; font-size:16px; font-weight:500;">${escapeHtml(g)}</li>`;
      const name = escapeHtml(g.name || '(Không tên)');
      const pts = (typeof g.points === 'number') ? `<span style="font-size:16px; color:#4f46e5; font-weight:800; background:#e0e7ff; padding:4px 12px; border-radius:8px; white-space:nowrap; box-shadow:0 1px 2px rgba(79,70,229,0.1);">${g.points}%</span>` : '';
      const note = g.note ? `<div style="font-size:15px; color:var(--text-muted); margin-top:6px; padding-top:6px; border-top:1px dashed var(--border);">${escapeHtml(g.note)}</div>` : '';
      return `<li style="padding:14px 18px; background:var(--bg-card); border:1px solid var(--border); border-radius:12px; display:flex; flex-direction:column; transition:transform 0.2s, box-shadow 0.2s; box-shadow:0 2px 4px rgba(0,0,0,0.02);" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.06)'" onmouseout="this.style.transform='none';this.style.boxShadow='0 2px 4px rgba(0,0,0,0.02)'"><div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px;"><strong style="font-size:17px; font-weight:600; color:var(--text-heading); line-height:1.5;">${name}</strong>${pts}</div>${note}</li>`;
    }).join('') + '</ul>';

    const sumHtml = `
      <div style="margin-top:16px; padding-top:16px; border-top:2px dashed var(--border); display:flex; justify-content:flex-end; align-items:center; gap:12px;">
        <span style="font-size:16px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Tổng trọng số:</span>
        <span style="font-size:19px; font-weight:800; padding:4px 12px; border-radius:8px; ${totalPts === 100 ? 'background:#dcfce7; color:#166534;' : 'background:#fee2e2; color:#991b1b;'}">${totalPts}%</span>
      </div>`;
    return listHtml + sumHtml;
  }
  const d = document.getElementById('exercise-detail');
  // determine grading criteria to show: prefer exercise -> parent form -> snapshot cache
  let finalCriteria = (ex.grading_criteria && ex.grading_criteria.length) ? ex.grading_criteria : ((parentForm && parentForm.grading_criteria && parentForm.grading_criteria.length) ? parentForm.grading_criteria : []);
  if ((!finalCriteria || !finalCriteria.length) && !state.snapshotTried) {
    // try to load subjects_merged.json as fallback
    try {
      state.snapshot = await fetchJSON('/subjects_merged.json');
      state.snapshotTried = true;
      // find exercise by id
      const allSnapExercises = (state.snapshot || []).flatMap(s => s.forms || []).flatMap(f => f.exercises || []);
      const exIdStr = String(ex.id || ex.exercise_id || '').trim();
      const exTitle = String(ex.title || '').trim().toLowerCase();
      const found = allSnapExercises.find(x => {
        const xid = String(x.id || x.exercise_id || '').trim();
        if (xid && exIdStr && xid === exIdStr) return true;
        // match by title as fallback (case-insensitive)
        const xt = String(x.title || '').trim().toLowerCase();
        if (xt && exTitle && xt === exTitle) return true;
        return false;
      });
      if (found && found.grading_criteria && found.grading_criteria.length) finalCriteria = found.grading_criteria;
    } catch (err) {
      state.snapshotTried = true;
    }
  }
  // render markdown then sanitize
  const rawHtml = (typeof marked !== 'undefined') ? marked.parse(ex.description || '') : (ex.description || '');
  const safeHtml = (typeof DOMPurify !== 'undefined') ? DOMPurify.sanitize(rawHtml) : rawHtml;
  const attached = (ex.attached_files||[]).map(f=>f.originalname || f.filename).join(', ') || '(Không có)';
  // difficulty badge class
  const LEVEL_NAMES = {1:'Nhập môn',2:'Cơ bản',3:'Trung bình',4:'Nâng cao',5:'Chuyên sâu'};
  const levelNum = ex.level || '';
  const levelLabel = levelNum ? `Lv.${levelNum} \u2013 ${LEVEL_NAMES[levelNum]||''}` : '';
  const diffLabel = normalizeDifficultyLabel(ex.difficulty) || ex.difficulty || '';
  const fmtIcons = { 'zip':'📦', 'pdf':'📄', 'docx':'📝', 'link':'🔗', 'text':'📃', 'image':'🖼️' };
  const fmtDisplay = ex.submission_format ? ex.submission_format.split(', ').map(f => (fmtIcons[f.toLowerCase()]||'📋') + ' ' + f.toUpperCase()).join('  ') : '(Chưa đặt)';
  
  const infoCards = [
    { bg:'linear-gradient(135deg,#e0f2fe,#bae6fd)', icon:'🏷️', label:'MÃ BÀI TẬP', value: ex.id||'---', color:'#0369a1' },
    { bg:'linear-gradient(135deg,#ede9fe,#ddd6fe)', icon:'🔢', label:'ID HỆ THỐNG', value: '#'+(ex.numeric_id||ex.pk||''), color:'#7c3aed' },
    { bg:'linear-gradient(135deg,#fff7ed,#fed7aa)', icon:'📂', label:'DẠNG BÀI', value: (parentForm&&parentForm.name)||'', color:'#c2410c' },
    { bg:'linear-gradient(135deg,#f1f5f9,#e2e8f0)', icon:'📊', label:'ĐỘ KHÓ & CẤP ĐỘ', value: diffLabel+(levelLabel?` • ${levelLabel}`:''), color:'#334155' },
    { bg:'linear-gradient(135deg,#ecfdf5,#d1fae5)', icon:'📋', label:'HÌNH THỨC NỘP', value: fmtDisplay, color:'#065f46' },
    { bg:'linear-gradient(135deg,#fdf4ff,#f5d0fe)', icon:'👨‍🏫', label:'GIẢNG VIÊN', value: ex.lecturer_name||ex.owner||'Hệ thống', color:'#86198f' }
  ];
  const cardsHtml = infoCards.map(c=>`
    <div style="background:${c.bg};border-radius:12px;padding:14px 16px;min-height:70px;border:1px solid rgba(0,0,0,.05);box-shadow:0 2px 4px rgba(0,0,0,.02)">
      <div style="font-size:11px;font-weight:800;color:${c.color};letter-spacing:.06em;margin-bottom:6px;text-transform:uppercase;opacity:.85">${c.icon} ${c.label}</div>
      <div style="font-size:16px;font-weight:700;color:${c.color};line-height:1.4">${escapeHtml(String(c.value))}</div>
    </div>`).join('');

  d.innerHTML = `
    <div class="detail-header" style="background:var(--bg-main); border-bottom:1px solid var(--border); padding:20px 24px 16px;">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
        <div style="flex:1; min-width:0;">
          <div style="margin-bottom:10px;">
            <span style="background:#4f46e5; color:#fff; font-size:12px; font-weight:700; text-transform:uppercase; padding:4px 12px; border-radius:20px; letter-spacing:0.5px;">${escapeHtml(ex.id || '#')}</span>
          </div>
          <h2 style="font-size:22px; color:var(--text-heading); line-height:1.3; margin-bottom:6px; margin-top:0;">${escapeHtml(ex.title)}</h2>
          <div class="detail-sub" style="font-size:15px; color:var(--text-muted); font-weight:500;">Ngân hàng Bài tập • Dạng bài: <strong>${escapeHtml((parentForm && parentForm.name) ? parentForm.name : 'Chung')}</strong></div>
        </div>
        <button id="exercise-close-btn" title="Đóng"
          style="flex-shrink:0; width:36px; height:36px; border-radius:50%; background:var(--bg-card); border:1px solid var(--border); color:var(--text-muted); font-size:20px; line-height:1; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 4px rgba(0,0,0,0.06); transition:all 0.15s;"
          onmouseover="this.style.background='#fee2e2'; this.style.borderColor='#fca5a5'; this.style.color='#dc2626';"
          onmouseout="this.style.background='var(--bg-card)'; this.style.borderColor='var(--border)'; this.style.color='var(--text-muted)';">×</button>
      </div>
    </div>
    
    <div class="detail-meta-grid" style="padding:24px 32px 16px;">
      ${cardsHtml}
    </div>
    
    <div class="section" style="border-top:none; padding:12px 32px 24px;">
      <h3 style="color:#6366f1; border-bottom:2px solid var(--border); padding-bottom:10px; margin-bottom:16px; font-size:18px; letter-spacing:0.3px;">📖 Mô tả bài tập</h3>
      <div class="desc-content" style="background:var(--bg-main); border:1px solid var(--border); border-left:4px solid #6366f1; box-shadow:0 2px 6px rgba(0,0,0,0.02);">${safeHtml}</div>
    </div>
    
    <div class="section" style="padding:24px 32px;">
      <h3 style="color:#10b981; border-bottom:2px solid var(--border); padding-bottom:10px; margin-bottom:16px; font-size:18px; letter-spacing:0.3px;">🎯 Yêu cầu kỹ thuật (${(ex.requirements||[]).length})</h3>
      <div style="background:var(--bg-main); padding:20px 24px; border-radius:14px; border:1px solid var(--border); box-shadow:0 2px 6px rgba(0,0,0,0.02);">
        <ol style="margin:0; padding-left:20px; font-weight:500; color:var(--text-heading);">
          ${(ex.requirements||[]).map(r => `<li style="margin-bottom:12px; line-height:1.6;">${escapeHtml(r)}</li>`).join('')}
        </ol>
      </div>
    </div>
    
    <div class="section" style="padding:24px 32px;">
      <h3 style="color:#f59e0b; border-bottom:2px solid var(--border); padding-bottom:10px; margin-bottom:16px; font-size:18px; letter-spacing:0.3px;">⚖️ Tiêu chí chấm điểm (${(finalCriteria||[]).length})</h3>
      <div style="background:var(--bg-main); padding:20px; border-radius:14px; border:1px solid var(--border); box-shadow:0 2px 6px rgba(0,0,0,0.02);">
        ${renderGradingHtml(finalCriteria)}
      </div>
    </div>
    
    ${(ex.attached_files && ex.attached_files.length) ? `
    <div class="section" style="padding:24px 32px 32px;">
      <h3 style="color:var(--text-muted); border-bottom:2px solid var(--border); padding-bottom:10px; margin-bottom:16px; font-size:18px; letter-spacing:0.3px;">📎 File đính kèm (${ex.attached_files.length})</h3>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${ex.attached_files.map(f => {
          const fname = f.filename || '';
          const oname = f.originalname || fname;
          const ext = oname.split('.').pop().toLowerCase();
          const iconMap = { pdf:'📄', doc:'📝', docx:'📝', xls:'📊', xlsx:'📊', zip:'📦', rar:'📦', png:'🖼️', jpg:'🖼️', jpeg:'🖼️', txt:'📃', ppt:'📊', pptx:'📊' };
          const icon = iconMap[ext] || '📎';
          const downloadUrl = `/uploads/${encodeURIComponent(fname)}?name=${encodeURIComponent(oname)}`;
          return `<a href="${downloadUrl}" download="${escapeHtml(oname)}" target="_blank"
            style="display:inline-flex; align-items:center; gap:10px; background:var(--bg-main); padding:12px 18px; border-radius:10px; border:1px solid #cbd5e1; text-decoration:none; color:var(--text-heading); font-size:15px; font-weight:600; transition:all 0.2s; max-width:fit-content;"
            onmouseover="this.style.background='#e0e7ff'; this.style.borderColor='#6366f1'; this.style.color='#4f46e5';"
            onmouseout="this.style.background='var(--bg-main)'; this.style.borderColor='#cbd5e1'; this.style.color='var(--text-heading)';">
            <span style="font-size:20px;">${icon}</span>
            <span>${escapeHtml(oname)}</span>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-left:4px; opacity:0.5;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          </a>`;
        }).join('')}
      </div>
    </div>
    ` : ''}
  `;
  // ensure overlay exists at document level (not inside modal) and show it
  let overlay = document.getElementById('exercise-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'exercise-overlay';
    document.body.appendChild(overlay);
  }
  // show overlay and panel (panel slides in from right)
  overlay.style.position = 'fixed'; overlay.style.inset = '0'; overlay.style.zIndex = '1098';
  overlay.classList.add('show');
  // show centered modal (use the .open styles in CSS)
  d.classList.remove('hidden');
  // ensure we trigger modal open transition
  d.classList.remove('open');
  requestAnimationFrame(()=> d.classList.add('open'));

  // close handler shared
  function closePanel(){
    d.classList.remove('open');
    overlay.classList.remove('show');
    // wait for transition before fully hiding
    d.addEventListener('transitionend', function handler(){ d.classList.add('hidden'); d.removeEventListener('transitionend', handler); }, { once: true });
  }

  overlay.onclick = closePanel;
  const closeBtn = document.getElementById('exercise-close-btn');
  if (closeBtn) closeBtn.onclick = closePanel;
}

// Theme (light/dark) handling
function applyTheme(theme) {
  if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
}
try { const saved = localStorage.getItem('theme'); if (saved) applyTheme(saved); } catch (e) {}
const themeToggle = document.getElementById('theme-toggle'); if (themeToggle) themeToggle.onclick = () => { try { const cur = document.body.classList.contains('dark-mode') ? 'dark' : 'light'; const next = cur === 'dark' ? 'light' : 'dark'; applyTheme(next); localStorage.setItem('theme', next); } catch (e) {} };

// Lecturer flow
const btnLogin = document.getElementById('btn-login');
const loginCancelEl = document.getElementById('login-cancel');
if (loginCancelEl) loginCancelEl.onclick = () => {
  const m = document.getElementById('lecturer-modal'); if (m) m.classList.add('hidden');
};

function updateLoginButton() {
  if (!btnLogin) return;
  // Student page's login button now redirects to a separate login page.
  btnLogin.textContent = 'Đăng nhập giảng viên';
  btnLogin.onclick = () => { window.location.href = '/login'; };
}

function showLoginModal() {
  const m = document.getElementById('lecturer-modal');
  if (!m) return;
  m.classList.remove('hidden');
  // autofocus first input
  setTimeout(() => {
    const first = m.querySelector('input[name="name"]');
    if (first) first.focus();
  }, 50);
}

// set initial button state after defining btnLogin and update function
updateLoginButton();

// close buttons (added in HTML)
const loginModal = document.getElementById('lecturer-modal');
const panelModal = document.getElementById('lecturer-panel');
const loginCloseBtn = document.getElementById('login-close');
const panelCloseBtn = document.getElementById('panel-close');
const loginCloseText = document.getElementById('login-close-text');
const panelCloseText = document.getElementById('panel-close-text');
if (loginCloseBtn) loginCloseBtn.onclick = () => loginModal.classList.add('hidden');
if (panelCloseBtn) panelCloseBtn.onclick = () => panelModal.classList.add('hidden');
if (loginCloseText) loginCloseText.onclick = () => loginModal.classList.add('hidden');
if (panelCloseText) panelCloseText.onclick = () => panelModal.classList.add('hidden');

// exercise modal close (lecturer page)
const exerciseModalClose = document.getElementById('modal-close');
if (exerciseModalClose) exerciseModalClose.onclick = () => { const m = document.getElementById('exercise-modal'); if (m) m.classList.remove('show'); };

// clicking on overlay (outside modal-content) closes modal
if (loginModal) {
  loginModal.addEventListener('click', (ev) => {
    if (ev.target === loginModal) loginModal.classList.add('hidden');
  });
}
if (panelModal) {
  panelModal.addEventListener('click', (ev) => {
    if (ev.target === panelModal) panelModal.classList.add('hidden');
  });
}

// ESC key closes any open modal
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' || ev.key === 'Esc') {
    if (loginModal && !loginModal.classList.contains('hidden')) loginModal.classList.add('hidden');
    if (panelModal && !panelModal.classList.contains('hidden')) panelModal.classList.add('hidden');
  }
});

const loginForm = document.getElementById('login-form');
if (loginForm) loginForm.onsubmit = async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const payload = { name: form.get('name'), password: form.get('password'), lecturer_id: form.get('lecturer_id') };
  try {
    const res = await fetch('/api/lecturer/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
    if (!res.ok) throw new Error('Login failed');
    // server sets HttpOnly cookie; redirect to /lecturer (protected page)
    window.location.href = '/lecturer';
  } catch (err) {
    alert('Đăng nhập thất bại');
  }
};

function openLecturerPanel() {
  const panel = document.getElementById('lecturer-panel');
  if (!panel) return;
  panel.classList.remove('hidden');
  document.getElementById('lecturer-info').textContent = `Giảng viên: ${state.lecturer.name} (${state.lecturer.lecturer_id || ''})`;
  populateLecturerSelects();
  renderManageList();
  // autofocus first field inside panel
  setTimeout(() => {
    const first = panel.querySelector('#form-subject');
    if (first) first.focus();
  }, 50);
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) btnLogout.onclick = () => {
  // call logout endpoint to clear server cookie
  fetch('/api/lecturer/logout', { method: 'POST', credentials: 'include' }).finally(()=>{
    try { localStorage.removeItem('lecturer'); } catch(e){}
    // if we are on the lecturer management page, redirect to login
    try {
      if (location && location.pathname && location.pathname.startsWith('/lecturer')) {
        window.location.href = '/login';
        return;
      }
    } catch (e) {}
    updateLoginButton();
  });
};

// Create new exercise button (opens modal with empty form)
const btnCreateNew = document.getElementById('btn-create-new');
if (btnCreateNew) btnCreateNew.onclick = () => {
  const formEl = document.getElementById('exercise-form');
  if (!formEl) { window.location.href = '/lecturer'; return; }
  formEl.reset();
  const original = document.getElementById('original_id'); if (original) original.value = '';
  const selSub = document.getElementById('form-subject'); if (selSub) { selSub.selectedIndex = 0; selSub.onchange && selSub.onchange(); }
  const selForm = document.getElementById('form-form'); if (selForm) selForm.selectedIndex = 0;
  // initialize dynamic lists
  currentRequirements = [];
  currentGrades = [];
  renderRequirements(); renderGradingList();
  // Reset submission format checkboxes
  if (typeof fillSubmissionFormat === 'function') fillSubmissionFormat('');
  const modal = document.getElementById('exercise-modal'); if (modal) modal.classList.add('show');
  setTimeout(()=> { const t = formEl.querySelector('[name=title]'); if (t) t.focus(); }, 50);
};

function populateLecturerSelects() {
  const selSub = document.getElementById('form-subject');
  const selForm = document.getElementById('form-form');
  if (!selSub) return;
  selSub.innerHTML = '';
  // Filter: non-admin lecturers only see their allowed subjects
  const lec = state.lecturer;
  const allowedIds = (lec && !lec.is_admin && Array.isArray(lec.allowed_subjects) && lec.allowed_subjects.length)
    ? lec.allowed_subjects : null;
  const subjectsToShow = allowedIds ? state.subjects.filter(s => allowedIds.includes(s.subject_id)) : state.subjects;
  subjectsToShow.forEach(s => {
    const o = document.createElement('option'); o.value = s.subject_id; o.textContent = s.subject_name; selSub.appendChild(o);
  });
  selSub.onchange = () => {
    const sub = state.subjects.find(x => x.subject_id === selSub.value);
    if (!selForm) return;
    selForm.innerHTML = '';
    sub.forms.forEach(f => { const o = document.createElement('option'); o.value = f.form_id; o.textContent = `${f.name}`; selForm.appendChild(o); });
    if (selForm.onchange) selForm.onchange();
  };
  selForm.onchange = async () => {
    const sub = state.subjects.find(x => x.subject_id === selSub.value);
    if (!sub) return;
    const form = sub.forms.find(f => f.form_id === selForm.value);
    const isNew = !document.getElementById('original_id').value;
    if (form && isNew) {
      currentGrades = JSON.parse(JSON.stringify(form.default_criteria || []));
      renderGradingList();
      try {
        const idField = document.getElementById('field-id');
        if (idField) {
          idField.value = 'Đang sinh mã...';
          const res = await fetch(`/api/next-id?subject_id=${encodeURIComponent(selSub.value)}&form_id=${encodeURIComponent(selForm.value)}`);
          if (res.ok) {
            const data = await res.json();
            idField.value = data.next_id || '';
          } else {
            idField.value = '';
          }
        }
      } catch (err) { console.error('Lỗi khi sinh mã tự động:', err); }
    }
  };
  if (subjectsToShow.length) selSub.onchange();
}

// search handling
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value || '';
    if (state.currentSubject) renderSubject();
  });
}

// lecturer page search box (manage list)
const lecturerSearch = document.getElementById('search-box');
if (lecturerSearch) lecturerSearch.addEventListener('input', () => { renderManageList(); });

const lecturerFilter = document.getElementById('filter-difficulty');
if (lecturerFilter) lecturerFilter.addEventListener('change', () => { renderManageList(); });

// difficulty filter handling
const diffFilter = document.getElementById('difficulty-filter');
if (diffFilter) {
  diffFilter.addEventListener('change', (e) => {
    state.difficultyFilter = e.target.value || 'all';
    if (state.currentSubject) renderSubject();
  });
}

const exerciseCancel = document.getElementById('exercise-cancel');
if (exerciseCancel) exerciseCancel.onclick = () => {
  const p = document.getElementById('lecturer-panel'); if (p) p.classList.add('hidden');
  const modal = document.getElementById('exercise-modal'); if (modal) modal.classList.remove('show');
};

const exerciseForm = document.getElementById('exercise-form');
// Dynamic lists state for modal editor
let currentRequirements = null;
let currentGrades = null;

function renderRequirements() {
  const container = document.getElementById('requirements-list');
  if (!container) return;
  container.innerHTML = '';
  if (!Array.isArray(currentRequirements)) currentRequirements = [];
  currentRequirements.forEach((v, idx) => {
    const row = document.createElement('div');
    row.style.display = 'flex'; row.style.gap = '8px'; row.style.marginBottom = '6px';
    const input = document.createElement('input'); input.type = 'text'; input.value = v || ''; input.style.flex = '1';
    input.oninput = (e) => { currentRequirements[idx] = e.target.value; };
    const del = document.createElement('button'); del.type = 'button'; del.textContent = '-'; del.title = 'Xóa yêu cầu';
    del.onclick = () => { currentRequirements.splice(idx,1); renderRequirements(); };
    row.appendChild(input); row.appendChild(del);
    container.appendChild(row);
  });
}

function renderGradingList() {
  const container = document.getElementById('grading-list');
  if (!container) return;
  container.innerHTML = '';
  if (!Array.isArray(currentGrades)) currentGrades = [];
  currentGrades.forEach((g, idx) => {
    const row = document.createElement('div');
    row.style.display = 'flex'; row.style.gap = '8px'; row.style.marginBottom = '6px';
    const name = document.createElement('input'); name.type='text'; name.placeholder='Tiêu chí'; name.value = g.name || ''; name.style.flex='1';
    name.oninput = (e) => { currentGrades[idx].name = e.target.value; };
    const pts = document.createElement('input'); pts.type='number'; pts.min='0'; pts.placeholder='%'; pts.value = (g.points!=null?g.points:''); pts.style.width='86px';
    pts.oninput = (e) => { currentGrades[idx].points = parseInt(e.target.value || 0, 10); updateGradingSum(); };
    const note = document.createElement('input'); note.type='text'; note.placeholder='Ghi chú (tùy chọn)'; note.value = g.note || ''; note.style.width='180px';
    note.oninput = (e) => { currentGrades[idx].note = e.target.value; };
    const del = document.createElement('button'); del.type='button'; del.textContent='-'; del.title='Xóa tiêu chí';
    del.onclick = () => { currentGrades.splice(idx,1); renderGradingList(); };
    row.appendChild(name); row.appendChild(pts); row.appendChild(note); row.appendChild(del);
    container.appendChild(row);
  });

  let sumRow = document.createElement('div');
  sumRow.style.marginTop = '8px'; sumRow.style.textAlign = 'right'; sumRow.style.fontSize = '13px';
  let sumEl = document.createElement('span'); sumEl.id = 'grading-sum-text';
  sumRow.appendChild(sumEl);
  container.appendChild(sumRow);
  updateGradingSum();
}

function updateGradingSum() {
  const sumEl = document.getElementById('grading-sum-text');
  if (!sumEl) return;
  let sumPts = 0;
  currentGrades.forEach(g => sumPts += (g.points || 0));
  sumEl.textContent = `(Tổng thang điểm: ${sumPts}%)`;
  if (sumPts !== 100) {
    sumEl.style.color = '#ef4444'; sumEl.style.fontWeight = '700';
  } else {
    sumEl.style.color = '#10b981'; sumEl.style.fontWeight = '600';
  }
}

// wire add buttons if present
const reqAddBtn = document.getElementById('req-add');
if (reqAddBtn) reqAddBtn.onclick = () => { if (!Array.isArray(currentRequirements)) currentRequirements = []; currentRequirements.push(''); renderRequirements(); };
const gradeAddBtn = document.getElementById('grade-add');
if (gradeAddBtn) gradeAddBtn.onclick = () => { if (!Array.isArray(currentGrades)) currentGrades = []; currentGrades.push({ name: '', points: 0, note: '' }); renderGradingList(); };
// parse grading criteria textarea into structured objects
function parseCriteriaText(text) {
  const lines = (text || '').split('\n').map(s=>s.trim()).filter(Boolean);
  const out = [];
  for (const line of lines) {
    // try to find first number as points
    const m = line.match(/(\d+)\s*p?\b/i);
    if (m) {
      const pts = parseInt(m[1], 10);
      // name is text before the number
      const idx = line.indexOf(m[0]);
      const namePart = line.substring(0, idx).replace(/[-–—|:]+$/,'').trim();
      // note is text after the number
      const notePart = line.substring(idx + m[0].length).replace(/^[-–—|:]+/,'').trim();
      out.push({ name: namePart || '(Không tên)', points: pts, note: notePart || '' });
    } else {
      // no points found — keep as simple object with 0 points
      out.push({ name: line, points: 0, note: '' });
    }
  }
  return out;
}
if (exerciseForm) exerciseForm.onsubmit = async (e) => {
  e.preventDefault();
  const formEl = e.target;
  const fd = new FormData(formEl);
  const orig = fd.get('original_id');
  const exercise = {
    id: fd.get('id'),
    title: fd.get('title'),
    difficulty: fd.get('difficulty'),
    description: fd.get('description'),
    requirements: (Array.isArray(currentRequirements) ? currentRequirements.slice().map(s=>String(s).trim()).filter(Boolean) : (fd.get('requirements')||'').split('\n').map(s=>s.trim()).filter(Boolean)),
    grading_criteria: (Array.isArray(currentGrades) ? currentGrades.map(g=>({ name: g.name||'', points: Number(g.points)||0, note: g.note||'' })) : parseCriteriaText(fd.get('grading_criteria')||'')),
    submission_format: fd.get('submission_format')
  };
  const multipart = new FormData();
  multipart.append('exercise', JSON.stringify(exercise));
  const fileInput = formEl.querySelector('input[type=file]');
  if (fileInput && fileInput.files.length) {
    for (const f of fileInput.files) multipart.append('files', f);
  }
  multipart.append('subject_id', fd.get('subject_id'));
  multipart.append('form_id', fd.get('form_id'));

  try {
    // QUICK CHECK
    const checkRes = await fetch('/api/duplicate/quick-check', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: exercise.title,
        description: exercise.description,
        requirements: exercise.requirements.join('\n')
      }), credentials: 'include'
    });
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      if (checkData.warning) {
          const bodyHtml = `
            Bài tập này rất giống <strong>${escapeHtml(checkData.score)}%</strong> với bài
            <em>"${escapeHtml(checkData.matchedTitle)}"</em>.<br><br>
            ${checkData.summary ? `<span style="color:#92400e">Mục tiêu chung: ${escapeHtml(checkData.summary)}</span><br><br>` : ''}
            Bạn có chắc chắn muốn lưu không?`;
          const go = await showConfirmModal({
            title: 'Cảnh báo trùng lặp bài tập',
            body: bodyHtml,
            confirmText: '✅ Vẫn lưu',
            cancelText: '✕ Huỷ',
            type: 'warning'
          });
          if (!go) return; // Cancel save
        }
    }

    let res;
    if (orig) {
      res = await fetch(`/api/exercise/${encodeURIComponent(orig)}`, { method: 'PUT', credentials: 'include', body: multipart });
    } else {
      res = await fetch('/api/exercise', { method: 'POST', credentials: 'include', body: multipart });
    }
    if (!res.ok) {
      let errMsg = 'Lỗi lưu bài tập';
      try { const errData = await res.json(); errMsg = errData.error || errMsg; } catch {}
      throw new Error(errMsg);
    }
    const data = await res.json();
    await loadSubjects();
    // Safely refresh current subject view without assuming data.subject exists
    if (data.subject_id && state.subjects) {
      const refreshed = state.subjects.find(s => s.subject_id === data.subject_id);
      if (refreshed) state.currentSubject = refreshed;
    }
    renderSubject();
    // close modal if present
    try { const modal = document.getElementById('exercise-modal'); if (modal) modal.classList.remove('show'); } catch (e) {}
    if (typeof showToast === 'function') {
      showToast('Lưu thành công!', 'success');
    } else {
      alert('Lưu thành công!');
    }
    formEl.reset();
    document.getElementById('original_id').value = '';
    renderManageList();
  } catch (err) { 
    console.error(err); 
    if (typeof showToast === 'function') {
      showToast('Lỗi: ' + (err.message || 'Lỗi không xác định'), 'error');
    } else {
      alert('Lỗi: ' + (err.message || 'Lỗi không xác định')); 
    }
  }
};

function renderManageList() {
  const container = document.getElementById('manage-list');
  if (!container) return;
  container.innerHTML = '';
  // render as table with columns: STT, Mã bài tập, Tên bài tập, Độ khó, Hành động
  const table = document.createElement('table');
  table.className = 'manage-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th style="width:60px">STT</th><th style="width:160px">Mã bài tập</th><th>Tên bài tập</th><th style="width:120px">Độ khó</th><th style="width:120px">Tổng trọng số</th><th style="width:160px">Hành động</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');

  // collect all exercises across subjects/forms into flat list for table
  let rows = [];
  state.subjects.forEach(s => {
    s.forms.forEach(f => {
      (f.exercises || []).forEach(ex => rows.push({ subject: s, form: f, ex }));
    });
  });

  // apply search and difficulty filter (lecturer page inputs)
  const searchBox = document.getElementById('search-box');
  const filterDiff = document.getElementById('filter-difficulty');
  const q = searchBox && searchBox.value ? searchBox.value.toLowerCase().trim() : '';
  const diffSel = filterDiff && filterDiff.value ? filterDiff.value : '';

  rows = rows.filter(r => {
    const ex = r.ex;
    if (diffSel) {
      if ((ex.difficulty || '').toLowerCase() !== diffSel.toLowerCase()) return false;
    }
    if (!q) return true;
    const searchStr = q.normalize('NFC').toLowerCase();
    const titleMatch = String(ex.title||'').normalize('NFC').toLowerCase().includes(searchStr);
    const idMatch = String(ex.id||'').normalize('NFC').toLowerCase().includes(searchStr);
    const descMatch = String(ex.description||'').normalize('NFC').toLowerCase().includes(searchStr);
    const kwMatch = String(ex.ai_keywords||'').normalize('NFC').toLowerCase().includes(searchStr);
    return titleMatch || idMatch || descMatch || kwMatch;
  });

  rows.forEach((r, idx) => {
    const ex = r.ex; const s = r.subject; const f = r.form;
    const tr = document.createElement('tr');
    const tdIndex = document.createElement('td'); tdIndex.textContent = String(idx+1);
    const tdId = document.createElement('td'); tdId.textContent = ex.id || '';
    const tdTitle = document.createElement('td'); tdTitle.textContent = ex.title || '';
    tdTitle.style.cursor = 'pointer'; tdTitle.onclick = () => showExercise(ex, f);
    const tdDiff = document.createElement('td');
    const diffText = ex.difficulty || '';
    tdDiff.innerHTML = diffText ? `<span style="display:inline-block;white-space:nowrap;padding:3px 10px;border-radius:12px;font-size:14px;font-weight:600;background:${diffText==='Khó'?'#fee2e2':(diffText==='Trung bình'?'#fef9c3':'#dcfce7')};color:${diffText==='Khó'?'#991b1b':(diffText==='Trung bình'?'#854d0e':'#166534')}">${diffText}</span>` : '';
    const tdTotal = document.createElement('td');
    // compute total points from grading_criteria if numeric points available
    let totalPoints = 0;
    try {
      if (Array.isArray(ex.grading_criteria)) {
        totalPoints = ex.grading_criteria.reduce((s, g) => s + (g && typeof g.points === 'number' ? g.points : 0), 0);
      }
    } catch (e) { totalPoints = 0; }
    tdTotal.innerHTML = (typeof totalPoints === 'number' && totalPoints > 0) ? `<span style="background:#e0e7ff;color:#4f46e5;padding:4px 8px;border-radius:6px;font-weight:700;font-size:14px">${totalPoints}%</span>` : (totalPoints === 0 ? `<span style="background:#f1f5f9;color:var(--text-muted);padding:4px 8px;border-radius:6px;font-weight:600;font-size:14px">0%</span>` : '-');
    const tdActions = document.createElement('td'); tdActions.style.display = 'flex'; tdActions.style.gap = '8px'; tdActions.style.justifyContent = 'flex-end';

    // determine if current user may edit/delete: allow if no owner set or owner === current lecturer
    const canEdit = (!ex.owner) || (state.lecturer && ex.owner === state.lecturer.lecturer_id);

    if (canEdit) {
      const btnEdit = document.createElement('button'); btnEdit.className='btn-edit'; btnEdit.textContent='Sửa'; btnEdit.onclick = () => {
        // reuse existing edit logic: populate form and open modal
        const ev = new Event('click');
        // call the edit flow inline
        const formEl = document.getElementById('exercise-form');
        const originalInp = document.getElementById('original_id');
        if (!formEl || !originalInp) { try { localStorage.setItem('editTarget', JSON.stringify({ subject_id: s.subject_id, form_id: f.form_id, id: ex.id })); } catch(e){}; location.href='/lecturer'; return; }
        originalInp.value = ex.id || '';
        const setIf = (selector, value) => { const el = formEl.querySelector(selector); if (el) el.value = value || ''; };
        setIf('[name=id]', ex.id); setIf('[name=title]', ex.title); setIf('[name=difficulty]', ex.difficulty); setIf('[name=description]', ex.description || '');
        currentRequirements = (ex.requirements && Array.isArray(ex.requirements)) ? ex.requirements.slice() : [];
        renderRequirements();
        currentGrades = (ex.grading_criteria || []).map(g => (typeof g==='string'?{name:g,points:0,note:''}:{ name: g.name||g.tieu_chi||'', points: g.points||0, note: g.note||'' }));
        renderGradingList();
        // Fill submission format checkboxes
        if (typeof fillSubmissionFormat === 'function') {
          fillSubmissionFormat(ex.submission_format || '');
        } else {
          setIf('[name=submission_format]', ex.submission_format || '');
        }
        const selSub = document.getElementById('form-subject'); if (selSub) { selSub.value = s.subject_id; selSub.onchange && selSub.onchange(); const selForm = document.getElementById('form-form'); if (selForm) selForm.value = f.form_id; }
        try { localStorage.setItem('editTarget', JSON.stringify({ subject_id: s.subject_id, form_id: f.form_id, id: ex.id })); } catch (e) {}
        const modal = document.getElementById('exercise-modal'); if (modal) modal.classList.add('show');
      };
      tdActions.appendChild(btnEdit);

      const btnDel = document.createElement('button'); btnDel.className='btn-delete'; btnDel.textContent='Xóa'; btnDel.onclick = async () => {
        const confirmed = await showConfirmModal({
          title: 'Xác nhận xóa',
          body: 'Bạn có chắc chắn muốn xóa bài tập này không?',
          type: 'danger',
          confirmText: 'Xóa bài tập'
        });
        if (!confirmed) return;
        const resp = await fetch(`/api/exercise/${ex.id}`, { method: 'DELETE', credentials: 'include' });
        if (!resp.ok) {
          alert('Không thể xóa (không có quyền hoặc lỗi)');
          return;
        }
        await loadSubjects(); renderManageList();
      };
      tdActions.appendChild(btnDel);
    } else {
      // view-only: show a View button
      const btnView = document.createElement('button'); btnView.textContent='Xem'; btnView.onclick = () => showExercise(ex, f);
      tdActions.appendChild(btnView);
    }

    tr.appendChild(tdIndex); tr.appendChild(tdId); tr.appendChild(tdTitle); tr.appendChild(tdDiff); tr.appendChild(tdTotal); tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

// Export button removed from lecturer UI; export handled elsewhere when needed

// init
loadSubjects().catch(err=>console.error(err));

// ==========================================
// LECTURER IMPORT & EXPORT LOG
// ==========================================
let lecImportPreviewData = [];
let lecImportStrategy = 'update';

// Download Excel template with dropdowns (use fetch+blob to stay on page)
async function downloadImportTemplate() {
  const btn = document.querySelector('[onclick="downloadImportTemplate()"]');
  const origText = btn ? btn.innerHTML : '';
  try {
    if (btn) { btn.innerHTML = '⏳ Đang tạo file...'; btn.disabled = true; }
    const res = await fetch('/api/import/template', { credentials: 'include' });
    if (!res.ok) throw new Error('Server trả về lỗi ' + res.status);
    // Validate Content-Type to catch cases where server returns JSON/HTML error
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('spreadsheet') && !ct.includes('excel') && !ct.includes('octet-stream')) {
      const errText = await res.text();
      try { const errJson = JSON.parse(errText); throw new Error(errJson.error || 'Server lỗi khi tạo file Excel'); } catch {}
      throw new Error('Server không trả về file Excel hợp lệ. Vui lòng thử lại.');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BaiTap_Template.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    alert('Lỗi tải file mẫu: ' + e.message);
  } finally {
    if (btn) { btn.innerHTML = origText; btn.disabled = false; }
  }
}

// Step indicator
function setImportStep(step) {
  [1,2,3].forEach(i => {
    const el = document.getElementById(`import-step-${i}`);
    if (!el) return;
    el.style.background = i === step ? '#6366f1' : (i < step ? '#10b981' : 'var(--border-color,#e2e8f0)');
    el.style.color = i <= step ? '#fff' : 'var(--text-muted)';
  });
  [1,2,3].forEach(i => {
    const p = document.getElementById(`import-panel-${i}`);
    if (p) p.style.display = i === step ? 'block' : 'none';
  });
}

async function handleLecturerImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  showToast('Đang đọc file Excel...', 'success');
  try {
    const res = await fetch('/api/import/preview', { method: 'POST', body: formData, credentials: 'include' });
    const data = await res.json();
    if (!data.success) { showToast('Lỗi: ' + data.error, 'error'); return; }
    lecImportPreviewData = data.preview;
    renderLecturerImportPreview();
    setImportStep(2);
  } catch (err) { showToast('Lỗi: ' + err.message, 'error'); }
  e.target.value = '';
}

async function handlePdfImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  showToast('Đang đọc file PDF và dùng AI phân tích. Vui lòng chờ...', 'success');
  try {
    const res = await fetch('/api/lecturer/import/pdf', { method: 'POST', body: formData, credentials: 'include' });
    const data = await res.json();
    if (!data.success) { showToast('Lỗi: ' + data.error, 'error'); return; }
    lecImportPreviewData = data.preview;
    renderLecturerImportPreview();
    setImportStep(2);
  } catch (err) { showToast('Lỗi: ' + err.message, 'error'); }
  e.target.value = '';
}

function renderLecturerImportPreview() {
  const valid = lecImportPreviewData.filter(r => r.status === 'VALID');
  const conflicts = lecImportPreviewData.filter(r => r.action === 'UPDATE' && r.status === 'VALID');
  const permErrors = lecImportPreviewData.filter(r => r.status === 'INVALID_NO_PERMISSION');
  const otherErrors = lecImportPreviewData.filter(r => r.status !== 'VALID' && r.status !== 'INVALID_NO_PERMISSION');

  const statsEl = document.getElementById('import-preview-stats');
  if (statsEl) statsEl.innerHTML = `
    <span style="background:#dcfce7;color:#16a34a;padding:6px 14px;border-radius:20px;font-weight:700;font-size:14px">✅ ${valid.length} hợp lệ</span>
    <span style="background:#fef3c7;color:#d97706;padding:6px 14px;border-radius:20px;font-weight:700;font-size:14px">⚠️ ${conflicts.length} trùng mã</span>
    ${permErrors.length ? `<span style="background:#fce4ec;color:#c62828;padding:6px 14px;border-radius:20px;font-weight:700;font-size:14px">🚫 ${permErrors.length} không có quyền</span>` : ''}
    ${otherErrors.length ? `<span style="background:#fee2e2;color:#dc2626;padding:6px 14px;border-radius:20px;font-weight:700;font-size:14px">❌ ${otherErrors.length} lỗi</span>` : ''}`;

  const tbody = document.getElementById('lec-import-preview-tbody');
  if (!tbody) return;
  tbody.innerHTML = lecImportPreviewData.map((r, i) => {
    const isErr = r.status !== 'VALID';
    const isPerm = r.status === 'INVALID_NO_PERMISSION';
    const isConflict = r.action === 'UPDATE' && r.status === 'VALID';
    const bg = isPerm ? '#fce4ec' : isErr ? '#fff5f5' : isConflict ? '#fffbeb' : '';
    let badge;
    if (isPerm) {
      badge = `<span style="background:#fce4ec;color:#c62828;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:700" title="${r.statusNote||''}">🚫 Không có quyền</span>`;
    } else if (isErr) {
      badge = `<span style="background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:700" title="${r.statusNote||''}">Lỗi</span>`;
    } else if (isConflict) {
      badge = `<span style="background:#fef3c7;color:#d97706;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:700">Trùng mã</span>`;
    } else {
      badge = `<span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:700">Hợp lệ</span>`;
    }
    return `<tr style="background:${bg};border-bottom:1px solid var(--border-color,#e2e8f0)">
      <td style="padding:8px 12px;color:var(--text-muted);font-size:14px">${r.row||i+2}</td>
      <td style="padding:8px 12px;font-weight:600;font-size:14px">${r.MaBaiTap||'(mới)'}</td>
      <td style="padding:8px 12px;font-size:14px">${r.TenBaiTap||''}</td>
      <td style="padding:8px 12px;font-size:14px">${r.MaMon||''}</td>
      <td style="padding:8px 12px">${badge}${r.statusNote ? `<div style="font-size:11px;color:#9e9e9e;margin-top:2px">${r.statusNote}</div>` : ''}</td>
    </tr>`;
  }).join('');
}

async function confirmLecturerImport() {
  const validData = lecImportPreviewData.filter(r => r.status === 'VALID');
  if (!validData.length) return;
  const btn = document.getElementById('lec-import-confirm-btn');
  if (btn) { btn.innerHTML = '⏳ Đang lưu...'; btn.disabled = true; }
  try {
    const res = await fetch('/api/import/confirm', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: validData, strategy: lecImportStrategy }), credentials: 'include'
    });
    const result = await res.json();
    if (!result.success) { showToast('Lỗi: ' + result.error, 'error'); return; }

    // Show result panel (step 3)
    const resEl = document.getElementById('import-result-content');
    if (resEl) resEl.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">
        <div style="background:linear-gradient(135deg,#10b981,#34d399);border-radius:12px;padding:14px;color:#fff;text-align:center">
          <div style="font-size:11px;font-weight:600;opacity:.85">Thêm mới</div>
          <div style="font-size:28px;font-weight:800">${result.inserted}</div>
        </div>
        <div style="background:linear-gradient(135deg,#f59e0b,#fbbf24);border-radius:12px;padding:14px;color:#fff;text-align:center">
          <div style="font-size:11px;font-weight:600;opacity:.85">Cập nhật</div>
          <div style="font-size:28px;font-weight:800">${result.updated}</div>
        </div>
        <div style="background:linear-gradient(135deg,#6366f1,#818cf8);border-radius:12px;padding:14px;color:#fff;text-align:center">
          <div style="font-size:11px;font-weight:600;opacity:.85">Bỏ qua</div>
          <div style="font-size:28px;font-weight:800">${result.skipped||0}</div>
        </div>
        <div style="background:linear-gradient(135deg,#ef4444,#f87171);border-radius:12px;padding:14px;color:#fff;text-align:center">
          <div style="font-size:11px;font-weight:600;opacity:.85">Lỗi</div>
          <div style="font-size:28px;font-weight:800">${(result.errors||[]).length}</div>
        </div>
      </div>
      ${(result.errors||[]).length ? `<div style="background:#fff5f5;border:1px solid #fecaca;border-radius:10px;padding:12px">
        <div style="font-weight:700;color:#dc2626;margin-bottom:8px">Chi tiết lỗi:</div>
        ${result.errors.map(e=>`<div style="font-size:14px;color:#7f1d1d;padding:4px 0;border-bottom:1px dashed #fecaca">Hàng ${e.row}: ${e.MaBaiTap||''} — ${e.reason}</div>`).join('')}
      </div>` : '<div style="color:#10b981;font-weight:600;font-size:16px;text-align:center;padding:16px">✅ Import hoàn tất không có lỗi!</div>'}`;
    setImportStep(3);
    loadLecturerExportLog();
    lecImportPreviewData = [];
  } catch (err) { showToast('Lỗi: ' + err.message, 'error'); }
  finally { if (btn) { btn.innerHTML = '✅ Xác nhận Import'; btn.disabled = false; } }
}

function resetImportWizard() {
  lecImportPreviewData = [];
  lecImportStrategy = 'update';
  const strat = document.getElementById('import-strategy');
  if (strat) strat.value = 'update';
  setImportStep(1);
}

async function loadLecturerExportLog() {
  const tbody = document.getElementById('lecturer-export-log-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted)">⏳ Đang tải...</td></tr>';
  try {
    const res = await fetch('/api/lecturer/export/log', { credentials: 'include' });
    const logs = await res.json();
    if (!logs.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);font-style:italic">Chưa có lịch sử</td></tr>'; return; }
    const fmtColor = { xlsx:'#16a34a', csv:'#0891b2', json:'#7c3aed' };
    const typeLabels = { exercises:'Xuất bài tập', import_exercises:'Nhập bài tập', students:'Xuất sinh viên', grades:'Xuất điểm' };
    tbody.innerHTML = logs.map(l => {
      const [date, time] = (l.exported_at||'').split(' ');
      const [y,mo,d] = (date||'').split('-');
      const dt = date ? `${d}/${mo}/${y} ${time?time.slice(0,5):''}` : '—';
      const typeLabel = typeLabels[l.export_type] || l.export_type || '—';
      const isImport = (l.export_type||'').includes('import');
      const typeBg = isImport ? '#e0f2fe' : '#f0fdf4';
      const typeColor = isImport ? '#0369a1' : '#16a34a';
      const typeIcon = isImport ? '📥' : '📤';
      // Details: truncate for display, show full on hover
      const details = l.details || '';
      const shortDetails = details.length > 80 ? details.substring(0, 80) + '...' : details;
      return `<tr style="border-bottom:1px solid var(--border-color)">
        <td style="padding:10px 14px">
          <span style="background:${typeBg};color:${typeColor};padding:3px 10px;border-radius:8px;font-size:13px;font-weight:700">${typeIcon} ${typeLabel}</span>
        </td>
        <td style="padding:10px 14px;text-align:center">
          <span style="background:${(fmtColor[l.format]||'#64748b')}22;color:${fmtColor[l.format]||'#64748b'};padding:2px 9px;border-radius:20px;font-size:13px;font-weight:700;text-transform:uppercase">${l.format||'—'}</span>
        </td>
        <td style="padding:10px 14px;text-align:center;font-weight:700;color:#6366f1">${l.row_count||0}</td>
        <td style="padding:10px 14px;font-size:13px;color:var(--text-muted);max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${details.replace(/"/g,'&quot;')}">${shortDetails||'—'}</td>
        <td style="padding:10px 14px;font-size:14px;color:var(--text-muted)">${dt}</td>
      </tr>`;
    }).join('');
  } catch(e) { tbody.innerHTML = `<tr><td colspan="5" style="color:#ef4444;text-align:center">❌ ${e.message}</td></tr>`; }
}

if (document.getElementById('lecturer-export-log-tbody')) {
  setTimeout(loadLecturerExportLog, 1000);
}

// ==================================================
// SUBJECT REQUESTS (LECTURER)
// ==================================================
function openSubjectRequestModal() {
  document.getElementById('modal-subject-request').classList.add('show');
  switchReqTab('form');
}
function closeSubjectRequestModal() {
  document.getElementById('modal-subject-request').classList.remove('show');
}
function switchReqTab(tab) {
  if (tab === 'form') {
    document.getElementById('req-form-section').style.display = 'block';
    document.getElementById('req-history-section').style.display = 'none';
    document.getElementById('tab-req-form').style.borderBottomColor = '#6366f1';
    document.getElementById('tab-req-form').style.color = '#6366f1';
    document.getElementById('tab-req-history').style.borderBottomColor = 'transparent';
    document.getElementById('tab-req-history').style.color = 'var(--text-muted)';
  } else {
    document.getElementById('req-form-section').style.display = 'none';
    document.getElementById('req-history-section').style.display = 'block';
    document.getElementById('tab-req-history').style.borderBottomColor = '#6366f1';
    document.getElementById('tab-req-history').style.color = '#6366f1';
    document.getElementById('tab-req-form').style.borderBottomColor = 'transparent';
    document.getElementById('tab-req-form').style.color = 'var(--text-muted)';
    loadSubjectRequests();
  }
}
async function submitSubjectRequest(e) {
  e.preventDefault();
  const data = {
    ActionType: document.getElementById('req-action').value,
    SubjectCode: document.getElementById('req-code').value.toUpperCase().trim(),
    SubjectName: document.getElementById('req-name').value.trim(),
    Reason: document.getElementById('req-reason').value.trim()
  };
  try {
    const res = await fetch('/api/lecturer/subject-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (res.ok && result.success) {
      showToast('Đã gửi yêu cầu thành công. Vui lòng chờ Admin duyệt!', 'success');
      document.getElementById('subject-request-form').reset();
      switchReqTab('history');
    } else {
      showToast(result.error || 'Lỗi gửi yêu cầu', 'error');
    }
  } catch(err) {
    showToast(err.message, 'error');
  }
}
async function loadSubjectRequests() {
  const tbody = document.getElementById('req-history-tbody');
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color:#64748b;">Đang tải...</td></tr>';
  try {
    const res = await fetch('/api/lecturer/subject-requests', {
      credentials: 'include'
    });
    const data = await res.json();
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color:#64748b;">Chưa có yêu cầu nào.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(r => {
      const isAdd = r.ActionType === 'ADD';
      const actionBadge = isAdd ? `<span style="background:#e0e7ff;color:#4338ca;padding:2px 8px;border-radius:6px;font-size:12px;font-weight:bold">Xin Thêm Môn</span>` 
                                : `<span style="background:#fee2e2;color:#b91c1c;padding:2px 8px;border-radius:6px;font-size:12px;font-weight:bold">Xin Hủy Môn</span>`;
      
      let statusBadge = '';
      if (r.Status === 'PENDING') statusBadge = `<span style="background:#fef9c3;color:#a16207;padding:2px 8px;border-radius:6px;font-size:12px;font-weight:bold">⏳ Đang chờ duyệt</span>`;
      else if (r.Status === 'APPROVED') statusBadge = `<span style="background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:6px;font-size:12px;font-weight:bold">✅ Đã duyệt</span>`;
      else statusBadge = `<span style="background:#fee2e2;color:#b91c1c;padding:2px 8px;border-radius:6px;font-size:12px;font-weight:bold">❌ Bị từ chối</span> <div style="font-size:12px;color:#ef4444;margin-top:4px">${r.AdminFeedback||''}</div>`;
      
      return `
        <tr style="border-bottom:1px solid var(--border-color,#e2e8f0);">
          <td style="padding:12px;font-size:14px;color:var(--text-main)">${new Date(r.CreatedAt).toLocaleString('vi-VN')}</td>
          <td style="padding:12px;">${actionBadge}</td>
          <td style="padding:12px;font-weight:600;color:var(--text-main)">${r.SubjectCode} - ${r.SubjectName}</td>
          <td style="padding:12px;">${statusBadge}</td>
        </tr>
      `;
    }).join('');
  } catch(err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color:#ef4444;">Lỗi tải dữ liệu.</td></tr>`;
  }
}


