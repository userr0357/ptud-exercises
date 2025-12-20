const API = '';

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const state = { subjects: [], currentSubject: null, expandedForms: {}, searchQuery: '' }; 

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
  // if URL fragment present (e.g. #CS101), select that subject automatically
  // fragment handling kept earlier but we already handled no-fragment case above
}

function renderSidebar() {
  const ul = document.getElementById('subject-list');
  ul.innerHTML = '';
  state.subjects.forEach(s => {
    const li = document.createElement('li');
    li.textContent = `${s.subject_name} (${s.total_exercises})`;
    li.onclick = async () => { await selectSubject(s.subject_id); renderSidebar(); };
    if (state.currentSubject && state.currentSubject.subject_id === s.subject_id) li.classList.add('active');
    ul.appendChild(li);
  });
}

async function selectSubject(id) {
  const subject = await fetchJSON(`/api/subject/${id}`);
  state.currentSubject = subject;
  renderSubject();
  renderSidebar();
  // update URL fragment without adding a history entry
  try { history.replaceState(null, '', '#' + id); } catch (e) { location.hash = '#' + id; }
}

function renderSubject() {
  const s = state.currentSubject;
  document.getElementById('subject-title').textContent = s.subject_name;
  const descEl = document.getElementById('subject-desc');
  if (descEl) descEl.textContent = s.description || '';
  const container = document.getElementById('forms-container');
  container.innerHTML = '';
  // sort forms by difficulty (easy -> medium -> hard) then by name
  s.forms.sort((a,b) => {
    const da = DIFF_ORDER[(normalizeDifficultyLabel(a.difficulty)||a.difficulty||'').toLowerCase()] ?? 1;
    const db = DIFF_ORDER[(normalizeDifficultyLabel(b.difficulty)||b.difficulty||'').toLowerCase()] ?? 1;
    if (da !== db) return da - db;
    return (a.name||'').localeCompare(b.name||'');
  });

  s.forms.forEach(form => {
    const card = document.createElement('div');
    card.className = 'form-card';
    const h = document.createElement('h3');
    h.textContent = `${form.name} — ${form.difficulty} (${form.exercise_count})`;
    card.appendChild(h);
    const criteria = document.createElement('div');
    // form.grading_criteria may be an array of strings or objects; render names only (hide points in student view)
    const formCriteriaText = (form.grading_criteria || []).map(g => (g && typeof g === 'object') ? (g.name || '') : (g || '') ).filter(Boolean).join(' | ');
    criteria.innerHTML = '<strong>Tiêu chí chấm:</strong> ' + formCriteriaText;
    card.appendChild(criteria);

    // create grid for exercise cards (student-facing)
    const grid = document.createElement('div');
    grid.className = 'exercise-grid';

    // apply search filter
    const q = state.searchQuery && state.searchQuery.toLowerCase();
    const filtered = (form.exercises || []).filter(ex => {
      if (!q) return true;
      return (ex.title || '').toLowerCase().includes(q) || (ex.description || '').toLowerCase().includes(q);
    });
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
      const title = document.createElement('div');
      title.className = 'exercise-title';
      title.textContent = ex.title;
      const desc = document.createElement('div');
      desc.className = 'exercise-desc';
      desc.textContent = ex.description ? (ex.description.length > 140 ? ex.description.substring(0,140) + '...' : ex.description) : '';
      const meta = document.createElement('div');
      meta.className = 'exercise-meta';
      const diff = document.createElement('span');
      // normalize difficulty label for consistent badges
      const diffLabel = normalizeDifficultyLabel(ex.difficulty) || ex.difficulty || '';
      diff.className = 'badge difficulty ' + (diffLabel === 'Khó' ? 'hard' : (diffLabel === 'Trung bình' ? 'medium' : 'easy'));
      diff.textContent = diffLabel;
      const format = document.createElement('span');
      format.className = 'small';
      format.textContent = ex.submission_format || '';
      meta.appendChild(diff);
      meta.appendChild(format);

      cardEl.appendChild(title);
      cardEl.appendChild(desc);
      cardEl.appendChild(meta);
      cardEl.onclick = () => showExercise(ex);
      grid.appendChild(cardEl);
    });

    card.appendChild(grid);

    if (filtered.length > SHOW_COUNT) {
      const moreBtn = document.createElement('button');
      moreBtn.className = 'accent';
      moreBtn.style.marginTop = '8px';
      moreBtn.textContent = expanded ? 'Thu gọn' : `Xem thêm (${filtered.length - SHOW_COUNT})`;
      moreBtn.onclick = () => {
        state.expandedForms[key] = !state.expandedForms[key];
        try { localStorage.setItem('expandedForms', JSON.stringify(state.expandedForms)); } catch (e) {}
        renderSubject();
      };
      card.appendChild(moreBtn);
    }

    container.appendChild(card);
  });
}

function showExercise(ex) {
  // helper: escape HTML to avoid XSS when building innerHTML
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderGradingHtml(criteria) {
    if (!criteria || !criteria.length) return '<div class="small muted">(Không có tiêu chí)</div>';
    return '<ul>' + criteria.map(g => {
      if (!g) return '<li>(Không xác định)</li>';
      if (typeof g === 'string') return `<li>${escapeHtml(g)}</li>`;
      const name = escapeHtml(g.name || '(Không tên)');
      // hide numeric points in student view per request; show only name and optional note
      const note = g.note ? ` — ${escapeHtml(g.note)}` : '';
      return `<li><strong>${name}</strong>${note}</li>`;
    }).join('') + '</ul>';
  }
  const d = document.getElementById('exercise-detail');
  // render markdown then sanitize
  const rawHtml = (typeof marked !== 'undefined') ? marked.parse(ex.description || '') : (ex.description || '');
  const safeHtml = (typeof DOMPurify !== 'undefined') ? DOMPurify.sanitize(rawHtml) : rawHtml;
  // prepare example input/output if present
  const sampleIn = ex.example_input ? `<pre class="sample">${ex.example_input}</pre>` : '<div class="small muted">(Không có ví dụ đầu vào)</div>';
  const sampleOut = ex.example_output ? `<pre class="sample">${ex.example_output}</pre>` : '<div class="small muted">(Không có ví dụ đầu ra)</div>';
  const attached = (ex.attached_files||[]).map(f=>f.originalname || f.filename).join(', ') || '(Không có)';
  // difficulty badge class
  const diffLabel = normalizeDifficultyLabel(ex.difficulty) || ex.difficulty || '';
  const badgeClass = (diffLabel === 'Khó') ? 'badge hard' : (diffLabel === 'Trung bình' ? 'badge medium' : 'badge easy');
  d.innerHTML = `
    <button class="close-ex" id="exercise-close-btn">×</button>
    <h2>${ex.title} <span class="${badgeClass}" style="margin-left:12px">${diffLabel || ex.difficulty || ''}</span></h2>
    <div><strong>Mô tả chi tiết:</strong><div>${safeHtml}</div></div>
    <div><strong>Yêu cầu:</strong><ol>${(ex.requirements||[]).map(r => `<li>${r}</li>`).join('')}</ol></div>
    <div><strong>Đầu vào (ví dụ):</strong>${sampleIn}</div>
    <div><strong>Đầu ra (ví dụ):</strong>${sampleOut}</div>
    <div><strong>Tiêu chí chấm:</strong>${renderGradingHtml(ex.grading_criteria)}</div>
    <div><strong>Cách nộp / Định dạng:</strong> ${ex.submission_format || '(Không có)'}</div>
    <div><strong>File đính kèm:</strong> ${attached}</div>
  `;
  // ensure overlay exists at document level (not inside modal) and show it
  let overlay = document.getElementById('exercise-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'exercise-overlay';
    document.body.appendChild(overlay);
  }
  // show overlay and panel (panel slides in from right)
  overlay.classList.add('show');
  overlay.style.position = 'fixed'; overlay.style.inset = '0'; overlay.style.zIndex = '1098';
  // small delay to allow CSS transition
  setTimeout(()=> overlay.classList.add('show'), 10);
  // show panel
  d.classList.remove('hidden');
  // ensure closed state reset then open
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
    updateLoginButton();
  });
};

function populateLecturerSelects() {
  const selSub = document.getElementById('form-subject');
  const selForm = document.getElementById('form-form');
  if (!selSub) return;
  selSub.innerHTML = '';
  state.subjects.forEach(s => {
    const o = document.createElement('option'); o.value = s.subject_id; o.textContent = s.subject_name; selSub.appendChild(o);
  });
  selSub.onchange = () => {
    const sub = state.subjects.find(x => x.subject_id === selSub.value);
    if (!selForm) return;
    selForm.innerHTML = '';
    sub.forms.forEach(f => { const o = document.createElement('option'); o.value = f.form_id; o.textContent = `${f.name} (${f.difficulty})`; selForm.appendChild(o); });
  };
  if (state.subjects.length) selSub.onchange();
}

// search handling
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value || '';
    if (state.currentSubject) renderSubject();
  });
}

const exerciseCancel = document.getElementById('exercise-cancel');
if (exerciseCancel) exerciseCancel.onclick = () => {
  const p = document.getElementById('lecturer-panel'); if (p) p.classList.add('hidden');
};

const exerciseForm = document.getElementById('exercise-form');
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
    requirements: (fd.get('requirements')||'').split('\n').map(s=>s.trim()).filter(Boolean),
    grading_criteria: parseCriteriaText(fd.get('grading_criteria')||''),
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
    let res;
    if (orig) {
      res = await fetch(`/api/exercise/${encodeURIComponent(orig)}`, { method: 'PUT', credentials: 'include', body: multipart });
    } else {
      res = await fetch('/api/exercise', { method: 'POST', credentials: 'include', body: multipart });
    }
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    await loadSubjects();
    if (state.currentSubject && state.currentSubject.subject_id === data.subject.subject_id) state.currentSubject = data.subject;
    renderSubject();
    alert('Lưu thành công');
    formEl.reset();
    document.getElementById('original_id').value = '';
    renderManageList();
  } catch (err) { console.error(err); alert('Lỗi lưu bài tập'); }
};

function renderManageList() {
  const container = document.getElementById('manage-list');
  if (!container) return;
  container.innerHTML = '';
  state.subjects.forEach(s => {
    const h = document.createElement('h4'); h.textContent = s.subject_name; container.appendChild(h);
    s.forms.forEach(f => {
      const formDiv = document.createElement('div'); formDiv.innerHTML = `<strong>${f.name} (${f.difficulty})</strong>`;
      const list = document.createElement('div');
      f.exercises.forEach(ex => {
        const item = document.createElement('div');
        item.style.display='flex'; item.style.justifyContent='space-between'; item.style.padding='6px 0';
        item.innerHTML = `<div>${ex.title} <small>[${ex.difficulty}]</small></div>`;
        const controls = document.createElement('div');
        const edit = document.createElement('button'); edit.textContent='Sửa'; edit.style.marginLeft='8px'; edit.onclick = () => {
          const formEl = document.getElementById('exercise-form');
          document.getElementById('original_id').value = ex.id;
          formEl.querySelector('[name=id]').value = ex.id;
          formEl.querySelector('[name=title]').value = ex.title;
          formEl.querySelector('[name=difficulty]').value = ex.difficulty;
          formEl.querySelector('[name=description]').value = ex.description || '';
          formEl.querySelector('[name=requirements]').value = (ex.requirements||[]).join('\n');
          // grading_criteria may be array of objects or strings — present as readable lines for editor
          formEl.querySelector('[name=grading_criteria]').value = (ex.grading_criteria||[]).map(g => {
            if (!g) return '';
            if (typeof g === 'string') return g;
            const note = g.note ? ` — ${g.note}` : '';
            return `${g.name} — ${g.points}${note}`;
          }).join('\n');
          formEl.querySelector('[name=submission_format]').value = ex.submission_format || '';
          const selSub = document.getElementById('form-subject');
          selSub.value = s.subject_id;
          selSub.onchange && selSub.onchange();
          document.getElementById('form-form').value = f.form_id;
          try { localStorage.setItem('editTarget', JSON.stringify({ subject_id: s.subject_id, form_id: f.form_id, id: ex.id })); } catch (e) {}
          location.href = '/lecturer';
        };
        const del = document.createElement('button'); del.textContent='Xóa'; del.style.marginLeft='8px'; del.onclick = async () => {
          if (!confirm('Xóa bài tập?')) return; await fetch(`/api/exercise/${ex.id}`, { method: 'DELETE', credentials: 'include' }); await loadSubjects(); renderManageList();
        };
        controls.appendChild(edit);
        controls.appendChild(del);
        item.appendChild(controls);
        list.appendChild(item);
      });
      formDiv.appendChild(list);
      container.appendChild(formDiv);
    });
  });
}

const btnExportEl = document.getElementById('btn-export');
if (btnExportEl) btnExportEl.onclick = async () => {
  if (!state.currentSubject) return alert('Chọn môn trước khi xuất');
  try {
    const res = await fetch(`/api/export?subject_id=${state.currentSubject.subject_id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.currentSubject.subject_id}-exercises.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) { alert('Xuất Excel thất bại'); }
};

// init
loadSubjects().catch(err=>console.error(err));
